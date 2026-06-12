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
import type { OrderStatus, PaymentStatus } from '@/types/database'

// ─── Status mapping ───────────────────────────────────────────────────────────

function resolveOrderStatus(
  transactionStatus: string,
  fraudStatus?: string,
): OrderStatus | null {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'accept' || !fraudStatus ? 'paid' : null
  }
  if (transactionStatus === 'settlement') return 'paid'
  if (transactionStatus === 'pending') return 'pending_payment'
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
  const { data: order, error: orderFetchError } = await admin
    .from('orders')
    .select('id, status, user_id')
    .eq('order_number', orderNumber)
    .single()

  if (orderFetchError || !order) {
    console.error('[webhook] Order not found for order_number:', orderNumber)
    return ok()
  }

  // 4. Update payment row
  const paymentUpdate = {
    midtrans_transaction_id: notification.transaction_id,
    payment_type: notification.payment_type,
    status: resolvePaymentStatus(notification.transaction_status, notification.fraud_status),
    gross_amount: parseFloat(notification.gross_amount),
    fraud_status: notification.fraud_status ?? null,
    settlement_time: notification.settlement_time ?? null,
    raw_response: notification as unknown as Record<string, unknown>,
  }

  await admin
    .from('payments')
    .update(paymentUpdate)
    .eq('midtrans_order_id', orderNumber)

  // 5. Resolve new order status
  const newOrderStatus = resolveOrderStatus(
    notification.transaction_status,
    notification.fraud_status,
  )

  if (!newOrderStatus || newOrderStatus === order.status) {
    return ok()
  }

  // 6. Update order status
  const { error: orderUpdateError } = await admin
    .from('orders')
    .update({ status: newOrderStatus })
    .eq('id', order.id)

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
  await decrementStock(orderId, admin)
  await createOrderNotification(userId, orderNumber, admin)
}

async function decrementStock(
  orderId: string,
  admin: Awaited<ReturnType<typeof createAdminClient>>,
) {
  const { data: items } = await admin
    .from('order_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', orderId)

  if (!items) return

  for (const item of items) {
    if (item.variant_id) {
      // Decrement variant stock
      const { data: variant } = await admin
        .from('product_variants')
        .select('stock')
        .eq('id', item.variant_id)
        .single()

      if (variant) {
        await admin
          .from('product_variants')
          .update({ stock: Math.max(0, variant.stock - item.quantity) })
          .eq('id', item.variant_id)
      }
    } else {
      // Decrement product stock
      const { data: product } = await admin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()

      if (product) {
        await admin
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', item.product_id)
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
  })
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function ok() {
  return NextResponse.json({ ok: true }, { status: 200 })
}
