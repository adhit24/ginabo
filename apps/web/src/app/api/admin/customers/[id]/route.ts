import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { getCustomer360Detail } from '@/lib/customers/customer360Service'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Enforce Admin Authorization
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const customerId = params.id
    if (!customerId) {
      return jsonError('ID customer tidak valid', 400)
    }

    // 2. Fetch Customer 360 Detail
    const customer = await getCustomer360Detail(auth.adminDb, customerId)
    if (!customer) {
      return jsonError('Customer tidak ditemukan', 404)
    }

    return jsonOk(customer)
  } catch (e) {
    return jsonError('Server error', 500, e instanceof Error ? e.message : String(e))
  }
}
