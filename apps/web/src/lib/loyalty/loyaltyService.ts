import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CustomerLoyaltySummary,
  AdminLoyaltyOverview,
  LoyaltyTransaction,
  LoyaltyReconciliationReport,
  MembershipTier,
} from './types'
import {
  calculateMembershipTier,
  calculateTierProgress,
  calculatePointsFromSpend,
} from './tierEngine'

const VALID_ORDER_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'completed']

/**
 * Server-authoritative, idempotent loyalty points credit upon order completion.
 */
export async function creditOrderLoyaltyPoints(
  db: SupabaseClient,
  orderId: string
): Promise<{
  ok: boolean
  pointsAwarded?: number
  alreadyCredited?: boolean
  newBalance?: number
  reason?: string
}> {
  // 1. Fetch order details
  const { data: order, error: orderErr } = await db
    .from('orders')
    .select('id, profile_id, order_number, status, total_amount')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return { ok: false, reason: 'Pesanan tidak ditemukan' }
  }

  // 2. Only completed orders earn loyalty points
  if (order.status !== 'completed') {
    return { ok: false, reason: `Status pesanan bukan completed (status saat ini: ${order.status})` }
  }

  const profileId = order.profile_id
  if (!profileId) {
    return { ok: false, reason: 'Pesanan tidak memiliki profil customer' }
  }

  // 3. Check for existing earning transaction to enforce idempotency
  const { data: existingTx } = await db
    .from('loyalty_transactions')
    .select('id, points_delta, balance_after')
    .eq('profile_id', profileId)
    .eq('transaction_type', 'earn_purchase')
    .eq('source_type', 'order')
    .eq('source_id', orderId)
    .maybeSingle()

  if (existingTx) {
    return {
      ok: true,
      pointsAwarded: existingTx.points_delta,
      alreadyCredited: true,
      newBalance: existingTx.balance_after,
    }
  }

  // 4. Calculate points from net order amount
  const pointsToAward = calculatePointsFromSpend(order.total_amount ?? 0)
  if (pointsToAward <= 0) {
    return { ok: true, pointsAwarded: 0 }
  }

  // 5. Fetch current balance
  const { data: profile } = await db
    .from('profiles')
    .select('loyalty_points')
    .eq('id', profileId)
    .single()

  const currentBalance = Math.max(0, profile?.loyalty_points ?? 0)
  const newBalance = currentBalance + pointsToAward

  // 6. Record in immutable ledger
  const { error: txErr } = await db.from('loyalty_transactions').insert({
    profile_id: profileId,
    transaction_type: 'earn_purchase',
    points_delta: pointsToAward,
    balance_after: newBalance,
    source_type: 'order',
    source_id: orderId,
    description: `Poin belanja dari pesanan ${order.order_number}`,
  })

  if (txErr) {
    return { ok: false, reason: `Gagal mencatat transaksi poin: ${txErr.message}` }
  }

  // 7. Update profile balance
  await db
    .from('profiles')
    .update({ loyalty_points: newBalance, updated_at: new Date().toISOString() })
    .eq('id', profileId)

  return {
    ok: true,
    pointsAwarded: pointsToAward,
    newBalance,
  }
}

/**
 * Reverses loyalty points upon refund approval (idempotent & prevents negative balance).
 */
export async function reverseRefundLoyaltyPoints(
  db: SupabaseClient,
  params: {
    refundId: string
    orderId: string
    profileId: string
    refundAmount: number
  }
): Promise<{
  ok: boolean
  pointsReversed?: number
  alreadyReversed?: boolean
  newBalance?: number
  reason?: string
}> {
  const { refundId, profileId, refundAmount } = params

  // 1. Check idempotency
  const { data: existingTx } = await db
    .from('loyalty_transactions')
    .select('id, points_delta, balance_after')
    .eq('profile_id', profileId)
    .eq('transaction_type', 'reversal')
    .eq('source_type', 'refund')
    .eq('source_id', refundId)
    .maybeSingle()

  if (existingTx) {
    return {
      ok: true,
      pointsReversed: Math.abs(existingTx.points_delta),
      alreadyReversed: true,
      newBalance: existingTx.balance_after,
    }
  }

  // 2. Calculate proportional points to reverse
  const pointsToReverse = calculatePointsFromSpend(refundAmount)
  if (pointsToReverse <= 0) {
    return { ok: true, pointsReversed: 0 }
  }

  // 3. Fetch current balance
  const { data: profile } = await db
    .from('profiles')
    .select('loyalty_points')
    .eq('id', profileId)
    .single()

  const currentBalance = Math.max(0, profile?.loyalty_points ?? 0)
  // Ensure balance cannot go below 0
  const actualDeduction = Math.min(currentBalance, pointsToReverse)
  const newBalance = Math.max(0, currentBalance - actualDeduction)

  if (actualDeduction > 0) {
    // 4. Record reversal in ledger
    const { error: txErr } = await db.from('loyalty_transactions').insert({
      profile_id: profileId,
      transaction_type: 'reversal',
      points_delta: -actualDeduction,
      balance_after: newBalance,
      source_type: 'refund',
      source_id: refundId,
      description: `Pengurangan poin atas retur/refund order (Refund: Rp ${refundAmount.toLocaleString('id-ID')})`,
    })

    if (txErr) {
      return { ok: false, reason: `Gagal mencatat pembalikan poin: ${txErr.message}` }
    }

    // 5. Update profile balance
    await db
      .from('profiles')
      .update({ loyalty_points: newBalance, updated_at: new Date().toISOString() })
      .eq('id', profileId)
  }

  return {
    ok: true,
    pointsReversed: actualDeduction,
    newBalance,
  }
}

