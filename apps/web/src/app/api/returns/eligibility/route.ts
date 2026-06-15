// GET /api/returns/eligibility?order=GNB-YYYYMMDD-XXXX
// Returns whether the order can be returned + the list of eligible line items.

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import { getActivePolicy, checkEligibility } from '@/lib/returns'

export async function GET(req: NextRequest) {
  const orderNumber = new URL(req.url).searchParams.get('order')?.trim()
  if (!orderNumber) return jsonError('Parameter "order" diperlukan', 400)

  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)

  const { data: order, error } = await auth.userDb
    .from('orders')
    .select(
      `id, order_number, status, delivered_at, created_at,
       items:order_items(id, product_id, variant_id, product_name, variant_name, image_url, quantity, unit_price)`,
    )
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (error) return jsonError('Gagal memuat pesanan', 500, error.message)
  if (!order) return jsonError('Pesanan tidak ditemukan', 404)

  const policy = await getActivePolicy(auth.adminDb)

  const { count } = await auth.adminDb
    .from('returns')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', (order as { id: string }).id)
    .not('status', 'in', '("rejected","cancelled")')

  const eligibility = checkEligibility(order as never, policy, count ?? 0)
  return jsonOk(eligibility)
}
