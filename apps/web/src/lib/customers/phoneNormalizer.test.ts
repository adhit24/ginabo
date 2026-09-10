import { describe, it, expect } from 'vitest'
import {
  normalizeIndonesianPhone,
  normalizeEmail,
  formatWhatsAppUrl,
} from './phoneNormalizer'

describe('phoneNormalizer', () => {
  it('normalizes local 08xx phone numbers to +628xx', () => {
    expect(normalizeIndonesianPhone('081234567890')).toBe('+6281234567890')
    expect(normalizeIndonesianPhone('0812-3456-7890')).toBe('+6281234567890')
    expect(normalizeIndonesianPhone(' 0856 789 0123 ')).toBe('+628567890123')
  })

  it('handles 628 and +628 formats gracefully', () => {
    expect(normalizeIndonesianPhone('6281234567890')).toBe('+6281234567890')
    expect(normalizeIndonesianPhone('+6281234567890')).toBe('+6281234567890')
    expect(normalizeIndonesianPhone('+62 812-3456-7890')).toBe('+6281234567890')
  })

  it('rejects invalid or too short strings', () => {
    expect(normalizeIndonesianPhone('')).toBeNull()
    expect(normalizeIndonesianPhone(null)).toBeNull()
    expect(normalizeIndonesianPhone('12345')).toBeNull()
    expect(normalizeIndonesianPhone('invalid-phone')).toBeNull()
  })

  it('normalizes email with trimming and lowercasing', () => {
    expect(normalizeEmail(' Siti.Rahayu@GMAIL.COM ')).toBe('siti.rahayu@gmail.com')
    expect(normalizeEmail('user@ginabo.id')).toBe('user@ginabo.id')
    expect(normalizeEmail('invalidemail')).toBeNull()
    expect(normalizeEmail(null)).toBeNull()
  })

  it('formats wa.me click-to-chat links correctly', () => {
    expect(formatWhatsAppUrl('081234567890')).toBe('https://wa.me/6281234567890')
    expect(formatWhatsAppUrl('081234567890', 'Halo Ginabo')).toBe(
      'https://wa.me/6281234567890?text=Halo%20Ginabo'
    )
    expect(formatWhatsAppUrl('invalid')).toBeNull()
  })
})
