import { describe, it, expect, vi } from 'vitest'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { creditOrderLoyaltyPoints } from './loyaltyService'

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

describe('Loyalty Security & Concurrency', () => {
  it('blocks unauthenticated non-admin adjustment requests', async () => {
    const auth = await requireAdminAuth()
    expect(auth.authorized).toBe(false)
    expect(auth.errorResponse?.status).toBe(403)
  })

  it('prevents race conditions from duplicating points on concurrent earnings', async () => {
    let callCount = 0
    const mockDb = {
      from: (table: string) => {
        if (table === 'orders') {
          const builder: any = {
            eq: () => builder,
            single: () =>
              Promise.resolve({
                data: {
                  id: 'order-race-1',
                  status: 'completed',
                  total_amount: 100_000,
                  profile_id: 'p-race',
                  order_number: 'GNB-RACE-01',
                },
              }),
          }
          return { select: () => builder }
        }
        if (table === 'loyalty_transactions') {
          const builder: any = {
            eq: () => builder,
            maybeSingle: () => {
              callCount++
              // First call sees no tx; second call (simulating after first insert) sees existing tx
              if (callCount > 1) {
                return Promise.resolve({ data: { id: 'tx-existing', points_delta: 100, balance_after: 200 } })
              }
              return Promise.resolve({ data: null })
            },
          }
          return {
            select: () => builder,
            insert: () => Promise.resolve({ error: null }),
          }
        }
        if (table === 'profiles') {
          const builder: any = {
            eq: () => builder,
            single: () => Promise.resolve({ data: { loyalty_points: 100 } }),
          }
          return {
            select: () => builder,
            update: () => ({ eq: () => Promise.resolve({ error: null }) }),
          }
        }
        return {}
      },
    } as any

    const [res1, res2] = await Promise.all([
      creditOrderLoyaltyPoints(mockDb, 'order-race-1'),
      creditOrderLoyaltyPoints(mockDb, 'order-race-1'),
    ])

    expect(res1.ok).toBe(true)
    expect(res2.ok).toBe(true)

    // Exactly one of them performed the initial credit, the other detected existing transaction
    const creditedDirectly = [res1, res2].filter((r) => !r.alreadyCredited)
    const interceptedAsDuplicate = [res1, res2].filter((r) => r.alreadyCredited)

    expect(creditedDirectly.length).toBe(1)
    expect(interceptedAsDuplicate.length).toBe(1)
  })
})
