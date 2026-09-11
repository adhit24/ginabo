import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server'
import { validateCouponCode } from '@/lib/promotions/promotionService'
import type { PromotionCartItem } from '@/lib/promotions/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { code, items, shippingCost } = body

    if (!code || typeof code !== 'string' || !code.trim()) {
      return jsonError('Kode kupon wajib diisi', 400)
    }

    if (!Array.isArray(items) || items.length === 0) {
      return jsonError('Keranjang belanja kosong', 400)
    }

    // Try to get authenticated user if present
    let userId: string | null = null
    try {
      const userClient = await createServerSupabaseClient()
      const { data: { user } } = await userClient.auth.getUser()
      if (user?.id) userId = user.id
    } catch {
      // Unauthenticated checkout is possible
    }

    const admin = createAdminClient()
    const sanitizedItems: PromotionCartItem[] = items.map((i: any) => ({
      productId: String(i.productId || i.product_id),
      categoryId: i.categoryId || i.category_id || null,
      unitPrice: Math.max(0, Number(i.unitPrice || i.unit_price || 0)),
      quantity: Math.max(1, Number(i.quantity || i.qty || 1)),
    }))

    const result = await validateCouponCode(admin, {
      code: code.trim(),
      userId,
      items: sanitizedItems,
      shippingCost: Math.max(0, Number(shippingCost || 0)),
    })

    if (!result.valid) {
      return jsonError(result.message, 400, result.errorCode)
    }

    return jsonOk(result)
  } catch (err) {
    console.error('[/api/coupons/validate] error:', err)
    return jsonError('Gagal memvalidasi kupon', 500, err instanceof Error ? err.message : String(err))
  }
}
