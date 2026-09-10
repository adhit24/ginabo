export type CustomerSegment =
  | 'vip'
  | 'loyal'
  | 'repeat_customer'
  | 'new_customer'
  | 'one_time_buyer'
  | 'at_risk'
  | 'dormant'
  | 'high_return_risk'

export type LifecycleState =
  | 'prospect'
  | 'first_time_buyer'
  | 'repeat_customer'
  | 'loyal'
  | 'at_risk'
  | 'dormant'

export interface RFMScore {
  recencyScore: number // 1 to 5
  frequencyScore: number // 1 to 5
  monetaryScore: number // 1 to 5
  compositeScore: string // e.g. "554"
}

export interface ProductAffinityItem {
  productId: string
  productName: string
  unitsSold: number
  totalRevenueMinor: number
}

export interface CategoryAffinityItem {
  categoryName: string
  unitsSold: number
}

export interface CustomerOrderSummaryItem {
  orderId: string
  orderNumber: string
  status: string
  totalAmountMinor: number
  createdAt: string
  itemCount: number
}

export interface Customer360Profile {
  // Identity
  id: string
  name: string
  email: string | null
  phone: string | null
  normalizedPhone: string | null
  whatsappNumber: string | null
  registrationDate: string
  loyaltyPoints?: number
  membershipTier?: string

  // Marketing & Acquisition Attribution
  acquisitionChannel?: string | null
  acquisitionSource?: string | null
  acquisitionCampaign?: string | null
  firstPurchaseAt?: string | null
  latestPurchaseChannel?: string | null

  // Commerce
  validOrderCount: number
  paidOrderCount: number
  completedOrderCount: number
  grossRevenueMinor: number
  validRefundsMinor: number
  netRevenueMinor: number // LTV V1
  averageOrderValueMinor: number // AOV
  totalUnitsPurchased: number
  firstOrderDate: string | null
  lastOrderDate: string | null
  firstPurchaseMonth: string | null

  // Retention & Cadence
  daysSinceLastPurchase: number | null
  repeatPurchaseCount: number
  isRepeatCustomer: boolean
  customerTenureDays: number
  averageRepurchaseGapDays: number | null
  expectedRepurchaseWindowDays: number

  // Segmentation & Lifecycle
  segment: CustomerSegment
  lifecycleState: LifecycleState
  rfm: RFMScore
  recommendedAction: string

  // Product Affinity
  topProducts: ProductAffinityItem[]
  topCategories: CategoryAffinityItem[]
  recentOrders?: CustomerOrderSummaryItem[]

  // Risk
  cancelledOrderCount: number
  returnCount: number
  refundedAmountMinor: number
  returnRatePercent: number
  riskSignal: boolean
  riskReasons: string[]

  // Marketing Consent & Reachability
  hasEmailConsent: boolean | null
  hasWhatsAppConsent: boolean | null
  consentAuditGap: boolean
}

export interface CustomerListItem {
  id: string
  name: string
  email: string | null
  phone: string | null
  normalizedPhone: string | null
  registrationDate: string
  validOrderCount: number
  netRevenueMinor: number // LTV
  averageOrderValueMinor: number // AOV
  lastOrderDate: string | null
  daysSinceLastPurchase: number | null
  segment: CustomerSegment
  lifecycleState: LifecycleState
  isRepeatCustomer: boolean
  returnCount: number
  returnRatePercent: number
  riskSignal: boolean
}

export interface CustomerSegmentOverview {
  totalCustomers: number
  firstTimeBuyers: number
  repeatCustomers: number
  repeatPurchaseRatePercent: number
  vipCount: number
  loyalCount: number
  atRiskCount: number
  dormantCount: number
  highReturnRiskCount: number
  averageCustomerLtvMinor: number
  medianRepurchaseDays: number
}

export type CustomerSortField = 'ltv' | 'last_purchase' | 'orders' | 'created_at'
export type SortDirection = 'asc' | 'desc'

export interface CustomerListFilter {
  q?: string
  segment?: CustomerSegment | 'all'
  page?: number
  limit?: number
  sortBy?: CustomerSortField
  sortOrder?: SortDirection
}

export interface CustomerListResponse {
  customers: CustomerListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  overview: CustomerSegmentOverview
}

export interface CustomerRetentionOpportunity {
  opportunityType:
    | 'approaching_reorder_window'
    | 'first_purchase_no_second'
    | 'high_ltv_inactive'
    | 'recent_return_resolution'
    | 'vip_active'
  customerId: string
  name: string
  email: string | null
  phone: string | null
  netRevenueMinor: number
  validOrderCount: number
  daysSinceLastPurchase: number | null
  reason: string
  suggestedAction: string
}
