import type { OrderStatus } from '@/types/database'

// Map of allowed order status transitions
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['completed', 'refunded'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
}

/**
 * Evaluates whether transitioning an order from current to next status is valid.
 */
export function isValidOrderTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true
  const allowedNext = ALLOWED_TRANSITIONS[current] ?? []
  return allowedNext.includes(next)
}

/**
 * Returns the list of valid target statuses from a given current order status.
 */
export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? []
}

/**
 * Sanitizes tracking resi number by trimming whitespace.
 */
export function sanitizeTrackingNumber(resi: string): string {
  return resi.trim().replace(/\s+/g, '')
}

/**
 * Validates tracking number presence, format, and length.
 */
export function validateTrackingNumber(resi: string): { valid: boolean; message?: string } {
  const clean = sanitizeTrackingNumber(resi)
  if (!clean) {
    return { valid: false, message: 'Nomor resi wajib diisi' }
  }
  if (clean.length < 4 || clean.length > 100) {
    return { valid: false, message: 'Nomor resi harus antara 4 sampai 100 karakter' }
  }
  return { valid: true }
}
