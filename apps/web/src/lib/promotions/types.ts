import type { CustomerSegment } from '@/lib/customers/types'
import type { MembershipTier } from '@/lib/loyalty/types'

export type DiscountType = 'percentage' | 'fixed_idr' | 'free_shipping'

export type AppliesToScope = 'all' | 'specific_products' | 'specific_categories'

export type CustomerEligibilityType =
  | 'all'
  | 'first_purchase'
  | 'repeat_customer'
  | 'specific_segments'
  | 'specific_tiers'
  | 'specific_profiles'

export type CampaignObjective =
  | 'acquisition'
  | 'conversion'
  | 'retention'
  | 'winback'
  | 'loyalty'
  | 'seasonal'

export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'disabled'

export interface Campaign {
  id: string
  name: string
  slug: string
  objective: CampaignObjective
  description?: string | null
  startsAt?: string | null
  endsAt?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: string
  code: string
  description?: string | null
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number | null
  usageLimit: number | null
  usagePerUser: number
  usedCount: number
  appliesTo: AppliesToScope
  productIds: string[] | null
  categoryIds: string[] | null
  isActive: boolean
  startsAt: string
  expiresAt: string | null
  campaignId?: string | null
  customerEligibility: CustomerEligibilityType
  eligibleSegments?: CustomerSegment[] | null
  eligibleTiers?: MembershipTier[] | null
  eligibleProfileIds?: string[] | null
  createdAt: string
  updatedAt: string
}

export interface CustomerEvaluationContext {
  profileId?: string | null
  validPaidOrderCount: number
  segment?: CustomerSegment | null
  tier?: MembershipTier | null
}

export interface PromotionCartItem {
  productId: string
  categoryId?: string | null
  unitPrice: number
  quantity: number
}

export interface DiscountSnapshot {
  couponId: string
  code: string
  discountType: DiscountType
  discountValue: number
  appliedAmount: number
  eligibleSubtotal: number
  maxDiscountAmount: number | null
  customerEligibility: CustomerEligibilityType
  calculatedAt: string
}

export interface PromotionValidationResult {
  valid: boolean
  code?: string
  couponId?: string
  discountType?: DiscountType
  discountValue?: number
  discountAmount: number
  eligibleSubtotal: number
  newSubtotal: number
  message: string
  ruleSummary?: string
  discountSnapshot?: DiscountSnapshot
  errorCode?:
    | 'NOT_FOUND'
    | 'INACTIVE'
    | 'NOT_STARTED'
    | 'EXPIRED'
    | 'MIN_SPEND_NOT_MET'
    | 'GLOBAL_LIMIT_REACHED'
    | 'USER_LIMIT_REACHED'
    | 'SCOPE_MISMATCH'
    | 'NOT_ELIGIBLE_FIRST_PURCHASE'
    | 'NOT_ELIGIBLE_REPEAT'
    | 'NOT_ELIGIBLE_SEGMENT'
    | 'NOT_ELIGIBLE_TIER'
    | 'NOT_ELIGIBLE_PROFILE'
    | 'INTERNAL_ERROR'
}

export interface PromotionMetrics {
  totalCoupons: number
  activeCoupons: number
  totalRedemptions: number
  totalDiscountCost: number
  associatedGrossRevenue: number
}

export interface PromotionReconciliationReport {
  auditedAt: string
  totalCouponsChecked: number
  anomaliesCount: number
  anomalies: Array<{
    couponId: string
    code: string
    type: 'EXPIRED_STILL_ACTIVE' | 'USAGE_EXCEEDED_LIMIT' | 'INVALID_PERCENTAGE' | 'INVALID_DATE_RANGE' | 'USAGE_COUNT_DRIFT'
    description: string
  }>
}
