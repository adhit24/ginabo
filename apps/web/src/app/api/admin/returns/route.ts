// GET /api/admin/returns — return queue with filters
// Query: ?status=&type=&q=&flagged=true&limit=

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'

export async function GET(req: NextRequest) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)

  const url = new URL(req.url)
  const status = url.searchParams.get('status')?.trim()
  const type = url.searchParams.get('type')?.trim()
  const flagged = url.searchParams.get('flagged') === 'true'
  const q = url.searchParams.get('q')?.trim()?.toLowerCase()
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 500)

  let query = auth.adminDb
    .from('returns')
    .select(
      `id, return_number, status, return_type, preferred_resolution, refund_amount,
       risk_score, is_flagged, created_at, submitted_at,
       order:orders(order_number),
       profile:profiles(full_name, email, phone_number),
       items:return_items(quantity)`,
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (type) query = query.eq('return_type', type)
  if (flagged) query = query.eq('is_flagged', true)

  const { data, error } = await query
  if (error) return jsonError('Gagal memuat antrean retur', 500, error.message)

  let rows = (data ?? []) as Record<string, any>[]
  if (q) {
    rows = rows.filter((r) => {
      const rn = String(r.return_number ?? '').toLowerCase()
      const on = String(r.order?.order_number ?? '').toLowerCase()
      const nm = String(r.profile?.full_name ?? '').toLowerCase()
      const em = String(r.profile?.email ?? '').toLowerCase()
      return rn.includes(q) || on.includes(q) || nm.includes(q) || em.includes(q)
    })
  }

  return jsonOk(rows)
}
