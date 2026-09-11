import { describe, it, expect, vi } from 'vitest'
import {
  creditOrderLoyaltyPoints,
  reverseRefundLoyaltyPoints,
  adjustCustomerPoints,
  reconcileLoyaltyData,
} from './loyaltyService'

describe('loyaltyService', () => {
  describe('creditOrderLoyaltyPoints', () => {
    it('rejects earning for non-completed order', async () => {
      const mockDb = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'o1', status: 'shipped', total_amount: 200_000, profile_id: 'p1' },
          }),
        }),
      } as any

      const result = await creditOrderLoyaltyPoints(mockDb, 'o1')
      expect(result.ok).toBe(false)
      expect(result.reason).toContain('Status pesanan bukan completed')
    })

    it('credits points idempotently for completed order', async () => {
      let insertedTx: any = null
      let updatedProfile: any = null

      const mockDb = {
        from: (table: string) => {
          if (table === 'orders') {
            const builder: any = {
              eq: () => builder,
              single: () =>
                Promise.resolve({
                  data: {
                    id: 'o1',
                    status: 'completed',
                    total_amount: 250_000,
                    profile_id: 'p1',
                    order_number: 'GNB-2026-001',
                  },
                }),
            }
            return { select: () => builder }
          }
          if (table === 'loyalty_transactions') {
            const builder: any = {
              eq: () => builder,
              maybeSingle: () => Promise.resolve({ data: null }),
            }
            return {
              select: () => builder,
              insert: (data: any) => {
                insertedTx = data
                return Promise.resolve({ error: null })
              },
            }
          }
          if (table === 'profiles') {
            const builder: any = {
              eq: () => builder,
              single: () => Promise.resolve({ data: { loyalty_points: 100 } }),
            }
            return {
              select: () => builder,
              update: (data: any) => {
                updatedProfile = data
                return { eq: () => Promise.resolve({ error: null }) }
              },
            }
          }
          return {}
        },
      } as any

      const result = await creditOrderLoyaltyPoints(mockDb, 'o1')
      expect(result.ok).toBe(true)
      expect(result.pointsAwarded).toBe(250) // 250k IDR = 250 points
      expect(result.newBalance).toBe(350) // 100 initial + 250
      expect(insertedTx.points_delta).toBe(250)
      expect(insertedTx.balance_after).toBe(350)
      expect(updatedProfile.loyalty_points).toBe(350)
    })

    it('prevents double earning when order already has earning transaction', async () => {
      const mockDb = {
        from: (table: string) => {
          if (table === 'orders') {
            const builder: any = {
              eq: () => builder,
              single: () =>
                Promise.resolve({
                  data: {
                    id: 'o1',
                    status: 'completed',
                    total_amount: 250_000,
                    profile_id: 'p1',
                    order_number: 'GNB-2026-001',
                  },
                }),
            }
            return { select: () => builder }
          }
          if (table === 'loyalty_transactions') {
            const builder: any = {
              eq: () => builder,
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: 'tx-1', points_delta: 250, balance_after: 350 },
                }),
            }
            return { select: () => builder }
          }
          return {}
        },
      } as any

      const result = await creditOrderLoyaltyPoints(mockDb, 'o1')
      expect(result.ok).toBe(true)
      expect(result.alreadyCredited).toBe(true)
      expect(result.pointsAwarded).toBe(250)
    })
  })

  describe('reverseRefundLoyaltyPoints', () => {
    it('reverses points proportionally without allowing negative balance', async () => {
      let insertedTx: any = null
      let updatedProfile: any = null

      const mockDb = {
        from: (table: string) => {
          if (table === 'loyalty_transactions') {
            const builder: any = {
              eq: () => builder,
              maybeSingle: () => Promise.resolve({ data: null }),
            }
            return {
              select: () => builder,
              insert: (data: any) => {
                insertedTx = data
                return Promise.resolve({ error: null })
              },
            }
          }
          if (table === 'profiles') {
            const builder: any = {
              eq: () => builder,
              single: () => Promise.resolve({ data: { loyalty_points: 50 } }),
            }
            return {
              select: () => builder,
              update: (data: any) => {
                updatedProfile = data
                return { eq: () => Promise.resolve({ error: null }) }
              },
            }
          }
          return {}
        },
      } as any

      // Refund of 100k would reverse 100 points, but customer only has 50 points
      const result = await reverseRefundLoyaltyPoints(mockDb, {
        refundId: 'ref-1',
        orderId: 'o1',
        profileId: 'p1',
        refundAmount: 100_000,
      })

      expect(result.ok).toBe(true)
      expect(result.pointsReversed).toBe(50) // Clamped to remaining 50
      expect(result.newBalance).toBe(0) // Not negative!
      expect(insertedTx.points_delta).toBe(-50)
      expect(insertedTx.balance_after).toBe(0)
      expect(updatedProfile.loyalty_points).toBe(0)
    })
  })

  describe('adjustCustomerPoints', () => {
    it('requires a non-empty audit reason for adjustments', async () => {
      const mockDb = {} as any
      const result = await adjustCustomerPoints(mockDb, {
        adminUserId: 'admin-1',
        profileId: 'p1',
        pointsDelta: 50,
        reason: '   ',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('Alasan penyesuaian poin wajib diisi')
    })

    it('rejects deduction that would cause balance to drop below 0', async () => {
      const mockDb = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { id: 'p1', loyalty_points: 30 } }),
            }),
          }),
        }),
      } as any

      const result = await adjustCustomerPoints(mockDb, {
        adminUserId: 'admin-1',
        profileId: 'p1',
        pointsDelta: -50,
        reason: 'Correction',
      })
      expect(result.ok).toBe(false)
      expect(result.error).toContain('tidak mencukupi')
    })

    it('successfully records admin adjustment and updates balance', async () => {
      let insertedTx: any = null
      let updatedProfile: any = null

      const mockDb = {
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ data: { id: 'p1', loyalty_points: 100 } }),
                }),
              }),
              update: (data: any) => {
                updatedProfile = data
                return { eq: () => Promise.resolve({ error: null }) }
              },
            }
          }
          if (table === 'loyalty_transactions') {
            return {
              insert: (data: any) => {
                insertedTx = data
                return Promise.resolve({ error: null })
              },
            }
          }
          return {}
        },
      } as any

      const result = await adjustCustomerPoints(mockDb, {
        adminUserId: 'admin-1',
        profileId: 'p1',
        pointsDelta: 50,
        reason: 'Kompensasi kendala pengiriman',
      })

      expect(result.ok).toBe(true)
      expect(result.newBalance).toBe(150)
      expect(insertedTx.points_delta).toBe(50)
      expect(insertedTx.balance_after).toBe(150)
      expect(insertedTx.description).toBe('Kompensasi kendala pengiriman')
      expect(updatedProfile.loyalty_points).toBe(150)
    })
  })

  describe('reconcileLoyaltyData', () => {
    it('identifies discrepancies between profile balance and ledger transactions', async () => {
      const mockDb = {
        from: (table: string) => {
          if (table === 'profiles') {
            return {
              select: () =>
                Promise.resolve({
                  data: [
                    { id: 'p1', loyalty_points: 250 }, // Sum: 250 -> ok
                    { id: 'p2', loyalty_points: 500 }, // Sum: 200 -> diff 300!
                    { id: 'p3', loyalty_points: -10 }, // negative balance!
                  ],
                }),
            }
          }
          if (table === 'loyalty_transactions') {
            return {
              select: () =>
                Promise.resolve({
                  data: [
                    { profile_id: 'p1', points_delta: 250 },
                    { profile_id: 'p2', points_delta: 200 },
                  ],
                }),
            }
          }
          return {}
        },
      } as any

      const report = await reconcileLoyaltyData(mockDb)
      expect(report.totalAccountsChecked).toBe(3)
      expect(report.negativeBalanceCount).toBe(1)
      expect(report.discrepanciesCount).toBe(1)
      expect(report.discrepancies[0].profileId).toBe('p2')
      expect(report.discrepancies[0].difference).toBe(300)
    })
  })
})
