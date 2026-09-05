// Ginabo — Return / Refund / Exchange domain logic
//
// Pure helpers (policy engine, eligibility, status machine, money) plus
// thin DB helpers that operate on the snake_case Supabase model + Supabase Auth.
// New tables (returns, refunds, …) are not yet in the generated `Database` type,
// so we accept a relaxed client type and cast.

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ReturnPolicyRow,
  ReturnStatus,
  ReturnType,
  PreferredResolution,
  ReturnEligibility,
  RefundMethod,
} from '@/types/returns'

// Relaxed client — the returns tables aren't in the generated Database type yet.
export type DB = SupabaseClient<any, any, any>

// ─────────────────────────────────────────────────────────────────────────────
// Policy engine
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_POLICY: ReturnPolicyRow = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'Fallback',
  is_active: true,
  return_window_days: 7,
  exchange_window_days: 7,
  refund_window_days: 14,
  eligible_category_ids: [],
  non_returnable_product_ids: [],
  auto_approve_reasons: ['missing_item', 'wrong_item'],
  manual_review_reasons: ['allergic_reaction', 'defective'],
  auto_approve_max_amount: 500000,
  require_evidence: true,
  min_evidence_count: 1,
  max_returns_per_month: 5,
  high_risk_score: 70,
  store_credit_bonus_pct: 0,
  notes: null,
  created_at: '',
  updated_at: '',
}

export async function getActivePolicy(db: DB): Promise<ReturnPolicyRow> {
  const { data } = await db
    .from('return_policies')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  return (data as ReturnPolicyRow | null) ?? FALLBACK_POLICY
}

// ─────────────────────────────────────────────────────────────────────────────
// Eligibility
// ─────────────────────────────────────────────────────────────────────────────

interface OrderForEligibility {
  id: string
  order_number: string
  status: string
  delivered_at: string | null
  created_at: string
  items: {
    id: string
    product_id: string | null
    variant_id: string | null
    product_name: string
    variant_name: string | null
    image_url: string | null
    quantity: number
    unit_price: number
  }[]
}

/**
 * Determines whether an order is eligible for a return under the active policy.
 * The window is counted from delivered_at (falls back to created_at if the order
 * is delivered/completed but delivered_at was never stamped).
 */
