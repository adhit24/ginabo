// Ginabo Skincare — Inventory Integrity & Forecasting Domain Service

export type StockHealthStatus = 'out_of_stock' | 'critical' | 'low' | 'healthy' | 'overstock'

export interface ReorderOptions {
  leadTimeDays?: number // Default: 7 days
  safetyStock?: number // Default: 5 units
  targetCoverageDays?: number // Default: 30 days
}

export interface ItemForecastMetric {
  id: string
  productId: string
  variantId: string | null
  name: string
  sku: string | null
  currentStock: number
  trackInventory: boolean
  sales7d: number
  sales30d: number
  avgDailySales: number
  daysOfStock: number
  healthStatus: StockHealthStatus
  reorderPoint: number
  suggestedReorderQty: number
}

/**
 * Calculates average daily sales over 30 days safely.
 */
export function calculateAvgDailySales(sales30d: number): number {
  if (sales30d <= 0) return 0
  return Number((sales30d / 30).toFixed(2))
}

/**
 * Calculates days of stock remaining based on current stock and daily sales.
 * Returns 999 if avgDailySales is 0 (prevents divide-by-zero).
 */
export function calculateDaysOfStock(currentStock: number, avgDailySales: number): number {
  if (currentStock <= 0) return 0
  if (avgDailySales <= 0) return 999
  return Math.round(currentStock / avgDailySales)
}

/**
 * Classifies stock health status.
 * - out_of_stock: stock <= 0
 * - critical: daysOfStock < 7
 * - low: daysOfStock < 14
 * - healthy: 14 <= daysOfStock <= 60
 * - overstock: daysOfStock > 60
 */
export function determineStockStatus(currentStock: number, daysOfStock: number): StockHealthStatus {
  if (currentStock <= 0) return 'out_of_stock'
  if (daysOfStock < 7) return 'critical'
  if (daysOfStock < 14) return 'low'
  if (daysOfStock > 60) return 'overstock'
  return 'healthy'
}

/**
 * Calculates reorder point and suggested reorder quantity.
 * - reorderPoint = (avgDailySales * leadTimeDays) + safetyStock
 * - targetStock = avgDailySales * targetCoverageDays
 * - suggestedReorderQty = max(0, Math.ceil(targetStock - currentStock))
 */
export function calculateReorderMetrics(
  currentStock: number,
  avgDailySales: number,
  options: ReorderOptions = {},
) {
  const leadTimeDays = options.leadTimeDays ?? 7
  const safetyStock = options.safetyStock ?? 5
  const targetCoverageDays = options.targetCoverageDays ?? 30

  const reorderPoint = Math.ceil(avgDailySales * leadTimeDays + safetyStock)
  const targetStock = avgDailySales * targetCoverageDays
  const suggestedReorderQty = avgDailySales > 0 ? Math.max(0, Math.ceil(targetStock - currentStock)) : 0

  return {
    reorderPoint,
    suggestedReorderQty,
  }
}

/**
 * Resolves the inventory source of truth between products and variants.
 * If active variants exist, variant stock is canonical; otherwise product stock is canonical.
 */
export function resolveInventorySourceOfTruth(
  hasActiveVariants: boolean,
  productStock: number,
  variantStocks: number[],
): { canonicalStock: number; isVariantSource: boolean } {
  if (hasActiveVariants && variantStocks.length > 0) {
    const totalVariantStock = variantStocks.reduce((sum, s) => sum + s, 0)
    return { canonicalStock: totalVariantStock, isVariantSource: true }
  }
  return { canonicalStock: productStock, isVariantSource: false }
}
