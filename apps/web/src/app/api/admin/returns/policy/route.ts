// GET  /api/admin/returns/policy — read the active return policy
// PATCH /api/admin/returns/policy — update configurable policy settings

import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import { getActivePolicy } from '@/lib/returns'

export async function GET() {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)
  const policy = await getActivePolicy(auth.adminDb)
  return jsonOk(policy)
}

const patchSchema = z.object({
  return_window_days: z.number().int().min(0).max(365).optional(),
  exchange_window_days: z.number().int().min(0).max(365).optional(),
  refund_window_days: z.number().int().min(0).max(365).optional(),
  auto_approve_max_amount: z.number().int().min(0).optional(),
  require_evidence: z.boolean().optional(),
  min_evidence_count: z.number().int().min(0).max(10).optional(),
  max_returns_per_month: z.number().int().min(0).max(100).optional(),
  high_risk_score: z.number().int().min(0).max(100).optional(),
  store_credit_bonus_pct: z.number().int().min(0).max(100).optional(),
  auto_approve_reasons: z.array(z.string()).optional(),
  manual_review_reasons: z.array(z.string()).optional(),
  non_returnable_product_ids: z.array(z.string().uuid()).optional(),
  notes: z.string().max(2000).optional(),
})

export async function PATCH(req: NextRequest) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Body JSON tidak valid', 400)
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return jsonError('Input tidak valid', 422, parsed.error.flatten())

  const policy = await getActivePolicy(auth.adminDb)
  const { data, error } = await auth.adminDb
    .from('return_policies')
    .update(parsed.data)
    .eq('id', policy.id)
    .select('*')
    .single()
  if (error) return jsonError('Gagal memperbarui kebijakan', 500, error.message)
  return jsonOk(data)
}
