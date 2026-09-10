import { NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { getCustomerLoyaltySummary } from '@/lib/loyalty/loyaltyService'

export async function GET(req: NextRequest) {
  try {
    const userDb = await createServerSupabaseClient()
    const {
      data: { user },
    } = await userDb.auth.getUser()

    if (!user) {
      return jsonError('Silakan login terlebih dahulu', 401)
    }

    const adminDb = createAdminClient()
    const summary = await getCustomerLoyaltySummary(adminDb, user.id)

    if (!summary) {
      return jsonError('Profil loyalty belum ditemukan', 404)
    }

    return jsonOk(summary)
  } catch (e) {
    return jsonError('Server error', 500, e instanceof Error ? e.message : String(e))
  }
}
