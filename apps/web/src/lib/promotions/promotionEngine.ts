import type {
  Coupon,
  CouponStatus,
  CustomerEvaluationContext,
  DiscountSnapshot,
  PromotionCartItem,
  PromotionValidationResult,
} from './types'
import { formatMoney } from '@/lib/money'

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase()
}

export function deriveCouponStatus(
  coupon: Pick<Coupon, 'isActive' | 'startsAt' | 'expiresAt'>,
  nowMs = Date.now(),
): CouponStatus {
  if (!coupon.isActive) return 'disabled'

  const startsAt = new Date(coupon.startsAt).getTime()
  if (Number.isFinite(startsAt) && startsAt > nowMs) {
    return 'scheduled'
  }

  if (coupon.expiresAt) {
    const expiresAt = new Date(coupon.expiresAt).getTime()
    if (Number.isFinite(expiresAt) && expiresAt <= nowMs) {
      return 'expired'
    }
  }

  return 'active'
}

export function calculateEligibleSubtotal(
  items: PromotionCartItem[],
  appliesTo: Coupon['appliesTo'],
  productIds?: string[] | null,
  categoryIds?: string[] | null,
): number {
  if (items.length === 0) return 0

  if (appliesTo === 'all') {
    return items.reduce((sum, item) => sum + Math.max(0, item.unitPrice) * Math.max(0, item.quantity), 0)
  }

  if (appliesTo === 'specific_products') {
    const eligibleIdSet = new Set(productIds ?? [])
    return items.reduce((sum, item) => {
      return eligibleIdSet.has(item.productId)
        ? sum + Math.max(0, item.unitPrice) * Math.max(0, item.quantity)
        : sum
    }, 0)
  }

  if (appliesTo === 'specific_categories') {
    const eligibleCategorySet = new Set(categoryIds ?? [])
    return items.reduce((sum, item) => {
      return item.categoryId && eligibleCategorySet.has(item.categoryId)
        ? sum + Math.max(0, item.unitPrice) * Math.max(0, item.quantity)
        : sum
    }, 0)
  }

  return 0
}

export function calculateDiscount(
  eligibleSubtotal: number,
  shippingCost: number,
  coupon: Pick<Coupon, 'discountType' | 'discountValue' | 'maxDiscountAmount'>,
): number {
  if (eligibleSubtotal <= 0 && coupon.discountType !== 'free_shipping') return 0

  let discount = 0

  if (coupon.discountType === 'percentage') {
    const safePercent = Math.min(100, Math.max(0, coupon.discountValue))
    discount = Math.round((eligibleSubtotal * safePercent) / 100)
    if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount >= 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount)
    }
    discount = Math.min(discount, eligibleSubtotal)
  } else if (coupon.discountType === 'fixed_idr') {
    discount = Math.min(Math.max(0, coupon.discountValue), eligibleSubtotal)
  } else if (coupon.discountType === 'free_shipping') {
    discount = Math.max(0, shippingCost)
    if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount >= 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount)
    }
  }

  return Math.max(0, discount)
}

export function evaluateDateValidity(
  coupon: Pick<Coupon, 'startsAt' | 'expiresAt'>,
  nowMs = Date.now(),
): { valid: boolean; errorCode?: 'NOT_STARTED' | 'EXPIRED'; reason?: string } {
  const startsAt = new Date(coupon.startsAt).getTime()
  if (Number.isFinite(startsAt) && startsAt > nowMs) {
    return {
      valid: false,
      errorCode: 'NOT_STARTED',
      reason: 'Kupon promosi belum mulai berlaku.',
    }
  }

  if (coupon.expiresAt) {
    const expiresAt = new Date(coupon.expiresAt).getTime()
    if (Number.isFinite(expiresAt) && expiresAt <= nowMs) {
      return {
        valid: false,
        errorCode: 'EXPIRED',
        reason: 'Masa berlaku kupon promosi telah berakhir.',
      }
    }
  }

  return { valid: true }
}

