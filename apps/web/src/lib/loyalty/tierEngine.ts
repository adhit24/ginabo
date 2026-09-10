import { LOYALTY_CONFIG } from './loyaltyConfig'
import type { MembershipTier } from './types'

/**
 * Deterministically computes customer membership tier from historical lifetime net spend.
 */
export function calculateMembershipTier(lifetimeNetSpendMinor: number): MembershipTier {
  const spend = Math.max(0, lifetimeNetSpendMinor)
  const thresholds = LOYALTY_CONFIG.TIER_THRESHOLDS_IDR

  if (spend >= thresholds.Platinum) return 'Platinum'
  if (spend >= thresholds.Gold) return 'Gold'
  if (spend >= thresholds.Silver) return 'Silver'
  return 'Regular'
}

/**
 * Computes progress and required spending to advance to the next membership tier.
 */
export function calculateTierProgress(lifetimeNetSpendMinor: number): {
  currentTier: MembershipTier
  nextTier: MembershipTier | null
  spendToNextTierMinor: number
  progressPercent: number
  message: string
} {
  const spend = Math.max(0, lifetimeNetSpendMinor)
  const currentTier = calculateMembershipTier(spend)
  const thresholds = LOYALTY_CONFIG.TIER_THRESHOLDS_IDR

  if (currentTier === 'Platinum') {
    return {
      currentTier,
      nextTier: null,
      spendToNextTierMinor: 0,
      progressPercent: 100,
      message: 'Selamat! Anda sudah berada di tier tertinggi GINABO Platinum.',
    }
  }

  let nextTier: MembershipTier = 'Silver'
  let lowerBound = thresholds.Regular
  let target = thresholds.Silver

  if (currentTier === 'Silver') {
    nextTier = 'Gold'
    lowerBound = thresholds.Silver
    target = thresholds.Gold
  } else if (currentTier === 'Gold') {
    nextTier = 'Platinum'
    lowerBound = thresholds.Gold
    target = thresholds.Platinum
  }

  const spendToNextTierMinor = Math.max(0, target - spend)
  const range = target - lowerBound
  const currentProgress = spend - lowerBound
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)))

  const formattedRemaining = spendToNextTierMinor.toLocaleString('id-ID')
  const message = `Belanja Rp ${formattedRemaining} lagi untuk naik ke level ${nextTier}.`

  return {
    currentTier,
    nextTier,
    spendToNextTierMinor,
    progressPercent,
    message,
  }
}

/**
 * Server-authoritative calculation of loyalty points earned from net eligible order spending.
 */
export function calculatePointsFromSpend(netAmountMinor: number): number {
  if (netAmountMinor <= 0) return 0
  const thousands = Math.floor(netAmountMinor / 1000)
  return Math.max(0, thousands * LOYALTY_CONFIG.POINTS_PER_1000_IDR)
}
