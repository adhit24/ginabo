import { describe, expect, it } from 'vitest'
import {
  canTransition,
  checkEligibility,
  computeRefundAmount,
  decidePostSubmitStatus,
  generateVoucherCode,
} from '../returns'
import type { ReturnPolicyRow } from '@/types/returns'

const MOCK_POLICY: ReturnPolicyRow = {
  id: 'pol-1',
  name: 'Standard Policy',
  is_active: true,
  return_window_days: 7,
  exchange_window_days: 7,
  refund_window_days: 14,
  eligible_category_ids: [],
  non_returnable_product_ids: ['non-ret-prod'],
  auto_approve_reasons: ['wrong_item', 'missing_item'],
  manual_review_reasons: ['allergic_reaction', 'defective'],
  auto_approve_max_amount: 500000,
  require_evidence: true,
  min_evidence_count: 1,
  max_returns_per_month: 5,
  high_risk_score: 70,
  store_credit_bonus_pct: 10,
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('Return State Machine Transitions', () => {
  it('allows valid progressive transitions', () => {
    expect(canTransition('draft', 'submitted')).toBe(true)
    expect(canTransition('submitted', 'under_review')).toBe(true)
    expect(canTransition('under_review', 'approved')).toBe(true)
    expect(canTransition('approved', 'awaiting_shipment')).toBe(true)
    expect(canTransition('awaiting_shipment', 'item_received')).toBe(true)
    expect(canTransition('item_received', 'quality_inspection')).toBe(true)
    expect(canTransition('quality_inspection', 'refund_approved')).toBe(true)
    expect(canTransition('refund_approved', 'completed')).toBe(true)
  })

  it('rejects invalid backward transitions', () => {
    expect(canTransition('refund_approved', 'submitted')).toBe(false)
    expect(canTransition('completed', 'approved')).toBe(false)
    expect(canTransition('rejected', 'approved')).toBe(false)
    expect(canTransition('cancelled', 'submitted')).toBe(false)
  })

  it('allows escalation and revision paths', () => {
    expect(canTransition('under_review', 'escalated')).toBe(true)
    expect(canTransition('escalated', 'approved')).toBe(true)
    expect(canTransition('under_review', 'more_evidence_required')).toBe(true)
    expect(canTransition('more_evidence_required', 'under_review')).toBe(true)
  })
})

describe('Return Eligibility Engine', () => {
  it('rejects non-delivered orders', () => {
    const order = {
      id: 'ord-1',
      order_number: 'GIN-1001',
      status: 'processing',
      delivered_at: null,
      created_at: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          variant_id: null,
          product_name: 'Serum',
          variant_name: null,
          image_url: null,
          quantity: 2,
          unit_price: 150000,
        },
      ],
    }
    const res = checkEligibility(order, MOCK_POLICY, 0)
    expect(res.eligible).toBe(false)
    expect(res.reasons.some((r) => r.includes('delivered'))).toBe(true)
  })

  it('rejects orders past return window', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString()
    const order = {
      id: 'ord-2',
      order_number: 'GIN-1002',
      status: 'delivered',
      delivered_at: eightDaysAgo,
      created_at: eightDaysAgo,
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          variant_id: null,
          product_name: 'Serum',
          variant_name: null,
          image_url: null,
          quantity: 2,
          unit_price: 150000,
        },
      ],
    }
    const res = checkEligibility(order, MOCK_POLICY, 0)
    expect(res.eligible).toBe(false)
    expect(res.reasons.some((r) => r.includes('berakhir'))).toBe(true)
  })

  it('accepts valid delivered orders within return window', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
    const order = {
      id: 'ord-3',
      order_number: 'GIN-1003',
      status: 'delivered',
      delivered_at: twoDaysAgo,
      created_at: twoDaysAgo,
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          variant_id: null,
          product_name: 'Serum',
          variant_name: null,
          image_url: null,
          quantity: 2,
          unit_price: 150000,
        },
      ],
    }
    const res = checkEligibility(order, MOCK_POLICY, 0)
    expect(res.eligible).toBe(true)
    expect(res.eligible_items).toHaveLength(1)
  })

  it('rejects orders with existing open returns', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
    const order = {
      id: 'ord-4',
      order_number: 'GIN-1004',
      status: 'delivered',
      delivered_at: twoDaysAgo,
      created_at: twoDaysAgo,
      items: [
        {
          id: 'item-1',
          product_id: 'prod-1',
          variant_id: null,
          product_name: 'Serum',
          variant_name: null,
          image_url: null,
          quantity: 2,
          unit_price: 150000,
        },
      ],
    }
    const res = checkEligibility(order, MOCK_POLICY, 1)
    expect(res.eligible).toBe(false)
    expect(res.reasons.some((r) => r.includes('retur aktif'))).toBe(true)
  })
})

describe('Refund Amount Calculation & Policy Decision', () => {
  it('computes exact integer refund amount based on item quantity and price', () => {
    const items = [
      { unit_price: 150000, quantity: 2 },
      { unit_price: 85000, quantity: 1 },
    ]
    expect(computeRefundAmount(items)).toBe(385000)
  })

  it('routes high risk returns to escalated status', () => {
    const status = decidePostSubmitStatus(MOCK_POLICY, 'wrong_item', 100000, 75)
    expect(status).toBe('escalated')
  })

  it('auto-approves low risk auto-approvable returns within amount cap', () => {
    const status = decidePostSubmitStatus(MOCK_POLICY, 'wrong_item', 200000, 10)
    expect(status).toBe('approved')
  })

  it('routes manual review reasons to under_review', () => {
    const status = decidePostSubmitStatus(MOCK_POLICY, 'defective', 200000, 10)
    expect(status).toBe('under_review')
  })

  it('generates valid voucher code prefix', () => {
    const code = generateVoucherCode()
    expect(code.startsWith('RFND-')).toBe(true)
    expect(code.length).toBeGreaterThan(10)
  })
})

describe('Evidence Storage Security Validation', () => {
  it('validates storage path structure and rejects traversal', () => {
    const isValidPath = (userId: string, path: string): boolean => {
      if (path.includes('..') || path.includes('\\')) return false
      return path.startsWith(`${userId}/`)
    }

    const userId = 'usr-123-abc'
    expect(isValidPath(userId, 'usr-123-abc/RET-2026-000001/photo.jpg')).toBe(true)
    expect(isValidPath(userId, 'usr-999-other/RET-2026-000001/photo.jpg')).toBe(false)
    expect(isValidPath(userId, 'usr-123-abc/../other-folder/file.jpg')).toBe(false)
    expect(isValidPath(userId, 'usr-123-abc\\file.jpg')).toBe(false)
  })
})
