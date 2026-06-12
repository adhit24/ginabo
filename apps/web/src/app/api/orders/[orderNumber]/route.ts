// GET /api/orders/[orderNumber] — fetch single order with items + payment
// Authenticated users can only see their own orders; admin role bypasses this.

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'

interface RouteContext {
  params: { orderNumber: string }
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { orderNumber } = params

  if (!orderNumber) {
    return jsonError('Order number diperlukan', 400)
  }

  // Attempt authenticated request first (respects RLS)
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if admin (service role query to admin_users table)
  let isAdmin = false
  if (user) {
    const admin = await createAdminClient()
    const { data: adminRecord } = await admin
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    isAdmin = adminRecord !== null
  }

  if (!user) {
    return jsonError('Silakan login terlebih dahulu', 401)
  }

  // Use admin client for admin users; RLS client for regular users
  const db = isAdmin ? await createAdminClient() : supabase

  const { data: order, error } = await db
    .from('orders')
    .select(
      `
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
        midtrans_order_id,
        midtrans_transaction_id,
        payment_type,
        status,
        gross_amount,
        snap_token,
        snap_redirect_url,
        fraud_status,
        settlement_time,
        created_at
      )
    `,
    )
    .eq('order_number', orderNumber)
    .single()

  if (error || !order) {
    return jsonError('Pesanan tidak ditemukan', 404)
  }

  // For regular users, assert ownership (belt-and-suspenders on top of RLS)
  if (!isAdmin && (order as unknown as { user_id?: string }).user_id !== user.id) {
    return jsonError('Pesanan tidak ditemukan', 404)
  }

  // Sort payments newest first, surface the latest
  const sortedPayments = Array.isArray(order.payments)
    ? [...order.payments].sort(
        (
          a: { created_at: string },
          b: { created_at: string },
        ) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    : []

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
    items: (order.items ?? []).map(
      (i: {
        id: string
        product_id: string
        variant_id: string | null
        product_name: string
        variant_name: string | null
        quantity: number
        unit_price: number
        total_price: number
      }) => ({
        id: i.id,
        product_id: i.product_id,
        variant_id: i.variant_id,
        product_name: i.product_name,
        variant_name: i.variant_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
      }),
    ),
    payment: latestPayment
      ? {
          id: latestPayment.id,
          payment_type: latestPayment.payment_type,
          status: latestPayment.status,
          gross_amount: latestPayment.gross_amount,
          snap_token: latestPayment.snap_token,
          snap_redirect_url: latestPayment.snap_redirect_url,
          fraud_status: latestPayment.fraud_status,
          settlement_time: latestPayment.settlement_time,
          midtrans_transaction_id: latestPayment.midtrans_transaction_id,
        }
      : null,
  })
}
