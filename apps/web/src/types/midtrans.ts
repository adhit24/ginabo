// Midtrans Snap API Types — ginabo.id

// ─── Snap Request ─────────────────────────────────────────────────────────────

export interface MidtransTransactionDetails {
  order_id: string
  gross_amount: number
}

export interface MidtransCustomerDetails {
  first_name: string
  last_name?: string
  email: string
  phone: string
  billing_address?: MidtransAddress
  shipping_address?: MidtransAddress
}

export interface MidtransAddress {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country_code?: string
}

export interface MidtransItemDetail {
  id: string
  price: number
  quantity: number
  name: string
  brand?: string
  category?: string
  merchant_name?: string
  url?: string
}

export interface MidtransCallbacks {
  finish?: string
  unfinish?: string
  error?: string
}

export interface MidtransCreditCard {
  secure?: boolean
  bank?: string
  installment?: {
    required: boolean
    terms: Record<string, number[]>
  }
  whitelist_bins?: string[]
}

export interface MidtransSnapRequest {
  transaction_details: MidtransTransactionDetails
  customer_details: MidtransCustomerDetails
  item_details: MidtransItemDetail[]
  callbacks?: MidtransCallbacks
  credit_card?: MidtransCreditCard
  enabled_payments?: MidtransPaymentMethod[]
  expiry?: {
    start_time?: string
    unit: 'minute' | 'hour' | 'day'
    duration: number
  }
  custom_field1?: string
  custom_field2?: string
  custom_field3?: string
}

// ─── Snap Response ────────────────────────────────────────────────────────────

export interface MidtransSnapResponse {
  token: string
  redirect_url: string
}

// ─── Transaction Status ───────────────────────────────────────────────────────

export type MidtransTransactionStatus =
  | 'capture'
  | 'settlement'
  | 'pending'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'refund'
  | 'partial_refund'
  | 'authorize'
  | 'failure'

export type MidtransFraudStatus = 'accept' | 'challenge' | 'deny'

export type MidtransPaymentMethod =
  | 'credit_card'
  | 'bank_transfer'
  | 'bca_va'
  | 'bni_va'
  | 'bri_va'
  | 'mandiri_va'
  | 'permata_va'
  | 'other_va'
  | 'gopay'
  | 'shopeepay'
  | 'dana'
  | 'ovo'
  | 'qris'
  | 'indomaret'
  | 'alfamart'
  | 'akulaku'
  | 'kredivo'

// ─── Webhook Notification ─────────────────────────────────────────────────────

export interface MidtransNotification {
  transaction_time: string
  transaction_status: MidtransTransactionStatus
  transaction_id: string
  status_message: string
  status_code: string
  signature_key: string
  settlement_time?: string
  payment_type: string
  order_id: string
  merchant_id: string
  masked_card?: string
  gross_amount: string
  fraud_status?: MidtransFraudStatus
  currency: string
  bank?: string
  approval_code?: string
  acquirer?: string
  // VA-specific
  va_numbers?: Array<{ bank: string; va_number: string }>
  biller_code?: string
  bill_key?: string
  // E-money specific
  issuer?: string
  acquirer_name?: string
  // Convenience store
  payment_code?: string
  store?: string
}

// ─── Verified notification (post signature check) ────────────────────────────

export interface MidtransVerifiedNotification extends MidtransNotification {
  _verified: true
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface MidtransApiError {
  status_code: string
  status_message: string[]
  id?: string
}
