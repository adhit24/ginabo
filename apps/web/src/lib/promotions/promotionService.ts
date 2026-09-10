import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Coupon,
  Campaign,
  CustomerEvaluationContext,
  PromotionCartItem,
  PromotionMetrics,
  PromotionReconciliationReport,
  PromotionValidationResult,
} from './types'
import {
  normalizeCouponCode,
  deriveCouponStatus,
  validateCouponRules,
} from './promotionEngine'
import { getCustomer360Detail } from '@/lib/customers/customer360Service'

export function mapDbCouponToDomain(row: Record<string, any>): Coupon {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrderAmount: Number(row.min_order_amount ?? 0),
    maxDiscountAmount: row.max_discount_amount !== null ? Number(row.max_discount_amount) : null,
    usageLimit: row.usage_limit !== null ? Number(row.usage_limit) : null,
    usagePerUser: Number(row.usage_per_user ?? 1),
    usedCount: Number(row.used_count ?? 0),
    appliesTo: row.applies_to,
    productIds: row.product_ids ?? null,
    categoryIds: row.category_ids ?? null,
    isActive: Boolean(row.is_active),
    startsAt: row.starts_at,
    expiresAt: row.expires_at ?? null,
    campaignId: row.campaign_id ?? null,
    customerEligibility: row.customer_eligibility ?? 'all',
    eligibleSegments: row.eligible_segments ?? null,
    eligibleTiers: row.eligible_tiers ?? null,
    eligibleProfileIds: row.eligible_profile_ids ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapDbCampaignToDomain(row: Record<string, any>): Campaign {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    objective: row.objective,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function validateCouponCode(
  db: SupabaseClient,
  params: {
    code: string
    userId?: string | null
    items: PromotionCartItem[]
    shippingCost?: number
  },
): Promise<PromotionValidationResult> {
  const normalizedCode = normalizeCouponCode(params.code)
  if (!normalizedCode) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: 0,
      message: 'Kode kupon wajib diisi.',
      errorCode: 'NOT_FOUND',
    }
  }

  // 1. Query coupon row
  const { data: rawCoupon, error: couponError } = await db
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .maybeSingle()

  if (couponError) {
    console.error('[promotionService] coupon lookup failed:', couponError)
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: 0,
      message: 'Terjadi kesalahan sistem saat memvalidasi kupon.',
      errorCode: 'INTERNAL_ERROR',
    }
  }

  if (!rawCoupon) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      newSubtotal: 0,
      message: 'Kode kupon tidak ditemukan.',
      errorCode: 'NOT_FOUND',
    }
  }

  const coupon = mapDbCouponToDomain(rawCoupon)

  // 2. Fetch usage counts
  const [{ count: globalUsage }, { count: userUsage }] = await Promise.all([
    db.from('coupon_usages').select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id),
    params.userId
      ? db
          .from('coupon_usages')
          .select('id', { count: 'exact', head: true })
          .eq('coupon_id', coupon.id)
          .eq('profile_id', params.userId)
      : Promise.resolve({ count: 0 }),
  ])

  // 3. Fetch Customer 360 & Loyalty Tier context if logged in
  let customerContext: CustomerEvaluationContext | undefined
  if (params.userId) {
    try {
      const c360 = await getCustomer360Detail(db, params.userId)
      if (c360) {
        customerContext = {
          profileId: params.userId,
          validPaidOrderCount: c360.paidOrderCount,
          segment: c360.segment,
          tier: (c360.membershipTier as any) ?? null,
        }
      }
    } catch (e) {
      console.warn('[promotionService] failed to fetch customer context, assuming standard user:', e)
      customerContext = {
        profileId: params.userId,
        validPaidOrderCount: 0,
      }
    }
  }

  // 4. Validate using pure engine
  return validateCouponRules(
    coupon,
    params.items,
    params.shippingCost ?? 0,
    customerContext,
    globalUsage ?? 0,
    userUsage ?? 0,
  )
}

