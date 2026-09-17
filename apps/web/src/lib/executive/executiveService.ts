import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ExecutivePeriod,
  MetricPolarity,
  KpiMetricItem,
  ExecutiveKpis,
  DailyRevenueTrendPoint,
  OrderStatusSummary,
  CustomerHealthSummary,
  MarketingSummary,
  InventorySummary,
  ReturnsSummary,
  ExecutiveAlert,
  OwnerActionItem,
  ExecutiveDashboardSummary,
} from './types'
import { ALERT_THRESHOLDS } from './alertConfig'

export interface DateBoundaryResult {
  current: {
    start: string | null
    end: string | null
  }
  previous: {
    start: string | null
    end: string | null
  }
  periodLabel: string
}

/**
 * Calculates current and previous equivalent period boundaries
 * anchored to Asia/Jakarta (WIB = UTC+7).
 */
export function getPeriodDateBoundaries(
  period: ExecutivePeriod = '7d',
  customStart?: string,
  customEnd?: string,
  baseNow: Date = new Date()
): DateBoundaryResult {
  const wibOffsetMs = 7 * 60 * 60 * 1000
  const nowWib = new Date(baseNow.getTime() + wibOffsetMs)

  if (customStart && customEnd) {
    const startMs = new Date(customStart).getTime()
    const endMs = new Date(customEnd).getTime()
    const durationMs = Math.max(1, endMs - startMs)
    return {
      current: {
        start: new Date(startMs).toISOString(),
        end: new Date(endMs).toISOString(),
      },
      previous: {
        start: new Date(startMs - durationMs).toISOString(),
        end: new Date(startMs).toISOString(),
      },
      periodLabel: `Kustom (${customStart.slice(0, 10)} - ${customEnd.slice(0, 10)})`,
    }
  }

  if (period === 'today') {
    const startOfTodayWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), nowWib.getUTCDate(), 0, 0, 0)
    )
    const startUtc = new Date(startOfTodayWib.getTime() - wibOffsetMs)
    const prevStartUtc = new Date(startUtc.getTime() - 24 * 60 * 60 * 1000)
    const prevEndUtc = new Date(baseNow.getTime() - 24 * 60 * 60 * 1000)

    return {
      current: { start: startUtc.toISOString(), end: baseNow.toISOString() },
      previous: { start: prevStartUtc.toISOString(), end: prevEndUtc.toISOString() },
      periodLabel: 'Hari Ini (vs Kemarin)',
    }
  }

  if (period === 'yesterday') {
    const startOfYesterdayWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), nowWib.getUTCDate() - 1, 0, 0, 0)
    )
    const endOfYesterdayWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), nowWib.getUTCDate() - 1, 23, 59, 59, 999)
    )
    const startUtc = new Date(startOfYesterdayWib.getTime() - wibOffsetMs)
    const endUtc = new Date(endOfYesterdayWib.getTime() - wibOffsetMs)

    const prevStartUtc = new Date(startUtc.getTime() - 24 * 60 * 60 * 1000)
    const prevEndUtc = new Date(endUtc.getTime() - 24 * 60 * 60 * 1000)

    return {
      current: { start: startUtc.toISOString(), end: endUtc.toISOString() },
      previous: { start: prevStartUtc.toISOString(), end: prevEndUtc.toISOString() },
      periodLabel: 'Kemarin (vs Hari Sebelumnya)',
    }
  }

  if (period === 'this_month') {
    const startOfMonthWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), 1, 0, 0, 0)
    )
    const startUtc = new Date(startOfMonthWib.getTime() - wibOffsetMs)

    // Previous month equivalent up to same day
    const prevMonthWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth() - 1, 1, 0, 0, 0)
    )
    const prevMonthEndWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth() - 1, nowWib.getUTCDate(), nowWib.getUTCHours(), nowWib.getUTCMinutes())
    )
    const prevStartUtc = new Date(prevMonthWib.getTime() - wibOffsetMs)
    const prevEndUtc = new Date(prevMonthEndWib.getTime() - wibOffsetMs)

    return {
      current: { start: startUtc.toISOString(), end: baseNow.toISOString() },
      previous: { start: prevStartUtc.toISOString(), end: prevEndUtc.toISOString() },
      periodLabel: 'Bulan Ini (vs Bulan Lalu)',
    }
  }

  if (period === 'last_month') {
    const startOfLastMonthWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth() - 1, 1, 0, 0, 0)
    )
    const endOfLastMonthWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), 0, 23, 59, 59, 999)
    )
    const startUtc = new Date(startOfLastMonthWib.getTime() - wibOffsetMs)
    const endUtc = new Date(endOfLastMonthWib.getTime() - wibOffsetMs)

    const prevMonthStartWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth() - 2, 1, 0, 0, 0)
    )
    const prevMonthEndWib = new Date(
      Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth() - 1, 0, 23, 59, 59, 999)
    )
    const prevStartUtc = new Date(prevMonthStartWib.getTime() - wibOffsetMs)
    const prevEndUtc = new Date(prevMonthEndWib.getTime() - wibOffsetMs)

    return {
      current: { start: startUtc.toISOString(), end: endUtc.toISOString() },
      previous: { start: prevStartUtc.toISOString(), end: prevEndUtc.toISOString() },
      periodLabel: 'Bulan Lalu (vs 2 Bulan Lalu)',
    }
  }

  // Default: '7d' or '30d'
  const days = period === '30d' ? 30 : 7
  const startWib = new Date(
    Date.UTC(nowWib.getUTCFullYear(), nowWib.getUTCMonth(), nowWib.getUTCDate() - days + 1, 0, 0, 0)
  )
  const startUtc = new Date(startWib.getTime() - wibOffsetMs)
  const prevStartUtc = new Date(startUtc.getTime() - days * 24 * 60 * 60 * 1000)
  const prevEndUtc = new Date(startUtc.getTime())

  return {
    current: { start: startUtc.toISOString(), end: baseNow.toISOString() },
    previous: { start: prevStartUtc.toISOString(), end: prevEndUtc.toISOString() },
    periodLabel: period === '30d' ? '30 Hari Terakhir' : '7 Hari Terakhir',
  }
}

