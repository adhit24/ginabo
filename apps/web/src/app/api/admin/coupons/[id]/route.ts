import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import {
  updateCoupon,
  toggleCouponActive,
  mapDbCouponToDomain,
} from '@/lib/promotions/promotionService'

interface Ctx {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const { data, error } = await auth.adminDb
      .from('coupons')
      .select('*, campaigns(id, name, slug)')
      .eq('id', params.id)
      .maybeSingle()

    if (error) throw error
    if (!data) return jsonError('Kupon tidak ditemukan', 404)

    return jsonOk(mapDbCouponToDomain(data))
  } catch (e) {
    console.error('[/api/admin/coupons/[id] GET] error:', e)
    return jsonError('Gagal memuat detail kupon', 500, e instanceof Error ? e.message : String(e))
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const body = await req.json()

    if (typeof body.isActive === 'boolean' && Object.keys(body).length === 1) {
      const toggled = await toggleCouponActive(auth.adminDb, params.id, body.isActive)
      return jsonOk(toggled)
    }

    const updated = await updateCoupon(auth.adminDb, params.id, body)
    return jsonOk(updated)
  } catch (e) {
    console.error('[/api/admin/coupons/[id] PATCH] error:', e)
    return jsonError(e instanceof Error ? e.message : String(e), 400)
  }
}
