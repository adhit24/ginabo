export type MembershipTier = 'Regular' | 'Silver' | 'Gold' | 'Platinum'

export type LoyaltyTransactionType =
  | 'earn_purchase'
  | 'redeem'
  | 'adjustment'
  | 'reversal'
  | 'welcome_bonus'
  | 'expiry'

export type LoyaltySourceType =
  | 'order'
  | 'refund'
  | 'admin'
  | 'registration'
  | 'manual'

export interface LoyaltyTransaction {
  id: string
  profileId: string
  transactionType: LoyaltyTransactionType
  pointsDelta: number
  balanceAfter: number
  sourceType: LoyaltySourceType
  sourceId: string
  description: string
  createdAt: string
}

export interface CustomerLoyaltySummary {
  profileId: string
  pointsBalance: number
  lifetimePointsEarned: number
  lifetimePointsRedeemed: number
  currentTier: MembershipTier
  lifetimeNetSpendMinor: number
  nextTier: MembershipTier | null
  spendToNextTierMinor: number
  tierProgressPercent: number
  tierMessage: string
  recentTransactions: LoyaltyTransaction[]
}

export interface AdminLoyaltyOverview {
  totalMembers: number
  activeMembers: number
  totalPointsOutstanding: number
  totalPointsEarnedAllTime: number
  totalPointsRedeemedAllTime: number
  tierDistribution: Record<MembershipTier, number>
  redemptionRatePercent: number
}

export interface LoyaltyReconciliationReport {
  auditedAt: string
  totalAccountsChecked: number
  discrepanciesCount: number
  discrepancies: Array<{
    profileId: string
    balanceInProfile: number
    sumFromLedger: number
    difference: number
  }>
  negativeBalanceCount: number
  orphanedTransactionsCount: number
}
