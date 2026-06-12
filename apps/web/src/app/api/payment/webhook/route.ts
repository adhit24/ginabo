// POST /api/payment/webhook — Midtrans notification handler
// Midtrans calls this endpoint after every transaction status change.
// IMPORTANT: Always returns HTTP 200. Midtrans will retry on non-200 responses.

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyMidtransNotification,
  isMidtransPaymentSuccessful,
} from '@/lib/midtrans'
import { createAdminClient } from '@/lib/supabase/server'
import type { MidtransNotification } from '@/types/midtrans'
import type { OrderStatus, PaymentStatus, OrderItemRow, ProductVariantRow, ProductRow } from '@/types/database'

// ─── Status mapping ───────────────────────────────────────────────────────────

function resolveOrderStatus(
  transactionStatus: string,
  fraudStatus?: string,
): OrderStatus | null {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'accept' || !fraudStatus ? 'paid' : null
  }
  if (transactionStatus === 'settlement') return 'paid'
  if (transactionStatus === 'pending') return 'pending'
  if (['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus)) return 'cancelled'
  return null
}

function resolvePaymentStatus(transactionStatus: string, fraudStatus?: string): PaymentStatus {
  if (transactionStatus === 'settlement') return 'paid'
  if (transactionStatus === 'capture') {
    return fraudStatus === 'challenge' ? 'challenge' : 'paid'
  }
  if (transactionStatus === 'pending') return 'pending'
  if (['deny', 'failure'].includes(transactionStatus)) return 'failed'
  if (['cancel', 'expire'].includes(transactionStatus)) return 'expired'
  return 'pending'
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse body — must return 200 even on errors to avoid Midtrans retries
  let raw: MidtransNotification
  try {
    raw = (await req.json()) as MidtransNotification
  } catch {
    console.error('[webhook] Failed to parse Midtrans notification body')
    return ok()
  }

  // 2. Verify HMAC-SHA512 signature
  let notification: ReturnType<typeof verifyMidtransNotification>
  try {
    notification = verifyMidtransNotification(raw)
  } catch (e) {
    console.error('[webhook] Signature verification failed:', e instanceof Error ? e.message : e)
    return ok()
  }

  const admin = await createAdminClient()
  const orderNumber = notification.order_id // Midtrans order_id = our order_number

  // 3. Fetch order
  const { data: rawOrder, error: orderFetchError } = await admin
    .from('orders')
    .select('id, status, user_id')
    .eq('order_number', orderNumber as never)
    .single()

  if (orderFetchError || !rawOrder) {
    console.error('[webhook] Order not found for order_number:', orderNumber)
    return ok()
  }

  const order = rawOrder as Pick<OrderRow, 'id' | 'status' | 'user_id'>

  // 4. Update payment row
  const paymentStatus = resolvePaymentStatus(
    notification.transaction_status,
    notification.fraud_status,
  )

  await admin
    .from('payments')
    .update({
      midtrans_transaction_id: notification.transaction_id,
      payment_type: notification.payment_type,
      status: paymentStatus,
      gross_amount: parseFloat(notification.gross_amount),
      fraud_status: notification.fraud_status ?? null,
      settlement_time: notification.settlement_time ?? null,
      raw_response: notification as unknown as Record<string, unknown>,
    } as never)
    .eq('midtrans_order_id', orderNumber as never)

  // 5. Resolve new order status
  const newOrderStatus = resolveOrderStatus(
    notification.transaction_status,
    notification.fraud_status,
  )

  if (!newOrderStatus || newOrderStatus === order.status) return ok()

  // 6. Update order status
  const { error: orderUpdateError } = await admin
    .from('orders')
    .update({ status: newOrderStatus } as never)
    .eq('id', order.id as never)

  if (orderUpdateError) {
    console.error('[webhook] Failed to update order status:', orderUpdateError.message)
    return ok()
  }

  // 7. Post-payment actions when order becomes paid
  if (isMidtransPaymentSuccessful(notification)) {
    await handlePaymentSucceeded(order.id, order.user_id, orderNumber, admin)
  }

  return ok()
}

// ─── Post-payment side-effects ────────────────────────────────────────────────

async function handlePaymentSucceeded(
  orderId: string,
  userId: string,
  orderNumber: string,
  admin: Awaited<ReturnType<typeof createAdminClient>>,
) {
  await Promise.allSettled([
    decrementStock(orderId, admin),
    createOrderNotification(userId, orderNumber, admin),
  ])
}

async function decrementStock(
  orderId: string,
  admin: Awaited<ReturnType<typeof createAdminClient>>,
) {
  const { data: rawItems } = await admin
    .from('order_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', orderId as never)

  if (!rawItems) return
  const items = rawItems as Pick<OrderItemRow, 'product_id' | 'variant_id' | 'quantity'>[]

  for (const item of items) {
    if (item.variant_id) {
      const { data: rawVariant } = await admin
        .from('product_variants')
        .select('stock')
        .eq('id', item.variant_id as never)
        .single()

      if (rawVariant) {
        const variant = rawVariant as Pick<ProductVariantRow, 'stock'>
        await admin
          .from('product_variants')
          .update({ stock: Math.max(0, variant.stock - item.quantity) } as never)
          .eq('id', item.variant_id as never)
      }
    } else {
      const { data: rawProduct } = await admin
        .from('products')
        .select('stock')
        .eq('id', item.product_id as never)
        .single()

      if (rawProduct) {
        const product = rawProduct as Pick<ProductRow, 'stock'>
        await admin
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) } as never)
          .eq('id', item.product_id as never)
      }
    }
  }
}

async function createOrderNotification(
  userId: string,
  orderNumber: string,
  admin: Awaited<ReturnType<typeof createAdminClient>>,
) {
  await admin.from('notifications').insert({
    user_id: userId,
    channel: 'in_app',
    status: 'pending',
    title: 'Pembayaran Berhasil',
    body: `Pesanan ${orderNumber} telah dikonfirmasi. Kami sedang memproses pesanan kamu.`,
    metadata: { order_number: orderNumber } as Record<string, unknown>,
    sent_at: null,
    read_at: null,
  } as never)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function ok() {
  return NextResponse.json({ ok: true }, { status: 200 })
}
