// GET /api/orders/[orderNumber] — fetch single order with items + payment
// Authenticated users can only see their own orders; admin role bypasses this.

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import type { OrderRow, OrderItemRow, PaymentRow, AddressRow } from '@/types/database'

interface RouteContext {
  params: { orderNumber: string }
}

// ─── Projected shapes from DB query ──────────────────────────────────────────

type OrderProjection = Pick<
  OrderRow,
  | 'id'
  | 'order_number'
  | 'status'
  | 'subtotal'
  | 'shipping_cost'
  | 'discount_amount'
  | 'tax_amount'
  | 'total_amount'
  | 'shipping_provider'
  | 'tracking_number'
  | 'notes'
  | 'created_at'
  | 'updated_at'
> & {
  shipping_address: Pick<
    AddressRow,
    | 'recipient_name'
    | 'phone'
    | 'address_line1'
    | 'address_line2'
    | 'city'
    | 'province'
    | 'postal_code'
  > | null
  items: Pick<
    OrderItemRow,
    | 'id'
    | 'product_id'
    | 'variant_id'
    | 'product_name'
    | 'variant_name'
    | 'quantity'
    | 'unit_price'
    | 'total_price'
  >[]
  payments: Pick<
    PaymentRow,
    | 'id'
    | 'provider'
    | 'invoice_number'
    | 'provider_transaction_id'
    | 'payment_type'
    | 'status'
    | 'gross_amount'
    | 'checkout_url'
    | 'payment_url'
    | 'settlement_time'
    | 'created_at'
  >[]
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { orderNumber } = params

  if (!orderNumber) return jsonError('Order number diperlukan', 400)

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return jsonError('Silakan login terlebih dahulu', 401)

  // Determine if user has admin role
  const adminDb = await createAdminClient()
  const { data: adminRecord } = await adminDb
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id as never)
    .eq('is_active', true as never)
    .maybeSingle()

  const isAdmin = adminRecord !== null

  // Use the appropriate client
  const db = isAdmin ? adminDb : supabase

  const SELECT = `
    id,
    order_number,
    status,
    subtotal,
    shipping_cost,
    discount_amount,
    tax_amount,
    total_amount,
    shipping_provider,
    tracking_number,
    notes,
    created_at,
    updated_at,
    shipping_address:addresses(
      recipient_name,
      phone,
      address_line1,
      address_line2,
      city,
      province,
      postal_code
    ),
    items:order_items(
      id,
      product_id,
      variant_id,
      product_name,
      variant_name,
      quantity,
      unit_price,
      total_price
    ),
    payments(
      id,
      provider,
      invoice_number,
      provider_transaction_id,
      payment_type,
      status,
      gross_amount,
      checkout_url,
      payment_url,
      settlement_time,
      created_at
    )
  `

  const { data: rawOrder, error } = await db
    .from('orders')
    .select(SELECT)
    .eq('order_number', orderNumber as never)
    .single()

  if (error || !rawOrder) return jsonError('Pesanan tidak ditemukan', 404)

  const order = rawOrder as unknown as OrderProjection

  // Sort payments newest first
  const sortedPayments = [...order.payments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const latestPayment = sortedPayments[0] ?? null

  return jsonOk({
    order_number: order.order_number,
    status: order.status,
    subtotal: order.subtotal,
    shipping_cost: order.shipping_cost,
    discount_amount: order.discount_amount,
    tax_amount: order.tax_amount,
    total_amount: order.total_amount,
    shipping_provider: order.shipping_provider,
    tracking_number: order.tracking_number,
    notes: order.notes,
    created_at: order.created_at,
    updated_at: order.updated_at,
    shipping_address: order.shipping_address ?? null,
    items: order.items.map((i) => ({
      id: i.id,
      product_id: i.product_id,
      variant_id: i.variant_id,
      product_name: i.product_name,
      variant_name: i.variant_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
    })),
    payment: latestPayment
      ? {
          id: latestPayment.id,
          provider: latestPayment.provider,
          invoice_number: latestPayment.invoice_number,
          provider_transaction_id: latestPayment.provider_transaction_id,
          payment_type: latestPayment.payment_type,
          status: latestPayment.status,
          gross_amount: latestPayment.gross_amount,
          checkout_url: latestPayment.checkout_url || latestPayment.payment_url,
          settlement_time: latestPayment.settlement_time,
        }
      : null,
  })
}
