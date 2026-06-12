// POST /api/checkout — creates order + Midtrans Snap transaction
// Replaces the legacy Prisma-based checkout with Supabase + Midtrans Snap.

import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { generateOrderNumber } from '@/lib/ids'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import {
  createSnapTransaction,
  isMidtransProduction,
} from '@/lib/midtrans'
import type { MidtransCustomerDetails, MidtransItemDetail } from '@/types/midtrans'
import type { OrderStatus, PaymentStatus } from '@/types/database'

// ─── Request schema ───────────────────────────────────────────────────────────

interface CartItem {
  product_id: string
  variant_id?: string | null
  qty: number
  price: number   // unit price in IDR (not minor units)
  name: string
}

interface CheckoutBody {
  items: CartItem[]
  coupon_code?: string | null
  address_id: string
  shipping_cost: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateItems(items: unknown): items is CartItem[] {
  if (!Array.isArray(items) || items.length === 0) return false
  return items.every(
    (i) =>
      typeof i === 'object' &&
      i !== null &&
      typeof (i as CartItem).product_id === 'string' &&
      typeof (i as CartItem).qty === 'number' &&
      (i as CartItem).qty > 0 &&
      typeof (i as CartItem).price === 'number' &&
      typeof (i as CartItem).name === 'string',
  )
}

function uniqueOrderNumber(): string {
  return generateOrderNumber()
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: CheckoutBody
  try {
    body = (await req.json()) as CheckoutBody
  } catch {
    return jsonError('Request body tidak valid', 400)
  }

  const { items, coupon_code, address_id, shipping_cost = 0 } = body

  if (!validateItems(items)) {
    return jsonError('Field items tidak valid', 400)
  }
  if (!address_id) {
    return jsonError('address_id diperlukan', 400)
  }

  // 2. Authenticate — use server client (RLS enforced)
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return jsonError('Silakan login terlebih dahulu', 401)
  }

  // 3. Fetch profile for customer details
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, email')
    .eq('id', user.id)
    .single()

  const customerName = profile?.full_name ?? user.email ?? 'Pelanggan'
  const customerPhone = profile?.phone ?? ''
  const customerEmail = user.email ?? ''

  // 4. Fetch address
  const { data: address } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', address_id)
    .eq('user_id', user.id)
    .single()

  if (!address) {
    return jsonError('Alamat tidak ditemukan', 404)
  }

  // 5. Validate coupon (optional)
  let discountAmount = 0
  let couponId: string | null = null

  if (coupon_code) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (coupon) {
      const subtotalForCoupon = items.reduce((sum, i) => sum + i.price * i.qty, 0)
      const meetsMinPurchase =
        !coupon.min_purchase || subtotalForCoupon >= coupon.min_purchase

      if (meetsMinPurchase) {
        if (coupon.type === 'percentage') {
          discountAmount = Math.round((subtotalForCoupon * coupon.value) / 100)
          if (coupon.max_discount) discountAmount = Math.min(discountAmount, coupon.max_discount)
        } else if (coupon.type === 'fixed_amount') {
          discountAmount = coupon.value
        } else if (coupon.type === 'free_shipping') {
          discountAmount = shipping_cost
        }
        couponId = coupon.id
      }
    }
  }

  // 6. Calculate totals
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const totalAmount = Math.max(0, subtotal + shipping_cost - discountAmount)

  // 7. Use admin client for writes (bypasses RLS insert policies on orders)
  const admin = await createAdminClient()

  // 8. Generate unique order number
  const orderNumber = uniqueOrderNumber()

  // 9. Insert order
  const orderInsert = {
    order_number: orderNumber,
    user_id: user.id,
    status: 'pending_payment' as OrderStatus,
    subtotal,
    shipping_cost,
    discount_amount: discountAmount,
    tax_amount: 0,
    total_amount: totalAmount,
    coupon_id: couponId,
    shipping_address_id: address_id,
    notes: null,
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert(orderInsert)
    .select()
    .single()

  if (orderError || !order) {
    return jsonError('Gagal membuat pesanan', 500, orderError?.message)
  }

  // 10. Insert order_items
  const orderItemsInsert = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    product_name: item.name,
    variant_name: null as string | null,
    quantity: item.qty,
    unit_price: item.price,
    total_price: item.price * item.qty,
  }))

  const { error: itemsError } = await admin.from('order_items').insert(orderItemsInsert)

  if (itemsError) {
    // Rollback order
    await admin.from('orders').delete().eq('id', order.id)
    return jsonError('Gagal menyimpan item pesanan', 500, itemsError.message)
  }

  // 11. Build Midtrans payload
  const [firstName, ...rest] = customerName.split(' ')
  const customerDetails: MidtransCustomerDetails = {
    first_name: firstName,
    last_name: rest.join(' ') || undefined,
    email: customerEmail,
    phone: customerPhone,
    shipping_address: {
      first_name: address.recipient_name,
      phone: address.phone,
      address: address.address_line1,
      city: address.city,
      postal_code: address.postal_code,
      country_code: 'IDN',
    },
  }

  const midtransItems: MidtransItemDetail[] = [
    ...items.map((item) => ({
      id: item.variant_id ?? item.product_id,
      price: item.price,
      quantity: item.qty,
      name: item.name.slice(0, 50),
    })),
    ...(shipping_cost > 0
      ? [{ id: 'SHIPPING', price: shipping_cost, quantity: 1, name: 'Ongkos Kirim' }]
      : []),
    ...(discountAmount > 0
      ? [{ id: 'DISCOUNT', price: -discountAmount, quantity: 1, name: 'Diskon' }]
      : []),
  ]

  // 12. Call Midtrans Snap
  let snapToken: string
  let snapRedirectUrl: string

  try {
    const snapResponse = await createSnapTransaction(
      orderNumber,
      totalAmount,
      customerDetails,
      midtransItems,
    )
    snapToken = snapResponse.token
    snapRedirectUrl = snapResponse.redirect_url
  } catch (e) {
    // Rollback — delete items then order
    await admin.from('order_items').delete().eq('order_id', order.id)
    await admin.from('orders').delete().eq('id', order.id)
    return jsonError(
      'Gagal menghubungi payment gateway',
      502,
      e instanceof Error ? e.message : String(e),
    )
  }

  // 13. Save initial payment record
  const paymentInsert = {
    order_id: order.id,
    midtrans_order_id: orderNumber,
    midtrans_transaction_id: null as string | null,
    payment_type: null as string | null,
    status: 'pending' as PaymentStatus,
    gross_amount: totalAmount,
    snap_token: snapToken,
    snap_redirect_url: snapRedirectUrl,
    fraud_status: null as string | null,
    settlement_time: null as string | null,
    expiry_time: null as string | null,
    raw_response: null as Record<string, unknown> | null,
  }

  const { error: paymentError } = await admin.from('payments').insert(paymentInsert)

  if (paymentError) {
    // Non-fatal: order exists, payment row failed — log and continue
    console.error('[checkout] Failed to save payment row:', paymentError.message)
  }

  // 14. Record coupon usage
  if (couponId) {
    await admin.from('coupon_usages').insert({
      coupon_id: couponId,
      user_id: user.id,
      order_id: order.id,
      discount_applied: discountAmount,
      used_at: new Date().toISOString(),
    })
    await admin
      .from('coupons')
      .update({ usage_count: admin.from('coupons').select() } as never)
      .eq('id', couponId)
  }

  return jsonOk({
    order_number: orderNumber,
    snap_token: snapToken,
    redirect_url: snapRedirectUrl,
    is_production: isMidtransProduction,
  })
}