export async function getAdminCouponsList(
  db: SupabaseClient,
  filters: {
    page?: number
    limit?: number
    status?: string
    q?: string
  } = {},
) {
  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.max(1, Math.min(100, filters.limit ?? 20))
  const offset = (page - 1) * limit

  let query = db
    .from('coupons')
    .select('*, campaigns(id, name, slug)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.q?.trim()) {
    const q = filters.q.trim().toUpperCase()
    query = query.or(`code.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('[promotionService] getAdminCouponsList failed:', error)
    throw new Error(`Gagal memuat daftar kupon: ${error.message}`)
  }

  const nowMs = Date.now()
  const couponsWithStatus = (data ?? []).map((row) => {
    const domainCoupon = mapDbCouponToDomain(row)
    const derivedStatus = deriveCouponStatus(domainCoupon, nowMs)
    return {
      ...domainCoupon,
      derivedStatus,
      campaignName: row.campaigns?.name ?? null,
    }
  })

  // Filter by status if specified
  const filtered = filters.status && filters.status !== 'all'
    ? couponsWithStatus.filter((c) => c.derivedStatus === filters.status)
    : couponsWithStatus

  return {
    coupons: filtered,
    totalCount: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit) || 1,
  }
}

export async function createCoupon(
  db: SupabaseClient,
  payload: {
    code: string
    description?: string | null
    discountType: Coupon['discountType']
    discountValue: number
    minOrderAmount?: number
    maxDiscountAmount?: number | null
    usageLimit?: number | null
    usagePerUser?: number
    appliesTo?: Coupon['appliesTo']
    productIds?: string[] | null
    categoryIds?: string[] | null
    isActive?: boolean
    startsAt?: string
    expiresAt?: string | null
    campaignId?: string | null
    customerEligibility?: Coupon['customerEligibility']
    eligibleSegments?: string[] | null
    eligibleTiers?: string[] | null
    eligibleProfileIds?: string[] | null
  },
  adminId?: string,
) {
  const normalizedCode = normalizeCouponCode(payload.code)
  if (!normalizedCode) throw new Error('Kode kupon wajib diisi.')

  if (payload.discountType === 'percentage' && (payload.discountValue <= 0 || payload.discountValue > 100)) {
    throw new Error('Nilai diskon persentase harus antara 1% dan 100%.')
  }
  if (payload.discountType === 'fixed_idr' && payload.discountValue <= 0) {
    throw new Error('Nilai diskon nominal IDR harus lebih besar dari 0.')
  }

  const startsAt = payload.startsAt ? new Date(payload.startsAt).toISOString() : new Date().toISOString()
  const expiresAt = payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null

  if (expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
    throw new Error('Tanggal berakhir kupon harus lebih besar dari tanggal mulai.')
  }

  const { data, error } = await db
    .from('coupons')
    .insert({
      code: normalizedCode,
      description: payload.description ?? null,
      discount_type: payload.discountType,
      discount_value: payload.discountValue,
      min_order_amount: payload.minOrderAmount ?? 0,
      max_discount_amount: payload.maxDiscountAmount ?? null,
      usage_limit: payload.usageLimit ?? null,
      usage_per_user: payload.usagePerUser ?? 1,
      applies_to: payload.appliesTo ?? 'all',
      product_ids: payload.productIds ?? null,
      category_ids: payload.categoryIds ?? null,
      is_active: payload.isActive ?? true,
      starts_at: startsAt,
      expires_at: expiresAt,
      campaign_id: payload.campaignId ?? null,
      customer_eligibility: payload.customerEligibility ?? 'all',
      eligible_segments: payload.eligibleSegments ?? [],
      eligible_tiers: payload.eligibleTiers ?? [],
      eligible_profile_ids: payload.eligibleProfileIds ?? [],
      created_by: adminId ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Kode kupon "${normalizedCode}" sudah digunakan. Gunakan kode lain.`)
    }
    throw new Error(`Gagal membuat kupon: ${error.message}`)
  }

  return mapDbCouponToDomain(data)
}

export async function updateCoupon(
  db: SupabaseClient,
  id: string,
  payload: Partial<Parameters<typeof createCoupon>[1]>,
) {
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (payload.code !== undefined) {
    const normalized = normalizeCouponCode(payload.code)
    if (!normalized) throw new Error('Kode kupon tidak boleh kosong.')
    updateData.code = normalized
  }
  if (payload.description !== undefined) updateData.description = payload.description
  if (payload.discountType !== undefined) updateData.discount_type = payload.discountType
  if (payload.discountValue !== undefined) updateData.discount_value = payload.discountValue
  if (payload.minOrderAmount !== undefined) updateData.min_order_amount = payload.minOrderAmount
  if (payload.maxDiscountAmount !== undefined) updateData.max_discount_amount = payload.maxDiscountAmount
  if (payload.usageLimit !== undefined) updateData.usage_limit = payload.usageLimit
  if (payload.usagePerUser !== undefined) updateData.usage_per_user = payload.usagePerUser
  if (payload.appliesTo !== undefined) updateData.applies_to = payload.appliesTo
  if (payload.productIds !== undefined) updateData.product_ids = payload.productIds
  if (payload.categoryIds !== undefined) updateData.category_ids = payload.categoryIds
  if (payload.isActive !== undefined) updateData.is_active = payload.isActive
  if (payload.startsAt !== undefined) updateData.starts_at = payload.startsAt
  if (payload.expiresAt !== undefined) updateData.expires_at = payload.expiresAt
  if (payload.campaignId !== undefined) updateData.campaign_id = payload.campaignId
  if (payload.customerEligibility !== undefined) updateData.customer_eligibility = payload.customerEligibility
  if (payload.eligibleSegments !== undefined) updateData.eligible_segments = payload.eligibleSegments
  if (payload.eligibleTiers !== undefined) updateData.eligible_tiers = payload.eligibleTiers
  if (payload.eligibleProfileIds !== undefined) updateData.eligible_profile_ids = payload.eligibleProfileIds

  const { data, error } = await db
    .from('coupons')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Gagal memperbarui kupon: ${error.message}`)
  }

  return mapDbCouponToDomain(data)
}

export async function toggleCouponActive(db: SupabaseClient, id: string, isActive: boolean) {
  const { data, error } = await db
    .from('coupons')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Gagal mengubah status kupon: ${error.message}`)
  return mapDbCouponToDomain(data)
}

