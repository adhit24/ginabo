import { describe, it, expect } from 'vitest'
import {
  calculateMembershipTier,
  calculateTierProgress,
  calculatePointsFromSpend,
} from './tierEngine'

describe('tierEngine', () => {
  describe('calculateMembershipTier', () => {
    it('assigns Regular to new customers with 0 spend', () => {
      expect(calculateMembershipTier(0)).toBe('Regular')
      expect(calculateMembershipTier(250_000)).toBe('Regular')
      expect(calculateMembershipTier(499_999)).toBe('Regular')
    })

    it('assigns Silver at Rp 500.000 spend', () => {
      expect(calculateMembershipTier(500_000)).toBe('Silver')
      expect(calculateMembershipTier(1_000_000)).toBe('Silver')
      expect(calculateMembershipTier(1_499_999)).toBe('Silver')
    })

    it('assigns Gold at Rp 1.500.000 spend', () => {
      expect(calculateMembershipTier(1_500_000)).toBe('Gold')
      expect(calculateMembershipTier(2_500_000)).toBe('Gold')
      expect(calculateMembershipTier(2_999_999)).toBe('Gold')
    })

    it('assigns Platinum at Rp 3.000.000+ spend', () => {
      expect(calculateMembershipTier(3_000_000)).toBe('Platinum')
      expect(calculateMembershipTier(10_000_000)).toBe('Platinum')
    })

    it('handles negative or invalid values gracefully by clamping to 0', () => {
      expect(calculateMembershipTier(-500)).toBe('Regular')
    })
  })

  describe('calculateTierProgress', () => {
    it('calculates progress from Regular towards Silver', () => {
      const progress = calculateTierProgress(250_000)
      expect(progress.currentTier).toBe('Regular')
      expect(progress.nextTier).toBe('Silver')
      expect(progress.spendToNextTierMinor).toBe(250_000)
      expect(progress.progressPercent).toBe(50)
      expect(progress.message).toContain('Rp 250.000 lagi')
    })

    it('calculates progress from Silver towards Gold', () => {
      const progress = calculateTierProgress(1_000_000)
      expect(progress.currentTier).toBe('Silver')
      expect(progress.nextTier).toBe('Gold')
      expect(progress.spendToNextTierMinor).toBe(500_000)
      expect(progress.progressPercent).toBe(50) // 500k out of (1.5M - 500k = 1M)
      expect(progress.message).toContain('Gold')
    })

    it('handles Platinum highest tier without next tier', () => {
      const progress = calculateTierProgress(3_500_000)
      expect(progress.currentTier).toBe('Platinum')
      expect(progress.nextTier).toBeNull()
      expect(progress.spendToNextTierMinor).toBe(0)
      expect(progress.progressPercent).toBe(100)
      expect(progress.message).toContain('tertinggi')
    })
  })

  describe('calculatePointsFromSpend', () => {
    it('calculates 1 point per Rp 1.000 spend', () => {
      expect(calculatePointsFromSpend(100_000)).toBe(100)
      expect(calculatePointsFromSpend(287_999)).toBe(287)
    })

    it('returns 0 for sub-1000 spend and 0/negative numbers', () => {
      expect(calculatePointsFromSpend(0)).toBe(0)
      expect(calculatePointsFromSpend(999)).toBe(0)
      expect(calculatePointsFromSpend(-50_000)).toBe(0)
    })
  })
})
