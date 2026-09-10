import type {
  CustomerSegment,
  LifecycleState,
  RFMScore,
} from './types'

export interface CustomerMetricsInput {
  validOrderCount: number
  grossRevenueMinor: number
  validRefundsMinor: number
  registrationDate: string
  firstOrderDate: string | null
  lastOrderDate: string | null
  orderDates?: string[] // sorted ascending
  returnCount: number
  cancelledOrderCount: number
  now?: Date
}

export interface ComputedCustomerMetrics {
  netRevenueMinor: number
  averageOrderValueMinor: number
  daysSinceLastPurchase: number | null
  customerTenureDays: number
  repeatPurchaseCount: number
  isRepeatCustomer: boolean
  averageRepurchaseGapDays: number | null
  expectedRepurchaseWindowDays: number
  returnRatePercent: number
  segment: CustomerSegment
  lifecycleState: LifecycleState
  rfm: RFMScore
  recommendedAction: string
  riskSignal: boolean
  riskReasons: string[]
  firstPurchaseMonth: string | null
}

export const DEFAULT_SKINCARE_REPURCHASE_WINDOW_DAYS = 45
export const VIP_MIN_REVENUE_THRESHOLD = 1_500_000 // 1.5 million IDR
export const HIGH_RETURN_RATE_THRESHOLD_PERCENT = 30.0

/**
 * Calculates days between two dates.
 */
export function getDaysDifference(d1: Date, d2: Date): number {
  const diffMs = Math.abs(d1.getTime() - d2.getTime())
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calculates average and median repurchase interval in days from an array of order date strings.
 */
export function calculateRepurchaseIntervals(orderDatesAsc: string[]): {
  averageDays: number | null
  medianDays: number | null
} {
  if (!orderDatesAsc || orderDatesAsc.length < 2) {
    return { averageDays: null, medianDays: null }
  }

  const gaps: number[] = []
  for (let i = 1; i < orderDatesAsc.length; i++) {
    const prev = new Date(orderDatesAsc[i - 1]).getTime()
    const curr = new Date(orderDatesAsc[i]).getTime()
    const gapDays = Math.max(0, Math.floor((curr - prev) / (1000 * 60 * 60 * 24)))
    gaps.push(gapDays)
  }

  if (gaps.length === 0) return { averageDays: null, medianDays: null }

  const sum = gaps.reduce((acc, g) => acc + g, 0)
  const averageDays = Math.round(sum / gaps.length)

  // Median
  const sorted = [...gaps].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const medianDays = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)

  return { averageDays, medianDays }
}

/**
 * Scores Recency, Frequency, and Monetary on a 1-5 scale.
 */
export function computeRFMScore(
  daysSinceLastPurchase: number | null,
  validOrderCount: number,
  netRevenueMinor: number
): RFMScore {
  // Recency (R)
  let recencyScore = 1
  if (daysSinceLastPurchase !== null) {
    if (daysSinceLastPurchase <= 30) recencyScore = 5
    else if (daysSinceLastPurchase <= 60) recencyScore = 4
    else if (daysSinceLastPurchase <= 90) recencyScore = 3
    else if (daysSinceLastPurchase <= 180) recencyScore = 2
    else recencyScore = 1
  }

  // Frequency (F)
  let frequencyScore = 1
  if (validOrderCount >= 5) frequencyScore = 5
  else if (validOrderCount === 4) frequencyScore = 4
  else if (validOrderCount === 3) frequencyScore = 3
  else if (validOrderCount === 2) frequencyScore = 2
  else frequencyScore = 1

  // Monetary (M)
  let monetaryScore = 1
  if (netRevenueMinor >= 2_000_000) monetaryScore = 5
  else if (netRevenueMinor >= 1_000_000) monetaryScore = 4
  else if (netRevenueMinor >= 500_000) monetaryScore = 3
  else if (netRevenueMinor >= 200_000) monetaryScore = 2
  else monetaryScore = 1

  return {
    recencyScore,
    frequencyScore,
    monetaryScore,
    compositeScore: `${recencyScore}${frequencyScore}${monetaryScore}`,
  }
}

