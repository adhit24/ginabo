import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Customer360Profile,
  CustomerListItem,
  CustomerListFilter,
  CustomerListResponse,
  CustomerSegmentOverview,
  CustomerRetentionOpportunity,
  ProductAffinityItem,
  CategoryAffinityItem,
} from './types'
import {
  computeCustomer360,
  calculateRepurchaseIntervals,
} from './segmentationEngine'
import {
  normalizeIndonesianPhone,
  normalizeEmail,
} from './phoneNormalizer'
import { sanitizeCustomerPayload } from '@/lib/auth/adminAuth'
import { calculateMembershipTier } from '@/lib/loyalty/tierEngine'
import { getCustomerAcquisitionAttribution } from '@/lib/attribution/attributionService'

const VALID_ORDER_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'completed']
const VALID_REFUND_STATUSES = ['pending', 'processing', 'completed']

/**
 * Retrieves paginated, filtered, and aggregated Customer 360 list without N+1 queries.
 */
export async function getCustomer360List(
  db: SupabaseClient,
  filters: CustomerListFilter = {}
): Promise<CustomerListResponse> {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.max(1, Math.min(100, filters.limit ?? 25))
  const offset = (page - 1) * limit

  // 1. Fetch profiles
  let profileQuery = db
    .from('profiles')
    .select('id, email, full_name, phone_number, whatsapp_number, created_at', { count: 'exact' })

  if (filters.q) {
    const q = filters.q.trim()
    profileQuery = profileQuery.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,phone_number.ilike.%${q}%`
    )
  }

  const { data: profiles, count: totalCount, error: profileError } = await profileQuery

  if (profileError || !profiles || profiles.length === 0) {
    return {
      customers: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      overview: {
        totalCustomers: 0,
        firstTimeBuyers: 0,
        repeatCustomers: 0,
        repeatPurchaseRatePercent: 0,
        vipCount: 0,
        loyalCount: 0,
        atRiskCount: 0,
        dormantCount: 0,
        highReturnRiskCount: 0,
        averageCustomerLtvMinor: 0,
        medianRepurchaseDays: 45,
      },
    }
  }

  const profileIds = profiles.map((p) => p.id)

  // 2. Fetch orders in single batch for these profiles
  const { data: rawOrders } = await db
    .from('orders')
    .select('id, profile_id, status, total_amount, created_at')
    .in('profile_id', profileIds)

  // 3. Fetch refunds in single batch
  const { data: rawRefunds } = await db
    .from('refunds')
    .select('id, profile_id, amount, status')
    .in('profile_id', profileIds)

  // 4. Fetch returns in single batch
  const { data: rawReturns } = await db
    .from('returns')
    .select('id, profile_id, status')
    .in('profile_id', profileIds)

  // Group aggregates in memory (No N+1)
  const ordersByProfile = new Map<string, typeof rawOrders>()
  for (const order of rawOrders ?? []) {
    const arr = ordersByProfile.get(order.profile_id) ?? []
    arr.push(order)
    ordersByProfile.set(order.profile_id, arr)
  }

  const refundsByProfile = new Map<string, number>()
  for (const ref of rawRefunds ?? []) {
    if (VALID_REFUND_STATUSES.includes(ref.status)) {
      const current = refundsByProfile.get(ref.profile_id) ?? 0
      refundsByProfile.set(ref.profile_id, current + (ref.amount ?? 0))
    }
  }

  const returnsByProfile = new Map<string, number>()
  for (const ret of rawReturns ?? []) {
    if (ret.status !== 'draft' && ret.status !== 'cancelled') {
      const count = returnsByProfile.get(ret.profile_id) ?? 0
      returnsByProfile.set(ret.profile_id, count + 1)
    }
  }

  // Compute 360 metrics for each customer
  const allIntervals: number[] = []
  let totalLtvSum = 0
  let validBuyerCount = 0

  const computedItems: CustomerListItem[] = profiles.map((p) => {
    const customerOrders = ordersByProfile.get(p.id) ?? []
    const validOrders = customerOrders.filter((o) => VALID_ORDER_STATUSES.includes(o.status))
    const cancelledOrders = customerOrders.filter((o) => o.status === 'cancelled')

    const sortedValidOrderDates = validOrders
      .map((o) => o.created_at)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    const grossRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
    const validRefunds = refundsByProfile.get(p.id) ?? 0
    const returnCount = returnsByProfile.get(p.id) ?? 0

    const firstOrderDate = sortedValidOrderDates.length > 0 ? sortedValidOrderDates[0] : null
    const lastOrderDate =
      sortedValidOrderDates.length > 0
        ? sortedValidOrderDates[sortedValidOrderDates.length - 1]
        : null

    const computed = computeCustomer360({
      validOrderCount: validOrders.length,
      grossRevenueMinor: grossRevenue,
      validRefundsMinor: validRefunds,
      registrationDate: p.created_at,
      firstOrderDate,
      lastOrderDate,
      orderDates: sortedValidOrderDates,
      returnCount,
      cancelledOrderCount: cancelledOrders.length,
    })

    if (computed.averageRepurchaseGapDays) {
      allIntervals.push(computed.averageRepurchaseGapDays)
    }

    if (validOrders.length > 0) {
      validBuyerCount++
      totalLtvSum += computed.netRevenueMinor
    }

    const item: CustomerListItem = {
      id: p.id,
      name: p.full_name ?? p.email ?? '—',
      email: normalizeEmail(p.email),
      phone: p.phone_number,
      normalizedPhone: normalizeIndonesianPhone(p.phone_number),
      registrationDate: p.created_at,
      validOrderCount: validOrders.length,
      netRevenueMinor: computed.netRevenueMinor,
      averageOrderValueMinor: computed.averageOrderValueMinor,
      lastOrderDate,
      daysSinceLastPurchase: computed.daysSinceLastPurchase,
      segment: computed.segment,
      lifecycleState: computed.lifecycleState,
      isRepeatCustomer: computed.isRepeatCustomer,
      returnCount,
      returnRatePercent: computed.returnRatePercent,
      riskSignal: computed.riskSignal,
    }

    return sanitizeCustomerPayload(item)
  })

  // Compute overview stats from the evaluated set
  let firstTimeBuyers = 0
  let repeatCustomers = 0
  let vipCount = 0
  let loyalCount = 0
  let atRiskCount = 0
  let dormantCount = 0
  let highReturnRiskCount = 0

  for (const c of computedItems) {
    if (c.validOrderCount === 1) firstTimeBuyers++
    if (c.isRepeatCustomer) repeatCustomers++
    if (c.segment === 'vip') vipCount++
    if (c.segment === 'loyal') loyalCount++
    if (c.segment === 'at_risk') atRiskCount++
    if (c.segment === 'dormant') dormantCount++
    if (c.segment === 'high_return_risk') highReturnRiskCount++
  }

  const repeatPurchaseRatePercent =
    validBuyerCount > 0 ? Number(((repeatCustomers / validBuyerCount) * 100).toFixed(1)) : 0

  const averageCustomerLtvMinor =
    validBuyerCount > 0 ? Math.round(totalLtvSum / validBuyerCount) : 0

  // Calculate global median repurchase interval
  let medianRepurchaseDays = 45
  if (allIntervals.length > 0) {
    const sorted = [...allIntervals].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    medianRepurchaseDays =
      sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  }

  const overview: CustomerSegmentOverview = {
    totalCustomers: totalCount ?? computedItems.length,
    firstTimeBuyers,
    repeatCustomers,
    repeatPurchaseRatePercent,
    vipCount,
    loyalCount,
    atRiskCount,
    dormantCount,
    highReturnRiskCount,
    averageCustomerLtvMinor,
    medianRepurchaseDays,
  }

  // Segment Filter
  let filtered = computedItems
  if (filters.segment && filters.segment !== 'all') {
    filtered = filtered.filter((c) => c.segment === filters.segment)
  }

  // Sorting
  const sortBy = filters.sortBy ?? 'created_at'
  const sortOrder = filters.sortOrder ?? 'desc'
  filtered.sort((a, b) => {
    let diff = 0
    if (sortBy === 'ltv') {
      diff = a.netRevenueMinor - b.netRevenueMinor
    } else if (sortBy === 'orders') {
      diff = a.validOrderCount - b.validOrderCount
    } else if (sortBy === 'last_purchase') {
      const da = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0
      const dbDate = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0
      diff = da - dbDate
    } else {
      diff = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()
    }
    return sortOrder === 'asc' ? diff : -diff
  })

  // Pagination slice
  const paginated = filtered.slice(offset, offset + limit)
  const totalItems = filtered.length

  return {
    customers: paginated,
    total: totalItems,
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
    overview,
  }
}

/**
 * Retrieves full 360 profile for a single customer.
 */
export async function getCustomer360Detail(
  db: SupabaseClient,
  customerId: string
): Promise<Customer360Profile | null> {
  // 1. Fetch profile
  const { data: profile, error: profileErr } = await db
    .from('profiles')
    .select('id, email, full_name, phone_number, whatsapp_number, created_at, loyalty_points')
    .eq('id', customerId)
    .maybeSingle()

  if (profileErr || !profile) return null

  // 2. Fetch orders with line items
  const { data: orders } = await db
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      total_amount,
      created_at,
      order_items (
        product_id,
        product_name,
        quantity,
        total_price
      )
    `
    )
    .eq('profile_id', customerId)
    .order('created_at', { ascending: false })

  // 3. Fetch refunds
  const { data: refunds } = await db
    .from('refunds')
    .select('id, amount, status')
    .eq('profile_id', customerId)

  // 4. Fetch returns
  const { data: returns } = await db
    .from('returns')
    .select('id, refund_amount, status, risk_score')
    .eq('profile_id', customerId)

  // 5. Check consent status from customer_events
  const { data: consentEvent } = await db
    .from('customer_events')
    .select('consent')
    .eq('profile_id', customerId)
    .order('occurred_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const allOrders = orders ?? []
  const validOrders = allOrders.filter((o) => VALID_ORDER_STATUSES.includes(o.status))
  const paidOrders = allOrders.filter((o) => o.status === 'paid')
  const completedOrders = allOrders.filter((o) => o.status === 'completed')
  const cancelledOrders = allOrders.filter((o) => o.status === 'cancelled')

  const sortedValidOrderDates = validOrders
    .map((o) => o.created_at)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const grossRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0)

  let validRefunds = 0
  for (const ref of refunds ?? []) {
    if (VALID_REFUND_STATUSES.includes(ref.status)) {
      validRefunds += ref.amount ?? 0
    }
  }

  const validReturns = (returns ?? []).filter(
    (r) => r.status !== 'draft' && r.status !== 'cancelled'
  )

  const firstOrderDate = sortedValidOrderDates.length > 0 ? sortedValidOrderDates[0] : null
  const lastOrderDate =
    sortedValidOrderDates.length > 0
      ? sortedValidOrderDates[sortedValidOrderDates.length - 1]
      : null

  // Calculate Product Affinity from valid order items
  const productAffinityMap = new Map<string, ProductAffinityItem>()
  let totalUnits = 0

  for (const o of validOrders) {
    const items = (o.order_items as any[]) ?? []
    for (const item of items) {
      totalUnits += item.quantity ?? 0
      const existing = productAffinityMap.get(item.product_id) ?? {
        productId: item.product_id,
        productName: item.product_name,
        unitsSold: 0,
        totalRevenueMinor: 0,
      }
      existing.unitsSold += item.quantity ?? 0
      existing.totalRevenueMinor += item.total_price ?? 0
      productAffinityMap.set(item.product_id, existing)
    }
  }

  const topProducts = Array.from(productAffinityMap.values())
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)

  // Compute 360 metrics
  const computed = computeCustomer360({
    validOrderCount: validOrders.length,
    grossRevenueMinor: grossRevenue,
    validRefundsMinor: validRefunds,
    registrationDate: profile.created_at,
    firstOrderDate,
    lastOrderDate,
    orderDates: sortedValidOrderDates,
    returnCount: validReturns.length,
    cancelledOrderCount: cancelledOrders.length,
  })

  // Recent orders list
  const recentOrders = allOrders.slice(0, 10).map((o) => ({
    orderId: o.id,
    orderNumber: o.order_number,
    status: o.status,
    totalAmountMinor: o.total_amount,
    createdAt: o.created_at,
    itemCount: ((o.order_items as any[]) ?? []).reduce(
      (sum, i) => sum + (i.quantity ?? 0),
      0
    ),
  }))

  const acquisition = await getCustomerAcquisitionAttribution(db, customerId)

  const result: Customer360Profile = {
    id: profile.id,
    name: profile.full_name ?? profile.email ?? '—',
    email: normalizeEmail(profile.email),
    phone: profile.phone_number,
    normalizedPhone: normalizeIndonesianPhone(profile.phone_number),
    whatsappNumber: normalizeIndonesianPhone(profile.whatsapp_number ?? profile.phone_number),
    registrationDate: profile.created_at,
    loyaltyPoints: (profile as any).loyalty_points ?? 0,
    membershipTier: calculateMembershipTier(computed.netRevenueMinor),

    // Marketing & Acquisition Attribution
    acquisitionChannel: acquisition.acquisitionChannel,
    acquisitionSource: acquisition.acquisitionSource,
    acquisitionCampaign: acquisition.acquisitionCampaign,
    firstPurchaseAt: acquisition.firstPurchaseAt,
    latestPurchaseChannel: acquisition.latestPurchaseChannel,

    validOrderCount: validOrders.length,
    paidOrderCount: paidOrders.length,
    completedOrderCount: completedOrders.length,
    grossRevenueMinor: grossRevenue,
    validRefundsMinor: validRefunds,
    netRevenueMinor: computed.netRevenueMinor,
    averageOrderValueMinor: computed.averageOrderValueMinor,
    totalUnitsPurchased: totalUnits,
    firstOrderDate,
    lastOrderDate,
    firstPurchaseMonth: computed.firstPurchaseMonth,

    daysSinceLastPurchase: computed.daysSinceLastPurchase,
    repeatPurchaseCount: computed.repeatPurchaseCount,
    isRepeatCustomer: computed.isRepeatCustomer,
    customerTenureDays: computed.customerTenureDays,
    averageRepurchaseGapDays: computed.averageRepurchaseGapDays,
    expectedRepurchaseWindowDays: computed.expectedRepurchaseWindowDays,

    segment: computed.segment,
    lifecycleState: computed.lifecycleState,
    rfm: computed.rfm,
    recommendedAction: computed.recommendedAction,

    topProducts,
    topCategories: [],
    recentOrders,

    cancelledOrderCount: cancelledOrders.length,
    returnCount: validReturns.length,
    refundedAmountMinor: validRefunds,
    returnRatePercent: computed.returnRatePercent,
    riskSignal: computed.riskSignal,
    riskReasons: computed.riskReasons,

    hasEmailConsent: consentEvent ? Boolean(consentEvent.consent) : null,
    hasWhatsAppConsent: Boolean(profile.whatsapp_number),
    consentAuditGap: consentEvent === null,
  }

  return sanitizeCustomerPayload(result)
}

