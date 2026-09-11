export type MarketingChannelName =
  | 'Direct'
  | 'Organic Search'
  | 'Paid Search'
  | 'Organic Social'
  | 'Paid Social'
  | 'WhatsApp'
  | 'Marketplace'
  | 'Referral'
  | 'Email'
  | 'Campaign'
  | 'Unknown'

export interface AttributionTouch {
  source?: string | null
  medium?: string | null
  campaign?: string | null
  content?: string | null
  term?: string | null
  referrer?: string | null
  landingPage?: string | null
  channel: MarketingChannelName
  capturedAt: string
}

export interface AttributionSnapshot {
  firstTouch?: AttributionTouch | null
  lastTouch?: AttributionTouch | null
  channel: MarketingChannelName
  model: 'last_non_direct'
  capturedAt: string
}

export interface AttributionPayload {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  referrer?: string | null
  landing_page?: string | null
  attribution_channel?: MarketingChannelName | null
  attribution_snapshot?: AttributionSnapshot | null
}

export interface ChannelMetrics {
  channel: MarketingChannelName
  sessions: number
  orders: number
  conversionRatePercent: number
  newCustomers: number
  revenueMinor: number
  averageOrderValueMinor: number
}

export interface CampaignAttributionMetrics {
  campaignName: string
  objective: string
  sessions: number
  orders: number
  conversionRatePercent: number
  newCustomers: number
  netRevenueMinor: number
  discountCostMinor: number
}

export interface FunnelStep {
  stage: string
  name: string
  count: number
  conversionRatePercent: number
  dropoffRatePercent: number
}

export interface AttributionMetrics {
  periodLabel: string
  totalSessions: number
  paidOrders: number
  conversionRatePercent: number
  grossRevenueMinor: number
  netRevenueMinor: number
  discountCostMinor: number
  newCustomersCount: number
  repeatRevenueMinor: number
  channels: ChannelMetrics[]
  campaigns: CampaignAttributionMetrics[]
  funnel: FunnelStep[]
  adSpendStatus: 'unavailable'
}

export interface AttributionReconciliationReport {
  auditedAt: string
  totalOrdersChecked: number
  unattributedOrdersCount: number
  duplicatePaymentEventsCount: number
  anomalies: Array<{
    type: string
    message: string
    orderId?: string
  }>
}
