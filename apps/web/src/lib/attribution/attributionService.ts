import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  MarketingChannelName,
  AttributionMetrics,
  ChannelMetrics,
  CampaignAttributionMetrics,
  FunnelStep,
  AttributionReconciliationReport,
} from './types'

export const ALL_CHANNELS: MarketingChannelName[] = [
  'Direct',
  'Organic Search',
  'Paid Search',
  'Organic Social',
  'Paid Social',
  'WhatsApp',
  'Marketplace',
  'Referral',
  'Email',
  'Campaign',
  'Unknown',
]

export interface PeriodDateRange {
  startDate: string | null
  endDate: string | null
  periodLabel: string
}

/**
 * Calculates start and end ISO dates adjusted for Asia/Jakarta (WIB = UTC+7)
 */
export function getPeriodDateRange(
  period: 'today' | '7d' | '30d' | 'all' = '30d',
  customStart?: string,
  customEnd?: string
): PeriodDateRange {
  if (customStart && customEnd) {
    return {
      startDate: new Date(customStart).toISOString(),
      endDate: new Date(customEnd).toISOString(),
      periodLabel: `Custom (${customStart.slice(0, 10)} - ${customEnd.slice(0, 10)})`,
    }
  }

  if (period === 'all') {
    return {
      startDate: null,
      endDate: null,
      periodLabel: 'Semua Waktu',
    }
  }

  const now = new Date()
  // Offset to Asia/Jakarta (UTC+7)
  const wibOffsetMs = 7 * 60 * 60 * 1000
  const nowWib = new Date(now.getTime() + wibOffsetMs)

  if (period === 'today') {
    const startOfTodayWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), nowWib.getUTCDate(), 0, 0, 0)
    )
    const startUtc = new Date(startOfTodayWib.getTime() - wibOffsetMs)
    return {
      startDate: startUtc.toISOString(),
      endDate: now.toISOString(),
      periodLabel: 'Hari Ini (WIB)',
    }
  }

  const days = period === '7d' ? 7 : 30
  const startWib = new Date(
    Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), nowWib.getUTCDate() - days + 1, 0, 0, 0)
  )
  const startUtc = new Date(startWib.getTime() - wibOffsetMs)

  return {
    startDate: startUtc.toISOString(),
    endDate: now.toISOString(),
    periodLabel: period === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir',
  }
}