export async function getAdminCampaignsList(db: SupabaseClient) {
  const { data, error } = await db
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Gagal memuat kampanye: ${error.message}`)
  return (data ?? []).map(mapDbCampaignToDomain)
}

export async function createCampaign(
  db: SupabaseClient,
  payload: {
    name: string
    slug: string
    objective: Campaign['objective']
    description?: string | null
    startsAt?: string | null
    endsAt?: string | null
  },
) {
  const { data, error } = await db
    .from('campaigns')
    .insert({
      name: payload.name.trim(),
      slug: payload.slug.trim().toLowerCase(),
      objective: payload.objective,
      description: payload.description ?? null,
      starts_at: payload.startsAt ?? null,
      ends_at: payload.endsAt ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Gagal membuat kampanye: ${error.message}`)
  return mapDbCampaignToDomain(data)
}

export async function getPromotionMetrics(db: SupabaseClient): Promise<PromotionMetrics> {
  const [couponsRes, usagesRes, ordersRes] = await Promise.all([
    db.from('coupons').select('id, is_active'),
    db.from('coupon_usages').select('id', { count: 'exact', head: true }),
    db
      .from('orders')
      .select('discount_amount, total_amount, status')
      .not('coupon_id', 'is', null)
      .in('status', ['paid', 'processing', 'shipped', 'delivered', 'completed']),
  ])

  const allCoupons = couponsRes.data ?? []
  const validOrders = ordersRes.data ?? []

  const totalDiscountCost = validOrders.reduce((sum, o) => sum + Number(o.discount_amount ?? 0), 0)
  const associatedGrossRevenue = validOrders.reduce(
    (sum, o) => sum + Number(o.total_amount ?? 0) + Number(o.discount_amount ?? 0),
    0,
  )

  return {
    totalCoupons: allCoupons.length,
    activeCoupons: allCoupons.filter((c) => c.is_active).length,
    totalRedemptions: usagesRes.count ?? 0,
    totalDiscountCost,
    associatedGrossRevenue,
  }
}

export async function reconcilePromotionData(db: SupabaseClient): Promise<PromotionReconciliationReport> {
  const { data: coupons, error } = await db.from('coupons').select('*')
  if (error) throw new Error(`Gagal mengambil data kupon untuk audit: ${error.message}`)

  const anomalies: PromotionReconciliationReport['anomalies'] = []
  const nowMs = Date.now()

  for (const c of coupons ?? []) {
    // 1. Expired but still active
    if (c.is_active && c.expires_at) {
      const exp = new Date(c.expires_at).getTime()
      if (Number.isFinite(exp) && exp < nowMs) {
        anomalies.push({
          couponId: c.id,
          code: c.code,
          type: 'EXPIRED_STILL_ACTIVE',
          description: `Kupon ${c.code} telah melewati batas waktu (${c.expires_at}) namun masih berstatus is_active = true.`,
        })
      }
    }

    // 2. Exceeded limit
    if (c.usage_limit !== null && c.used_count > c.usage_limit) {
      anomalies.push({
        couponId: c.id,
        code: c.code,
        type: 'USAGE_EXCEEDED_LIMIT',
        description: `Penggunaan kupon (${c.used_count}) melebihi kuota maksimal (${c.usage_limit}).`,
      })
    }

    // 3. Invalid percentage
    if (c.discount_type === 'percentage' && (c.discount_value <= 0 || c.discount_value > 100)) {
      anomalies.push({
        couponId: c.id,
        code: c.code,
        type: 'INVALID_PERCENTAGE',
        description: `Persentase diskon tidak valid: ${c.discount_value}%.`,
      })
    }

    // 4. Invalid date range
    if (c.expires_at && new Date(c.expires_at) <= new Date(c.starts_at)) {
      anomalies.push({
        couponId: c.id,
        code: c.code,
        type: 'INVALID_DATE_RANGE',
        description: `Rentang tanggal tidak valid: expires_at (${c.expires_at}) <= starts_at (${c.starts_at}).`,
      })
    }
  }

  return {
    auditedAt: new Date().toISOString(),
    totalCouponsChecked: coupons?.length ?? 0,
    anomaliesCount: anomalies.length,
    anomalies,
  }
}