export function checkEligibility(
  order: OrderForEligibility,
  policy: ReturnPolicyRow,
  existingOpenReturns: number,
): ReturnEligibility {
  const reasons: string[] = []

  const deliveredOrDone = order.status === 'delivered' || order.status === 'completed'
  if (!deliveredOrDone) {
    reasons.push('Pesanan belum berstatus "delivered". Retur hanya bisa diajukan setelah barang diterima.')
  }

  const anchor = order.delivered_at ?? (deliveredOrDone ? order.created_at : null)
  let daysRemaining: number | null = null
  if (anchor) {
    const deadline = new Date(anchor).getTime() + policy.return_window_days * 86400000
    daysRemaining = Math.ceil((deadline - Date.now()) / 86400000)
    if (daysRemaining < 0) {
      reasons.push(`Masa retur ${policy.return_window_days} hari sudah berakhir.`)
    }
  }

  if (existingOpenReturns > 0) {
    reasons.push('Sudah ada permintaan retur aktif untuk pesanan ini.')
  }

  if (order.status === 'cancelled') {
    reasons.push('Pesanan dibatalkan, tidak dapat diretur.')
  }
  if (order.status === 'refunded') {
    reasons.push('Pesanan ini sudah direfund.')
  }

  const nonReturnable = new Set(policy.non_returnable_product_ids)
  const eligibleItems = order.items
    .filter((it) => !it.product_id || !nonReturnable.has(it.product_id))
    .map((it) => ({
      order_item_id: it.id,
      product_id: it.product_id,
      variant_id: it.variant_id,
      product_name: it.product_name,
      variant_name: it.variant_name,
      image_url: it.image_url,
      quantity: it.quantity,
      unit_price: it.unit_price,
    }))

  if (eligibleItems.length === 0) {
    reasons.push('Tidak ada produk dalam pesanan ini yang memenuhi syarat retur.')
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    order_number: order.order_number,
    delivered_at: order.delivered_at,
    window_days: policy.return_window_days,
    days_remaining: daysRemaining,
    eligible_items: eligibleItems,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Money
// ─────────────────────────────────────────────────────────────────────────────

export function computeRefundAmount(
  items: { unit_price: number; quantity: number }[],
): number {
  return items.reduce((sum, it) => sum + it.unit_price * it.quantity, 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Status machine
// ─────────────────────────────────────────────────────────────────────────────

const TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['under_review', 'cancelled'],
  under_review: ['more_evidence_required', 'approved', 'rejected', 'escalated'],
  more_evidence_required: ['under_review', 'rejected', 'cancelled'],
  approved: ['awaiting_shipment', 'refund_approved', 'exchange_approved'],
  awaiting_shipment: ['item_received', 'cancelled'],
  item_received: ['quality_inspection'],
  quality_inspection: ['refund_approved', 'exchange_approved', 'rejected', 'escalated'],
  refund_approved: ['completed'],
  exchange_approved: ['completed'],
  escalated: ['under_review', 'approved', 'rejected', 'refund_approved', 'exchange_approved'],
  rejected: [],
  cancelled: [],
  completed: [],
}

export function allowedTransitions(from: ReturnStatus): ReturnStatus[] {
  return TRANSITIONS[from] ?? []
}

export function canTransition(from: ReturnStatus, to: ReturnStatus): boolean {
  return allowedTransitions(from).includes(to)
}

/**
 * Decide the post-submission status based on policy + risk.
 * Returns the status the request should land in right after submission.
 */
export function decidePostSubmitStatus(
  policy: ReturnPolicyRow,
  returnType: ReturnType,
  amount: number,
  riskScore: number,
): ReturnStatus {
  // High risk or manual-review reasons always go to human review.
  if (riskScore >= policy.high_risk_score) return 'escalated'
  if (policy.manual_review_reasons.includes(returnType)) return 'under_review'
  if (amount > policy.auto_approve_max_amount) return 'under_review'
  if (policy.auto_approve_reasons.includes(returnType)) return 'approved'
  return 'under_review'
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit log + notifications
// ─────────────────────────────────────────────────────────────────────────────

export async function logStatusChange(
  adminDb: DB,
  args: {
    returnId: string
    from: ReturnStatus | null
    to: ReturnStatus
    changedBy?: string | null
    actorType?: 'customer' | 'admin' | 'system'
    reason?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  await adminDb.from('return_status_logs').insert({
    return_id: args.returnId,
    from_status: args.from,
    to_status: args.to,
    changed_by: args.changedBy ?? null,
    actor_type: args.actorType ?? 'system',
    reason: args.reason ?? null,
    metadata: args.metadata ?? {},
  })
}

const NOTIFY_TEMPLATES: Partial<Record<ReturnStatus, { subject: string; body: (n: string) => string }>> = {
  submitted: {
    subject: 'Permintaan retur diterima',
    body: (n) => `Permintaan retur ${n} sudah kami terima dan sedang diproses.`,
  },
  under_review: {
    subject: 'Retur sedang ditinjau',
    body: (n) => `Permintaan retur ${n} sedang ditinjau oleh tim kami.`,
  },
  more_evidence_required: {
    subject: 'Butuh bukti tambahan',
    body: (n) => `Untuk melanjutkan retur ${n}, mohon unggah bukti tambahan melalui halaman retur kamu.`,
  },
  approved: {
    subject: 'Retur disetujui',
    body: (n) => `Kabar baik! Retur ${n} telah disetujui. Silakan kirim barang kembali sesuai instruksi.`,
  },
  rejected: {
    subject: 'Retur ditolak',
    body: (n) => `Mohon maaf, permintaan retur ${n} tidak dapat kami setujui. Lihat detail untuk alasannya.`,
  },
  item_received: {
    subject: 'Barang retur diterima',
    body: (n) => `Barang untuk retur ${n} sudah kami terima dan sedang diperiksa.`,
  },
  refund_approved: {
    subject: 'Refund disetujui',
    body: (n) => `Refund untuk retur ${n} telah disetujui dan sedang diproses.`,
  },
  exchange_approved: {
    subject: 'Penukaran disetujui',
    body: (n) => `Penukaran untuk retur ${n} disetujui. Barang pengganti akan segera dikirim.`,
  },
  completed: {
    subject: 'Retur selesai',
    body: (n) => `Retur ${n} telah selesai. Terima kasih sudah berbelanja di Ginabo.`,
  },
}

/** Enqueue a customer notification into the `notifications` table (email + in_app). */
export async function enqueueReturnNotification(
  adminDb: DB,
  args: {
    profileId: string
    recipientEmail: string | null
    whatsappNumber?: string | null
    returnId: string
    returnNumber: string
    status: ReturnStatus
  },
): Promise<void> {
  const tpl = NOTIFY_TEMPLATES[args.status]
  if (!tpl) return

  const rows: Record<string, unknown>[] = []
  const subject = tpl.subject
  const body = tpl.body(args.returnNumber)

  // In-app always
  rows.push({
    profile_id: args.profileId,
    channel: 'in_app',
    recipient: args.profileId,
    template_id: `return_${args.status}`,
    subject,
    body,
    related_type: 'return',
    related_id: args.returnId,
    status: 'pending',
    variables: { return_number: args.returnNumber },
  })

  if (args.recipientEmail) {
    rows.push({
      profile_id: args.profileId,
      channel: 'email',
      recipient: args.recipientEmail,
      template_id: `return_${args.status}`,
      subject,
      body,
      related_type: 'return',
      related_id: args.returnId,
      status: 'pending',
      variables: { return_number: args.returnNumber },
    })
  }

  if (args.whatsappNumber) {
    rows.push({
      profile_id: args.profileId,
      channel: 'whatsapp',
      recipient: args.whatsappNumber,
      template_id: `return_${args.status}`,
      subject,
      body,
      related_type: 'return',
      related_id: args.returnId,
      status: 'pending',
      variables: { return_number: args.returnNumber },
    })
  }

  await adminDb.from('notifications').insert(rows)
}

// ─────────────────────────────────────────────────────────────────────────────
// Refund processing
// ─────────────────────────────────────────────────────────────────────────────

export function generateVoucherCode(): string {
  const block = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, 'X')
  return `RFND-${block()}-${block()}`
}

/**
 * Create + execute a refund for a return.
 * - original_payment: records a pending gateway refund (settled via webhook/manual).
 * - store_credit: credits the customer wallet atomically (via wallet_credit RPC) — completes immediately.
 * - voucher: mints a single-use coupon for the refund amount — completes immediately.
 *
 * Must be called with a service-role client (adminDb).
 */
export async function processRefund(
  adminDb: DB,
  args: {
    returnId: string
    orderId: string
    profileId: string
    paymentId: string | null
    method: RefundMethod
    amount: number
    storeCreditBonusPct?: number
    processedByAdminId?: string | null
  },
): Promise<{ refundId: string; status: string; voucherCode?: string }> {
  const base = {
    return_id: args.returnId,
    order_id: args.orderId,
    profile_id: args.profileId,
    payment_id: args.paymentId,
    method: args.method,
    amount: args.amount,
    processed_by: args.processedByAdminId ?? null,
  }

  if (args.method === 'store_credit') {
    const credited = Math.round(args.amount * (1 + (args.storeCreditBonusPct ?? 0) / 100))
    const { data: txId } = await adminDb.rpc('wallet_credit', {
      p_profile_id: args.profileId,
      p_amount: credited,
      p_source_type: 'refund',
      p_source_id: args.returnId,
      p_description: `Store credit refund untuk retur`,
    })
    const { data, error } = await adminDb
      .from('refunds')
      .insert({
        ...base,
        amount: credited,
        wallet_transaction_id: txId,
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    return { refundId: (data as { id: string }).id, status: 'completed' }
  }

  if (args.method === 'voucher') {
    const code = generateVoucherCode()
    const { data: coupon, error: cErr } = await adminDb
      .from('coupons')
      .insert({
        code,
        description: `Refund voucher untuk retur ${args.returnId}`,
        discount_type: 'fixed_idr',
        discount_value: args.amount,
        usage_limit: 1,
        usage_per_user: 1,
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
      })
      .select('id')
      .single()
    if (cErr) throw new Error(cErr.message)
    const { data, error } = await adminDb
      .from('refunds')
      .insert({
        ...base,
        coupon_id: (coupon as { id: string }).id,
        voucher_code: code,
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    return { refundId: (data as { id: string }).id, status: 'completed', voucherCode: code }
  }

  // original_payment — record as pending; actual gateway reversal handled out-of-band.
  const { data, error } = await adminDb
    .from('refunds')
    .insert({ ...base, status: 'pending' })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return { refundId: (data as { id: string }).id, status: 'pending' }
}