export async function getMarketingAttributionOverview(
  supabase: SupabaseClient,
  options: {
    period?: 'today' | '7d' | '30d' | 'all'
    startDate?: string
    endDate?: string
  } = {}
): Promise<AttributionMetrics> {
  const { startDate, endDate, periodLabel } = getPeriodDateRange(
    options.period,
    options.startDate,
    options.endDate
  )

  // 1. Fetch valid paid orders in window
  let ordersQuery = supabase
    .from('orders')
    .select(
      'id, order_number, profile_id, total_amount, discount_amount, attribution_channel, utm_source, utm_medium, utm_campaign, created_at, status'
    )

  if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate)
  if (endDate) ordersQuery = ordersQuery.lte('created_at', endDate)

  const { data: rawOrders, error: ordersError } = await ordersQuery
  if (ordersError) {
    console.error('[AttributionService] Error querying orders:', ordersError)
  }

  // Filter for valid paid commerce — same VALID_ORDER_STATUSES standard used
  // by Customer 360 (customer360Service.ts) and loyalty crediting
  // (loyaltyService.ts). orders has no payment_status column (that lives on
  // payments.status); status itself already tells us whether payment
  // cleared, since checkout only ever moves an order to 'paid' via
  // settle_doku_payment.
  const VALID_ORDER_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'completed']
  const validOrders = (rawOrders || []).filter((o: any) => VALID_ORDER_STATUSES.includes(o.status))

  // 2. Fetch refund totals for net revenue
  let refundsQuery = supabase
    .from('refunds')
    .select('amount, status, created_at')
    .eq('status', 'completed')

  if (startDate) refundsQuery = refundsQuery.gte('created_at', startDate)
  if (endDate) refundsQuery = refundsQuery.lte('created_at', endDate)

  const { data: refunds } = await refundsQuery
  const totalRefundAmount = (refunds || []).reduce((acc: number, r: any) => acc + (Number(r.amount) || 0), 0)

  // 3. Determine New Customers vs Repeat Customers
  // Fetch historical first order date for each customer
  const profileIds = Array.from(new Set(validOrders.map((o: any) => o.profile_id).filter(Boolean)))
  let firstOrderMap: Record<string, string> = {}

  if (profileIds.length > 0) {
    const { data: allCustomerOrders } = await supabase
      .from('orders')
      .select('profile_id, created_at, status')
      .in('profile_id', profileIds)
      .order('created_at', { ascending: true })

    const validHistory = (allCustomerOrders || []).filter((o: any) => VALID_ORDER_STATUSES.includes(o.status))

    for (const ord of validHistory) {
      if (ord.profile_id && !firstOrderMap[ord.profile_id]) {
        firstOrderMap[ord.profile_id] = ord.created_at
      }
    }
  }

  // 4. Fetch Funnel & Session Events from customer_events
  let eventsQuery = supabase
    .from('customer_events')
    .select('event_name, anonymous_session_id, metadata, occurred_at')

  if (startDate) eventsQuery = eventsQuery.gte('occurred_at', startDate)
  if (endDate) eventsQuery = eventsQuery.lte('occurred_at', endDate)

  const { data: rawEvents } = await eventsQuery
  const events = rawEvents || []

  // Count events for funnel
  const eventCounts: Record<string, number> = {
    session_started: 0,
    product_viewed: 0,
    add_to_cart: 0,
    checkout_started: 0,
    order_created: 0,
    payment_success: 0,
  }

  // Also collect distinct sessions
  const distinctSessionIds = new Set<string>()

  for (const ev of events) {
    if (ev.anonymous_session_id) distinctSessionIds.add(ev.anonymous_session_id)
    if (eventCounts[ev.event_name] !== undefined) {
      eventCounts[ev.event_name]++
    }
  }

  // Fallback: If session_started events were sparse, use distinct sessions or at least orders count
  const totalSessions = Math.max(
    eventCounts.session_started,
    distinctSessionIds.size,
    validOrders.length
  )

  // 5. Aggregate by Channel
  const channelMap: Record<string, ChannelMetrics> = {}
  for (const ch of ALL_CHANNELS) {
    channelMap[ch] = {
      channel: ch,
      sessions: 0,
      orders: 0,
      conversionRatePercent: 0,
      newCustomers: 0,
      revenueMinor: 0,
      averageOrderValueMinor: 0,
    }
  }

  let grossRevenueMinor = 0
  let discountCostMinor = 0
  let repeatRevenueMinor = 0
  const newCustomerProfileSet = new Set<string>()

  for (const order of validOrders) {
    const rawCh = (order.attribution_channel as MarketingChannelName) || 'Unknown'
    const channelKey = ALL_CHANNELS.includes(rawCh) ? rawCh : 'Unknown'
    const target = channelMap[channelKey]

    const total = Number(order.total_amount) || 0
    const discount = Number(order.discount_amount) || 0
    grossRevenueMinor += total
    discountCostMinor += discount

    target.orders += 1
    target.revenueMinor += total

    // Check if this is new or repeat customer
    const firstCreatedAt = order.profile_id ? firstOrderMap[order.profile_id] : null
    const isNew =
      !firstCreatedAt ||
      (startDate && new Date(firstCreatedAt).getTime() >= new Date(startDate).getTime()) ||
      firstCreatedAt === order.created_at

    if (isNew && order.profile_id) {
      if (!newCustomerProfileSet.has(order.profile_id)) {
        newCustomerProfileSet.add(order.profile_id)
        target.newCustomers += 1
      }
    } else {
      repeatRevenueMinor += total
    }
  }

  // Distribute estimated sessions to channels based on event metadata or equal baseline
  for (const ev of events) {
    const ch = (ev.metadata?.channel as MarketingChannelName) || null
    if (ch && channelMap[ch]) {
      channelMap[ch].sessions += 1
    }
  }

  // Compute rates and AOV per channel
  for (const ch of ALL_CHANNELS) {
    const m = channelMap[ch]
    if (m.sessions === 0 && m.orders > 0) {
      m.sessions = m.orders // at least 1 session per order
    }
    m.conversionRatePercent =
      m.sessions > 0 ? Number(((m.orders / m.sessions) * 100).toFixed(2)) : 0
    m.averageOrderValueMinor =
      m.orders > 0 ? Math.round(m.revenueMinor / m.orders) : 0
  }

  const channels = Object.values(channelMap).sort((a, b) => b.revenueMinor - a.revenueMinor)

  // 6. Aggregate by Campaign
  const campaignMap: Record<string, CampaignAttributionMetrics> = {}
  for (const order of validOrders) {
    const cName = order.utm_campaign?.trim() || 'Tanpa Campaign'
    if (!campaignMap[cName]) {
      campaignMap[cName] = {
        campaignName: cName,
        objective: 'Conversion / Sales',
        sessions: 0,
        orders: 0,
        conversionRatePercent: 0,
        newCustomers: 0,
        netRevenueMinor: 0,
        discountCostMinor: 0,
      }
    }
    const c = campaignMap[cName]
    const total = Number(order.total_amount) || 0
    const discount = Number(order.discount_amount) || 0
    c.orders += 1
    c.netRevenueMinor += total
    c.discountCostMinor += discount

    if (order.profile_id && newCustomerProfileSet.has(order.profile_id)) {
      c.newCustomers += 1
    }
  }

  for (const c of Object.values(campaignMap)) {
    if (c.sessions === 0) c.sessions = c.orders
    c.conversionRatePercent =
      c.sessions > 0 ? Number(((c.orders / c.sessions) * 100).toFixed(2)) : 0
  }
  const campaigns = Object.values(campaignMap).sort((a, b) => b.netRevenueMinor - a.netRevenueMinor)

  // 7. Funnel Steps
  const funnelCounts = [
    { stage: 'session', name: 'Sesi Pengunjung', count: totalSessions },
    { stage: 'product_view', name: 'Lihat Produk', count: eventCounts.product_viewed },
    { stage: 'cart', name: 'Tambah Keranjang', count: eventCounts.add_to_cart },
    { stage: 'checkout', name: 'Mulai Checkout', count: eventCounts.checkout_started },
    { stage: 'order_created', name: 'Order Terbuat', count: Math.max(eventCounts.order_created, validOrders.length) },
    { stage: 'payment_success', name: 'Pembayaran Sukses', count: validOrders.length },
  ]

  const funnel: FunnelStep[] = []
  for (let i = 0; i < funnelCounts.length; i++) {
    const current = funnelCounts[i]
    const prev = i > 0 ? funnelCounts[i - 1] : null
    let cvr = 0
    let dropoff = 0

    if (i === 0) {
      cvr = 100
      dropoff = 0
    } else if (prev && prev.count > 0) {
      cvr = Number(((current.count / prev.count) * 100).toFixed(1))
      dropoff = Number((Math.max(0, 100 - cvr)).toFixed(1))
    }

    funnel.push({
      stage: current.stage,
      name: current.name,
      count: current.count,
      conversionRatePercent: cvr,
      dropoffRatePercent: dropoff,
    })
  }

  const netRevenueMinor = Math.max(0, grossRevenueMinor - totalRefundAmount)
  const paidOrders = validOrders.length
  const overallCvr = totalSessions > 0 ? Number(((paidOrders / totalSessions) * 100).toFixed(2)) : 0

  return {
    periodLabel,
    totalSessions,
    paidOrders,
    conversionRatePercent: overallCvr,
    grossRevenueMinor,
    netRevenueMinor,
    discountCostMinor,
    newCustomersCount: newCustomerProfileSet.size,
    repeatRevenueMinor,
    channels,
    campaigns,
    funnel,
    adSpendStatus: 'unavailable',
  }
}

