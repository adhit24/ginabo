import { describe, it, expect } from 'vitest'
import { auditCustomerDataQuality } from './dataQualityService'

describe('dataQualityService', () => {
  it('detects duplicate emails, duplicate phones, and orphaned orders', async () => {
    const mockDb = {
      from: (table: string) => {
        if (table === 'profiles') {
          return {
            select: () =>
              Promise.resolve({
                data: [
                  { id: 'p1', email: 'siti@ginabo.id', phone_number: '081234567890' },
                  { id: 'p2', email: 'Siti@Ginabo.id ', phone_number: '+62 812-3456-7890' }, // duplicate normalized
                  { id: 'p3', email: 'invalid-email', phone_number: '123' }, // invalid email & phone
                ],
              }),
          }
        }
        if (table === 'orders') {
          return {
            select: () =>
              Promise.resolve({
                data: [
                  { id: 'o1', order_number: 'GNB-001', profile_id: 'p1' },
                  { id: 'o2', order_number: 'GNB-002', profile_id: 'p999' }, // orphaned!
                ],
              }),
          }
        }
        return { select: () => Promise.resolve({ data: [] }) }
      },
    } as any

    const report = await auditCustomerDataQuality(mockDb)

    expect(report.totalProfilesChecked).toBe(3)
    expect(report.totalOrdersChecked).toBe(2)
    expect(report.issues.duplicateNormalizedEmails.length).toBe(1)
    expect(report.issues.duplicateNormalizedEmails[0].email).toBe('siti@ginabo.id')
    expect(report.issues.duplicateNormalizedPhones.length).toBe(1)
    expect(report.issues.duplicateNormalizedPhones[0].phone).toBe('+6281234567890')
    expect(report.issues.invalidEmails.length).toBe(1)
    expect(report.issues.invalidPhones.length).toBe(1)
    expect(report.issues.orphanedOrders.length).toBe(1)
    expect(report.issues.orphanedOrders[0].orderNumber).toBe('GNB-002')
    expect(report.anomaliesFound).toBe(5)
  })
})
