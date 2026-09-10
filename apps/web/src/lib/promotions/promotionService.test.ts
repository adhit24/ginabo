import { describe, it, expect, vi } from 'vitest'
import {
  mapDbCouponToDomain,
  mapDbCampaignToDomain,
  validateCouponCode,
  reconcilePromotionData,
} from './promotionService'

describe('Promotion Service', () => {
  describe('Mapping functions', () => {
    it('correctly maps DB coupon row to domain Coupon', () => {
      const dbRow = {
        id: '123',
        code: 'GINABO20',
        description: 'Diskon 20%',
        discount_type: 'percentage',
        discount_value: '20',
        min_order_amount: '100000',
        max_discount_amount: '50000',
        usage_limit: '100',
        usage_per_user: '2',
        used_count: '10',
        applies_to: 'all',
        product_ids: null,
        category_ids: null,
        is_active: true,
        starts_at: '2025-01-01T00:00:00Z',
        expires_at: '2025-12-31T23:59:59Z',
        campaign_id: 'camp-1',
        customer_eligibility: 'first_purchase',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      const domain = mapDbCouponToDomain(dbRow)
      expect(domain.id).toBe('123')
      expect(domain.code).toBe('GINABO20')
      expect(domain.discountValue).toBe(20)
      expect(domain.minOrderAmount).toBe(100000)
      expect(domain.maxDiscountAmount).toBe(50000)
      expect(domain.customerEligibility).toBe('first_purchase')
    })

    it('correctly maps DB campaign row to domain Campaign', () => {
      const dbRow = {
        id: 'c1',
        name: 'Ramadan Glow',
        slug: 'ramadan-glow',
        objective: 'seasonal',
        description: 'Promo Ramadan',
        starts_at: '2025-03-01T00:00:00Z',
        ends_at: '2025-04-01T00:00:00Z',
        is_active: true,
        created_at: '2025-03-01T00:00:00Z',
        updated_at: '2025-03-01T00:00:00Z',
      }

      const domain = mapDbCampaignToDomain(dbRow)
      expect(domain.id).toBe('c1')
      expect(domain.name).toBe('Ramadan Glow')
      expect(domain.objective).toBe('seasonal')
    })
  })

  describe('validateCouponCode', () => {
    it('returns NOT_FOUND if coupon does not exist in DB', async () => {
      const mockDb: any = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      }

      const res = await validateCouponCode(mockDb, {
        code: 'NOTEXIST',
        items: [{ productId: 'p1', unitPrice: 100000, quantity: 1 }],
      })

      expect(res.valid).toBe(false)
      expect(res.errorCode).toBe('NOT_FOUND')
    })
  })

  describe('reconcilePromotionData', () => {
    it('detects expired active coupons and usage anomalies', async () => {
      const mockCoupons = [
        {
          id: 'c-expired',
          code: 'EXPIRED10',
          is_active: true,
          starts_at: '2020-01-01T00:00:00Z',
          expires_at: '2021-01-01T00:00:00Z', // In past
          discount_type: 'percentage',
          discount_value: 10,
          usage_limit: 10,
          used_count: 5,
        },
        {
          id: 'c-exceeded',
          code: 'OVERUSED',
          is_active: true,
          starts_at: '2020-01-01T00:00:00Z',
          expires_at: null,
          discount_type: 'percentage',
          discount_value: 10,
          usage_limit: 10,
          used_count: 15, // Exceeded
        },
      ]

      const mockDb: any = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: mockCoupons, error: null }),
        }),
      }

      const report = await reconcilePromotionData(mockDb)
      expect(report.anomaliesCount).toBe(2)
      expect(report.anomalies[0].type).toBe('EXPIRED_STILL_ACTIVE')
      expect(report.anomalies[1].type).toBe('USAGE_EXCEEDED_LIMIT')
    })
  })
})
