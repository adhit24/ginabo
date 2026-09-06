import { describe, expect, it } from 'vitest'
import {
  calculateAvgDailySales,
  calculateDaysOfStock,
  determineStockStatus,
  calculateReorderMetrics,
  resolveInventorySourceOfTruth,
} from './inventoryService'

describe('Inventory Forecasting & Velocity Calculations', () => {
  it('calculates average daily sales over 30 days', () => {
    expect(calculateAvgDailySales(30)).toBe(1)
    expect(calculateAvgDailySales(15)).toBe(0.5)
    expect(calculateAvgDailySales(0)).toBe(0)
    expect(calculateAvgDailySales(-5)).toBe(0)
  })

  it('calculates days of stock with divide-by-zero protection', () => {
    expect(calculateDaysOfStock(100, 10)).toBe(10)
    expect(calculateDaysOfStock(50, 0)).toBe(999) // Protection: zero sales returns 999 days
    expect(calculateDaysOfStock(0, 5)).toBe(0) // Zero stock returns 0 days
    expect(calculateDaysOfStock(-10, 5)).toBe(0)
  })

  it('classifies stock health status correctly', () => {
    expect(determineStockStatus(0, 0)).toBe('out_of_stock')
    expect(determineStockStatus(-5, 0)).toBe('out_of_stock')
    expect(determineStockStatus(10, 3)).toBe('critical')
    expect(determineStockStatus(25, 10)).toBe('low')
    expect(determineStockStatus(100, 30)).toBe('healthy')
    expect(determineStockStatus(500, 90)).toBe('overstock')
  })

  it('calculates reorder point and suggested reorder quantity correctly', () => {
    // Default options: leadTime = 7d, safetyStock = 5, targetCoverage = 30d
    // avgDailySales = 2, currentStock = 20
    // reorderPoint = (2 * 7) + 5 = 19
    // targetStock = 2 * 30 = 60 -> suggestedReorderQty = 60 - 20 = 40
    const res1 = calculateReorderMetrics(20, 2)
    expect(res1.reorderPoint).toBe(19)
    expect(res1.suggestedReorderQty).toBe(40)

    // Current stock is high enough (e.g. 70 units > target 60)
    const res2 = calculateReorderMetrics(70, 2)
    expect(res2.suggestedReorderQty).toBe(0)

    // Zero sales -> zero suggested reorder quantity
    const res3 = calculateReorderMetrics(5, 0)
    expect(res3.suggestedReorderQty).toBe(0)
  })
})

describe('Inventory Source of Truth Resolution', () => {
  it('prefers variant stock when active variants exist', () => {
    const res = resolveInventorySourceOfTruth(true, 100, [15, 25, 10])
    expect(res.isVariantSource).toBe(true)
    expect(res.canonicalStock).toBe(50)
  })

  it('uses product stock when no active variants exist', () => {
    const res = resolveInventorySourceOfTruth(false, 45, [])
    expect(res.isVariantSource).toBe(false)
    expect(res.canonicalStock).toBe(45)
  })
})