/**
 * Returns actionable retention opportunities for marketing & customer success teams.
 */
export async function getRetentionOpportunities(
  db: SupabaseClient
): Promise<CustomerRetentionOpportunity[]> {
  const { customers } = await getCustomer360List(db, { limit: 100 })
  const opportunities: CustomerRetentionOpportunity[] = []

  for (const c of customers) {
    // 1. Repeat customer approaching or past normal reorder window
    if (c.isRepeatCustomer && c.daysSinceLastPurchase !== null && c.daysSinceLastPurchase >= 35 && c.daysSinceLastPurchase <= 65) {
      opportunities.push({
        opportunityType: 'approaching_reorder_window',
        customerId: c.id,
        name: c.name,
        email: c.email,
        phone: c.normalizedPhone ?? c.phone,
        netRevenueMinor: c.netRevenueMinor,
        validOrderCount: c.validOrderCount,
        daysSinceLastPurchase: c.daysSinceLastPurchase,
        reason: `Mendekati siklus reorder (${c.daysSinceLastPurchase} hari sejak order terakhir).`,
        suggestedAction: 'Kirimkan pesan pengingat restock rutin dan penawaran bundling produk.',
      })
    }

    // 2. First purchase with no second order after 20 days
    if (c.validOrderCount === 1 && c.daysSinceLastPurchase !== null && c.daysSinceLastPurchase >= 20 && c.daysSinceLastPurchase <= 45) {
      opportunities.push({
        opportunityType: 'first_purchase_no_second',
        customerId: c.id,
        name: c.name,
        email: c.email,
        phone: c.normalizedPhone ?? c.phone,
        netRevenueMinor: c.netRevenueMinor,
        validOrderCount: c.validOrderCount,
        daysSinceLastPurchase: c.daysSinceLastPurchase,
        reason: `Pembeli pertama belum repurchase setelah ${c.daysSinceLastPurchase} hari.`,
        suggestedAction: 'Kirimkan voucher diskon pembelian ke-2 dan tanyakan kesan pemakaian.',
      })
    }

    // 3. High LTV but becoming inactive
    if (c.netRevenueMinor >= 1_000_000 && c.daysSinceLastPurchase !== null && c.daysSinceLastPurchase > 60) {
      opportunities.push({
        opportunityType: 'high_ltv_inactive',
        customerId: c.id,
        name: c.name,
        email: c.email,
        phone: c.normalizedPhone ?? c.phone,
        netRevenueMinor: c.netRevenueMinor,
        validOrderCount: c.validOrderCount,
        daysSinceLastPurchase: c.daysSinceLastPurchase,
        reason: `Pelanggan bernilai tinggi tidak aktif selama ${c.daysSinceLastPurchase} hari.`,
        suggestedAction: 'Berikan reward personal atau penawaran eksklusif VIP untuk re-aktivasi.',
      })
    }

    // 4. Active VIP customers
    if (c.segment === 'vip' && c.daysSinceLastPurchase !== null && c.daysSinceLastPurchase <= 45) {
      opportunities.push({
        opportunityType: 'vip_active',
        customerId: c.id,
        name: c.name,
        email: c.email,
        phone: c.normalizedPhone ?? c.phone,
        netRevenueMinor: c.netRevenueMinor,
        validOrderCount: c.validOrderCount,
        daysSinceLastPurchase: c.daysSinceLastPurchase,
        reason: `VIP aktif dengan LTV tinggi (Rp ${c.netRevenueMinor.toLocaleString('id-ID')}).`,
        suggestedAction: 'Tawarkan sneak peek produk baru dan undangan konsultasi kulit privat.',
      })
    }
  }

  return opportunities.slice(0, 20)
}
