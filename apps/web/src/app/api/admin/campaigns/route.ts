import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { requireAdminAuth } from '@/lib/auth/adminAuth'
import {
  getAdminCampaignsList,
  createCampaign,
} from '@/lib/promotions/promotionService'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const campaigns = await getAdminCampaignsList(auth.adminDb)
    return jsonOk(campaigns)
  } catch (e) {
    console.error('[/api/admin/campaigns GET] error:', e)
    return jsonError('Gagal memuat kampanye', 500, e instanceof Error ? e.message : String(e))
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req)
    if (!auth.authorized || !auth.adminDb) {
      return auth.errorResponse ?? jsonError('Akses ditolak. Diperlukan autentikasi admin.', 403)
    }

    const body = await req.json()
    if (!body.name || !body.slug) {
      return jsonError('Nama dan slug kampanye wajib diisi', 400)
    }

    const campaign = await createCampaign(auth.adminDb, body)
    return jsonOk(campaign)
  } catch (e) {
    console.error('[/api/admin/campaigns POST] error:', e)
    return jsonError(e instanceof Error ? e.message : String(e), 400)
  }
}
