// POST /api/payment/webhook — DOKU notification handler
// Receives transaction status notifications from DOKU Checkout gateway.
// Performs strict signature verification, provider-neutral invoice lookup,
// and delegates atomic order settlement to PostgreSQL RPCs.

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyDokuWebhookSignature,
  isDokuPaymentSuccessful,
  type DokuNotificationPayload,
} from '@/lib/doku'
import { createAdminClient } from '@/lib/supabase/server'
import { parsePaymentAmount } from '@/lib/payments/paymentState'

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawText = await req.text()
  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawText) as Record<string, unknown>
  } catch {
    console.error('[webhook] Failed to parse notification body')
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const clientIdHeader = req.headers.get('client-id')
  const signatureHeader = req.headers.get('signature')
  const requestIdHeader = req.headers.get('request-id')
  const requestTimestampHeader = req.headers.get('request-timestamp')

  // 1. Strict Fail-Closed DOKU Webhook Signature Verification
  const isValidSignature = verifyDokuWebhookSignature({
    clientIdHeader,
    requestIdHeader,
    requestTimestampHeader,
    signatureHeader,
    requestTargetPath: '/api/payment/webhook',
    rawBody: rawText,
  })

  if (!isValidSignature) {
    console.error('[webhook] DOKU Signature verification failed — rejecting request')
    return NextResponse.json({ error: 'Invalid request signature or missing headers' }, { status: 400 })
  }

  // 2. Parse DOKU Notification Payload Fields
  const dokuPayload = body as unknown as DokuNotificationPayload
  const orderNumber = (dokuPayload.order?.invoice_number ?? body.order_id ?? '').toString().trim()
  const grossAmountInput = dokuPayload.order?.amount ?? (body.gross_amount as number) ?? 0
  const transactionStatus = (dokuPayload.transaction?.status ?? body.transaction_status ?? 'PENDING').toString().trim()
  const transactionId = (
    (body.transaction as any)?.id ??
    (body.service as any)?.id ??
    body.transaction_id ??
    ''
  ).toString().trim()
  const paymentType = (
    dokuPayload.channel?.id ??
    dokuPayload.service?.id ??
    (body.payment_type as string) ??
    null
  )

  if (!orderNumber) {
    console.error('[webhook] Missing order invoice number')
    return NextResponse.json({ error: 'Missing order invoice number' }, { status: 400 })
  }

  let grossAmount: number
  try {
    grossAmount = parsePaymentAmount(grossAmountInput)
  } catch (error) {
    console.error('[webhook] Invalid gross amount:', error)
    return NextResponse.json({ error: 'Invalid gross amount' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const adminAny = admin as any

  // 3. Process Settlement or Failure via Atomic Database RPCs
  const isSuccess = isDokuPaymentSuccessful(transactionStatus)

  if (isSuccess) {
    const { data, error } = await adminAny.rpc('settle_doku_payment', {
      p_invoice_number: orderNumber,
      p_provider_transaction_id: transactionId || null,
      p_payment_type: paymentType ? String(paymentType) : null,
      p_gross_amount: grossAmount,
      p_raw_notification: body,
    })

    if (error) {
      console.error('[webhook] Settlement RPC failed:', error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const res = Array.isArray(data) ? data[0] : data
    if (!res || !res.success) {
      console.error('[webhook] Settlement failed:', res?.message ?? 'Unknown error')
      return NextResponse.json({ ok: false, error: res?.message ?? 'Settlement rejected' }, { status: 400 })
    }

    // Trigger in-app notification if first time settled
    if (!res.already_settled && res.profile_id) {
      await createOrderNotification(res.profile_id, orderNumber, admin).catch((err) => {
        console.error('[webhook] Failed to create in-app notification:', err)
      })
    }

    return NextResponse.json({ ok: true, message: res.message }, { status: 200 })
  }

  // Handle FAILED / EXPIRED / CANCELLED notifications
  const { data: failData, error: failError } = await adminAny.rpc('handle_failed_doku_payment', {
    p_invoice_number: orderNumber,
    p_target_status: transactionStatus,
    p_raw_notification: body,
  })

  if (failError) {
    console.error('[webhook] Failure handling RPC failed:', failError.message)
    return NextResponse.json({ ok: false, error: failError.message }, { status: 500 })
  }

  const res = Array.isArray(failData) ? failData[0] : failData
  return NextResponse.json({ ok: true, message: res?.message ?? 'Failure recorded' }, { status: 200 })
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
