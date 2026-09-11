export type ExecutivePeriod =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'custom'

export type MetricPolarity = 'positive' | 'negative' | 'neutral'

export interface KpiMetricItem {
  current: number
  previous: number
  absoluteChange: number
  percentageChange: number | null
  polarity: MetricPolarity
  isFavorable: boolean
  formattedCurrent: string
  formattedPrevious: string
}

export interface ExecutiveKpis {
  netRevenue: KpiMetricItem
  grossRevenue: KpiMetricItem
  paidOrders: KpiMetricItem
  averageOrderValue: KpiMetricItem
  conversionRate: KpiMetricItem
  newCustomers: KpiMetricItem
  repeatPurchaseRate: KpiMetricItem
  refundRate: KpiMetricItem
  discountCost: KpiMetricItem
  atRiskCustomersCount: KpiMetricItem
}

export interface DailyRevenueTrendPoint {
  date: string // YYYY-MM-DD
  grossRevenueMinor: number
  netRevenueMinor: number
  ordersCount: number
}

export interface OrderStatusSummary {
  pending: number
  paid: number
  processing: number
  shipped: number
  delivered: number
  completed: number
  cancelled: number
  totalBacklog: number // Orders waiting processing or shipping
}

export interface CustomerHealthSummary {
  totalValidBuyers: number
  newBuyersCount: number
  repeatBuyersCount: number
  repeatPurchaseRatePercent: number
  loyalCount: number
  vipCount: number
  atRiskCount: number
  dormantCount: number
  atRiskRevenueValueMinor: number
}

export interface MarketingSummary {
  totalSessions: number
  paidOrders: number
  conversionRatePercent: number
  topChannels: Array<{
    channel: string
    orders: number
    revenueMinor: number
    cvr: number
  }>
  topCampaigns: Array<{
    campaign: string
    orders: number
    revenueMinor: number
  }>
  unattributedPercent: number
  adSpendStatus: 'unavailable'
}

export interface InventorySummary {
  outOfStockCount: number
  criticalCount: number
  lowStockCount: number
  healthyCount: number
  suggestedReorderCount: number
  criticalProducts: Array<{
    id: string
    name: string
    sku: string
    stockQuantity: number
  }>
}

export interface ReturnsSummary {
  returnRequestsCount: number
  approvedReturnsCount: number
  completedRefundsCount: number
  refundValueMinor: number
  refundRatePercent: number
}

export interface ExecutiveAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  metricKey: string
  actionHref: string
}

export interface OwnerActionItem {
  id: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  href: string
  badge?: string
}

export interface ExecutiveDashboardSummary {
  period: ExecutivePeriod
  periodLabel: string
  currentDateRange: {
    start: string | null
    end: string | null
  }
  previousDateRange: {
    start: string | null
    end: string | null
  }
  kpis: ExecutiveKpis
  trends: DailyRevenueTrendPoint[]
  orderStatus: OrderStatusSummary
  customers: CustomerHealthSummary
  marketing: MarketingSummary
  inventory: InventorySummary
  returns: ReturnsSummary
  alerts: ExecutiveAlert[]
  actions: OwnerActionItem[]
  dataQuality: {
    isConsistent: boolean
    issues: string[]
  }
  generatedAt: string
}
