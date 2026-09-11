import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { getExecutiveDashboardSummary } from '@/lib/executive/executiveService'
import type { ExecutivePeriod } from '@/lib/executive/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const { searchParams } = new URL(req.url)
    const periodParam = (searchParams.get('period') as ExecutivePeriod) ?? '7d'
    const validPeriods: ExecutivePeriod[] = [
      'today',
      'yesterday',
      '7d',
      '30d',
      'this_month',
      'last_month',
      'custom',
    ]

    const period = validPeriods.includes(periodParam) ? periodParam : '7d'
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const summary = await getExecutiveDashboardSummary(auth.adminDb, {
      period,
      startDate,
      endDate,
    })

    return jsonOk(summary, {
      headers: {
        'Cache-Control': 'private, max-age=30',
      },
    })
  } catch (error) {
    console.error('[/api/admin/dashboard/summary GET] error:', error)
    return jsonError(
      'Gagal memuat ringkasan eksekutif bisnis',
      500,
      error instanceof Error ? error.message : String(error)
    )
  }
}
