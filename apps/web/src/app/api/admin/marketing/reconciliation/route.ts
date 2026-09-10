import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { reconcileAttributionData } from '@/lib/attribution/attributionService'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const report = await reconcileAttributionData(auth.adminDb)
    return jsonOk(report)
  } catch (error) {
    console.error('[/api/admin/marketing/reconciliation GET] error:', error)
    return jsonError(
      'Gagal menjalankan rekonsiliasi analitik atribusi',
      500,
      error instanceof Error ? error.message : String(error)
    )
  }
}
