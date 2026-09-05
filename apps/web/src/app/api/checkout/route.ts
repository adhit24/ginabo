// POST /api/checkout — creates order + DOKU Checkout transaction
// Supabase + DOKU Checkout

import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { generateOrderNumber } from '@/lib/ids'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { createDokuCheckoutSession, isDokuProduction, type DokuLineItem } from '@/lib/doku'
import { calculateShippingCost, getCities, isRajaOngkirConfigured } from '@/lib/rajaongkir'
import { calculateServerCheckoutTotal, normalizeCheckoutRequestItems, priceCheckoutItems, type ServerProduct, type ServerVariant } from '@/lib/checkout/checkoutService'
import type {
  OrderRow,
  CouponRow,
} from '@/types/database'

// ─── Request schema ───────────────────────────────────────────────────────────

interface CartItem {
  product_id: string
  variant_id?: string | null
  qty: number
}

interface CheckoutBody {
  items: CartItem[]
  coupon_code?: string | null
  address_id: string
  shipping_courier?: string | null
  shipping_service?: string | null
  payment_method?: string | null
  checkout_idempotency_key?: string | null
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

  let requestedItems: CartItem[]
  try {
    requestedItems = normalizeCheckoutRequestItems(body.items) as CartItem[]
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Field items tidak valid', 400)
  }
  const { coupon_code, address_id, shipping_courier, shipping_service, payment_method, checkout_idempotency_key } = body

