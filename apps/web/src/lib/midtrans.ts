// Midtrans Snap client — server-side only
// All functions must be called from Route Handlers or Server Actions, never from the browser.

import { createHash } from 'crypto'
import type {
  MidtransSnapRequest,
  MidtransSnapResponse,
  MidtransNotification,
  MidtransVerifiedNotification,
  MidtransCustomerDetails,
  MidtransItemDetail,
} from '@/types/midtrans'

// ─── Config ───────────────────────────────────────────────────────────────────

export const isMidtransProduction =
  process.env.MIDTRANS_IS_PRODUCTION === 'true'

export const midtransServerKey = process.env.MIDTRANS_SERVER_KEY ?? ''
export const midtransClientKey =
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''

const SNAP_BASE_URL = isMidtransProduction
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function basicAuthHeader(): string {
  return `Basic ${Buffer.from(`${midtransServerKey}:`).toString('base64')}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a Midtrans Snap transaction and returns the snap token + redirect URL.
 * Call from a Route Handler (POST /api/payments/snap).
 */
export async function createSnapTransaction(
  orderId: string,
  grossAmount: number,
  customerDetails: MidtransCustomerDetails,
  items: MidtransItemDetail[]
): Promise<MidtransSnapResponse> {
  if (!midtransServerKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured')
  }

  const payload: MidtransSnapRequest = {
    transaction_details: { order_id: orderId, gross_amount: grossAmount },
    customer_details: customerDetails,
    item_details: items,
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/finish`,
      unfinish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/unfinish`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error`,
    },
  }

  const response = await fetch(`${SNAP_BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: basicAuthHeader(),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Midtrans Snap error ${response.status}: ${errorBody}`
    )
  }

  const data = (await response.json()) as MidtransSnapResponse
  return data
}

/**
 * Verifies the SHA-512 signature of a Midtrans webhook notification.
 * Returns the notification cast as MidtransVerifiedNotification on success.
 * Throws if the signature is invalid.
 *
 * Signature formula (Midtrans docs):
 *   SHA512( order_id + status_code + gross_amount + server_key )
 */
export function verifyMidtransNotification(
  notification: MidtransNotification
): MidtransVerifiedNotification {
  if (!midtransServerKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured')
  }

  const expected = createHash('sha512')
    .update(
      notification.order_id +
        notification.status_code +
        notification.gross_amount +
        midtransServerKey
    )
    .digest('hex')

  if (expected !== notification.signature_key) {
    throw new Error('Midtrans notification signature mismatch — possible spoofing attempt')
  }

  return { ...notification, _verified: true }
}

/**
 * Resolves whether a transaction is considered paid based on its status.
 * Handles both card capture flow and direct settlement.
 */
export function isMidtransPaymentSuccessful(
  notification: MidtransVerifiedNotification
): boolean {
  const { transaction_status, fraud_status } = notification

  if (transaction_status === 'capture') {
    return fraud_status === 'accept' || fraud_status === undefined
  }

  return transaction_status === 'settlement'
}