/**
 * Evaluates business segment based on deterministic, transparent rules.
 */
export function evaluateCustomerSegment(params: {
  validOrderCount: number
  netRevenueMinor: number
  daysSinceLastPurchase: number | null
  returnRatePercent: number
  returnCount: number
  expectedRepurchaseWindowDays: number
}): CustomerSegment {
  const {
    validOrderCount,
    netRevenueMinor,
    daysSinceLastPurchase,
    returnRatePercent,
    returnCount,
    expectedRepurchaseWindowDays,
  } = params

  // 1. High Return Risk (abnormal return rate or high frequency of returns)
  if (
    returnCount >= 2 &&
    (returnRatePercent >= HIGH_RETURN_RATE_THRESHOLD_PERCENT || validOrderCount <= returnCount)
  ) {
    return 'high_return_risk'
  }

  // Customers with 0 valid orders
  if (validOrderCount === 0) {
    return 'dormant'
  }

  const recency = daysSinceLastPurchase ?? 999

  // 2. VIP: high LTV + repeat customer
  if (netRevenueMinor >= VIP_MIN_REVENUE_THRESHOLD && validOrderCount >= 2) {
    return 'vip'
  }

  // 3. Loyal: high frequency (>= 3) and healthy recency
  if (validOrderCount >= 3 && recency <= expectedRepurchaseWindowDays * 1.5) {
    return 'loyal'
  }

  // 4. Repeat Customer: >= 2 valid purchases and active within cadence
  if (validOrderCount >= 2 && recency <= expectedRepurchaseWindowDays * 1.5) {
    return 'repeat_customer'
  }

  // 5. At Risk: repeat customer who has exceeded expected reorder cadence
  if (validOrderCount >= 2 && recency > expectedRepurchaseWindowDays * 1.5 && recency <= 180) {
    return 'at_risk'
  }

  // 6. Dormant: inactive for > 180 days
  if (recency > 180) {
    return 'dormant'
  }

  // 7. New Customer: exactly 1 valid order placed recently (<= 30 days)
  if (validOrderCount === 1 && recency <= 30) {
    return 'new_customer'
  }

  // 8. One-Time Buyer: 1 order, but has passed immediate onboarding window without repeat
  if (validOrderCount === 1 && recency > 30) {
    return 'one_time_buyer'
  }

  return 'new_customer'
}

/**
 * Maps lifecycle state according to purchase history and cadence.
 */
export function evaluateLifecycleState(
  validOrderCount: number,
  segment: CustomerSegment
): LifecycleState {
  if (validOrderCount === 0) return 'prospect'
  if (segment === 'loyal' || segment === 'vip') return 'loyal'
  if (segment === 'at_risk') return 'at_risk'
  if (segment === 'dormant') return 'dormant'
  if (validOrderCount >= 2) return 'repeat_customer'
  return 'first_time_buyer'
}

/**
 * Returns actionable advice for the owner/marketing team per segment.
 */
export function getRecommendedAction(segment: CustomerSegment): string {
  switch (segment) {
    case 'vip':
      return 'Berikan apresiasi VIP eksklusif, prioritas layanan CS, dan akses lebih awal untuk peluncuran produk baru.'
    case 'loyal':
      return 'Tawarkan benefit loyalitas berkala dan rekomendasi produk komplementer untuk meningkatkan basket size.'
    case 'repeat_customer':
      return 'Pertahankan keterikatan dengan edukasi perawatan kulit berkelanjutan dan pengingat restock rutin.'
    case 'new_customer':
      return 'Kirimkan panduan pemakaian (skincare routine regimen) & follow up hasil pemakaian setelah 7-14 hari.'
    case 'one_time_buyer':
      return 'Kirimkan insentif pembelian kedua (kupon reorder) dan mintakan feedback pengalaman produk pertama.'
    case 'at_risk':
      return 'Segera hubungi dengan voucher re-engagement "Ginabo Merindukanmu" sebelum customer menjadi dormant.'
    case 'dormant':
      return 'Jalankan win-back campaign bertarget dengan penawaran spesial atau kabar pembaruan formula produk.'
    case 'high_return_risk':
      return 'Lakukan review riwayat return/komplain; berikan konsultasi pra-pembelian untuk mencegah retur berulang.'
  }
}

