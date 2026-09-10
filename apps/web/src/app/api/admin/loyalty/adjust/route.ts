import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import { adjustCustomerPoints } from '@/lib/loyalty/loyaltyService'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const body = (await req.json()) as {
      profileId?: string
      pointsDelta?: number
      reason?: string
    }

    if (!body.profileId) {
      return jsonError('ID profil customer wajib diisi', 400)
    }

    if (typeof body.pointsDelta !== 'number' || body.pointsDelta === 0) {
      return jsonError('Jumlah poin (pointsDelta) harus berupa angka dan tidak boleh 0', 400)
    }

    if (!body.reason || !body.reason.trim()) {
      return jsonError('Alasan penyesuaian poin wajib diisi untuk tujuan audit', 400)
    }

    const result = await adjustCustomerPoints(auth.adminDb, {
      adminUserId: auth.adminUserId ?? 'system-admin',
      profileId: body.profileId,
      pointsDelta: Math.round(body.pointsDelta),
      reason: body.reason.trim(),
    })

    if (!result.ok) {
      return jsonError(result.error ?? 'Gagal menyesuaikan poin', 400)
    }

    return jsonOk(result)
  } catch (e) {
    return jsonError('Server error', 500, e instanceof Error ? e.message : String(e))
  }
}