export function evaluateUsageLimits(
  coupon: Pick<Coupon, 'usageLimit' | 'usagePerUser'>,
  globalUsage: number,
  userUsage: number,
): { valid: boolean; errorCode?: 'GLOBAL_LIMIT_REACHED' | 'USER_LIMIT_REACHED'; reason?: string } {
  if (coupon.usageLimit !== null && globalUsage >= coupon.usageLimit) {
    return {
      valid: false,
      errorCode: 'GLOBAL_LIMIT_REACHED',
      reason: 'Kuota penggunaan kupon ini telah habis.',
    }
  }

  if (userUsage >= coupon.usagePerUser) {
    return {
      valid: false,
      errorCode: 'USER_LIMIT_REACHED',
      reason: 'Anda telah mencapai batas maksimal penggunaan kupon ini.',
    }
  }

  return { valid: true }
}

export function evaluateCustomerEligibility(
  context: CustomerEvaluationContext | undefined,
  coupon: Pick<
    Coupon,
    'customerEligibility' | 'eligibleSegments' | 'eligibleTiers' | 'eligibleProfileIds'
  >,
): {
  eligible: boolean
  errorCode?:
    | 'NOT_ELIGIBLE_FIRST_PURCHASE'
    | 'NOT_ELIGIBLE_REPEAT'
    | 'NOT_ELIGIBLE_SEGMENT'
    | 'NOT_ELIGIBLE_TIER'
    | 'NOT_ELIGIBLE_PROFILE'
  reason?: string
} {
  switch (coupon.customerEligibility) {
    case 'all':
      return { eligible: true }

    case 'first_purchase':
      if (context && context.validPaidOrderCount > 0) {
        return {
          eligible: false,
          errorCode: 'NOT_ELIGIBLE_FIRST_PURCHASE',
          reason: 'Kupon ini khusus untuk transaksi pertama pelanggan baru.',
        }
      }
      return { eligible: true }

    case 'repeat_customer':
      if (!context || context.validPaidOrderCount < 2) {
        return {
          eligible: false,
          errorCode: 'NOT_ELIGIBLE_REPEAT',
          reason: 'Kupon ini khusus untuk pelanggan setia (minimal 2 kali belanja).',
        }
      }
      return { eligible: true }

    case 'specific_segments': {
      const allowedSegments = coupon.eligibleSegments ?? []
      if (!context?.segment || !allowedSegments.includes(context.segment)) {
        return {
          eligible: false,
          errorCode: 'NOT_ELIGIBLE_SEGMENT',
          reason: `Kupon ini khusus untuk segmen pelanggan tertentu (${allowedSegments.join(', ')}).`,
        }
      }
      return { eligible: true }
    }

    case 'specific_tiers': {
      const allowedTiers = coupon.eligibleTiers ?? []
      if (!context?.tier || !allowedTiers.includes(context.tier)) {
        return {
          eligible: false,
          errorCode: 'NOT_ELIGIBLE_TIER',
          reason: `Kupon ini khusus untuk member tier (${allowedTiers.join(', ')}).`,
        }
      }
      return { eligible: true }
    }

    case 'specific_profiles': {
      const allowedProfiles = coupon.eligibleProfileIds ?? []
      if (!context?.profileId || !allowedProfiles.includes(context.profileId)) {
        return {
          eligible: false,
          errorCode: 'NOT_ELIGIBLE_PROFILE',
          reason: 'Kupon ini bersifat khusus untuk akun pelanggan tertentu.',
        }
      }
      return { eligible: true }
    }

    default:
      return { eligible: true }
  }
}

export function formatRuleSummary(
  coupon: Pick<
    Coupon,
    | 'discountType'
    | 'discountValue'
    | 'maxDiscountAmount'
    | 'minOrderAmount'
    | 'appliesTo'
    | 'customerEligibility'
    | 'eligibleTiers'
    | 'eligibleSegments'
  >,
): string {
  const parts: string[] = []

  // 1. Discount value
  if (coupon.discountType === 'percentage') {
    let disc = `Diskon ${coupon.discountValue}%`
    if (coupon.maxDiscountAmount) {
      disc += ` (Maks ${formatMoney(coupon.maxDiscountAmount, 'IDR')})`
    }
    parts.push(disc)
  } else if (coupon.discountType === 'fixed_idr') {
    parts.push(`Potongan ${formatMoney(coupon.discountValue, 'IDR')}`)
  } else if (coupon.discountType === 'free_shipping') {
    let disc = 'Gratis Ongkir'
    if (coupon.maxDiscountAmount) {
      disc += ` (Maks ${formatMoney(coupon.maxDiscountAmount, 'IDR')})`
    }
    parts.push(disc)
  }

  // 2. Min order
  if (coupon.minOrderAmount > 0) {
    parts.push(`Min. Belanja ${formatMoney(coupon.minOrderAmount, 'IDR')}`)
  }

  // 3. Scope
  if (coupon.appliesTo === 'specific_products') {
    parts.push('Produk Pilihan')
  } else if (coupon.appliesTo === 'specific_categories') {
    parts.push('Kategori Pilihan')
  }

  // 4. Eligibility
  if (coupon.customerEligibility === 'first_purchase') {
    parts.push('Khusus Pembeli Pertama')
  } else if (coupon.customerEligibility === 'repeat_customer') {
    parts.push('Khusus Pelanggan Setia')
  } else if (coupon.customerEligibility === 'specific_tiers' && coupon.eligibleTiers?.length) {
    parts.push(`Khusus Tier: ${coupon.eligibleTiers.join('/')}`)
  } else if (coupon.customerEligibility === 'specific_segments' && coupon.eligibleSegments?.length) {
    parts.push(`Khusus Segmen: ${coupon.eligibleSegments.join('/')}`)
  }

  return parts.join(' • ')
}

