// POST /api/checkout — creates order + Midtrans Snap transaction
// Replaces the legacy Prisma-based checkout with Supabase + Midtrans Snap.

import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { generateOrderNumber } from '@/lib/ids'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { createSnapTransaction, isMidtransProduction } from '@/lib/midtrans'
import type { MidtransCustomerDetails, MidtransItemDetail } from '@/types/midtrans'
import type {
  OrderRow,
  OrderItemRow,
  PaymentRow,
  CouponRow,
} from '@/types/database'

// ─── Request schema ───────────────────────────────────────────────────────────

interface CartItem {
  product_id: string
  variant_id?: string | null
  qty: number
  price: number // unit price in IDR
  name: string
}

interface CheckoutBody {
  items: CartItem[]
  coupon_code?: string | null
  address_id: string
  shipping_cost: number
  shipping_courier?: string | null
  shipping_service?: string | null
  payment_fee?: number
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

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse body
  let body: CheckoutBody
  try {
    body = (await req.json()) as CheckoutBody
  } catch {
    return jsonError('Request body tidak valid', 400)
  }

  const { items, coupon_code, address_id, shipping_cost = 0, shipping_courier, shipping_service, payment_fee = 0 } = body

  if (!validateItems(items)) return jsonError('Field items tidak valid', 400)
  if (!address_id) return jsonError('address_id diperlukan', 400)

  // 2. Authenticate
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return jsonError('Silakan login terlebih dahulu', 401)

  // 3. Fetch profile for customer details
  const profiles = supabase.from('profiles') as any
  const addresses = supabase.from('addresses') as any
  const { data: rawProfile } = await profiles
    .select('full_name, phone_number, email')
    .eq('id', user.id)
    .single()

  const profile = rawProfile as { full_name: string | null; phone_number: string | null; email: string } | null
  const customerName = profile?.full_name ?? user.email ?? 'Pelanggan'
  const customerPhone = profile?.phone_number ?? ''
  const customerEmail = user.email ?? ''

  // 4. Fetch address
  const { data: rawAddress } = await addresses
    .select('*')
    .eq('id', address_id)
    .eq('profile_id', user.id)
    .single()

  if (!rawAddress) return jsonError('Alamat tidak ditemukan', 404)
  const address = {
    recipient_name: rawAddress.recipient_name,
    phone: rawAddress.phone_number,
    address_line1: rawAddress.address_line1,
    city: rawAddress.kota_kabupaten,
    postal_code: rawAddress.postal_code,
  }

  // 5. Validate coupon (optional)
  let discountAmount = 0
  let couponId: string | null = null

  if (coupon_code) {
    const { data: rawCoupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toUpperCase())
      .eq('is_active', true)
      .single()

    const coupon = rawCoupon as CouponRow | null
    if (coupon) {
      const subtotalForCoupon = items.reduce((sum, i) => sum + i.price * i.qty, 0)
      const meetsMin = !coupon.min_purchase || subtotalForCoupon >= coupon.min_purchase

      if (meetsMin) {
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
  const totalAmount = Math.max(0, subtotal + shipping_cost + payment_fee - discountAmount)

  // 7. Admin client for writes
  const admin = await createAdminClient()

  const productKeys = [...new Set(items.map((item) => item.product_id))]
  const { data: productsBySlug } = await admin.from('products').select('id, slug').in('slug', productKeys)
  const uuidKeys = productKeys.filter((key) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))
  const { data: productsById } = uuidKeys.length
    ? await admin.from('products').select('id, slug').in('id', uuidKeys)
    : { data: [] }
  const productMap = new Map<string, string>()
  for (const product of [...(productsBySlug ?? []), ...(productsById ?? [])] as Array<{ id: string; slug: string }>) {
    productMap.set(product.slug, product.id)
    productMap.set(product.id, product.id)
  }
  const unresolvedProduct = productKeys.find((key) => !productMap.has(key))
  if (unresolvedProduct) return jsonError(`Produk tidak ditemukan: ${unresolvedProduct}`, 400)

  // 8. Insert order — cast payload to bypass strict Insert generic
  const orderNumber = generateOrderNumber()

  const { data: rawOrder, error: orderError } = await admin
    .from('orders')
    .insert({
      order_number: orderNumber,
      profile_id: user.id,
      status: 'pending',
      subtotal,
      shipping_cost,
      discount_amount: discountAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      coupon_id: couponId,
      shipping_address: address,
      shipping_courier: shipping_courier ?? null,
      shipping_service: shipping_service ?? null,
      notes: null,
    } as never)
    .select()
    .single()

  if (orderError || !rawOrder) {
    return jsonError('Gagal membuat pesanan', 500, orderError?.message)
  }
  const order = rawOrder as OrderRow

  // 9. Insert order_items
  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    product_id: productMap.get(item.product_id),
    variant_id: item.variant_id ?? null,
    product_name: item.name,
    variant_name: null as string | null,
    quantity: item.qty,
    unit_price: item.price,
    total_price: item.price * item.qty,
  }))

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(orderItemsPayload as never)

  if (itemsError) {
    await admin.from('orders').delete().eq('id', order.id as never)
    return jsonError('Gagal menyimpan item pesanan', 500, itemsError.message)
  }

  // 10. Build Midtrans payload
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
    ...(payment_fee > 0
      ? [{ id: 'PAYMENT_FEE', price: payment_fee, quantity: 1, name: 'Biaya layanan pembayaran' }]
      : []),
    ...(discountAmount > 0
      ? [{ id: 'DISCOUNT', price: -discountAmount, quantity: 1, name: 'Diskon' }]
      : []),
  ]

  // 11. Call Midtrans Snap
  let snapToken: string
  let snapRedirectUrl: string

  try {
    const snap = await createSnapTransaction(
      orderNumber,
      totalAmount,
      customerDetails,
      midtransItems,
    )
    snapToken = snap.token
    snapRedirectUrl = snap.redirect_url
  } catch (e) {
    await admin.from('order_items').delete().eq('order_id', order.id as never)
    await admin.from('orders').delete().eq('id', order.id as never)
    return jsonError(
      'Gagal menghubungi payment gateway',
      502,
      e instanceof Error ? e.message : String(e),
    )
  }

  // 12. Save payment record
  const { error: paymentError } = await admin
    .from('payments')
    .insert({
      order_id: order.id,
      midtrans_order_id: orderNumber,
      midtrans_transaction_id: null,
      payment_type: null,
      status: 'pending',
      gross_amount: totalAmount,
      snap_token: snapToken,
      snap_redirect_url: snapRedirectUrl,
      fraud_status: null,
      settlement_time: null,
      expiry_time: null,
      raw_response: null,
    } as never)

  if (paymentError) {
    console.error('[checkout] Failed to save payment row:', paymentError.message)
  }

  // 13. Record coupon usage (best-effort)
  if (couponId) {
    await admin
      .from('coupon_usages')
      .insert({
        coupon_id: couponId,
        profile_id: user.id,
        order_id: order.id,
      } as never)
  }

  return jsonOk({
    order_number: orderNumber,
    snap_token: snapToken,
    redirect_url: snapRedirectUrl,
    is_production: isMidtransProduction,
  })
}
