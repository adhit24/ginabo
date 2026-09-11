// GET /api/admin/inventory/forecast — Inventory Forecasting V1 & Reorder Alert Report

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import {
  calculateAvgDailySales,
  calculateDaysOfStock,
  determineStockStatus,
  calculateReorderMetrics,
  type ItemForecastMetric,
} from '@/lib/inventory/inventoryService'

export async function GET(req: NextRequest) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)

  const url = new URL(req.url)
  const leadTimeDays = Number(url.searchParams.get('lead_time_days') ?? '7')
  const safetyStock = Number(url.searchParams.get('safety_stock') ?? '5')
  const targetCoverageDays = Number(url.searchParams.get('target_coverage_days') ?? '30')

  const now = new Date()
  const date30dAgo = new Date(now.getTime() - 30 * 86400000).toISOString()
  const date7dAgo = new Date(now.getTime() - 7 * 86400000).toISOString()

  // 1. Fetch products & variants
  const { data: products, error: pErr } = await auth.adminDb
    .from('products')
    .select('id, name, sku, stock_quantity, track_inventory, is_active, variants:product_variants(id, name, sku, stock_quantity, is_active)')
    .eq('is_active', true)

  if (pErr) return jsonError('Gagal memuat katalog produk', 500, pErr.message)

  // 2. Fetch paid/completed orders in last 30 days
  const { data: paidOrders } = await auth.adminDb
    .from('orders')
    .select('id, created_at')
    .in('status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])
    .gte('created_at', date30dAgo)

  const orderIds30d = new Set((paidOrders ?? []).map((o: { id: string }) => o.id))
  const orderIds7d = new Set(
    (paidOrders ?? [])
      .filter((o: { id: string; created_at: string }) => o.created_at >= date7dAgo)
      .map((o: { id: string }) => o.id),
  )

  // 3. Fetch order items for sales velocity calculation
  const salesMap7d = new Map<string, number>()
  const salesMap30d = new Map<string, number>()

  if (orderIds30d.size > 0) {
    const { data: orderItems } = await auth.adminDb
      .from('order_items')
      .select('order_id, product_id, variant_id, quantity')
      .in('order_id', Array.from(orderIds30d))

    if (Array.isArray(orderItems)) {
      for (const item of orderItems) {
        const key = item.variant_id ? `variant:${item.variant_id}` : `product:${item.product_id}`
        const qty = item.quantity ?? 0

        const current30d = salesMap30d.get(key) ?? 0
        salesMap30d.set(key, current30d + qty)

        if (orderIds7d.has(item.order_id)) {
          const current7d = salesMap7d.get(key) ?? 0
          salesMap7d.set(key, current7d + qty)
        }
      }
    }
  }

  // 4. Build forecast metrics per item
  const metrics: ItemForecastMetric[] = []

  for (const prod of products ?? []) {
    const p = prod as {
      id: string
      name: string
      sku: string | null
      stock_quantity: number
      track_inventory: boolean
      variants: { id: string; name: string; sku: string | null; stock_quantity: number; is_active: boolean }[]
    }

    const activeVariants = (p.variants ?? []).filter((v) => v.is_active)

    if (activeVariants.length > 0) {
      for (const v of activeVariants) {
        const key = `variant:${v.id}`
        const sales7 = salesMap7d.get(key) ?? 0
        const sales30 = salesMap30d.get(key) ?? 0
        const avgDaily = calculateAvgDailySales(sales30)
        const days = calculateDaysOfStock(v.stock_quantity, avgDaily)
        const status = determineStockStatus(v.stock_quantity, days)
        const reorder = calculateReorderMetrics(v.stock_quantity, avgDaily, {
          leadTimeDays,
          safetyStock,
          targetCoverageDays,
        })

        metrics.push({
          id: v.id,
          productId: p.id,
          variantId: v.id,
          name: `${p.name} - ${v.name}`,
          sku: v.sku ?? p.sku,
          currentStock: v.stock_quantity,
          trackInventory: p.track_inventory,
          sales7d: sales7,
          sales30d: sales30,
          avgDailySales: avgDaily,
          daysOfStock: days,
          healthStatus: status,
          reorderPoint: reorder.reorderPoint,
          suggestedReorderQty: reorder.suggestedReorderQty,
        })
      }
    } else {
      const key = `product:${p.id}`
      const sales7 = salesMap7d.get(key) ?? 0
      const sales30 = salesMap30d.get(key) ?? 0
      const avgDaily = calculateAvgDailySales(sales30)
      const days = calculateDaysOfStock(p.stock_quantity, avgDaily)
      const status = determineStockStatus(p.stock_quantity, days)
      const reorder = calculateReorderMetrics(p.stock_quantity, avgDaily, {
        leadTimeDays,
        safetyStock,
        targetCoverageDays,
      })

      metrics.push({
        id: p.id,
        productId: p.id,
        variantId: null,
        name: p.name,
        sku: p.sku,
        currentStock: p.stock_quantity,
        trackInventory: p.track_inventory,
        sales7d: sales7,
        sales30d: sales30,
        avgDailySales: avgDaily,
        daysOfStock: days,
        healthStatus: status,
        reorderPoint: reorder.reorderPoint,
        suggestedReorderQty: reorder.suggestedReorderQty,
      })
    }
  }

  const summary = {
    totalItems: metrics.length,
    outOfStockCount: metrics.filter((m) => m.healthStatus === 'out_of_stock').length,
    criticalCount: metrics.filter((m) => m.healthStatus === 'critical').length,
    lowStockCount: metrics.filter((m) => m.healthStatus === 'low').length,
    healthyCount: metrics.filter((m) => m.healthStatus === 'healthy').length,
    overstockCount: metrics.filter((m) => m.healthStatus === 'overstock').length,
    reorderRequiredCount: metrics.filter((m) => m.currentStock <= m.reorderPoint).length,
  }

  return jsonOk({
    summary,
    parameters: {
      leadTimeDays,
      safetyStock,
      targetCoverageDays,
    },
    items: metrics,
  })
}
