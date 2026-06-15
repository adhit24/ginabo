// POST /api/returns/[returnNumber]/evidence
// Registers an evidence file the client already uploaded to the private
// 'return-evidence' bucket (path: <auth.uid>/<return_number>/<file>).
// Body: { storage_path, media_type, caption?, usage_history?, file_size_bytes? }

import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'

const schema = z.object({
  storage_path: z.string().min(3),
  media_type: z.enum(['image', 'video', 'document']),
  caption: z.string().max(500).optional(),
  usage_history: z.string().max(2000).optional(),
  file_size_bytes: z.number().int().positive().optional(),
})

interface Ctx {
  params: { returnNumber: string }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Body JSON tidak valid', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Input tidak valid', 422, parsed.error.flatten())

  // Ownership + editable status check
  const { data: ret } = await auth.userDb
    .from('returns')
    .select('id, status, profile_id')
    .eq('return_number', params.returnNumber)
    .maybeSingle()
  if (!ret) return jsonError('Retur tidak ditemukan', 404)
  const r = ret as { id: string; status: string }

  const editable = ['draft', 'submitted', 'under_review', 'more_evidence_required']
  if (!editable.includes(r.status)) {
    return jsonError('Bukti tidak dapat ditambahkan pada status retur saat ini', 409)
  }

  // Enforce the uploader owns the folder (defence-in-depth on top of storage RLS).
  if (!parsed.data.storage_path.startsWith(`${auth.userId}/`)) {
    return jsonError('Path penyimpanan tidak valid', 403)
  }

  const { data, error } = await auth.adminDb
    .from('return_evidence')
    .insert({
      return_id: r.id,
      uploaded_by: auth.userId,
      media_type: parsed.data.media_type,
      storage_path: parsed.data.storage_path,
      caption: parsed.data.caption ?? null,
      usage_history: parsed.data.usage_history ?? null,
      file_size_bytes: parsed.data.file_size_bytes ?? null,
    })
    .select('id')
    .single()

  if (error) return jsonError('Gagal menyimpan bukti', 500, error.message)

  // If we were waiting on more evidence, move it back into review.
  if (r.status === 'more_evidence_required') {
    await auth.adminDb.from('returns').update({ status: 'under_review' }).eq('id', r.id)
    await auth.adminDb.from('return_status_logs').insert({
      return_id: r.id,
      from_status: 'more_evidence_required',
      to_status: 'under_review',
      changed_by: auth.userId,
      actor_type: 'customer',
      reason: 'Bukti tambahan diunggah',
    })
  }

  return jsonOk({ id: (data as { id: string }).id }, { status: 201 })
}
