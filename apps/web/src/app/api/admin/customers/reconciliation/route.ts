import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { auditCustomerDataQuality } from '@/lib/customers/dataQualityService'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const report = await auditCustomerDataQuality(auth.adminDb)
    return jsonOk(report)
  } catch (e) {
    return jsonError('Server error', 500, e instanceof Error ? e.message : String(e))
  }
}