export async function reconcileAttributionData(
  supabase: SupabaseClient
): Promise<AttributionReconciliationReport> {
  const anomalies: Array<{ type: string; message: string; orderId?: string }> = []

  // Check 1: Paid orders missing attribution snapshot or channel
  const { data: allPaidOrders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, order_number, attribution_channel, attribution_snapshot, created_at, status')
    .in('status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])

  if (ordersErr) {
    console.error('[Reconciliation] Error fetching orders:', ordersErr)
  }

  const paidOrdersList = allPaidOrders || []
  let unattributedCount = 0

  for (const ord of paidOrdersList) {
    if (!ord.attribution_channel || ord.attribution_channel === 'Unknown') {
      unattributedCount++
      anomalies.push({
        type: 'unattributed_order',
        message: `Order ${ord.order_number || ord.id} memiliki attribution channel tidak terdefinisi (Unknown / Null)`,
        orderId: ord.id,
      })
    }
  }

  // Check 2: Duplicate payment_success events
  const { data: paymentEvents } = await supabase
    .from('customer_events')
    .select('event_id, order_id, anonymous_session_id, metadata, occurred_at')
    .eq('event_name', 'payment_success')

  const seenOrderEvents: Record<string, string[]> = {}
  let duplicateCount = 0

  for (const ev of paymentEvents || []) {
    const ordId = ev.order_id || (ev.metadata?.order_id as string) || (ev.metadata?.order_number as string)
    if (ordId) {
      if (!seenOrderEvents[ordId]) {
        seenOrderEvents[ordId] = []
      }
      seenOrderEvents[ordId].push(ev.event_id)
      if (seenOrderEvents[ordId].length > 1) {
        duplicateCount++
        anomalies.push({
          type: 'duplicate_payment_event',
          message: `Ditemukan duplikasi event payment_success untuk order ${ordId}`,
          orderId: ordId,
        })
      }
    }
  }

  // Check 3: Check for future timestamps in customer_events
  const futureThreshold = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  const { data: futureEvents } = await supabase
    .from('customer_events')
    .select('event_id, event_name, occurred_at')
    .gt('occurred_at', futureThreshold)

  for (const fe of futureEvents || []) {
    anomalies.push({
      type: 'future_timestamp',
      message: `Event ${fe.event_name} (${fe.event_id}) memiliki timestamp masa depan: ${fe.occurred_at}`,
    })
  }

  return {
    auditedAt: new Date().toISOString(),
    totalOrdersChecked: paidOrdersList.length,
    unattributedOrdersCount: unattributedCount,
    duplicatePaymentEventsCount: duplicateCount,
    anomalies,
  }
}

export async function getCustomerAcquisitionAttribution(
  supabase: SupabaseClient,
  profileId: string
) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, attribution_channel, utm_source, utm_campaign, created_at, status')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true })

  if (error || !orders || orders.length === 0) {
    return {
      acquisitionChannel: 'Direct',
      acquisitionSource: 'direct',
      acquisitionCampaign: null,
      firstPurchaseAt: null,
      latestPurchaseChannel: 'Direct',
    }
  }

  const validOrders = orders.filter((o: any) =>
    ['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(o.status)
  )

  if (validOrders.length === 0) {
    return {
      acquisitionChannel: 'Direct',
      acquisitionSource: 'direct',
      acquisitionCampaign: null,
      firstPurchaseAt: null,
      latestPurchaseChannel: 'Direct',
    }
  }

  const firstOrder = validOrders[0]
  const latestOrder = validOrders[validOrders.length - 1]

  return {
    acquisitionChannel: firstOrder.attribution_channel || 'Unknown',
    acquisitionSource: firstOrder.utm_source || 'direct',
    acquisitionCampaign: firstOrder.utm_campaign || null,
    firstPurchaseAt: firstOrder.created_at,
    latestPurchaseChannel: latestOrder.attribution_channel || 'Unknown',
  }
}
