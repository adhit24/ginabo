// POST /api/payment/webhook — DOKU notification handler
// DOKU calls this endpoint after transaction status change.
// IMPORTANT: Always returns HTTP 200 to acknowledge webhook.

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyDokuWebhookSignature,
  isDokuPaymentSuccessful,
  type DokuNotificationPayload,
} from '@/lib/doku'
import { createAdminClient } from '@/lib/supabase/server'
import type { OrderRow } from '@/types/database'
import { amountsMatch, parsePaymentAmount, resolvePaymentTransition, shouldFulfill, shouldUpdateOrderStatus } from '@/lib/payments/paymentState'

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawText = await req.text()
  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawText) as Record<string, unknown>
  } catch {
    console.error('[webhook] Failed to parse notification body')
    return ok()
  }

  const clientIdHeader = req.headers.get('client-id')
  const signatureHeader = req.headers.get('signature')

  const dokuPayload = body as unknown as DokuNotificationPayload
  const orderNumber = dokuPayload.order?.invoice_number ?? (body.order_id as string) ?? ''
  const grossAmountInput = dokuPayload.order?.amount ?? (body.gross_amount as number) ?? 0
  const transactionStatus = dokuPayload.transaction?.status ?? (body.transaction_status as string) ?? 'PENDING'
  const transactionId = (body.transaction as any)?.id ?? (body.service as any)?.id ?? (body.transaction_id as string) ?? ''
  const paymentType = dokuPayload.channel?.id ?? dokuPayload.service?.id ?? (body.payment_type as string) ?? null

  // Signature verification for DOKU
  if (process.env.DOKU_SECRET_KEY && (clientIdHeader || signatureHeader)) {
    const isValid = verifyDokuWebhookSignature({
      clientIdHeader,
      requestIdHeader: req.headers.get('request-id'),
      requestTimestampHeader: req.headers.get('request-timestamp'),
      signatureHeader,
      requestTargetPath: '/api/payment/webhook',
      rawBody: rawText,
    })

    if (!isValid) {
      console.error('[webhook] DOKU Signature verification failed — invalid request signature')
      return ok()
    }
  }

  const isPaymentSuccess = isDokuPaymentSuccessful(transactionStatus)
  const admin = await createAdminClient()
  const adminAny = admin as any

  // Fetch order
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
    grossAmount = parsePaymentAmount(grossAmountInput)
  } catch (error) {
    console.error('[webhook] Invalid gross amount:', error)
    return ok()
  }

  if (!amountsMatch(order.total_amount, grossAmount)) {
    console.error('[webhook] Gross amount mismatch for order:', orderNumber)
    await adminAny.from('payments').update({ status: 'failed', raw_notification: body }).eq('invoice_number', orderNumber)
    return ok()
  }

  // Update payment row using generic provider-neutral columns
  const transition = resolvePaymentTransition(transactionStatus)

  await adminAny
    .from('payments')
    .update({
      provider: 'doku',
      provider_transaction_id: transactionId || null,
      payment_type: paymentType,
      status: transition.paymentStatus,
      gross_amount: grossAmount,
      raw_notification: body,
    })
    .eq('invoice_number', orderNumber)

  // Resolve new order status
  const newOrderStatus = transition.orderStatus

  if (!newOrderStatus || !shouldUpdateOrderStatus(order.status, newOrderStatus)) return ok()

  // Fulfillment must succeed before the order is marked paid
  if (isPaymentSuccess && shouldFulfill(order.status, newOrderStatus)) {
    try {
      await handlePaymentSucceeded(order.id, order.profile_id, orderNumber, admin)
    } catch (error) {
      console.error('[webhook] Fulfillment failed:', error instanceof Error ? error.message : error)
      return ok()
    }
  }

  // Update order status
  const { error: orderUpdateError } = await admin
    .from('orders')
    .update({ status: newOrderStatus } as never)
    .eq('id', order.id as never)

  if (orderUpdateError) {
    console.error('[webhook] Failed to update order status:', orderUpdateError.message)
    return ok()
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
