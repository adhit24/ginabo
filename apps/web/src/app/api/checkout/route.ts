// POST /api/checkout — creates order + DOKU Checkout transaction
// Supabase + DOKU Checkout

import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { generateOrderNumber } from '@/lib/ids'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { createDokuCheckoutSession, isDokuProduction, type DokuLineItem } from '@/lib/doku'
import { calculateShippingCost, COURIERS, getCities, isRajaOngkirConfigured, type CourierCode } from '@/lib/rajaongkir'
import { calculateServerCheckoutTotal, normalizeCheckoutRequestItems, priceCheckoutItems, type ServerProduct, type ServerVariant } from '@/lib/checkout/checkoutService'
import type { OrderRow } from '@/types/database'

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

type DbCoupon = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_idr' | 'free_shipping'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  usage_per_user: number
  used_count: number
  applies_to: 'all' | 'specific_products' | 'specific_categories'
  product_ids: string[] | null
  category_ids: string[] | null
  is_active: boolean
  starts_at: string
  expires_at: string | null
}

type ProductForCheckout = ServerProduct & { category_id: string | null }

type ExistingOrder = {
  id: string
  order_number: string
  status: string
  subtotal: number
  shipping_cost: number
  discount_amount: number
  total_amount: number
  payment_fee: number
  shipping_weight_grams: number | null
  coupon_id: string | null
  coupon_code: string | null
  shipping_address: Record<string, unknown>
  shipping_courier: string | null
  shipping_service: string | null
}

const PAYMENT_FEES: Record<string, number> = {
  bank_transfer: 0,
  bca_va: 4000,
  mandiri_va: 4000,
  bni_va: 4000,
  bri_va: 4000,
  mega_va: 3500,
  bsi_va: 3000,
  maybank_va: 3000,
  dana: 0,
  ovo: 750,
  gopay: 1000,
  shopeepay: 0,
  linkaja: 0,
}

function normalizePlace(value: string): string {
  return value.toLowerCase().replace(/^(kota|kabupaten)\s+/i, '').trim()
}

