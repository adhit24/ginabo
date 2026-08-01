// GET /api/returns/[returnNumber] — full detail for the owner (or admin):
// items, evidence (signed URLs), customer-visible notes, status timeline, refund/exchange.

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'

interface Ctx {
  params: { returnNumber: string }
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)

  // userDb respects RLS (owner only); admins additionally pass via is_admin policy.
  const db = auth.isAdmin ? auth.adminDb : auth.userDb

  const { data: ret, error } = await db
    .from('returns')
    .select(
      `id, return_number, status, return_type, preferred_resolution, customer_note,
       rejection_reason, refund_amount, return_courier, return_tracking_number,
       risk_score, is_flagged, submitted_at, reviewed_at, received_at, completed_at, created_at,
       order:orders(order_number, total_amount, status),
       items:return_items(id, product_name, variant_name, sku, image_url, quantity, unit_price,
                          line_refund_amount, item_reason, inspection_result),
       refund:refunds(id, method, amount, status, voucher_code, processed_at),
       exchange:exchanges(id, exchange_type, new_product_name, price_difference, status, tracking_number)`,
    )
    .eq('return_number', params.returnNumber)
    .maybeSingle()

  if (error) return jsonError('Gagal memuat retur', 500, error.message)
  if (!ret) return jsonError('Retur tidak ditemukan', 404)
  const r = ret as { id: string }

  // Status timeline (RLS allows owner + admin)
  const { data: timeline } = await db
    .from('return_status_logs')
    .select('from_status, to_status, actor_type, reason, created_at')
    .eq('return_id', r.id)
    .order('created_at', { ascending: true })

  // Notes — admins see all, customers see only customer-visible (RLS enforces this)
  const { data: notes } = await db
    .from('return_notes')
    .select('id, author_type, visibility, body, created_at')
    .eq('return_id', r.id)
    .order('created_at', { ascending: true })

  // Evidence with signed URLs (private bucket)
  const { data: evidence } = await db
    .from('return_evidence')
    .select('id, media_type, storage_path, caption, usage_history, created_at')
    .eq('return_id', r.id)
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
