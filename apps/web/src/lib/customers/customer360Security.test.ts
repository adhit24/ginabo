import { describe, it, expect, vi } from 'vitest'
import { sanitizeCustomerPayload, requireAdminAuth } from '@/lib/auth/adminAuth'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    }),
  }),
}))

describe('Customer 360 Security & Privacy', () => {
  it('strips all sensitive credentials and authentication metadata', () => {
    const rawPayload = {
      id: 'cust-123',
      name: 'Siti Rahayu',
      email: 'siti@ginabo.id',
      password_hash: '$2b$10$xyz...',
      token: 'secret-token',
      refresh_token: 'refresh-xyz',
      provider_token: 'google-oauth-secret',
      auth_metadata: { role: 'customer' },
      raw_user_meta_data: { sensitive: true },
      netRevenueMinor: 500_000,
    }

    const sanitized = sanitizeCustomerPayload(rawPayload)

    expect(sanitized.id).toBe('cust-123')
    expect(sanitized.name).toBe('Siti Rahayu')
    expect(sanitized.netRevenueMinor).toBe(500_000)

    expect((sanitized as any).password_hash).toBeUndefined()
    expect((sanitized as any).token).toBeUndefined()
    expect((sanitized as any).refresh_token).toBeUndefined()
    expect((sanitized as any).provider_token).toBeUndefined()
    expect((sanitized as any).auth_metadata).toBeUndefined()
    expect((sanitized as any).raw_user_meta_data).toBeUndefined()
  })

  it('blocks unauthenticated requests with 403 status', async () => {
    const auth = await requireAdminAuth()
    expect(auth.authorized).toBe(false)
    expect(auth.errorResponse).toBeDefined()
    expect(auth.errorResponse?.status).toBe(403)
  })
})
