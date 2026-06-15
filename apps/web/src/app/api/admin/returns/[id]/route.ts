// GET /api/admin/returns/[id] — full admin detail (incl. internal notes, all evidence, risk)

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'

interface Ctx {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)

  const { data: ret, error } = await auth.adminDb
    .from('returns')
    .select(
      `*,
       order:orders(id, order_number, total_amount, status, shipping_address, delivered_at, created_at),
       profile:profiles(id, full_name, email, phone_number, whatsapp_number),
       items:return_items(*),
       refund:refunds(*),
       exchange:exchanges(*)`,
    )
    .eq('id', params.id)
    .maybeSingle()

  if (error) return jsonError('Gagal memuat retur', 500, error.message)
  if (!ret) return jsonError('Retur tidak ditemukan', 404)

  const { data: timeline } = await auth.adminDb
    .from('return_status_logs')
    .select('from_status, to_status, actor_type, reason, metadata, created_at')
    .eq('return_id', params.id)
    .order('created_at', { ascending: true })

  const { data: notes } = await auth.adminDb
    .from('return_notes')
    .select('id, author_type, visibility, body, created_at')
    .eq('return_id', params.id)
    .order('created_at', { ascending: true })

  const { data: evidence } = await auth.adminDb
    .from('return_evidence')
    .select('id, media_type, storage_path, caption, usage_history, is_validated, created_at')
    .eq('return_id', params.id)
    .order('created_at', { ascending: true })

  const evidenceWithUrls = await Promise.all(
    (evidence ?? []).map(async (ev: { storage_path: string; [k: string]: unknown }) => {
      const { data: signed } = await auth.adminDb.storage
        .from('return-evidence')
        .createSignedUrl(ev.storage_path, 3600)
      return { ...ev, url: signed?.signedUrl ?? null }
    }),
  )

  return jsonOk({ ...ret, timeline: timeline ?? [], notes: notes ?? [], evidence: evidenceWithUrls })
}