/**
 * Main calculation engine for a customer's 360 profile.
 */
export function computeCustomer360(input: CustomerMetricsInput): ComputedCustomerMetrics {
  const referenceDate = input.now ?? new Date()
  const registration = new Date(input.registrationDate)
  const customerTenureDays = Math.max(0, getDaysDifference(referenceDate, registration))

  // Revenue rules: Net = Gross - Valid Refunds
  const grossRevenueMinor = Math.max(0, input.grossRevenueMinor)
  const validRefundsMinor = Math.max(0, input.validRefundsMinor)
  const netRevenueMinor = Math.max(0, grossRevenueMinor - validRefundsMinor)

  // AOV: Net Revenue / Valid Order Count (Safe 0 division)
  const validOrderCount = Math.max(0, input.validOrderCount)
  const averageOrderValueMinor =
    validOrderCount > 0 ? Math.round(netRevenueMinor / validOrderCount) : 0

  // Recency
  let daysSinceLastPurchase: number | null = null
  if (input.lastOrderDate) {
    daysSinceLastPurchase = Math.max(
      0,
      getDaysDifference(referenceDate, new Date(input.lastOrderDate))
    )
  }

  // Repurchase cadence
  const isRepeatCustomer = validOrderCount >= 2
  const repeatPurchaseCount = Math.max(0, validOrderCount - 1)

  const intervals = calculateRepurchaseIntervals(input.orderDates ?? [])
  const averageRepurchaseGapDays = intervals.averageDays
  const expectedRepurchaseWindowDays =
    intervals.medianDays && intervals.medianDays > 0
      ? intervals.medianDays
      : DEFAULT_SKINCARE_REPURCHASE_WINDOW_DAYS

  // Return rate
  const returnCount = Math.max(0, input.returnCount)
  const returnRatePercent =
    validOrderCount > 0
      ? Number(((returnCount / validOrderCount) * 100).toFixed(2))
      : 0.0

  // Risk signals
  const riskReasons: string[] = []
  if (returnRatePercent >= HIGH_RETURN_RATE_THRESHOLD_PERCENT && returnCount >= 2) {
    riskReasons.push(`Tingkat pengembalian tinggi: ${returnRatePercent}% (${returnCount} retur)`)
  }
  if (input.cancelledOrderCount >= 3) {
    riskReasons.push(`Pembatalan pesanan berulang (${input.cancelledOrderCount} order dibatalkan)`)
  }
  const riskSignal = riskReasons.length > 0

  // RFM
  const rfm = computeRFMScore(daysSinceLastPurchase, validOrderCount, netRevenueMinor)

  // Segment
  const segment = evaluateCustomerSegment({
    validOrderCount,
    netRevenueMinor,
    daysSinceLastPurchase,
    returnRatePercent,
    returnCount,
    expectedRepurchaseWindowDays,
  })

  // Lifecycle
  const lifecycleState = evaluateLifecycleState(validOrderCount, segment)

  // Recommended Action
  const recommendedAction = getRecommendedAction(segment)

  // Cohort month
  let firstPurchaseMonth: string | null = null
  if (input.firstOrderDate) {
    const d = new Date(input.firstOrderDate)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    firstPurchaseMonth = `${year}-${month}`
  }

  return {
    netRevenueMinor,
    averageOrderValueMinor,
    daysSinceLastPurchase,
    customerTenureDays,
    repeatPurchaseCount,
    isRepeatCustomer,
    averageRepurchaseGapDays,
    expectedRepurchaseWindowDays,
    returnRatePercent,
    segment,
    lifecycleState,
    rfm,
    recommendedAction,
    riskSignal,
    riskReasons,
    firstPurchaseMonth,
  }
}
