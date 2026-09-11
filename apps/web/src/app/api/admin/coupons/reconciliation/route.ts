import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { reconcilePromotionData } from '@/lib/promotions/promotionService'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const report = await reconcilePromotionData(auth.adminDb)
    return jsonOk(report)
  } catch (e) {
    console.error('[/api/admin/coupons/reconciliation GET] error:', e)
    return jsonError('Gagal menjalankan audit kupon', 500, e instanceof Error ? e.message : String(e))
  }
}