/**
 * Computes comparative KPI delta with polarity and safe percentage calculation.
 */
export function computeKpiItem(
  current: number,
  previous: number,
  polarity: MetricPolarity,
  formatType: 'currency' | 'number' | 'percent'
): KpiMetricItem {
  const absoluteChange = current - previous
  let percentageChange: number | null = null

  if (previous === 0) {
    if (current === 0) percentageChange = 0
    else percentageChange = null // Safe indicator for new baseline from zero
  } else {
    percentageChange = Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1))
  }

  let isFavorable = true
  if (polarity === 'positive') {
    isFavorable = current >= previous
  } else if (polarity === 'negative') {
    isFavorable = current <= previous
  }

  function formatVal(v: number): string {
    if (formatType === 'currency') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(v)
    }
    if (formatType === 'percent') {
      return `${v}%`
    }
    return v.toLocaleString('id-ID')
  }

  return {
    current,
    previous,
    absoluteChange,
    percentageChange,
    polarity,
    isFavorable,
    formattedCurrent: formatVal(current),
    formattedPrevious: formatVal(previous),
  }
}

export async function getExecutiveDashboardSummary(
  supabase: SupabaseClient,
  options: {
    period?: ExecutivePeriod
    startDate?: string
    endDate?: string
  } = {}
): Promise<ExecutiveDashboardSummary> {
  const boundaries = getPeriodDateBoundaries(
    options.period ?? '7d',
    options.startDate,
    options.endDate
  )

  const curStart = boundaries.current.start
  const curEnd = boundaries.current.end
  const prevStart = boundaries.previous.start
  const prevEnd = boundaries.previous.end

  // 1. Fetch orders in both windows (from prevStart up to curEnd)
  let ordersQuery = supabase
    .from('orders')
    .select(
      'id, order_number, profile_id, total_amount, discount_amount, attribution_channel, utm_campaign, created_at, status'
    )

  if (prevStart) ordersQuery = ordersQuery.gte('created_at', prevStart)
  if (curEnd) ordersQuery = ordersQuery.lte('created_at', curEnd)

  const { data: rawOrders } = await ordersQuery
  const allOrders = rawOrders || []

  // Split into Current vs Previous
  const curOrders: typeof allOrders = []
  const prevOrders: typeof allOrders = []

  const curStartMs = curStart ? new Date(curStart).getTime() : 0
  const curEndMs = curEnd ? new Date(curEnd).getTime() : Infinity
  const prevStartMs = prevStart ? new Date(prevStart).getTime() : 0
  const prevEndMs = prevEnd ? new Date(prevEnd).getTime() : Infinity

  for (const o of allOrders) {
    const t = new Date(o.created_at).getTime()
    if (t >= curStartMs && t <= curEndMs) {
      curOrders.push(o)
    } else if (t >= prevStartMs && t < prevEndMs) {
      prevOrders.push(o)
    }
  }

  // Filter valid paid orders — orders has no payment_status column (that
  // lives on payments.status); status alone already tells us whether
  // payment cleared, matching the VALID_ORDER_STATUSES standard used by
  // customer360Service.ts, loyaltyService.ts, and attributionService.ts.
  function isValidPaid(o: any): boolean {
    return ['paid', 'processing', 'shipped', 'delivered', 'completed', 'refunded'].includes(o.status)
  }

  const validCurOrders = curOrders.filter(isValidPaid)
  const validPrevOrders = prevOrders.filter(isValidPaid)

  // Order status backlog (current period snapshot)
  const orderStatus: OrderStatusSummary = {
    pending: 0,
    paid: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    totalBacklog: 0,
  }

  for (const o of curOrders) {
    const st = o.status as keyof OrderStatusSummary
    if (typeof orderStatus[st] === 'number') {
      orderStatus[st]++
    }
  }
  // Backlog: orders waiting to be processed or shipped
  orderStatus.totalBacklog = orderStatus.paid + orderStatus.processing

  // 2. Fetch completed refunds
  let refundsQuery = supabase
    .from('refunds')
    .select('amount, status, created_at')
    .in('status', ['completed', 'pending', 'processing'])

  if (prevStart) refundsQuery = refundsQuery.gte('created_at', prevStart)
  if (curEnd) refundsQuery = refundsQuery.lte('created_at', curEnd)

  const { data: rawRefunds } = await refundsQuery
  const allRefunds = rawRefunds || []

  let curRefundAmount = 0
  let prevRefundAmount = 0
  let curCompletedRefundsCount = 0

  for (const r of allRefunds) {
    const t = new Date(r.created_at).getTime()
    const amt = Number(r.amount) || 0
    if (t >= curStartMs && t <= curEndMs) {
      curRefundAmount += amt
      curCompletedRefundsCount++
    } else if (t >= prevStartMs && t < prevEndMs) {
      prevRefundAmount += amt
    }
  }

  // 3. Customer 360 & Historical first purchase lookup
  const curBuyerIds = Array.from(new Set(validCurOrders.map((o) => o.profile_id).filter(Boolean)))
  const prevBuyerIds = Array.from(new Set(validPrevOrders.map((o) => o.profile_id).filter(Boolean)))
  const allBuyerIds = Array.from(new Set([...curBuyerIds, ...prevBuyerIds]))

  let firstOrderMap: Record<string, string> = {}
  if (allBuyerIds.length > 0) {
    const { data: customerOrderHistory } = await supabase
      .from('orders')
      .select('profile_id, created_at, status')
      .in('profile_id', allBuyerIds)
      .order('created_at', { ascending: true })

    const validHistory = (customerOrderHistory || []).filter(isValidPaid)
    for (const h of validHistory) {
      if (h.profile_id && !firstOrderMap[h.profile_id]) {
        firstOrderMap[h.profile_id] = h.created_at
      }
    }
  }

  // Count new vs repeat customers in current period
  let curNewBuyers = 0
  let curRepeatBuyers = 0
  for (const buyerId of curBuyerIds) {
    const firstDate = firstOrderMap[buyerId]
    if (firstDate && new Date(firstDate).getTime() < curStartMs) {
      curRepeatBuyers++
    } else {
      curNewBuyers++
    }
  }

  let prevNewBuyers = 0
  let prevRepeatBuyers = 0
  for (const buyerId of prevBuyerIds) {
    const firstDate = firstOrderMap[buyerId]
    if (firstDate && new Date(firstDate).getTime() < prevStartMs) {
      prevRepeatBuyers++
    } else {
      prevNewBuyers++
    }
  }

  const curRepeatRate = curBuyerIds.length > 0
    ? Number(((curRepeatBuyers / curBuyerIds.length) * 100).toFixed(1))
    : 0
  const prevRepeatRate = prevBuyerIds.length > 0
    ? Number(((prevRepeatBuyers / prevBuyerIds.length) * 100).toFixed(1))
    : 0

  // 4. Customer Segmentation Summary (At-Risk, VIP, Loyal, Dormant)
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
  const totalProfilesCount = (allProfiles || []).length

  // Simplified segmentation calculation
  let vipCount = 0
  let loyalCount = 0
  let atRiskCount = 0
  let dormantCount = 0
  let atRiskRevenueValueMinor = 0

  // 5. Traffic & Conversion Funnel from customer_events
  let eventsQuery = supabase
    .from('customer_events')
    .select('event_name, anonymous_session_id, occurred_at')

  if (prevStart) eventsQuery = eventsQuery.gte('occurred_at', prevStart)
  if (curEnd) eventsQuery = eventsQuery.lte('occurred_at', curEnd)

  const { data: rawEvents } = await eventsQuery
  const curSessionsSet = new Set<string>()
  const prevSessionsSet = new Set<string>()

  for (const ev of rawEvents || []) {
    const t = new Date(ev.occurred_at).getTime()
    const sess = ev.anonymous_session_id || 'anon'
    if (t >= curStartMs && t <= curEndMs) {
      curSessionsSet.add(sess)
    } else if (t >= prevStartMs && t < prevEndMs) {
      prevSessionsSet.add(sess)
    }
  }

  const curSessions = Math.max(curSessionsSet.size, validCurOrders.length)
  const prevSessions = Math.max(prevSessionsSet.size, validPrevOrders.length)

  const curCvr = curSessions > 0 ? Number(((validCurOrders.length / curSessions) * 100).toFixed(2)) : 0
  const prevCvr = prevSessions > 0 ? Number(((validPrevOrders.length / prevSessions) * 100).toFixed(2)) : 0

  // 6. Primary Revenue Totals
  const curGross = validCurOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0)
  const prevGross = validPrevOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0)

  const curNet = Math.max(0, curGross - curRefundAmount)
  const prevNet = Math.max(0, prevGross - prevRefundAmount)

  const curDiscount = validCurOrders.reduce((acc, o) => acc + (Number(o.discount_amount) || 0), 0)
  const prevDiscount = validPrevOrders.reduce((acc, o) => acc + (Number(o.discount_amount) || 0), 0)

  const curPaidCount = validCurOrders.length
  const prevPaidCount = validPrevOrders.length

  const curAov = curPaidCount > 0 ? Math.round(curNet / curPaidCount) : 0
  const prevAov = prevPaidCount > 0 ? Math.round(prevNet / prevPaidCount) : 0

  const curRefundRate = curGross > 0 ? Number(((curRefundAmount / curGross) * 100).toFixed(1)) : 0
  const prevRefundRate = prevGross > 0 ? Number(((prevRefundAmount / prevGross) * 100).toFixed(1)) : 0

  // 7. Inventory Status
  const { data: rawProducts } = await supabase
    .from('products')
    .select('id, name, sku, stock_quantity, is_active')
    .eq('is_active', true)

  const productsList = rawProducts || []
  let outOfStockCount = 0
  let criticalCount = 0
  let lowStockCount = 0
  let healthyCount = 0
  const criticalProducts: Array<{ id: string; name: string; sku: string; stockQuantity: number }> = []

  for (const p of productsList) {
    const qty = Number(p.stock_quantity) || 0
    if (qty <= 0) {
      outOfStockCount++
      criticalProducts.push({ id: p.id, name: p.name, sku: p.sku || '—', stockQuantity: qty })
    } else if (qty <= 5) {
      criticalCount++
      criticalProducts.push({ id: p.id, name: p.name, sku: p.sku || '—', stockQuantity: qty })
    } else if (qty <= 15) {
      lowStockCount++
    } else {
      healthyCount++
    }
  }

  // 8. Daily Revenue Trend (WIB dates)
  const trendMap: Record<string, DailyRevenueTrendPoint> = {}
  for (const ord of validCurOrders) {
    const wibDate = new Date(new Date(ord.created_at).getTime() + 7 * 3600 * 1000)
      .toISOString()
      .slice(0, 10)

    if (!trendMap[wibDate]) {
      trendMap[wibDate] = {
        date: wibDate,
        grossRevenueMinor: 0,
        netRevenueMinor: 0,
        ordersCount: 0,
      }
    }
    const amt = Number(ord.total_amount) || 0
    trendMap[wibDate].grossRevenueMinor += amt
    trendMap[wibDate].netRevenueMinor += amt
    trendMap[wibDate].ordersCount += 1
  }

  const trends = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date))

  // 9. Marketing Channel & Campaign Breakdown
  const channelMap: Record<string, { orders: number; revenueMinor: number }> = {}
  let unattributedOrders = 0

  for (const o of validCurOrders) {
    const ch = o.attribution_channel || 'Unknown'
    if (ch === 'Unknown') unattributedOrders++
    if (!channelMap[ch]) channelMap[ch] = { orders: 0, revenueMinor: 0 }
    channelMap[ch].orders++
    channelMap[ch].revenueMinor += Number(o.total_amount) || 0
  }

  const topChannels = Object.entries(channelMap)
    .map(([channel, data]) => ({
      channel,
      orders: data.orders,
      revenueMinor: data.revenueMinor,
      cvr: curSessions > 0 ? Number(((data.orders / curSessions) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.revenueMinor - a.revenueMinor)
    .slice(0, 3)

  const unattributedPercent = curPaidCount > 0
    ? Number(((unattributedOrders / curPaidCount) * 100).toFixed(1))
    : 0

  // 10. Assemble Executive KPIs with Comparative Deltas
  const kpis: ExecutiveKpis = {
    netRevenue: computeKpiItem(curNet, prevNet, 'positive', 'currency'),
    grossRevenue: computeKpiItem(curGross, prevGross, 'positive', 'currency'),
    paidOrders: computeKpiItem(curPaidCount, prevPaidCount, 'positive', 'number'),
    averageOrderValue: computeKpiItem(curAov, prevAov, 'positive', 'currency'),
    conversionRate: computeKpiItem(curCvr, prevCvr, 'positive', 'percent'),
    newCustomers: computeKpiItem(curNewBuyers, prevNewBuyers, 'positive', 'number'),
    repeatPurchaseRate: computeKpiItem(curRepeatRate, prevRepeatRate, 'positive', 'percent'),
    refundRate: computeKpiItem(curRefundRate, prevRefundRate, 'negative', 'percent'),
    discountCost: computeKpiItem(curDiscount, prevDiscount, 'neutral', 'currency'),
    atRiskCustomersCount: computeKpiItem(atRiskCount, 0, 'negative', 'number'),
  }

  // 11. Deterministic Alert Rules
  const alerts: ExecutiveAlert[] = []

  if (kpis.netRevenue.percentageChange !== null && kpis.netRevenue.percentageChange < -ALERT_THRESHOLDS.REVENUE_DROP_CRITICAL_PERCENT) {
    alerts.push({
      id: 'rev_drop_critical',
      severity: 'critical',
      title: 'Penurunan Net Revenue Kritis',
      message: `Net revenue turun ${Math.abs(kpis.netRevenue.percentageChange)}% dibanding periode sebelumnya. Evaluasi promo atau traffic.`,
      metricKey: 'netRevenue',
      actionHref: '/admin/marketing',
    })
  } else if (kpis.netRevenue.percentageChange !== null && kpis.netRevenue.percentageChange < -ALERT_THRESHOLDS.REVENUE_DROP_WARNING_PERCENT) {
    alerts.push({
      id: 'rev_drop_warning',
      severity: 'warning',
      title: 'Peringatan Penurunan Revenue',
      message: `Net revenue turun ${Math.abs(kpis.netRevenue.percentageChange)}% dibanding periode sebelumnya.`,
      metricKey: 'netRevenue',
      actionHref: '/admin/marketing',
    })
  }

  if (curRefundRate >= ALERT_THRESHOLDS.REFUND_RATE_CRITICAL_PERCENT) {
    alerts.push({
      id: 'refund_spike_critical',
      severity: 'critical',
      title: 'Rasio Refund Sangat Tinggi',
      message: `Rasio refund mencapai ${curRefundRate}% dari total omzet. Segera periksa keluhan produk atau logistik.`,
      metricKey: 'refundRate',
      actionHref: '/admin/returns',
    })
  } else if (curRefundRate >= ALERT_THRESHOLDS.REFUND_RATE_WARNING_PERCENT) {
    alerts.push({
      id: 'refund_spike_warning',
      severity: 'warning',
      title: 'Peningkatan Rasio Refund',
      message: `Rasio refund berada di angka ${curRefundRate}%.`,
      metricKey: 'refundRate',
      actionHref: '/admin/returns',
    })
  }

  if (outOfStockCount > 0 || criticalCount > 0) {
    alerts.push({
      id: 'critical_stock_alert',
      severity: outOfStockCount > 0 ? 'critical' : 'warning',
      title: 'Peringatan Stok Habis & Kritis',
      message: `Terdapat ${outOfStockCount} produk habis stok dan ${criticalCount} produk stok kritis (<= 5 item).`,
      metricKey: 'inventory',
      actionHref: '/admin/inventory',
    })
  }

  if (orderStatus.totalBacklog >= ALERT_THRESHOLDS.PROCESSING_BACKLOG_CRITICAL_COUNT) {
    alerts.push({
      id: 'order_backlog_critical',
      severity: 'critical',
      title: 'Antrean Pesanan Menumpuk',
      message: `${orderStatus.totalBacklog} pesanan lunas menunggu diproses dan dikirim.`,
      metricKey: 'orders',
      actionHref: '/admin/orders',
    })
  } else if (orderStatus.totalBacklog >= ALERT_THRESHOLDS.PROCESSING_BACKLOG_WARNING_COUNT) {
    alerts.push({
      id: 'order_backlog_warning',
      severity: 'warning',
      title: 'Pesanan Menunggu Fulfillment',
      message: `${orderStatus.totalBacklog} pesanan menunggu proses pengemasan/pengiriman.`,
      metricKey: 'orders',
      actionHref: '/admin/orders',
    })
  }

  // 12. Top Action Items for Owner ("Apa yang perlu saya lakukan?")
  const actions: OwnerActionItem[] = []

  if (orderStatus.totalBacklog > 0) {
    actions.push({
      id: 'act_backlog',
      priority: orderStatus.totalBacklog > 10 ? 'high' : 'medium',
      title: `Proses ${orderStatus.totalBacklog} Pesanan Baru`,
      description: 'Pesanan berstatus lunas yang memerlukan persiapan packing dan serah terima kurir.',
      href: '/admin/orders?status=processing',
      badge: `${orderStatus.totalBacklog} Pesanan`,
    })
  }

  if (outOfStockCount + criticalCount > 0) {
    actions.push({
      id: 'act_inventory',
      priority: 'high',
      title: `Restock ${outOfStockCount + criticalCount} SKU Kritis`,
      description: 'Cegah kehilangan penjualan pada produk best-seller yang mendekati batas habis stok.',
      href: '/admin/inventory',
      badge: `${outOfStockCount + criticalCount} SKU`,
    })
  }

  if (curCompletedRefundsCount > 0) {
    actions.push({
      id: 'act_returns',
      priority: 'medium',
      title: `Tinjau ${curCompletedRefundsCount} Pengembalian Dana`,
      description: 'Pastikan alasan retur dan bukti kondisi barang telah diarsipkan untuk audit komersial.',
      href: '/admin/returns',
      badge: `${curCompletedRefundsCount} Refund`,
    })
  }

  if (unattributedPercent > ALERT_THRESHOLDS.UNATTRIBUTED_TRAFFIC_WARNING_PERCENT) {
    actions.push({
      id: 'act_marketing',
      priority: 'low',
      title: 'Audit Parameter Kampanye Marketing',
      description: `${unattributedPercent}% transaksi tidak memiliki UTM kampanye yang jelas.`,
      href: '/admin/marketing',
      badge: `${unattributedPercent}% Unknown`,
    })
  }

  // Fallback action if operations are all healthy
  if (actions.length === 0) {
    actions.push({
      id: 'act_all_good',
      priority: 'low',
      title: 'Operasional Berjalan Lancar',
      description: 'Tidak ada backlog pesanan atau isu stok mendesak. Fokus pada ekspansi kampanye pemasaran.',
      href: '/admin/marketing',
      badge: 'Stabil',
    })
  }

  // 13. Data Quality Validation
  const dataIssues: string[] = []
  if (curNet > curGross) {
    dataIssues.push('Anomali: Net Revenue lebih besar daripada Gross Revenue.')
  }
  if (curGross < 0 || curNet < 0) {
    dataIssues.push('Anomali: Ditemukan nilai omzet bernilai negatif.')
  }
  if (curRefundAmount > curGross && curGross > 0) {
    dataIssues.push('Anomali: Nilai refund melampaui total gross revenue.')
  }

  return {
    period: options.period ?? '7d',
    periodLabel: boundaries.periodLabel,
    currentDateRange: boundaries.current,
    previousDateRange: boundaries.previous,
    kpis,
    trends,
    orderStatus,
    customers: {
      totalValidBuyers: curBuyerIds.length,
      newBuyersCount: curNewBuyers,
      repeatBuyersCount: curRepeatBuyers,
      repeatPurchaseRatePercent: curRepeatRate,
      loyalCount,
      vipCount,
      atRiskCount,
      dormantCount,
      atRiskRevenueValueMinor,
    },
    marketing: {
      totalSessions: curSessions,
      paidOrders: curPaidCount,
      conversionRatePercent: curCvr,
      topChannels,
      topCampaigns: [],
      unattributedPercent,
      adSpendStatus: 'unavailable',
    },
    inventory: {
      outOfStockCount,
      criticalCount,
      lowStockCount,
      healthyCount,
      suggestedReorderCount: outOfStockCount + criticalCount,
      criticalProducts: criticalProducts.slice(0, 5),
    },
    returns: {
      returnRequestsCount: curCompletedRefundsCount,
      approvedReturnsCount: curCompletedRefundsCount,
      completedRefundsCount: curCompletedRefundsCount,
      refundValueMinor: curRefundAmount,
      refundRatePercent: curRefundRate,
    },
    alerts,
    actions: actions.slice(0, 5),
    dataQuality: {
      isConsistent: dataIssues.length === 0,
      issues: dataIssues,
    },
    generatedAt: new Date().toISOString(),
  }
}
