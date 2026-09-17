import { describe, it, expect, vi } from 'vitest'
import {
  getPeriodDateBoundaries,
  computeKpiItem,
  getExecutiveDashboardSummary,
} from './executiveService'

describe('executiveService', () => {
  describe('getPeriodDateBoundaries', () => {
    it('calculates boundaries for 7d with equivalent previous window', () => {
      const fixedNow = new Date('2025-06-15T12:00:00Z')
      const boundaries = getPeriodDateBoundaries('7d', undefined, undefined, fixedNow)

      expect(boundaries.current.start).toBeDefined()
      expect(boundaries.current.end).toBe(fixedNow.toISOString())
      expect(boundaries.previous.start).toBeDefined()
      expect(boundaries.previous.end).toBe(boundaries.current.start)
      expect(boundaries.periodLabel).toBe('7 Hari Terakhir')
    })

    it('calculates boundaries for today vs yesterday', () => {
      const fixedNow = new Date('2025-06-15T12:00:00Z')
      const boundaries = getPeriodDateBoundaries('today', undefined, undefined, fixedNow)

      expect(boundaries.periodLabel).toBe('Hari Ini (vs Kemarin)')
      expect(boundaries.current.start).toBeDefined()
      expect(boundaries.previous.start).toBeDefined()
    })

    it('calculates boundaries for custom range', () => {
      const start = '2025-01-01T00:00:00.000Z'
      const end = '2025-01-10T00:00:00.000Z'
      const boundaries = getPeriodDateBoundaries('custom', start, end)

      expect(boundaries.current.start).toBe(start)
      expect(boundaries.current.end).toBe(end)
      expect(boundaries.periodLabel).toContain('Kustom')
    })
  })

  describe('computeKpiItem', () => {
    it('computes positive revenue growth correctly', () => {
      const item = computeKpiItem(1500000, 1000000, 'positive', 'currency')
      expect(item.absoluteChange).toBe(500000)
      expect(item.percentageChange).toBe(50)
      expect(item.isFavorable).toBe(true)
      expect(item.formattedCurrent).toContain('1.500.000')
    })

    it('handles negative polarity metrics like refund rate', () => {
      // Refund rate increased from 2% to 6% -> unfavorable!
      const item = computeKpiItem(6, 2, 'negative', 'percent')
      expect(item.absoluteChange).toBe(4)
      expect(item.percentageChange).toBe(200)
      expect(item.isFavorable).toBe(false)
    })

    it('handles zero previous gracefully without infinity or NaN', () => {
      const item = computeKpiItem(500000, 0, 'positive', 'currency')
      expect(item.percentageChange).toBeNull() // Safe null indicator instead of infinity
      expect(item.absoluteChange).toBe(500000)
    })
  })

  describe('getExecutiveDashboardSummary', () => {
    it('aggregates executive KPIs, comparisons, inventory alerts, and top actions', async () => {
      const mockOrders = [
        // Current period orders
        {
          id: 'ord-1',
          order_number: 'GIN-001',
          profile_id: 'cust-new',
          total_amount: 500000,
          discount_amount: 50000,
          attribution_channel: 'Paid Social',
          utm_campaign: 'promo_june',
          created_at: '2025-06-14T10:00:00Z',
          status: 'processing',
          payment_status: 'paid',
        },
        {
          id: 'ord-2',
          order_number: 'GIN-002',
          profile_id: 'cust-repeat',
          total_amount: 300000,
          discount_amount: 0,
          attribution_channel: 'WhatsApp',
          utm_campaign: 'vip_offer',
          created_at: '2025-06-14T15:00:00Z',
          status: 'delivered',
          payment_status: 'paid',
        },
        // Previous period order
        {
          id: 'ord-prev',
          order_number: 'GIN-000',
          profile_id: 'cust-repeat',
          total_amount: 400000,
          discount_amount: 0,
          attribution_channel: 'Direct',
          utm_campaign: null,
          created_at: '2025-06-05T10:00:00Z',
          status: 'delivered',
          payment_status: 'paid',
        },
      ]

      const mockRefunds = [
        { amount: 50000, status: 'completed', created_at: '2025-06-14T12:00:00Z' },
      ]

      const mockProducts = [
        { id: 'p-1', name: 'Serum Glow', sku: 'SRM-01', stock_quantity: 2, is_active: true }, // critical
        { id: 'p-2', name: 'Facial Wash', sku: 'FCW-01', stock_quantity: 50, is_active: true }, // healthy
      ]

      const mockEvents = [
        { event_name: 'session_started', anonymous_session_id: 'sess-1', occurred_at: '2025-06-14T09:00:00Z' },
        { event_name: 'session_started', anonymous_session_id: 'sess-2', occurred_at: '2025-06-14T10:00:00Z' },
      ]

      const mockSupabase: any = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'orders') {
            return {
              select: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
              then: (res: any) => res({ data: mockOrders, error: null }),
            }
          }
          if (table === 'refunds') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockResolvedValue({ data: mockRefunds, error: null }),
            }
          }
          if (table === 'products') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
            }
          }
          if (table === 'customer_events') {
            return {
              select: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
            }
          }
          if (table === 'profiles') {
            return {
              select: vi.fn().mockResolvedValue({ data: [{ id: 'cust-new' }, { id: 'cust-repeat' }], error: null }),
            }
          }
          return {
            select: vi.fn().mockReturnThis(),
            then: (res: any) => res({ data: [], error: null }),
          }
        }),
      }

      const summary = await getExecutiveDashboardSummary(mockSupabase, {
        period: '7d',
        startDate: '2025-06-10T00:00:00Z',
        endDate: '2025-06-17T00:00:00Z',
      })

      // Gross: ord-1 (500000) + ord-2 (300000) = 800000
      expect(summary.kpis.grossRevenue.current).toBe(800000)
      // Net: 800000 - 50000 (refund) = 750000
      expect(summary.kpis.netRevenue.current).toBe(750000)
      // Paid count: 2
      expect(summary.kpis.paidOrders.current).toBe(2)
      // Discount: 50000
      expect(summary.kpis.discountCost.current).toBe(50000)

      // Inventory alerts
      expect(summary.inventory.criticalCount).toBe(1)
      expect(summary.inventory.healthyCount).toBe(1)
      expect(summary.alerts.some((a) => a.id === 'critical_stock_alert')).toBe(true)

      // Actions panel
      expect(summary.actions.length).toBeGreaterThan(0)
      expect(summary.actions.some((a) => a.id === 'act_inventory')).toBe(true)

      // Data consistency
      expect(summary.dataQuality.isConsistent).toBe(true)
    })
  })
})
