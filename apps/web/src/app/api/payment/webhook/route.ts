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
import type { OrderStatus, PaymentStatus, OrderRow, OrderItemRow, ProductVariantRow, ProductRow } from '@/types/database'
import { amountsMatch, parseMidtransAmount, resolvePaymentTransition, shouldFulfill, shouldUpdateOrderStatus } from '@/lib/payments/paymentState'

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
  const adminAny = admin as any
  const orderNumber = notification.order_id // Midtrans order_id = our order_number

  // 3. Fetch order
  const { data: rawOrder, error: orderFetchError } = await admin
    .from('orders')
    .select('id, status, profile_id, total_amount')
    .eq('order_number', orderNumber as never)
    .single()

  if (orderFetchError || !rawOrder) {
    console.error('[webhook] Order not found for order_number:', orderNumber)
    return ok()
  }

  const order = rawOrder as Pick<OrderRow, 'id' | 'status' | 'profile_id' | 'total_amount'>

  let grossAmount: number
  try {
    grossAmount = parseMidtransAmount(notification.gross_amount)
  } catch (error) {
    console.error('[webhook] Invalid gross amount:', error)
    return ok()
  }
  if (!amountsMatch(order.total_amount, grossAmount)) {
    console.error('[webhook] Gross amount mismatch for order:', orderNumber)
    await adminAny.from('payments').update({ status: 'failed', raw_notification: notification as unknown as Record<string, unknown> }).eq('midtrans_order_id', orderNumber)
    return ok()
  }

  // 4. Update payment row
  const transition = resolvePaymentTransition(
    notification.transaction_status,
    notification.fraud_status,
  )

  await admin
    .from('payments')
    .update({
      midtrans_transaction_id: notification.transaction_id,
      provider_transaction_id: notification.transaction_id,
      payment_type: notification.payment_type,
      status: transition.paymentStatus,
      midtrans_gross_amount: grossAmount,
      midtrans_fraud_status: notification.fraud_status ?? null,
      settlement_time: notification.settlement_time ?? null,
      raw_notification: notification as unknown as Record<string, unknown>,
    } as never)
    .eq('midtrans_order_id', orderNumber as never)

  // 5. Resolve new order status
  const newOrderStatus = transition.orderStatus

  if (!newOrderStatus || !shouldUpdateOrderStatus(order.status, newOrderStatus)) return ok()

  // Fulfillment must succeed before the order is marked paid; retries can then
  // safely re-enter the atomic RPC if stock/provider infrastructure is down.
  if (isMidtransPaymentSuccessful(notification) && shouldFulfill(order.status, newOrderStatus)) {
    try {
      await handlePaymentSucceeded(order.id, order.profile_id, orderNumber, admin)
    } catch (error) {
      console.error('[webhook] Fulfillment failed:', error instanceof Error ? error.message : error)
      return ok()
    }
  }

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
  const { error } = await (admin as any).rpc('fulfill_paid_order', { p_order_id: orderId })
  if (error) throw new Error(`fulfillment gagal: ${error.message}`)
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
