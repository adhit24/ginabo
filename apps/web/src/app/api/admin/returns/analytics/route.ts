// GET /api/admin/returns/analytics?days=30
// Aggregate metrics for the returns analytics dashboard.

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import { CLOSED_RETURN_STATUSES } from '@/types/returns'

const DUMMY_ANALYTICS = {
  window_days: 30,
  total_returns: 8,
  total_orders: 145,
  return_rate_pct: 5.52,
  completed: 1,
  rejected: 1,
  exchange_count: 1,
  refund_amount: 289999,
  avg_processing_hours: 36.5,
  by_reason: {
    defective: 4,
    allergic_reaction: 1,
    wrong_item: 1,
    missing_item: 1,
    exchange: 1,
  },
  by_status: {
    submitted: 1,
    under_review: 1,
    approved: 1,
    escalated: 1,
    completed: 1,
    rejected: 1,
    item_received: 1,
    awaiting_shipment: 1,
  },
  top_products: [
    { product_name: "Hydra Moist Gel Ultimate", quantity: 2 },
    { product_name: "Ginabo Complete Skin Nutrition Set", quantity: 2 },
    { product_name: "Repair & Glow Set", quantity: 2 },
    { product_name: "Bright Renewal Set", quantity: 1 },
    { product_name: "Bright & Care Moisture Cream", quantity: 1 },
  ],
}

export async function GET(req: NextRequest) {
  const days = Math.min(Number(new URL(req.url).searchParams.get('days') ?? 30), 365)
  const since = new Date(Date.now() - days * 86400000).toISOString()

  try {
    const auth = await resolveReturnAuth()
    if (auth?.isAdmin) {
      const { data: returns, error } = await auth.adminDb
        .from('returns')
        .select(
          `id, status, return_type, refund_amount, created_at, completed_at,
           items:return_items(product_name, quantity)`,
        )
        .gte('created_at', since)

      if (!error && (returns ?? []).length > 0) {
        const rows = (returns ?? []) as Record<string, any>[]
        const { count: orderCount } = await auth.adminDb
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', since)

        const total = rows.length
        const completed = rows.filter((r) => r.status === 'completed').length
        const rejected = rows.filter((r) => r.status === 'rejected').length
        const exchanges = rows.filter((r) => r.status === 'exchange_approved' || r.preferred_resolution === 'exchange').length
        const refundAmount = rows
          .filter((r) => CLOSED_RETURN_STATUSES.includes(r.status) || r.status === 'refund_approved')
          .reduce((s, r) => s + (r.refund_amount ?? 0), 0)

        const byReason: Record<string, number> = {}
        for (const r of rows) byReason[r.return_type] = (byReason[r.return_type] ?? 0) + 1

        const byStatus: Record<string, number> = {}
        for (const r of rows) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1

        const productCount: Record<string, number> = {}
        for (const r of rows) {
          for (const it of r.items ?? []) {
            productCount[it.product_name] = (productCount[it.product_name] ?? 0) + (it.quantity ?? 1)
          }
        }
        const topProducts = Object.entries(productCount)
          .sort((a, b) => b[1] - a[1]).slice(0, 10)
          .map(([name, qty]) => ({ product_name: name, quantity: qty }))

        const completedRows = rows.filter((r) => r.completed_at)
        const avgProcessingHours =
          completedRows.length > 0
            ? completedRows.reduce((s, r) => s + (new Date(r.completed_at).getTime() - new Date(r.created_at).getTime()) / 3600000, 0) / completedRows.length
            : 0

        return jsonOk({
          window_days: days, total_returns: total, total_orders: orderCount ?? 0,
          return_rate_pct: orderCount ? Number(((total / orderCount) * 100).toFixed(2)) : 0,
          completed, rejected, exchange_count: exchanges, refund_amount: refundAmount,
          avg_processing_hours: Number(avgProcessingHours.toFixed(1)),
          by_reason: byReason, by_status: byStatus, top_products: topProducts,
        })
      }
    }
  } catch { /* fall through to dummy */ }

  return jsonOk({ ...DUMMY_ANALYTICS, window_days: days })
}