  if (!address_id) return jsonError('address_id diperlukan', 400)
  if (!shipping_courier || !shipping_service) return jsonError('Layanan pengiriman wajib dipilih', 400)

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
    id: rawAddress.id,
    recipient_name: rawAddress.recipient_name,
    phone: rawAddress.phone_number,
    address_line1: rawAddress.address_line1,
    address_line2: rawAddress.address_line2,
    kelurahan: rawAddress.kelurahan,
    kecamatan: rawAddress.kecamatan,
    city: rawAddress.kota_kabupaten,
    province: rawAddress.provinsi,
    postal_code: rawAddress.postal_code,
    country: 'Indonesia',
  }

  // 5. Fetch canonical products and variants; never trust browser prices/names.
  const admin = await createAdminClient()
  const adminAny = admin as any
  const productKeys = [...new Set(requestedItems.map((item) => item.product_id))]
  const variantKeys = [...new Set(requestedItems.flatMap((item) => item.variant_id ? [item.variant_id] : []))]
  const { data: productRows, error: productError } = await admin
    .from('products')
    .select('id, name, base_price, stock_quantity, weight_grams, is_active')
    .in('id', productKeys)
  if (productError) return jsonError('Gagal membaca katalog produk', 503, productError.message)
  const { data: variantRows, error: variantError } = variantKeys.length
    ? await admin.from('product_variants').select('id, product_id, name, price_modifier, stock_quantity, weight_grams, is_active').in('id', variantKeys)
    : { data: [], error: null }
  if (variantError) return jsonError('Gagal membaca varian produk', 503, variantError.message)
  let items
  try {
    items = priceCheckoutItems(requestedItems, (productRows ?? []) as ServerProduct[], (variantRows ?? []) as ServerVariant[])
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Produk tidak tersedia', 409)
  }

  // 6. Recalculate shipping from the snapshot address and canonical weight.
  const shippingWeightGrams = Math.max(1000, items.reduce((sum, item) => sum + (item.weightGrams ?? 100) * item.quantity, 0))
  if (!isRajaOngkirConfigured()) return jsonError('Shipping API belum dikonfigurasi', 503)
  const cities = await getCities(address.city)
  const normalizedCity = address.city.toLowerCase().replace(/^(kota|kabupaten)\s+/i, '').trim()
  const normalizedProvince = rawAddress.provinsi?.toLowerCase().trim()
  const city = cities.find((candidate) => candidate.city_name.toLowerCase().replace(/^(kota|kabupaten)\s+/i, '').trim() === normalizedCity && (!normalizedProvince || candidate.province?.toLowerCase().includes(normalizedProvince))) ?? cities[0]
  if (!city?.city_id) return jsonError('Kota alamat belum tersedia di shipping provider', 400)
  const shippingOptions = await calculateShippingCost(city.city_id, shippingWeightGrams, [shipping_courier as 'jne'])
  const shippingOption = shippingOptions.find((option) => option.service.toUpperCase() === shipping_service.toUpperCase())
  if (!shippingOption) return jsonError('Layanan pengiriman tidak valid atau sudah berubah', 409)
  const shippingCost = shippingOption.cost
  const paymentFees: Record<string, number> = { bca_va: 4000, mandiri_va: 4000, bni_va: 4000, bri_va: 4000, mega_va: 3500, bsi_va: 3000, maybank_va: 3000, ovo: 750, gopay: 1000 }
  const paymentFee = payment_method ? paymentFees[payment_method] ?? 0 : 0

  // 7. Validate coupon against the server subtotal.
  let discountAmount = 0
  let couponId: string | null = null
  if (coupon_code) {
    const { data: rawCoupon } = await supabase.from('coupons').select('*').eq('code', coupon_code.toUpperCase()).eq('is_active', true).single()
    const coupon = rawCoupon as CouponRow | null
    const subtotalForCoupon = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    if (coupon && (!coupon.min_purchase || subtotalForCoupon >= coupon.min_purchase)) {
      if (coupon.type === 'percentage') discountAmount = Math.round((subtotalForCoupon * coupon.value) / 100)
      if (coupon.type === 'fixed_amount') discountAmount = coupon.value
      if (coupon.type === 'free_shipping') discountAmount = shippingCost
      if (coupon.max_discount) discountAmount = Math.min(discountAmount, coupon.max_discount)
      couponId = coupon.id
    }
  }
  const totals = calculateServerCheckoutTotal({ items, shippingCost, paymentFee, discountAmount })
  const { subtotal, total: totalAmount } = totals

  // 8. Idempotent repeat submit returns the existing order/payment.
  if (checkout_idempotency_key) {
    const { data: existingOrder } = await adminAny.from('orders').select('id, order_number').eq('profile_id', user.id).eq('checkout_idempotency_key', checkout_idempotency_key).maybeSingle()
    if (existingOrder) {
      const { data: existingPayment } = await adminAny.from('payments').select('checkout_url, payment_url').eq('order_id', existingOrder.id).maybeSingle()
      if (existingPayment) {
        const redirectUrl = existingPayment.checkout_url || existingPayment.payment_url || ''
        return jsonOk({ order_number: existingOrder.order_number, redirect_url: redirectUrl, is_production: isDokuProduction })
      }
    }
  }

  // 9. Insert order

  const orderNumber = generateOrderNumber()

  const { data: rawOrder, error: orderError } = await admin
    .from('orders')
    .insert({
      order_number: orderNumber,
      profile_id: user.id,
      status: 'pending',
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      tax_amount: 0,
      total_amount: totalAmount,
      payment_fee: paymentFee,
      shipping_weight_grams: shippingWeightGrams,
      checkout_idempotency_key: checkout_idempotency_key ?? null,
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
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    product_name: item.productName,
    variant_name: item.variantName ?? null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }))

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(orderItemsPayload as never)

  if (itemsError) {
    await admin.from('orders').delete().eq('id', order.id as never)
    return jsonError('Gagal menyimpan item pesanan', 500, itemsError.message)
  }

  // 10. Build DOKU line items payload
  const dokuItems: DokuLineItem[] = [
    ...items.map((item) => ({
      name: `${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}`.slice(0, 100),
      price: item.unitPrice,
      quantity: item.quantity,
    })),
    ...(shippingCost > 0
      ? [{ name: 'Ongkos Kirim', price: shippingCost, quantity: 1 }]
      : []),
    ...(paymentFee > 0
      ? [{ name: 'Biaya Layanan Pembayaran', price: paymentFee, quantity: 1 }]
      : []),
    ...(discountAmount > 0
      ? [{ name: 'Diskon', price: -discountAmount, quantity: 1 }]
      : []),
  ]

  // 11. Create DOKU Checkout Session
  let checkoutUrl: string
  let invoiceNumber: string
  let dokuRawResponse: Record<string, unknown>

  try {
    const dokuSession = await createDokuCheckoutSession({
      orderNumber,
      totalAmount,
      customer: {
        id: user.id,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      items: dokuItems,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/finish?order=${orderNumber}`,
    })
    checkoutUrl = dokuSession.checkoutUrl
    invoiceNumber = dokuSession.invoiceNumber
    dokuRawResponse = dokuSession.rawResponse
  } catch (e) {
    await adminAny.from('payments').insert({
      order_id: order.id,
      invoice_number: orderNumber,
      provider: 'doku',
      gross_amount: totalAmount,
      currency: 'IDR',
      status: 'failed',
      raw_notification: null,
    })
    return jsonError(
      'Gagal menghubungi payment gateway (DOKU Checkout)',
      502,
      e instanceof Error ? e.message : String(e),
    )
  }

  // 12. Save payment record
  const { error: paymentError } = await admin
    .from('payments')
    .insert({
      order_id: order.id,
      provider: 'doku',
      invoice_number: invoiceNumber,
      checkout_url: checkoutUrl,
      payment_url: checkoutUrl,
      gross_amount: totalAmount,
      currency: 'IDR',
      status: 'pending',
      raw_response: dokuRawResponse,
      raw_notification: null,
    } as never)

  if (paymentError) return jsonError('Payment initiation tidak tercatat; pesanan ditahan untuk audit', 500, paymentError.message)

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
    redirect_url: checkoutUrl,
    is_production: isDokuProduction,
  })
}
