import { describe, it, expect, vi } from 'vitest'
import {
  getPeriodDateRange,
  getMarketingAttributionOverview,
  reconcileAttributionData,
  getCustomerAcquisitionAttribution,
} from './attributionService'

describe('attributionService', () => {
  describe('getPeriodDateRange', () => {
    it('returns null boundaries for all', () => {
      const range = getPeriodDateRange('all')
      expect(range.startDate).toBeNull()
      expect(range.endDate).toBeNull()
      expect(range.periodLabel).toBe('Semua Waktu')
    })

    it('returns ISO date strings for 7d and 30d', () => {
      const range7d = getPeriodDateRange('7d')
      expect(range7d.startDate).toBeDefined()
      expect(range7d.endDate).toBeDefined()
      expect(range7d.periodLabel).toBe('7 Hari Terakhir')

      const range30d = getPeriodDateRange('30d')
      expect(range30d.startDate).toBeDefined()
      expect(range30d.endDate).toBeDefined()
      expect(range30d.periodLabel).toBe('30 Hari Terakhir')
    })

    it('returns custom date range when provided', () => {
      const range = getPeriodDateRange('30d', '2025-01-01T00:00:00Z', '2025-01-31T23:59:59Z')
      expect(range.startDate).toBe('2025-01-01T00:00:00.000Z')
      expect(range.endDate).toBe('2025-01-31T23:59:59.000Z')
    })
  })

  describe('getMarketingAttributionOverview', () => {
    it('aggregates valid paid commerce orders, channels, and campaigns', async () => {
      const mockOrders = [
        {
          id: 'ord-1',
          order_number: 'GIN-101',
          profile_id: 'cust-1',
          total_amount: 500000,
          discount_amount: 50000,
          attribution_channel: 'Paid Social',
          utm_source: 'instagram',
          utm_medium: 'paid_social',
          utm_campaign: 'summer_sale',
          created_at: '2025-06-01T10:00:00Z',
          status: 'processing',
          payment_status: 'paid',
        },
        {
          id: 'ord-2',
          order_number: 'GIN-102',
          profile_id: 'cust-2',
          total_amount: 300000,
          discount_amount: 0,
          attribution_channel: 'WhatsApp',
          utm_source: 'whatsapp',
          utm_medium: 'chat',
          utm_campaign: 'vip_promo',
          created_at: '2025-06-02T11:00:00Z',
          status: 'delivered',
          payment_status: 'paid',
        },
        // Cancelled / unpaid order must be excluded from valid commerce
        {
          id: 'ord-3',
          order_number: 'GIN-103',
          profile_id: 'cust-3',
          total_amount: 250000,
          discount_amount: 0,
          attribution_channel: 'Direct',
          utm_source: null,
          created_at: '2025-06-03T12:00:00Z',
          status: 'cancelled',
          payment_status: 'unpaid',
        },
      ]

      const mockRefunds = [
        { amount: 50000, status: 'completed', created_at: '2025-06-02T15:00:00Z' },
      ]

      const mockEvents = [
        { event_name: 'session_started', anonymous_session_id: 'sess-1' },
        { event_name: 'product_viewed', anonymous_session_id: 'sess-1' },
        { event_name: 'add_to_cart', anonymous_session_id: 'sess-1' },
        { event_name: 'checkout_started', anonymous_session_id: 'sess-1' },
        { event_name: 'order_created', anonymous_session_id: 'sess-1' },
        { event_name: 'payment_success', anonymous_session_id: 'sess-1' },
      ]

      const mockSupabase: any = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'orders') {
            const chain: any = {
              select: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              in: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              then: (resolve: any) => resolve({ data: mockOrders, error: null }),
            }
            return chain
          }
          if (table === 'order_refunds') {
            const chain: any = {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              then: (resolve: any) => resolve({ data: mockRefunds, error: null }),
            }
            return chain
          }
          if (table === 'customer_events') {
            const chain: any = {
              select: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              then: (resolve: any) => resolve({ data: mockEvents, error: null }),
            }
            return chain
          }
          return {
            select: vi.fn().mockReturnThis(),
            then: (resolve: any) => resolve({ data: [], error: null }),
          }
        }),
      }

      const overview = await getMarketingAttributionOverview(mockSupabase, { period: 'all' })

      // Gross revenue: ord-1 (500000) + ord-2 (300000) = 800000
      expect(overview.grossRevenueMinor).toBe(800000)
      // Net revenue: 800000 - 50000 (refund) = 750000
      expect(overview.netRevenueMinor).toBe(750000)
      // Discount: ord-1 (50000)
      expect(overview.discountCostMinor).toBe(50000)
      // Paid orders: 2
      expect(overview.paidOrders).toBe(2)
      // Ad spend status: explicitly unavailable
      expect(overview.adSpendStatus).toBe('unavailable')

      // Check channels
      const paidSocial = overview.channels.find((c) => c.channel === 'Paid Social')
      expect(paidSocial?.orders).toBe(1)
      expect(paidSocial?.revenueMinor).toBe(500000)

      const whatsApp = overview.channels.find((c) => c.channel === 'WhatsApp')
      expect(whatsApp?.orders).toBe(1)
      expect(whatsApp?.revenueMinor).toBe(300000)

      // Check campaigns
      const summerSale = overview.campaigns.find((c) => c.campaignName === 'summer_sale')
      expect(summerSale?.orders).toBe(1)
      expect(summerSale?.netRevenueMinor).toBe(500000)

      // Funnel has all steps
      expect(overview.funnel.length).toBe(6)
      expect(overview.funnel[0].stage).toBe('session')
      expect(overview.funnel[5].stage).toBe('payment_success')
    })
  })

  describe('reconcileAttributionData', () => {
    it('detects unattributed orders and duplicate payment events', async () => {
      const mockOrders = [
        {
          id: 'ord-good',
          order_number: 'GIN-201',
          attribution_channel: 'Paid Search',
          attribution_snapshot: { model: 'last_non_direct' },
          payment_status: 'paid',
        },
        {
          id: 'ord-bad',
          order_number: 'GIN-202',
          attribution_channel: 'Unknown',
          attribution_snapshot: null,
          payment_status: 'paid',
        },
      ]

      const mockPaymentEvents = [
        { event_id: 'ev-1', order_id: 'ord-good', metadata: {} },
        { event_id: 'ev-2', order_id: 'ord-good', metadata: {} }, // duplicate!
      ]

      const mockSupabase: any = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'orders') {
            return {
              select: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
            }
          }
          if (table === 'customer_events') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockPaymentEvents, error: null }),
              gt: vi.fn().mockResolvedValue({ data: [], error: null }),
            }
          }
          return {
            select: vi.fn().mockReturnThis(),
            then: (resolve: any) => resolve({ data: [], error: null }),
          }
        }),
      }

      const report = await reconcileAttributionData(mockSupabase)
      expect(report.totalOrdersChecked).toBe(2)
      expect(report.unattributedOrdersCount).toBe(1)
      expect(report.duplicatePaymentEventsCount).toBe(1)
      expect(report.anomalies.some((a) => a.type === 'unattributed_order')).toBe(true)
      expect(report.anomalies.some((a) => a.type === 'duplicate_payment_event')).toBe(true)
    })
  })

  describe('getCustomerAcquisitionAttribution', () => {
    it('returns acquisition channel and latest purchase channel', async () => {
      const mockOrders = [
        {
          id: 'ord-first',
          order_number: 'GIN-001',
          attribution_channel: 'Paid Social',
          utm_source: 'instagram',
          utm_campaign: 'ramadan_2025',
          created_at: '2025-03-01T00:00:00Z',
          status: 'delivered',
          payment_status: 'paid',
        },
        {
          id: 'ord-latest',
          order_number: 'GIN-002',
          attribution_channel: 'WhatsApp',
          utm_source: 'whatsapp',
          utm_campaign: 'vip_offer',
          created_at: '2025-05-01T00:00:00Z',
          status: 'delivered',
          payment_status: 'paid',
        },
      ]

      const mockSupabase: any = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
        }),
      }

      const acq = await getCustomerAcquisitionAttribution(mockSupabase, 'cust-123')
      expect(acq.acquisitionChannel).toBe('Paid Social')
      expect(acq.acquisitionSource).toBe('instagram')
      expect(acq.acquisitionCampaign).toBe('ramadan_2025')
      expect(acq.latestPurchaseChannel).toBe('WhatsApp')
    })
  })
})
