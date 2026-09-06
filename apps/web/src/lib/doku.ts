// DOKU Checkout Client — server-side only
// All functions must be called from Route Handlers or Server Actions, never from the browser.

import { createHash, createHmac, timingSafeEqual } from 'crypto'

// ─── Config ───────────────────────────────────────────────────────────────────

export const isDokuProduction = process.env.DOKU_IS_PRODUCTION === 'true'

export const dokuClientId = process.env.DOKU_CLIENT_ID ?? ''
export const dokuSecretKey = process.env.DOKU_SECRET_KEY ?? ''

const DOKU_BASE_URL = isDokuProduction
  ? 'https://api.doku.com'
  : 'https://api-sandbox.doku.com'

const CHECKOUT_PATH = '/checkout/v1/payment'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DokuLineItem {
  name: string
  price: number
  quantity: number
}

export interface DokuCustomerDetails {
  id?: string
  name: string
  email: string
  phone?: string
}

export interface DokuCheckoutRequestPayload {
  order: {
    invoice_number: string
    amount: number
    line_items?: DokuLineItem[]
    callback_url?: string
    auto_redirect?: boolean
  }
  payment?: {
    payment_due_date?: number
  }
  customer: {
    id?: string
    name: string
    email: string
    phone?: string
  }
}

export interface DokuCheckoutResponse {
  order: {
    invoice_number: string
    amount: number
  }
  response: {
    payment: {
      url: string
      expired_date?: string
    }
  }
  [key: string]: unknown
}

export interface DokuNotificationPayload {
  service?: {
    id: string
  }
  acquirer?: {
    id: string
  }
  channel?: {
    id: string
  }
  order: {
    invoice_number: string
    amount: number
  }
  transaction?: {
    status: string // SUCCESS, FAILED, EXPIRED, PENDING, CANCELLED
    date?: string
  }
  [key: string]: unknown
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates ISO 8601 UTC timestamp format required by DOKU (e.g. 2026-09-03T18:40:00Z).
 */
export function getDokuTimestamp(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19) + 'Z'
}

/**
 * Computes Base64 SHA256 digest of JSON request body string.
 */
export function computeBodyDigest(bodyString: string): string {
  return createHash('sha256').update(bodyString).digest('base64')
}

/**
 * Computes DOKU Signature header for HTTP requests or Webhooks.
 * Formula:
 * HMACSHA256 = Base64(HMAC-SHA256(SecretKey, Client-Id + \n + Request-Id + \n + Request-Timestamp + \n + Request-Target + \n + Digest))
 */
export function calculateDokuSignature(opts: {
  clientId: string
  secretKey: string
  requestId: string
  requestTimestamp: string
  requestTarget: string
  digest: string
}): string {
  const componentString = [
    `Client-Id:${opts.clientId}`,
    `Request-Id:${opts.requestId}`,
    `Request-Timestamp:${opts.requestTimestamp}`,
    `Request-Target:${opts.requestTarget}`,
    `Digest:${opts.digest}`,
  ].join('\n')

  const hmac = createHmac('sha256', opts.secretKey)
    .update(componentString)
    .digest('base64')

  return `HMACSHA256=${hmac}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a DOKU Checkout transaction session and returns the checkout URL & invoice reference.
 */
export async function createDokuCheckoutSession(opts: {
  orderNumber: string
  totalAmount: number
  customer: DokuCustomerDetails
  items: DokuLineItem[]
  callbackUrl?: string
  idempotencyKey?: string
}): Promise<{ checkoutUrl: string; invoiceNumber: string; rawResponse: Record<string, unknown> }> {
  if (!dokuClientId || !dokuSecretKey) {
    throw new Error('DOKU credentials (DOKU_CLIENT_ID, DOKU_SECRET_KEY) are not configured')
  }

  const payload: DokuCheckoutRequestPayload = {
    order: {
      invoice_number: opts.orderNumber,
      amount: opts.totalAmount,
      line_items: opts.items.map((item) => ({
        name: item.name.slice(0, 100),
        price: item.price,
        quantity: item.quantity,
      })),
      callback_url: opts.callbackUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/checkout/finish`,
      auto_redirect: true,
    },
    payment: {
      payment_due_date: 60, // 60 minutes expiry
    },
    customer: {
      id: opts.customer.id || opts.orderNumber,
      name: opts.customer.name,
      email: opts.customer.email,
      phone: opts.customer.phone || '081234567890',
    },
  }

  const jsonBody = JSON.stringify(payload)
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  const requestTimestamp = getDokuTimestamp()
  const digest = computeBodyDigest(jsonBody)

  const signature = calculateDokuSignature({
    clientId: dokuClientId,
    secretKey: dokuSecretKey,
    requestId,
    requestTimestamp,
    requestTarget: CHECKOUT_PATH,
    digest,
  })

  const response = await fetch(`${DOKU_BASE_URL}${CHECKOUT_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': dokuClientId,
      'Request-Id': requestId,
      'Request-Timestamp': requestTimestamp,
      Signature: signature,
    },
    body: jsonBody,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`DOKU Checkout API error ${response.status}: ${errorBody}`)
  }

  const data = (await response.json()) as DokuCheckoutResponse

  const checkoutUrl = data.response?.payment?.url
  if (!checkoutUrl) {
    throw new Error('DOKU Checkout response missing payment url')
  }

  return {
    checkoutUrl,
    invoiceNumber: data.order?.invoice_number || opts.orderNumber,
    rawResponse: data as Record<string, unknown>,
  }
}

/**
 * Verifies DOKU Webhook Notification request HMAC signature.
 */
export function verifyDokuWebhookSignature(opts: {
  clientIdHeader: string | null
  requestIdHeader: string | null
  requestTimestampHeader: string | null
  signatureHeader: string | null
  requestTargetPath: string
  rawBody: string
  secretKey?: string
}): boolean {
  const secretKey = opts.secretKey ?? process.env.DOKU_SECRET_KEY ?? ''
  const configuredClientId = process.env.DOKU_CLIENT_ID ?? ''

  if (!secretKey) {
    console.error('[doku] Webhook signature verification failed: DOKU_SECRET_KEY is not configured')
    return false
  }

  const {
    clientIdHeader,
    requestIdHeader,
    requestTimestampHeader,
    signatureHeader,
    requestTargetPath,
    rawBody,
  } = opts

  if (!clientIdHeader || !requestIdHeader || !requestTimestampHeader || !signatureHeader) {
    console.error('[doku] Webhook signature verification failed: Missing required header(s)')
    return false
  }

  if (configuredClientId && clientIdHeader !== configuredClientId) {
    console.error('[doku] Webhook signature verification failed: Client-Id mismatch')
    return false
  }

  const digest = computeBodyDigest(rawBody)
  const expectedSignature = calculateDokuSignature({
    clientId: clientIdHeader,
    secretKey,
    requestId: requestIdHeader,
    requestTimestamp: requestTimestampHeader,
    requestTarget: requestTargetPath,
    digest,
  })

  const cleanReceived = signatureHeader.trim()
  const cleanExpected = expectedSignature.trim()

  const sigBufferA = Buffer.from(cleanExpected)
  const sigBufferB = Buffer.from(cleanReceived)

  if (sigBufferA.length !== sigBufferB.length) {
    return false
  }

  return timingSafeEqual(sigBufferA, sigBufferB)
}

/**
 * Evaluates whether DOKU transaction status corresponds to a successful payment.
 */
export function isDokuPaymentSuccessful(status: string): boolean {
  const normalized = status.toUpperCase()
  return normalized === 'SUCCESS' || normalized === 'PAID' || normalized === 'SETTLED'
}
