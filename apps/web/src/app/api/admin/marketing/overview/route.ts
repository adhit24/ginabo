import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { getMarketingAttributionOverview } from '@/lib/attribution/attributionService'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const { searchParams } = new URL(req.url)
    const period = (searchParams.get('period') as 'today' | '7d' | '30d' | 'all') || '30d'
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const overview = await getMarketingAttributionOverview(auth.adminDb, {
      period,
      startDate,
      endDate,
    })

    return jsonOk(overview)
  } catch (error) {
    console.error('[/api/admin/marketing/overview GET] error:', error)
    return jsonError(
      'Gagal memuat analitik atribusi pemasaran',
      500,
      error instanceof Error ? error.message : String(error)
    )
  }
}
