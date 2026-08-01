// POST /api/returns/[returnNumber]/cancel — customer cancels their own request
// Allowed only before the item has been shipped back for inspection.

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import { logStatusChange } from '@/lib/returns'

interface Ctx {
  params: { returnNumber: string }
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)

  const { data: ret } = await auth.userDb
    .from('returns')
    .select('id, status')
    .eq('return_number', params.returnNumber)
    .maybeSingle()
  if (!ret) return jsonError('Retur tidak ditemukan', 404)
  const r = ret as { id: string; status: string }

  const cancellable = ['draft', 'submitted', 'under_review', 'more_evidence_required', 'approved', 'awaiting_shipment']
  if (!cancellable.includes(r.status)) {
    return jsonError('Retur tidak dapat dibatalkan pada status ini', 409)
  }

  await auth.adminDb.from('returns').update({ status: 'cancelled' }).eq('id', r.id)
  await logStatusChange(auth.adminDb, {
    returnId: r.id,
    from: r.status as never,
    to: 'cancelled',
    changedBy: auth.userId,
    actorType: 'customer',
    reason: 'Dibatalkan oleh pelanggan',
  })

  return jsonOk({ status: 'cancelled' })
}