export function validateCouponRules(
  coupon: Coupon,
  items: PromotionCartItem[],
  shippingCost = 0,
  customerContext?: CustomerEvaluationContext,
  globalUsage = 0,
  userUsage = 0,
  nowMs = Date.now(),
): PromotionValidationResult {
  const totalSubtotal = items.reduce((sum, item) => sum + Math.max(0, item.unitPrice) * Math.max(0, item.quantity), 0)

  // 1. Check active status
  if (!coupon.isActive) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: totalSubtotal,
      message: 'Kupon promosi saat ini tidak aktif.',
      errorCode: 'INACTIVE',
    }
  }

  // 2. Check date validity
  const dateResult = evaluateDateValidity(coupon, nowMs)
  if (!dateResult.valid) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: totalSubtotal,
      message: dateResult.reason ?? 'Kupon tidak berlaku.',
      errorCode: dateResult.errorCode,
    }
  }

  // 3. Check customer eligibility
  const eligibilityResult = evaluateCustomerEligibility(customerContext, coupon)
  if (!eligibilityResult.eligible) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: totalSubtotal,
      message: eligibilityResult.reason ?? 'Anda tidak memenuhi syarat untuk kupon ini.',
      errorCode: eligibilityResult.errorCode,
    }
  }

  // 4. Check usage limits
  const usageResult = evaluateUsageLimits(coupon, globalUsage, userUsage)
  if (!usageResult.valid) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: totalSubtotal,
      message: usageResult.reason ?? 'Batas penggunaan kupon tercapai.',
      errorCode: usageResult.errorCode,
    }
  }

  // 5. Calculate eligible subtotal
  const eligibleSubtotal = calculateEligibleSubtotal(
    items,
    coupon.appliesTo,
    coupon.productIds,
    coupon.categoryIds,
  )

  if (eligibleSubtotal <= 0 && coupon.discountType !== 'free_shipping') {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: totalSubtotal,
      message: 'Kupon ini tidak berlaku untuk produk di keranjang Anda.',
      errorCode: 'SCOPE_MISMATCH',
    }
  }

  // 6. Check minimum order amount against eligible product subtotal
  if (eligibleSubtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal,
      newSubtotal: totalSubtotal,
      message: `Minimum belanja untuk kupon ini adalah ${formatMoney(coupon.minOrderAmount, 'IDR')}.`,
      errorCode: 'MIN_SPEND_NOT_MET',
    }
  }

  // 7. Calculate discount
  const discountAmount = calculateDiscount(eligibleSubtotal, shippingCost, coupon)

  const discountSnapshot: DiscountSnapshot = {
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    appliedAmount: discountAmount,
    eligibleSubtotal,
    maxDiscountAmount: coupon.maxDiscountAmount,
    customerEligibility: coupon.customerEligibility,
    calculatedAt: new Date(nowMs).toISOString(),
  }

  const ruleSummary = formatRuleSummary(coupon)

  return {
    valid: true,
    code: coupon.code,
    couponId: coupon.id,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    eligibleSubtotal,
    newSubtotal: Math.max(0, totalSubtotal - (coupon.discountType !== 'free_shipping' ? discountAmount : 0)),
    message: `Kupon ${coupon.code} berhasil diterapkan! Hemat ${formatMoney(discountAmount, 'IDR')}.`,
    ruleSummary,
    discountSnapshot,
  }
}
