import { describe, it, expect } from 'vitest'
import {
  normalizeCouponCode,
  deriveCouponStatus,
  calculateEligibleSubtotal,
  calculateDiscount,
  evaluateDateValidity,
  evaluateUsageLimits,
  evaluateCustomerEligibility,
  formatRuleSummary,
  validateCouponRules,
} from './promotionEngine'
import type { Coupon, PromotionCartItem } from './types'

describe('Promotion Engine', () => {
  describe('normalizeCouponCode', () => {
    it('trims and converts code to uppercase', () => {
      expect(normalizeCouponCode('  ginabo20  ')).toBe('GINABO20')
      expect(normalizeCouponCode('GlowUp_10')).toBe('GLOWUP_10')
    })
  })

  describe('deriveCouponStatus', () => {
    const now = 1700000000000 // Fixed epoch

    it('returns disabled if isActive is false', () => {
      expect(
        deriveCouponStatus({ isActive: false, startsAt: new Date(now - 1000).toISOString(), expiresAt: null }, now),
      ).toBe('disabled')
    })

    it('returns scheduled if startsAt is in the future', () => {
      expect(
        deriveCouponStatus(
          { isActive: true, startsAt: new Date(now + 100000).toISOString(), expiresAt: null },
          now,
        ),
      ).toBe('scheduled')
    })

    it('returns expired if expiresAt is in the past', () => {
      expect(
        deriveCouponStatus(
          {
            isActive: true,
            startsAt: new Date(now - 100000).toISOString(),
            expiresAt: new Date(now - 1000).toISOString(),
          },
          now,
        ),
      ).toBe('expired')
    })

    it('returns active if valid within window', () => {
      expect(
        deriveCouponStatus(
          {
            isActive: true,
            startsAt: new Date(now - 10000).toISOString(),
            expiresAt: new Date(now + 10000).toISOString(),
          },
          now,
        ),
      ).toBe('active')
    })
  })

  describe('calculateEligibleSubtotal', () => {
    const items: PromotionCartItem[] = [
      { productId: 'p1', categoryId: 'cat_serum', unitPrice: 150000, quantity: 2 }, // 300.000
      { productId: 'p2', categoryId: 'cat_cleanser', unitPrice: 80000, quantity: 1 }, // 80.000
    ]

    it('sums all items when appliesTo is all', () => {
      expect(calculateEligibleSubtotal(items, 'all')).toBe(380000)
    })

    it('filters items for specific_products', () => {
      expect(calculateEligibleSubtotal(items, 'specific_products', ['p1'])).toBe(300000)
      expect(calculateEligibleSubtotal(items, 'specific_products', ['p3'])).toBe(0)
    })

    it('filters items for specific_categories', () => {
      expect(calculateEligibleSubtotal(items, 'specific_categories', null, ['cat_cleanser'])).toBe(80000)
      expect(calculateEligibleSubtotal(items, 'specific_categories', null, ['cat_cream'])).toBe(0)
    })
  })

  describe('calculateDiscount', () => {
    it('calculates percentage discount accurately with integer rounding', () => {
      // 10% of 155.555 -> 15.556
      const discount = calculateDiscount(155555, 20000, {
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: null,
      })
      expect(discount).toBe(15556)
    })

    it('caps percentage discount at maxDiscountAmount', () => {
      // 20% of 1.000.000 = 200.000, capped at 50.000
      const discount = calculateDiscount(1000000, 20000, {
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountAmount: 50000,
      })
      expect(discount).toBe(50000)
    })

    it('never allows percentage discount to exceed eligible subtotal', () => {
      const discount = calculateDiscount(100000, 20000, {
        discountType: 'percentage',
        discountValue: 120, // misconfiguration
        maxDiscountAmount: null,
      })
      expect(discount).toBe(100000)
    })

    it('calculates fixed IDR discount safely', () => {
      const discount = calculateDiscount(250000, 20000, {
        discountType: 'fixed_idr',
        discountValue: 50000,
        maxDiscountAmount: null,
      })
      expect(discount).toBe(50000)
    })

    it('caps fixed IDR discount at eligible subtotal so total is never negative', () => {
      const discount = calculateDiscount(30000, 20000, {
        discountType: 'fixed_idr',
        discountValue: 50000,
        maxDiscountAmount: null,
      })
      expect(discount).toBe(30000)
    })

    it('calculates free shipping discount up to shipping cost or cap', () => {
      const discount = calculateDiscount(200000, 25000, {
        discountType: 'free_shipping',
        discountValue: 0,
        maxDiscountAmount: 20000,
      })
      expect(discount).toBe(20000)
    })
  })

  describe('evaluateCustomerEligibility', () => {
    it('allows all customers when eligibility is all', () => {
      expect(evaluateCustomerEligibility(undefined, { customerEligibility: 'all' })).toEqual({ eligible: true })
    })

    it('validates first_purchase (only customers with 0 valid paid orders)', () => {
      // New user (0 orders)
      expect(
        evaluateCustomerEligibility({ validPaidOrderCount: 0 }, { customerEligibility: 'first_purchase' }),
      ).toEqual({ eligible: true })

      // Repeat user (1 order)
      const res = evaluateCustomerEligibility({ validPaidOrderCount: 1 }, { customerEligibility: 'first_purchase' })
      expect(res.eligible).toBe(false)
      expect(res.errorCode).toBe('NOT_ELIGIBLE_FIRST_PURCHASE')
    })

    it('validates repeat_customer (customers with >= 2 valid paid orders)', () => {
      expect(
        evaluateCustomerEligibility({ validPaidOrderCount: 1 }, { customerEligibility: 'repeat_customer' }).eligible,
      ).toBe(false)

      expect(
        evaluateCustomerEligibility({ validPaidOrderCount: 2 }, { customerEligibility: 'repeat_customer' }).eligible,
      ).toBe(true)
    })

    it('validates specific_segments', () => {
      const coupon = {
        customerEligibility: 'specific_segments' as const,
        eligibleSegments: ['vip' as const, 'loyal' as const],
      }

      expect(evaluateCustomerEligibility({ validPaidOrderCount: 1, segment: 'new_customer' }, coupon).eligible).toBe(
        false,
      )
      expect(evaluateCustomerEligibility({ validPaidOrderCount: 5, segment: 'vip' }, coupon).eligible).toBe(true)
    })

    it('validates specific_tiers', () => {
      const coupon = {
        customerEligibility: 'specific_tiers' as const,
        eligibleTiers: ['Gold' as const, 'Platinum' as const],
      }

      expect(evaluateCustomerEligibility({ validPaidOrderCount: 1, tier: 'Regular' }, coupon).eligible).toBe(false)
      expect(evaluateCustomerEligibility({ validPaidOrderCount: 4, tier: 'Gold' }, coupon).eligible).toBe(true)
    })
  })

  describe('formatRuleSummary', () => {
    it('formats summary for percentage with min spend and tier', () => {
      const summary = formatRuleSummary({
        discountType: 'percentage',
        discountValue: 15,
        maxDiscountAmount: 40000,
        minOrderAmount: 250000,
        appliesTo: 'all',
        customerEligibility: 'specific_tiers',
        eligibleTiers: ['Gold', 'Platinum'],
      })
      expect(summary).toContain('Diskon 15%')
      expect(summary).toContain('Min. Belanja')
      expect(summary).toContain('Gold/Platinum')
    })
  })

  describe('validateCouponRules integration', () => {
    const baseCoupon: Coupon = {
      id: 'c1',
      code: 'GINABO10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 100000,
      maxDiscountAmount: 30000,
      usageLimit: 100,
      usagePerUser: 1,
      usedCount: 5,
      appliesTo: 'all',
      productIds: null,
      categoryIds: null,
      isActive: true,
      startsAt: '2020-01-01T00:00:00Z',
      expiresAt: '2030-01-01T00:00:00Z',
      customerEligibility: 'all',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z',
    }

    const items: PromotionCartItem[] = [{ productId: 'p1', unitPrice: 200000, quantity: 1 }]

    it('successfully applies valid coupon', () => {
      const res = validateCouponRules(baseCoupon, items, 15000)
      expect(res.valid).toBe(true)
      expect(res.discountAmount).toBe(20000) // 10% of 200.000
      expect(res.newSubtotal).toBe(180000)
      expect(res.discountSnapshot).toBeDefined()
      expect(res.discountSnapshot?.appliedAmount).toBe(20000)
    })

    it('rejects if subtotal is below minOrderAmount', () => {
      const smallItems: PromotionCartItem[] = [{ productId: 'p1', unitPrice: 50000, quantity: 1 }]
      const res = validateCouponRules(baseCoupon, smallItems, 15000)
      expect(res.valid).toBe(false)
      expect(res.errorCode).toBe('MIN_SPEND_NOT_MET')
      expect(res.discountAmount).toBe(0)
    })

    it('rejects if user limit is exceeded', () => {
      const res = validateCouponRules(baseCoupon, items, 15000, undefined, 5, 1) // userUsage = 1 >= usagePerUser = 1
      expect(res.valid).toBe(false)
      expect(res.errorCode).toBe('USER_LIMIT_REACHED')
    })

    it('rejects if global limit is exceeded', () => {
      const res = validateCouponRules(baseCoupon, items, 15000, undefined, 100, 0) // globalUsage = 100 >= usageLimit = 100
      expect(res.valid).toBe(false)
      expect(res.errorCode).toBe('GLOBAL_LIMIT_REACHED')
    })
  })
})
