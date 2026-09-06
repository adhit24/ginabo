import { describe, expect, it } from 'vitest'
import {
  amountsMatch,
  parsePaymentAmount,
  resolvePaymentTransition,
  shouldFulfill,
  shouldUpdateOrderStatus,
} from './paymentState'
import {
  calculateDokuSignature,
  verifyDokuWebhookSignature,
  computeBodyDigest,
  isDokuPaymentSuccessful,
} from '../doku'

describe('Payment Integrity & Amount Matching', () => {
  it('accepts only exact integer gross amount', () => {
    expect(parsePaymentAmount('218000')).toBe(218000)
    expect(amountsMatch(218000, 218000)).toBe(true)
    expect(amountsMatch(218000, 217999)).toBe(false)
    expect(() => parsePaymentAmount(150.75)).toThrow('Nominal pembayaran tidak valid')
  })

  it('rejects invalid or non-integer numbers', () => {
    expect(() => parsePaymentAmount(-100)).toThrow()
    expect(() => parsePaymentAmount('invalid')).toThrow()
  })
})

describe('DOKU Payment State Machine Transitions', () => {
  it('maps DOKU and legacy statuses correctly', () => {
    expect(resolvePaymentTransition('SUCCESS')).toEqual({ orderStatus: 'paid', paymentStatus: 'success' })
    expect(resolvePaymentTransition('PAID')).toEqual({ orderStatus: 'paid', paymentStatus: 'success' })
    expect(resolvePaymentTransition('settlement')).toEqual({ orderStatus: 'paid', paymentStatus: 'success' })
    expect(resolvePaymentTransition('FAILED')).toEqual({ orderStatus: 'cancelled', paymentStatus: 'failed' })
    expect(resolvePaymentTransition('EXPIRED')).toEqual({ orderStatus: 'cancelled', paymentStatus: 'expired' })
    expect(resolvePaymentTransition('CANCELLED')).toEqual({ orderStatus: 'cancelled', paymentStatus: 'expired' })
  })

  it('evaluates DOKU success helper correctly', () => {
    expect(isDokuPaymentSuccessful('SUCCESS')).toBe(true)
    expect(isDokuPaymentSuccessful('PAID')).toBe(true)
    expect(isDokuPaymentSuccessful('SETTLED')).toBe(true)
    expect(isDokuPaymentSuccessful('FAILED')).toBe(false)
    expect(isDokuPaymentSuccessful('EXPIRED')).toBe(false)
    expect(isDokuPaymentSuccessful('PENDING')).toBe(false)
  })

  it('prevents terminal order status regression', () => {
    expect(shouldFulfill('pending', 'paid')).toBe(true)
    expect(shouldFulfill('paid', 'paid')).toBe(false)
    expect(shouldUpdateOrderStatus('paid', 'pending')).toBe(false)
    expect(shouldUpdateOrderStatus('processing', 'paid')).toBe(false)
    expect(shouldUpdateOrderStatus('delivered', 'cancelled')).toBe(false)
  })
})

describe('DOKU Webhook Signature Verification', () => {
  const secretKey = 'test_secret_key_12345'
  const clientId = 'MOCK-CLIENT-ID'
  const requestId = 'REQ-001'
  const requestTimestamp = '2026-09-06T12:00:00Z'
  const requestTargetPath = '/api/payment/webhook'
  const rawBody = JSON.stringify({ order: { invoice_number: 'INV-101', amount: 150000 } })

  // Set mock environment variables for test
  process.env.DOKU_SECRET_KEY = secretKey
  process.env.DOKU_CLIENT_ID = clientId

  it('calculates valid signature and verifies matching request headers', () => {
    const digest = computeBodyDigest(rawBody)
    const expectedSig = calculateDokuSignature({
      clientId,
      secretKey,
      requestId,
      requestTimestamp,
      requestTarget: requestTargetPath,
      digest,
    })

    const isValid = verifyDokuWebhookSignature({
      clientIdHeader: clientId,
      requestIdHeader: requestId,
      requestTimestampHeader: requestTimestamp,
      signatureHeader: expectedSig,
      requestTargetPath,
      rawBody,
    })

    expect(isValid).toBe(true)
  })

  it('rejects webhook missing required headers', () => {
    const isValid = verifyDokuWebhookSignature({
      clientIdHeader: null,
      requestIdHeader: requestId,
      requestTimestampHeader: requestTimestamp,
      signatureHeader: 'some-sig',
      requestTargetPath,
      rawBody,
    })

    expect(isValid).toBe(false)
  })

  it('rejects webhook with invalid signature', () => {
    const isValid = verifyDokuWebhookSignature({
      clientIdHeader: clientId,
      requestIdHeader: requestId,
      requestTimestampHeader: requestTimestamp,
      signatureHeader: 'HMACSHA256=invalid_forged_signature_hash',
      requestTargetPath,
      rawBody,
    })

    expect(isValid).toBe(false)
  })

  it('rejects webhook with client id mismatch', () => {
    const digest = computeBodyDigest(rawBody)
    const sig = calculateDokuSignature({
      clientId: 'WRONG-CLIENT-ID',
      secretKey,
      requestId,
      requestTimestamp,
      requestTarget: requestTargetPath,
      digest,
    })

    const isValid = verifyDokuWebhookSignature({
      clientIdHeader: 'WRONG-CLIENT-ID',
      requestIdHeader: requestId,
      requestTimestampHeader: requestTimestamp,
      signatureHeader: sig,
      requestTargetPath,
      rawBody,
    })

    expect(isValid).toBe(false)
  })
})