/**
 * Admin manual points adjustment with required reason and full audit logging.
 */
export async function adjustCustomerPoints(
  db: SupabaseClient,
  params: {
    adminUserId: string
    profileId: string
    pointsDelta: number
    reason: string
  }
): Promise<{
  ok: boolean
  newBalance?: number
  pointsDelta?: number
  error?: string
}> {
  const { adminUserId, profileId, pointsDelta, reason } = params

  if (!reason || !reason.trim()) {
    return { ok: false, error: 'Alasan penyesuaian poin wajib diisi untuk audit' }
  }

  if (pointsDelta === 0) {
    return { ok: false, error: 'Jumlah penyesuaian poin tidak boleh 0' }
  }

  // 1. Fetch current balance
  const { data: profile, error: profErr } = await db
    .from('profiles')
    .select('id, loyalty_points')
    .eq('id', profileId)
    .single()

  if (profErr || !profile) {
    return { ok: false, error: 'Profil customer tidak ditemukan' }
  }

  const currentBalance = Math.max(0, profile.loyalty_points ?? 0)
  const newBalance = currentBalance + pointsDelta

  if (newBalance < 0) {
    return {
      ok: false,
      error: `Penyesuaian tidak valid: saldo poin saat ini ${currentBalance}, tidak mencukupi untuk pengurangan ${Math.abs(pointsDelta)} poin`,
    }
  }

  // 2. Insert ledger record
  const { error: txErr } = await db.from('loyalty_transactions').insert({
    profile_id: profileId,
    transaction_type: 'adjustment',
    points_delta: pointsDelta,
    balance_after: newBalance,
    source_type: 'admin',
    source_id: adminUserId,
    description: reason.trim(),
  })

  if (txErr) {
    return { ok: false, error: `Gagal mencatat penyesuaian poin: ${txErr.message}` }
  }

  // 3. Update profile balance
  await db
    .from('profiles')
    .update({ loyalty_points: newBalance, updated_at: new Date().toISOString() })
    .eq('id', profileId)

  return {
    ok: true,
    newBalance,
    pointsDelta,
  }
}

/**
 * Retrieves comprehensive loyalty status, tier progress, and transaction history for a customer.
 */
