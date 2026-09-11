import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import {
  getAdminCouponsList,
  createCoupon,
  getPromotionMetrics,
} from '@/lib/promotions/promotionService'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const status = searchParams.get('status') ?? 'all'
    const q = searchParams.get('q') ?? ''

    const [couponsData, metrics] = await Promise.all([
      getAdminCouponsList(auth.adminDb, { page, limit, status, q }),
      getPromotionMetrics(auth.adminDb),
    ])

    return jsonOk({
      ...couponsData,
      metrics,
    })
  } catch (e) {
    console.error('[/api/admin/coupons GET] error:', e)
    return jsonError('Gagal memuat data kupon', 500, e instanceof Error ? e.message : String(e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const body = await req.json()
    const newCoupon = await createCoupon(auth.adminDb, body, auth.adminUserId ?? undefined)
    return jsonOk(newCoupon)
  } catch (e) {
    console.error('[/api/admin/coupons POST] error:', e)
    return jsonError(e instanceof Error ? e.message : String(e), 400)
  }
}
