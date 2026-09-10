import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { getCustomer360List } from '@/lib/customers/customer360Service'
import type { CustomerSegment, CustomerSortField, SortDirection } from '@/lib/customers/types'

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce Admin Authorization
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || undefined
    const segment = (searchParams.get('segment') as CustomerSegment | 'all') || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    const sortBy = (searchParams.get('sortBy') as CustomerSortField) || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') as SortDirection) || 'desc'

    // 2. Fetch Customer 360 Aggregations
    const result = await getCustomer360List(auth.adminDb, {
      q,
      segment,
      page,
      limit,
      sortBy,
      sortOrder,
    })

    return jsonOk(result)
  } catch (e) {
    return jsonError('Server error', 500, e instanceof Error ? e.message : String(e))
  }
}