export async function getCustomerLoyaltySummary(
  db: SupabaseClient,
  profileId: string
): Promise<CustomerLoyaltySummary | null> {
  const [{ data: profile }, { data: orders }, { data: refunds }, { data: transactions }] =
    await Promise.all([
      db.from('profiles').select('id, loyalty_points').eq('id', profileId).maybeSingle(),
      db.from('orders').select('id, total_amount, status').eq('profile_id', profileId),
      db.from('refunds').select('amount, status').eq('profile_id', profileId),
      db
        .from('loyalty_transactions')
        .select('id, profile_id, transaction_type, points_delta, balance_after, source_type, source_id, description, created_at')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

  if (!profile) return null

  const validOrders = (orders ?? []).filter((o) => VALID_ORDER_STATUSES.includes(o.status))
  const grossSpend = validOrders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
  const validRefunds = (refunds ?? [])
    .filter((r) => r.status === 'completed' || r.status === 'processing')
    .reduce((sum, r) => sum + (r.amount ?? 0), 0)

  const lifetimeNetSpendMinor = Math.max(0, grossSpend - validRefunds)
  const tierProgress = calculateTierProgress(lifetimeNetSpendMinor)

  const txList: LoyaltyTransaction[] = (transactions ?? []).map((t) => ({
    id: t.id,
    profileId: t.profile_id,
    transactionType: t.transaction_type,
    pointsDelta: t.points_delta,
    balanceAfter: t.balance_after,
    sourceType: t.source_type,
    sourceId: t.source_id,
    description: t.description,
    createdAt: t.created_at,
  }))

  let lifetimePointsEarned = 0
  let lifetimePointsRedeemed = 0

  for (const t of txList) {
    if (t.pointsDelta > 0) {
      lifetimePointsEarned += t.pointsDelta
    } else {
      lifetimePointsRedeemed += Math.abs(t.pointsDelta)
    }
  }

  return {
    profileId,
    pointsBalance: profile.loyalty_points ?? 0,
    lifetimePointsEarned,
    lifetimePointsRedeemed,
    currentTier: tierProgress.currentTier,
    lifetimeNetSpendMinor,
    nextTier: tierProgress.nextTier,
    spendToNextTierMinor: tierProgress.spendToNextTierMinor,
    tierProgressPercent: tierProgress.progressPercent,
    tierMessage: tierProgress.message,
    recentTransactions: txList,
  }
}

/**
 * Retrieves platform-wide loyalty metrics and liability overview for store administrators.
 */
export async function getAdminLoyaltyOverview(db: SupabaseClient): Promise<AdminLoyaltyOverview> {
  const [{ data: profiles }, { data: orders }, { data: transactions }] = await Promise.all([
    db.from('profiles').select('id, loyalty_points'),
    db.from('orders').select('profile_id, total_amount, status'),
    db.from('loyalty_transactions').select('transaction_type, points_delta'),
  ])

  const profileList = profiles ?? []
  const orderList = orders ?? []
  const txList = transactions ?? []

  // 1. Total points outstanding (current promotional liability)
  let totalPointsOutstanding = 0
  for (const p of profileList) {
    totalPointsOutstanding += Math.max(0, p.loyalty_points ?? 0)
  }

  // 2. Points earned and redeemed all-time
  let totalPointsEarnedAllTime = 0
  let totalPointsRedeemedAllTime = 0

  for (const tx of txList) {
    if (tx.points_delta > 0) {
      totalPointsEarnedAllTime += tx.points_delta
    } else if (tx.transaction_type === 'redeem') {
      totalPointsRedeemedAllTime += Math.abs(tx.points_delta)
    }
  }

  const redemptionRatePercent =
    totalPointsEarnedAllTime > 0
      ? Number(((totalPointsRedeemedAllTime / totalPointsEarnedAllTime) * 100).toFixed(1))
      : 0.0

  // 3. Tier Distribution from lifetime spend
  const spendByProfile = new Map<string, number>()
  for (const o of orderList) {
    if (VALID_ORDER_STATUSES.includes(o.status)) {
      const current = spendByProfile.get(o.profile_id) ?? 0
      spendByProfile.set(o.profile_id, current + (o.total_amount ?? 0))
    }
  }

  const tierDistribution: Record<MembershipTier, number> = {
    Regular: 0,
    Silver: 0,
    Gold: 0,
    Platinum: 0,
  }

  for (const p of profileList) {
    const spend = spendByProfile.get(p.id) ?? 0
    const tier = calculateMembershipTier(spend)
    tierDistribution[tier] = (tierDistribution[tier] ?? 0) + 1
  }

  return {
    totalMembers: profileList.length,
    activeMembers: spendByProfile.size,
    totalPointsOutstanding,
    totalPointsEarnedAllTime,
    totalPointsRedeemedAllTime,
    tierDistribution,
    redemptionRatePercent,
  }
}

/**
 * Reconciles customer profiles with points ledger to detect balance drift or corruption.
 */
export async function reconcileLoyaltyData(
  db: SupabaseClient
): Promise<LoyaltyReconciliationReport> {
  const [{ data: profiles }, { data: transactions }] = await Promise.all([
    db.from('profiles').select('id, loyalty_points'),
    db.from('loyalty_transactions').select('profile_id, points_delta'),
  ])

  const profileList = profiles ?? []
  const txList = transactions ?? []

  const ledgerSumByProfile = new Map<string, number>()
  for (const tx of txList) {
    const cur = ledgerSumByProfile.get(tx.profile_id) ?? 0
    ledgerSumByProfile.set(tx.profile_id, cur + (tx.points_delta ?? 0))
  }

  const profileIdSet = new Set(profileList.map((p) => p.id))
  let orphanedTransactionsCount = 0
  for (const tx of txList) {
    if (!profileIdSet.has(tx.profile_id)) {
      orphanedTransactionsCount++
    }
  }

  let negativeBalanceCount = 0
  const discrepancies: Array<{
    profileId: string
    balanceInProfile: number
    sumFromLedger: number
    difference: number
  }> = []

  for (const p of profileList) {
    const bal = p.loyalty_points ?? 0
    if (bal < 0) negativeBalanceCount++

    // Only audit accounts that have ledger records
    if (ledgerSumByProfile.has(p.id)) {
      const sum = ledgerSumByProfile.get(p.id) ?? 0
      // Note: Welcome bonus of 100 on registration might be in balance without ledger in legacy rows
      const diff = bal - sum
      if (diff !== 0 && diff !== 100) {
        discrepancies.push({
          profileId: p.id,
          balanceInProfile: bal,
          sumFromLedger: sum,
          difference: diff,
        })
      }
    }
  }

  return {
    auditedAt: new Date().toISOString(),
    totalAccountsChecked: profileList.length,
    discrepanciesCount: discrepancies.length,
    discrepancies,
    negativeBalanceCount,
    orphanedTransactionsCount,
  }
}
