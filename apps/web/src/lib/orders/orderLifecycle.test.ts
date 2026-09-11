import { describe, expect, it } from 'vitest'
import {
  isValidOrderTransition,
  getAllowedNextStatuses,
  sanitizeTrackingNumber,
  validateTrackingNumber,
} from './orderLifecycle'

describe('Order Lifecycle State Machine', () => {
  it('allows valid progressive order status transitions', () => {
    expect(isValidOrderTransition('pending', 'paid')).toBe(true)
    expect(isValidOrderTransition('paid', 'processing')).toBe(true)
    expect(isValidOrderTransition('processing', 'shipped')).toBe(true)
    expect(isValidOrderTransition('shipped', 'delivered')).toBe(true)
    expect(isValidOrderTransition('delivered', 'completed')).toBe(true)
    expect(isValidOrderTransition('delivered', 'refunded')).toBe(true)
  })

  it('allows valid cancellation transitions', () => {
    expect(isValidOrderTransition('pending', 'cancelled')).toBe(true)
    expect(isValidOrderTransition('paid', 'cancelled')).toBe(true)
    expect(isValidOrderTransition('processing', 'cancelled')).toBe(true)
  })

  it('rejects invalid backward transitions', () => {
    expect(isValidOrderTransition('shipped', 'processing')).toBe(false)
    expect(isValidOrderTransition('delivered', 'processing')).toBe(false)
    expect(isValidOrderTransition('delivered', 'shipped')).toBe(false)
    expect(isValidOrderTransition('completed', 'shipped')).toBe(false)
    expect(isValidOrderTransition('cancelled', 'paid')).toBe(false)
    expect(isValidOrderTransition('cancelled', 'shipped')).toBe(false)
  })

  it('rejects invalid shortcut transitions', () => {
    expect(isValidOrderTransition('pending', 'shipped')).toBe(false)
    expect(isValidOrderTransition('pending', 'delivered')).toBe(false)
    expect(isValidOrderTransition('shipped', 'cancelled')).toBe(false)
  })

  it('returns valid allowed next statuses', () => {
    expect(getAllowedNextStatuses('pending')).toEqual(['paid', 'cancelled'])
    expect(getAllowedNextStatuses('paid')).toEqual(['processing', 'cancelled'])
    expect(getAllowedNextStatuses('processing')).toEqual(['shipped', 'cancelled'])
    expect(getAllowedNextStatuses('shipped')).toEqual(['delivered'])
    expect(getAllowedNextStatuses('delivered')).toEqual(['completed', 'refunded'])
    expect(getAllowedNextStatuses('completed')).toEqual(['refunded'])
    expect(getAllowedNextStatuses('cancelled')).toEqual([])
  })
})

describe('Tracking Resi Sanitization & Validation', () => {
  it('sanitizes tracking numbers properly', () => {
    expect(sanitizeTrackingNumber('  JNE-123 456  ')).toBe('JNE-123456')
    expect(sanitizeTrackingNumber(' JNT987654321 ')).toBe('JNT987654321')
  })

  it('validates tracking numbers within valid range', () => {
    expect(validateTrackingNumber('JNE123456789')).toEqual({ valid: true })
    expect(validateTrackingNumber('')).toEqual({ valid: false, message: 'Nomor resi wajib diisi' })
    expect(validateTrackingNumber('   ')).toEqual({ valid: false, message: 'Nomor resi wajib diisi' })
    expect(validateTrackingNumber('AB')).toEqual({
      valid: false,
      message: 'Nomor resi harus antara 4 sampai 100 karakter',
    })
  })
})
