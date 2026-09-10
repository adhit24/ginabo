/**
 * Customer Identity normalization helpers for Indonesian phone numbers and emails.
 */

/**
 * Normalizes an Indonesian phone number to E.164 format (+628xxxx).
 * Preserves validity; does not destructively modify invalid arbitrary strings.
 */
export function normalizeIndonesianPhone(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Strip spaces, dashes, dots, parentheses
  const cleaned = phone.trim().replace(/[\s\-\.\(\)]/g, '')
  if (!cleaned) return null

  // Check prefix
  if (cleaned.startsWith('+62')) {
    const digits = cleaned.slice(1).replace(/\D/g, '')
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`
    }
    return null
  }

  if (cleaned.startsWith('62')) {
    const digits = cleaned.replace(/\D/g, '')
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`
    }
    return null
  }

  if (cleaned.startsWith('08')) {
    const digits = cleaned.slice(1).replace(/\D/g, '')
    if (digits.length >= 9 && digits.length <= 14) {
      return `+62${digits}`
    }
    return null
  }

  if (cleaned.startsWith('8')) {
    const digits = cleaned.replace(/\D/g, '')
    if (digits.length >= 9 && digits.length <= 13) {
      return `+62${digits}`
    }
    return null
  }

  // If already standard E.164 international
  if (cleaned.startsWith('+') && /^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return cleaned
  }

  return null
}

/**
 * Normalizes email by trimming and lowercasing.
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const clean = email.trim().toLowerCase()
  if (!clean || !clean.includes('@')) return null
  return clean
}

/**
 * Formats a valid WhatsApp direct click-to-chat URL.
 */
export function formatWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const normalized = normalizeIndonesianPhone(phone)
  if (!normalized) return null
  const digits = normalized.replace(/\D/g, '')
  const base = `https://wa.me/${digits}`
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`
  }
  return base
}
