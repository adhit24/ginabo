import { describe, it, expect } from 'vitest'
import {
  computeCustomer360,
  calculateRepurchaseIntervals,
  computeRFMScore,
  evaluateCustomerSegment,
  evaluateLifecycleState,
} from './segmentationEngine'

describe('segmentationEngine', () => {
  const NOW = new Date('2026-06-16T12:00:00Z')

  describe('Revenue & Order Calculations', () => {
    it('handles zero-order customers safely without division by zero', () => {
      const result = computeCustomer360({
        validOrderCount: 0,
        grossRevenueMinor: 0,
        validRefundsMinor: 0,
        registrationDate: '2026-05-01T00:00:00Z',
        firstOrderDate: null,
        lastOrderDate: null,
        returnCount: 0,
        cancelledOrderCount: 0,
        now: NOW,
      })

      expect(result.netRevenueMinor).toBe(0)
      expect(result.averageOrderValueMinor).toBe(0)
      expect(result.daysSinceLastPurchase).toBeNull()
      expect(result.isRepeatCustomer).toBe(false)
      expect(result.repeatPurchaseCount).toBe(0)
      expect(result.averageRepurchaseGapDays).toBeNull()
      expect(result.lifecycleState).toBe('prospect')
      expect(result.segment).toBe('dormant')
    })

    it('deducts refunds correctly to yield Net Revenue (LTV V1)', () => {
      const result = computeCustomer360({
        validOrderCount: 2,
        grossRevenueMinor: 500_000,
        validRefundsMinor: 100_000,
        registrationDate: '2026-03-01T00:00:00Z',
        firstOrderDate: '2026-04-01T00:00:00Z',
        lastOrderDate: '2026-05-20T00:00:00Z',
        orderDates: ['2026-04-01T00:00:00Z', '2026-05-20T00:00:00Z'],
        returnCount: 1,
        cancelledOrderCount: 0,
        now: NOW,
      })

      expect(result.netRevenueMinor).toBe(400_000)
      expect(result.averageOrderValueMinor).toBe(200_000) // 400k / 2
      expect(result.isRepeatCustomer).toBe(true)
      expect(result.repeatPurchaseCount).toBe(1)
    })

    it('floors negative net revenue to 0 if refunds exceed gross for edge cases', () => {
      const result = computeCustomer360({
        validOrderCount: 1,
        grossRevenueMinor: 100_000,
        validRefundsMinor: 150_000,
        registrationDate: '2026-05-01T00:00:00Z',
        firstOrderDate: '2026-05-10T00:00:00Z',
        lastOrderDate: '2026-05-10T00:00:00Z',
        returnCount: 1,
        cancelledOrderCount: 0,
        now: NOW,
      })

      expect(result.netRevenueMinor).toBe(0)
      expect(result.averageOrderValueMinor).toBe(0)
    })
  })

  describe('Repurchase Cadence & Intervals', () => {
    it('returns null average and median repurchase days for single order customer', () => {
      const { averageDays, medianDays } = calculateRepurchaseIntervals(['2026-06-01T00:00:00Z'])
      expect(averageDays).toBeNull()
      expect(medianDays).toBeNull()
    })

    it('calculates accurate repurchase gap days for repeat customers', () => {
      const dates = [
        '2026-01-01T00:00:00Z',
        '2026-01-31T00:00:00Z', // 30 days gap
        '2026-03-02T00:00:00Z', // 30 days gap
      ]
      const { averageDays, medianDays } = calculateRepurchaseIntervals(dates)
      expect(averageDays).toBe(30)
      expect(medianDays).toBe(30)
    })
  })

  describe('RFM Scoring', () => {
    it('scores maximum 555 for very recent, frequent, high-spending VIP customer', () => {
      const rfm = computeRFMScore(5, 6, 3_000_000)
      expect(rfm.recencyScore).toBe(5)
      expect(rfm.frequencyScore).toBe(5)
      expect(rfm.monetaryScore).toBe(5)
      expect(rfm.compositeScore).toBe('555')
    })

    it('scores 111 for dormant, one-time, low spending buyer', () => {
      const rfm = computeRFMScore(200, 1, 90_000)
      expect(rfm.recencyScore).toBe(1)
      expect(rfm.frequencyScore).toBe(1)
      expect(rfm.monetaryScore).toBe(1)
      expect(rfm.compositeScore).toBe('111')
    })
  })

  describe('Business Segmentation & Lifecycle Transitions', () => {
    it('classifies customer with 1 recent order as new_customer', () => {
      const seg = evaluateCustomerSegment({
        validOrderCount: 1,
        netRevenueMinor: 250_000,
        daysSinceLastPurchase: 10,
        returnRatePercent: 0,
        returnCount: 0,
        expectedRepurchaseWindowDays: 45,
      })
      expect(seg).toBe('new_customer')
      expect(evaluateLifecycleState(1, seg)).toBe('first_time_buyer')
    })

    it('classifies customer with 1 old order (> 30 days) as one_time_buyer, NOT loyal', () => {
      const seg = evaluateCustomerSegment({
        validOrderCount: 1,
        netRevenueMinor: 300_000,
        daysSinceLastPurchase: 50,
        returnRatePercent: 0,
        returnCount: 0,
        expectedRepurchaseWindowDays: 45,
      })
      expect(seg).toBe('one_time_buyer')
      expect(evaluateLifecycleState(1, seg)).toBe('first_time_buyer')
    })

    it('classifies high-value repeat customer as vip', () => {
      const seg = evaluateCustomerSegment({
        validOrderCount: 3,
        netRevenueMinor: 2_500_000,
        daysSinceLastPurchase: 20,
        returnRatePercent: 0,
        returnCount: 0,
        expectedRepurchaseWindowDays: 45,
      })
      expect(seg).toBe('vip')
      expect(evaluateLifecycleState(3, seg)).toBe('loyal')
    })

    it('transitions repeat customer past repurchase window into at_risk', () => {
      const seg = evaluateCustomerSegment({
        validOrderCount: 2,
        netRevenueMinor: 400_000,
        daysSinceLastPurchase: 75, // > 45 * 1.5 = 67.5 days
        returnRatePercent: 0,
        returnCount: 0,
        expectedRepurchaseWindowDays: 45,
      })
      expect(seg).toBe('at_risk')
      expect(evaluateLifecycleState(2, seg)).toBe('at_risk')
    })

    it('transitions back from at_risk to repeat_customer when customer places a fresh order', () => {
      const seg = evaluateCustomerSegment({
        validOrderCount: 3,
        netRevenueMinor: 600_000,
        daysSinceLastPurchase: 5, // Just ordered!
        returnRatePercent: 0,
        returnCount: 0,
        expectedRepurchaseWindowDays: 45,
      })
      expect(seg).toBe('loyal') // >= 3 orders + recent
      expect(evaluateLifecycleState(3, seg)).toBe('loyal')
    })

    it('identifies high return risk customers when return rate >= 30% and returns >= 2', () => {
      const seg = evaluateCustomerSegment({
        validOrderCount: 3,
        netRevenueMinor: 200_000,
        daysSinceLastPurchase: 10,
        returnRatePercent: 66.6,
        returnCount: 2,
        expectedRepurchaseWindowDays: 45,
      })
      expect(seg).toBe('high_return_risk')
    })
  })
})