function itemSignature(items: Array<{ productId: string; variantId?: string | null; quantity: number; unitPrice: number }>): string {
  return items
    .map((item) => `${item.productId}:${item.variantId ?? 'base'}:${item.quantity}:${item.unitPrice}`)
    .sort()
    .join('|')
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Authenticate before parsing or validating attacker-controlled body data.
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return jsonError('Silakan login terlebih dahulu', 401)

  // 2. Parse and validate request shape. Checkout idempotency is mandatory —
  // the UI already generates one stable key per checkout page/session.
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

  const {
    coupon_code,
    address_id,
    shipping_courier,
    shipping_service,
    payment_method,
    checkout_idempotency_key,
  } = body

  if (!address_id || typeof address_id !== 'string') return jsonError('address_id diperlukan', 400)
  if (!shipping_courier || !shipping_service) return jsonError('Layanan pengiriman wajib dipilih', 400)
  if (!checkout_idempotency_key || typeof checkout_idempotency_key !== 'string') {
    return jsonError('checkout_idempotency_key diperlukan', 400)
  }
  const idempotencyKey = checkout_idempotency_key.trim()
  if (idempotencyKey.length < 8 || idempotencyKey.length > 128) {
    return jsonError('checkout_idempotency_key tidak valid', 400)
  }
  if (!payment_method || !(payment_method in PAYMENT_FEES)) {
    return jsonError('Metode pembayaran tidak valid', 400)
  }
  if (!COURIERS.some((courier) => courier.code === shipping_courier)) {
    return jsonError('Kurir pengiriman tidak valid', 400)
  }

  // 3. Fetch profile for payment-customer details.
  const profiles = supabase.from('profiles') as any
  const addresses = supabase.from('addresses') as any
  const { data: rawProfile, error: profileError } = await profiles
    .select('full_name, phone_number, email')
    .eq('id', user.id)
    .single()

  if (profileError) console.error('[checkout] profile lookup failed', profileError)

  const profile = rawProfile as { full_name: string | null; phone_number: string | null; email: string } | null
  const customerName = profile?.full_name ?? user.email ?? 'Pelanggan'
  const customerPhone = profile?.phone_number ?? ''
  const customerEmail = user.email ?? ''

  // 4. Address ownership is enforced by both id and profile_id. Do not reveal
  // whether another customer's address id exists.
  const { data: rawAddress, error: addressError } = await addresses
    .select('*')
    .eq('id', address_id)
    .eq('profile_id', user.id)
    .maybeSingle()

  if (addressError) console.error('[checkout] address lookup failed', addressError)
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

  // 5. Canonical catalog lookup — browser-supplied prices/names never enter the
  // order. Variant ownership and stock are checked by priceCheckoutItems().
  const admin = await createAdminClient()
  const adminAny = admin as any
  const productKeys = [...new Set(requestedItems.map((item) => item.product_id))]
  const variantKeys = [...new Set(requestedItems.flatMap((item) => item.variant_id ? [item.variant_id] : []))]

  const { data: productRows, error: productError } = await admin
    .from('products')
    .select('id, name, base_price, stock_quantity, weight_grams, is_active, category_id')
    .in('id', productKeys)

  if (productError) {
    console.error('[checkout] canonical product lookup failed', productError)
    return jsonError('Gagal membaca katalog produk', 503)
  }

  const { data: variantRows, error: variantError } = variantKeys.length
    ? await admin
        .from('product_variants')
        .select('id, product_id, name, price_modifier, stock_quantity, weight_grams, is_active')
        .in('id', variantKeys)
    : { data: [], error: null }

  if (variantError) {
    console.error('[checkout] canonical variant lookup failed', variantError)
    return jsonError('Gagal membaca varian produk', 503)
  }

  let items
  try {
    items = priceCheckoutItems(
      requestedItems,
      (productRows ?? []) as ProductForCheckout[],
      (variantRows ?? []) as ServerVariant[],
    )
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Produk tidak tersedia', 409)
  }

  // 6. Shipping is recalculated from the owned address + canonical product
  // weight. Never silently fall back to the first fuzzy city search result.
  const shippingWeightGrams = Math.max(
    1000,
    items.reduce((sum, item) => sum + (item.weightGrams ?? 100) * item.quantity, 0),
  )

  if (!isRajaOngkirConfigured()) return jsonError('Shipping API belum dikonfigurasi', 503)

  let cities
  try {
    cities = await getCities(address.city)
  } catch (error) {
    console.error('[checkout] destination lookup failed', error)
    return jsonError('Gagal memvalidasi kota tujuan pengiriman', 503)
  }

  const normalizedCity = normalizePlace(address.city)
  const normalizedProvince = rawAddress.provinsi?.toLowerCase().trim()
  const city = cities.find((candidate) =>
    normalizePlace(candidate.city_name) === normalizedCity
    && (!normalizedProvince || candidate.province?.toLowerCase().trim() === normalizedProvince),
  )

  if (!city?.city_id) return jsonError('Kota alamat belum tersedia di shipping provider', 400)

  let shippingOptions
  try {
    shippingOptions = await calculateShippingCost(
      city.city_id,
      shippingWeightGrams,
      [shipping_courier as CourierCode],
    )
  } catch (error) {
    console.error('[checkout] shipping cost lookup failed', error)
    return jsonError('Gagal menghitung ongkos kirim', 503)
  }

  const shippingOption = shippingOptions.find(
    (option) => option.courier_code === shipping_courier
      && option.service.toUpperCase() === shipping_service.toUpperCase(),
  )
  if (!shippingOption) return jsonError('Layanan pengiriman tidak valid atau sudah berubah', 409)

  const shippingCost = shippingOption.cost
  const paymentFee = PAYMENT_FEES[payment_method]

  // 7. Coupon validation uses the real DB schema names. The previous route cast
  // rows to a stale CouponRow shape (type/value/min_purchase/max_discount), so
  // real coupons would silently calculate no discount.
  let discountAmount = 0
  let couponId: string | null = null
  let normalizedCouponCode: string | null = null

  const subtotalForCoupon = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  if (coupon_code?.trim()) {
    normalizedCouponCode = coupon_code.trim().toUpperCase()
    const { data: rawCoupon, error: couponError } = await adminAny
      .from('coupons')
      .select('id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, usage_per_user, used_count, applies_to, product_ids, category_ids, is_active, starts_at, expires_at')
      .eq('code', normalizedCouponCode)
      .maybeSingle()

    if (couponError) {
      console.error('[checkout] coupon lookup failed', couponError)
      return jsonError('Gagal memvalidasi kupon', 503)
    }

    const coupon = rawCoupon as DbCoupon | null
    if (!coupon || !coupon.is_active) return jsonError('Kupon tidak valid atau tidak aktif', 400)

    const now = Date.now()
    const startsAt = new Date(coupon.starts_at).getTime()
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at).getTime() : null
    if (!Number.isFinite(startsAt) || startsAt > now || (expiresAt !== null && expiresAt <= now)) {
      return jsonError('Kupon belum berlaku atau sudah kedaluwarsa', 400)
    }
    if (subtotalForCoupon < coupon.min_order_amount) {
      return jsonError('Minimum transaksi kupon belum terpenuhi', 400)
    }

    // Pre-check limits for a useful response. claim_checkout_coupon() below is
    // still authoritative and row-locks the coupon to close concurrency races.
    const [{ count: globalUsage, error: globalUsageError }, { count: userUsage, error: userUsageError }] = await Promise.all([
      adminAny.from('coupon_usages').select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id),
      adminAny.from('coupon_usages').select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id).eq('profile_id', user.id),
    ])
    if (globalUsageError || userUsageError) {
      console.error('[checkout] coupon usage lookup failed', globalUsageError ?? userUsageError)
      return jsonError('Gagal memvalidasi batas penggunaan kupon', 503)
    }
    if (coupon.usage_limit !== null && (globalUsage ?? 0) >= coupon.usage_limit) {
      return jsonError('Kuota kupon sudah habis', 409)
    }
    if ((userUsage ?? 0) >= coupon.usage_per_user) {
      return jsonError('Batas penggunaan kupon untuk akun ini sudah tercapai', 409)
    }

    const productsById = new Map(
      ((productRows ?? []) as ProductForCheckout[]).map((product) => [product.id, product]),
    )
    let eligibleSubtotal = subtotalForCoupon

    if (coupon.applies_to === 'specific_products') {
      const eligibleIds = new Set(coupon.product_ids ?? [])
      eligibleSubtotal = items.reduce(
        (sum, item) => eligibleIds.has(item.productId) ? sum + item.unitPrice * item.quantity : sum,
        0,
      )
    } else if (coupon.applies_to === 'specific_categories') {
      const eligibleCategoryIds = new Set(coupon.category_ids ?? [])
      eligibleSubtotal = items.reduce((sum, item) => {
        const categoryId = productsById.get(item.productId)?.category_id
        return categoryId && eligibleCategoryIds.has(categoryId)
          ? sum + item.unitPrice * item.quantity
          : sum
      }, 0)
    }

    if (eligibleSubtotal <= 0) return jsonError('Kupon tidak berlaku untuk produk yang dipilih', 400)

    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((eligibleSubtotal * coupon.discount_value) / 100)
    } else if (coupon.discount_type === 'fixed_idr') {
      discountAmount = Math.min(coupon.discount_value, eligibleSubtotal)
    } else if (coupon.discount_type === 'free_shipping') {
      discountAmount = shippingCost
    }

    if (coupon.max_discount_amount !== null) {
      discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
    }

    if (!Number.isSafeInteger(discountAmount) || discountAmount < 0) {
      console.error('[checkout] coupon produced invalid discount', { couponId: coupon.id, discountAmount })
      return jsonError('Konfigurasi kupon tidak valid', 500)
    }

    couponId = coupon.id
  }

  let totals
  try {
    totals = calculateServerCheckoutTotal({ items, shippingCost, paymentFee, discountAmount })
  } catch (error) {
    console.error('[checkout] total calculation failed', error)
    return jsonError('Total pesanan tidak valid', 409)
  }
  const { subtotal, total: totalAmount } = totals

  // A stable signature lets us reject accidental/malicious reuse of the same
  // idempotency key for a different cart while still safely resuming retries.
  const expectedItemSignature = itemSignature(items)

  async function loadReusableOrder(): Promise<
    | { kind: 'none' }
    | { kind: 'error'; message: string; status: number }
    | { kind: 'ready'; order: ExistingOrder; redirectUrl: string | null }
  > {
    const { data: rawExisting, error: existingError } = await adminAny
      .from('orders')
      .select('id, order_number, status, subtotal, shipping_cost, discount_amount, total_amount, payment_fee, shipping_weight_grams, coupon_id, coupon_code, shipping_address, shipping_courier, shipping_service')
      .eq('profile_id', user!.id)
      .eq('checkout_idempotency_key', idempotencyKey)
      .maybeSingle()

    if (existingError) {
      console.error('[checkout] idempotency lookup failed', existingError)
      return { kind: 'error', message: 'Gagal memeriksa status checkout', status: 503 }
    }
    if (!rawExisting) return { kind: 'none' }

    const existing = rawExisting as ExistingOrder
    const snapshotAddressId = typeof existing.shipping_address?.id === 'string'
      ? existing.shipping_address.id
      : null

    const sameOrder =
      Number(existing.subtotal) === subtotal
      && Number(existing.shipping_cost) === shippingCost
      && Number(existing.discount_amount) === discountAmount
      && Number(existing.total_amount) === totalAmount
      && Number(existing.payment_fee) === paymentFee
      && Number(existing.shipping_weight_grams) === shippingWeightGrams
      && (existing.coupon_id ?? null) === couponId
      && (existing.coupon_code ?? null) === normalizedCouponCode
      && existing.shipping_courier === shipping_courier
      && existing.shipping_service === shipping_service
      && snapshotAddressId === address_id

    if (!sameOrder) {
      return { kind: 'error', message: 'Kunci checkout sudah digunakan untuk pesanan yang berbeda', status: 409 }
    }

    const { data: existingItems, error: existingItemsError } = await adminAny
      .from('order_items')
      .select('product_id, variant_id, quantity, unit_price')
      .eq('order_id', existing.id)

    if (existingItemsError) {
      console.error('[checkout] existing order item lookup failed', existingItemsError)
      return { kind: 'error', message: 'Gagal memeriksa item checkout sebelumnya', status: 503 }
    }

    const storedSignature = itemSignature((existingItems ?? []).map((item: any) => ({
      productId: item.product_id,
      variantId: item.variant_id,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
    })))

    if (storedSignature !== expectedItemSignature) {
      return { kind: 'error', message: 'Kunci checkout sudah digunakan untuk item yang berbeda', status: 409 }
    }

    const { data: existingPayment, error: paymentLookupError } = await adminAny
      .from('payments')
      .select('checkout_url, payment_url, status')
      .eq('order_id', existing.id)
      .eq('provider', 'doku')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (paymentLookupError) {
      console.error('[checkout] existing payment lookup failed', paymentLookupError)
      return { kind: 'error', message: 'Gagal memeriksa pembayaran sebelumnya', status: 503 }
    }

    const redirectUrl = existingPayment?.checkout_url || existingPayment?.payment_url || null
    return { kind: 'ready', order: existing, redirectUrl }
  }

  // 8. Repeated submit: return the existing checkout URL when available. If a
  // previous attempt stopped between DB commit and payment persistence, reuse
  // the same order and replay DOKU with the same Request-Id below.
  const existingResult = await loadReusableOrder()
  if (existingResult.kind === 'error') return jsonError(existingResult.message, existingResult.status)
  if (existingResult.kind === 'ready' && existingResult.redirectUrl) {
    return jsonOk({
      order_number: existingResult.order.order_number,
      redirect_url: existingResult.redirectUrl,
      is_production: isDokuProduction,
    })
  }

  let order: ExistingOrder
  let orderIsNew = false

  if (existingResult.kind === 'ready') {
    if (existingResult.order.status !== 'pending') {
      return jsonOk({
        order_number: existingResult.order.order_number,
        redirect_url: '',
        is_production: isDokuProduction,
      })
    }
    order = existingResult.order
  } else {
    // 9. Atomic order + order_items persistence. Unique order-number collisions
    // are retried; an idempotency collision is loaded and safely reused.
    let createdOrder: ExistingOrder | null = null

    for (let attempt = 0; attempt < 3 && !createdOrder; attempt += 1) {
      const orderNumber = generateOrderNumber()
      const orderPayload = {
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
        checkout_idempotency_key: idempotencyKey,
        coupon_id: couponId,
        coupon_code: normalizedCouponCode,
        shipping_address: address,
        shipping_courier,
        shipping_service,
        notes: null,
      }
      const orderItemsPayload = items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        product_name: item.productName,
        variant_name: item.variantName ?? null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }))

      const { data: orderId, error: createOrderError } = await adminAny.rpc(
        'create_checkout_order_atomic',
        { p_order: orderPayload, p_items: orderItemsPayload },
      )

      if (!createOrderError && orderId) {
        createdOrder = {
          id: orderId as string,
          order_number: orderNumber,
          status: 'pending',
          subtotal,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          payment_fee: paymentFee,
          shipping_weight_grams: shippingWeightGrams,
          coupon_id: couponId,
          coupon_code: normalizedCouponCode,
          shipping_address: address,
          shipping_courier,
          shipping_service,
        }
        orderIsNew = true
        break
      }

      if (createOrderError?.code === '23505') {
        const concurrentResult = await loadReusableOrder()
        if (concurrentResult.kind === 'error') {
          return jsonError(concurrentResult.message, concurrentResult.status)
        }
        if (concurrentResult.kind === 'ready') {
          if (concurrentResult.redirectUrl) {
            return jsonOk({
              order_number: concurrentResult.order.order_number,
              redirect_url: concurrentResult.redirectUrl,
              is_production: isDokuProduction,
            })
          }
          createdOrder = concurrentResult.order
          break
        }
        // No idempotent order exists, so this was most likely the independently
        // unique order_number constraint. Loop with a fresh order number.
        continue
      }

      console.error('[checkout] atomic order creation failed', createOrderError)
      return jsonError('Gagal membuat pesanan', 500)
    }

    if (!createdOrder) return jsonError('Gagal membuat nomor pesanan yang unik', 503)
    order = createdOrder
  }

  // 10. Atomically claim coupon quota before creating the external payment.
  // For retries of the same order the RPC is idempotent and returns true.
  if (couponId) {
    const { data: claimed, error: claimError } = await adminAny.rpc('claim_checkout_coupon', {
      p_coupon_id: couponId,
      p_profile_id: user.id,
      p_order_id: order.id,
    })

    if (claimError) {
      console.error('[checkout] coupon claim failed', claimError)
      if (orderIsNew) await adminAny.from('orders').delete().eq('id', order.id)
      return jsonError('Gagal mengunci penggunaan kupon', 503)
    }
    if (!claimed) {
      if (orderIsNew) await adminAny.from('orders').delete().eq('id', order.id)
      return jsonError('Kuota kupon sudah tidak tersedia', 409)
    }
  }

  // 11. Build provider line items from the exact canonical totals persisted in
  // the order. Payment fee/discount are explicit reconciliation lines.
  const dokuItems: DokuLineItem[] = [
    ...items.map((item) => ({
      name: `${item.productName}${item.variantName ? ` - ${item.variantName}` : ''}`.slice(0, 100),
      price: item.unitPrice,
      quantity: item.quantity,
    })),
    ...(shippingCost > 0 ? [{ name: 'Ongkos Kirim', price: shippingCost, quantity: 1 }] : []),
    ...(paymentFee > 0 ? [{ name: 'Biaya Layanan Pembayaran', price: paymentFee, quantity: 1 }] : []),
    ...(discountAmount > 0 ? [{ name: 'Diskon', price: -discountAmount, quantity: 1 }] : []),
  ]

  // 12. DOKU request id is derived from user + checkout idempotency key. An
  // ambiguous retry therefore replays the exact same provider request instead
  // of creating another payment session.
  let checkoutUrl: string
  let invoiceNumber: string
  let dokuRawResponse: Record<string, unknown>

  try {
    const dokuSession = await createDokuCheckoutSession({
      orderNumber: order.order_number,
      totalAmount,
      customer: {
        id: user.id,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      items: dokuItems,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/finish?order=${order.order_number}`,
      idempotencyKey: `${user.id}:${idempotencyKey}`,
    })
    checkoutUrl = dokuSession.checkoutUrl
    invoiceNumber = dokuSession.invoiceNumber
    dokuRawResponse = dokuSession.rawResponse
  } catch (error) {
    console.error('[checkout] DOKU initiation failed', error)

    const { error: failedPaymentError } = await adminAny
      .from('payments')
      .upsert({
        order_id: order.id,
        invoice_number: order.order_number,
        provider: 'doku',
        gross_amount: totalAmount,
        currency: 'IDR',
        status: 'failed',
        checkout_url: null,
        raw_response: null,
        raw_notification: null,
      }, { onConflict: 'provider,order_id' })

    if (failedPaymentError) {
      console.error('[checkout] failed-payment audit persistence failed', failedPaymentError)
    }
    return jsonError('Gagal menghubungi payment gateway (DOKU Checkout)', 502)
  }

  // 13. One provider/order payment row, updated idempotently across retries.
  const { error: paymentError } = await adminAny
    .from('payments')
    .upsert({
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
    }, { onConflict: 'provider,order_id' })

  if (paymentError) {
    console.error('[checkout] payment persistence failed', paymentError)
    return jsonError('Payment initiation tidak tercatat; pesanan ditahan untuk audit', 500)
  }

  return jsonOk({
    order_number: order.order_number,
    redirect_url: checkoutUrl,
    is_production: isDokuProduction,
  })
}
