// Ginabo — Return / Refund / Exchange domain types
// Mirrors supabase/migrations/004_returns_system.sql
// Currency amounts are IDR integers (BIGINT) represented as `number`.

// ─── Enums (string unions matching CHECK constraints) ────────────────────────

export type ReturnType =
  | 'defective'
  | 'wrong_item'
  | 'missing_item'
  | 'expired'
  | 'allergic_reaction'
  | 'exchange'
  | 'other'

export type PreferredResolution =
  | 'refund'
  | 'exchange'
  | 'store_credit'
  | 'voucher'
  | 'repair_replace'

export type ReturnStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'more_evidence_required'
  | 'approved'
  | 'rejected'
  | 'awaiting_shipment'
  | 'item_received'
  | 'quality_inspection'
  | 'refund_approved'
  | 'exchange_approved'
  | 'completed'
  | 'cancelled'
  | 'escalated'

export type RefundMethod = 'original_payment' | 'store_credit' | 'voucher'

export type RefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type ExchangeType = 'same_product' | 'different_variant' | 'different_product'

export type ExchangeStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'approved'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export type EvidenceMediaType = 'image' | 'video' | 'document'
export type InspectionResult = 'pending' | 'passed' | 'failed' | 'partial'
export type NoteAuthorType = 'customer' | 'admin' | 'system'
export type NoteVisibility = 'internal' | 'customer'

// ─── Human-readable labels (Bahasa Indonesia) ────────────────────────────────

export const RETURN_TYPE_LABELS: Record<ReturnType, string> = {
  defective: 'Produk Rusak / Cacat',
  wrong_item: 'Barang Salah Kirim',
  missing_item: 'Barang Tidak Lengkap',
  expired: 'Produk Kedaluwarsa',
  allergic_reaction: 'Reaksi Alergi',
  exchange: 'Permintaan Tukar',
  other: 'Lainnya',
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  draft: 'Draf',
  submitted: 'Diajukan',
  under_review: 'Sedang Ditinjau',
  more_evidence_required: 'Butuh Bukti Tambahan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  awaiting_shipment: 'Menunggu Pengiriman Balik',
  item_received: 'Barang Diterima',
  quality_inspection: 'Pemeriksaan Kualitas',
  refund_approved: 'Refund Disetujui',
  exchange_approved: 'Tukar Disetujui',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  escalated: 'Dieskalasi',
}

// Status groups used by the customer Return Center tabs.
export const ACTIVE_RETURN_STATUSES: ReturnStatus[] = [
  'submitted',
  'under_review',
  'more_evidence_required',
  'approved',
  'awaiting_shipment',
  'item_received',
  'quality_inspection',
  'refund_approved',
  'exchange_approved',
  'escalated',
]
export const CLOSED_RETURN_STATUSES: ReturnStatus[] = ['completed', 'rejected', 'cancelled']

// ─── Row types ───────────────────────────────────────────────────────────────

export interface ReturnPolicyRow {
  id: string
  name: string
  is_active: boolean
  return_window_days: number
  exchange_window_days: number
  refund_window_days: number
  eligible_category_ids: string[]
  non_returnable_product_ids: string[]
  auto_approve_reasons: ReturnType[]
  manual_review_reasons: ReturnType[]
  auto_approve_max_amount: number
  require_evidence: boolean
  min_evidence_count: number
  max_returns_per_month: number
  high_risk_score: number
  store_credit_bonus_pct: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ReturnRow {
  id: string
  return_number: string
  order_id: string
  profile_id: string
  policy_id: string | null
  return_type: ReturnType
  preferred_resolution: PreferredResolution
  status: ReturnStatus
  customer_note: string | null
  rejection_reason: string | null
  refund_amount: number
  return_courier: string | null
  return_tracking_number: string | null
  risk_score: number
  risk_flags: string[]
  is_flagged: boolean
  assigned_admin_id: string | null
  submitted_at: string | null
  reviewed_at: string | null
  received_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ReturnItemRow {
  id: string
  return_id: string
  order_item_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_name: string | null
  sku: string | null
  image_url: string | null
  quantity: number
  unit_price: number
  line_refund_amount: number
  item_reason: string | null
  inspection_result: InspectionResult
  inspection_note: string | null
  restock: boolean
  created_at: string
}

export interface ReturnEvidenceRow {
  id: string
  return_id: string
  uploaded_by: string
  media_type: EvidenceMediaType
  storage_path: string
  url: string | null
  caption: string | null
  file_size_bytes: number | null
  usage_history: string | null
  is_validated: boolean
  created_at: string
}

export interface ReturnNoteRow {
  id: string
  return_id: string
  author_id: string | null
  author_type: NoteAuthorType
  visibility: NoteVisibility
  body: string
  created_at: string
}

export interface ReturnStatusLogRow {
  id: string
  return_id: string
  from_status: ReturnStatus | null
  to_status: ReturnStatus
  changed_by: string | null
  actor_type: NoteAuthorType
  reason: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface RefundRow {
  id: string
  return_id: string
  order_id: string
  payment_id: string | null
  profile_id: string
  method: RefundMethod
  amount: number
  provider_refund_id: string | null
  wallet_transaction_id: string | null
  coupon_id: string | null
  voucher_code: string | null
  status: RefundStatus
  failure_reason: string | null
  processed_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
}

export interface ExchangeRow {
  id: string
  return_id: string
  order_id: string
  profile_id: string
  exchange_type: ExchangeType
  original_product_id: string | null
  original_variant_id: string | null
  new_product_id: string | null
  new_variant_id: string | null
  new_product_name: string | null
  quantity: number
  original_value: number
  new_value: number
  price_difference: number
  additional_payment_id: string | null
  new_order_id: string | null
  shipping_courier: string | null
  tracking_number: string | null
  shipped_at: string | null
  status: ExchangeStatus
  processed_by: string | null
  created_at: string
  updated_at: string
}

export interface CustomerWalletRow {
  id: string
  profile_id: string
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface WalletTransactionRow {
  id: string
  wallet_id: string
  profile_id: string
  direction: 'credit' | 'debit'
  amount: number
  balance_after: number
  source_type: 'refund' | 'order' | 'adjustment' | 'expiry'
  source_id: string | null
  description: string | null
  created_at: string
}

// ─── API request/response shapes ─────────────────────────────────────────────

export interface ReturnEligibility {
  eligible: boolean
  reasons: string[]            // why NOT eligible (empty when eligible)
  order_number: string
  delivered_at: string | null
  window_days: number
  days_remaining: number | null
  eligible_items: {
    order_item_id: string
    product_id: string | null
    variant_id: string | null
    product_name: string
    variant_name: string | null
    image_url: string | null
    quantity: number
    unit_price: number
  }[]
}

export interface CreateReturnInput {
  order_number: string
  return_type: ReturnType
  preferred_resolution: PreferredResolution
  customer_note?: string
  items: {
    order_item_id: string
    quantity: number
    item_reason?: string
  }[]
  // Allergic-reaction special handling
  usage_history?: string
}
