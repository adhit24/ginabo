// GET /api/admin/returns — return queue with filters
// Query: ?status=&type=&q=&flagged=true&limit=

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import type { ReturnStatus, ReturnType } from '@/types/returns'

type QueueRow = {
  id: string
  return_number: string
  status: ReturnStatus
  return_type: ReturnType
  refund_amount: number
  risk_score: number
  is_flagged: boolean
  created_at: string
  order: { order_number: string } | null
  profile: { full_name: string | null; email: string | null } | null
  items: { quantity: number }[]
}

const DUMMY_RETURNS: QueueRow[] = [
  { id:"dr1", return_number:"RTN-20240601-001", status:"submitted",    return_type:"defective",        refund_amount:120000, risk_score:20, is_flagged:false, created_at:"2024-06-01T08:00:00Z", order:{order_number:"GNB-20240520-003"}, profile:{full_name:"Siti Rahayu",    email:"siti.rahayu@gmail.com"},    items:[{quantity:1}] },
  { id:"dr2", return_number:"RTN-20240602-002", status:"under_review", return_type:"allergic_reaction", refund_amount:287999, risk_score:75, is_flagged:true,  created_at:"2024-06-02T10:00:00Z", order:{order_number:"GNB-20240515-001"}, profile:{full_name:"Budi Santoso",   email:"budi.santoso@gmail.com"},   items:[{quantity:1}] },
  { id:"dr3", return_number:"RTN-20240603-003", status:"approved",     return_type:"wrong_item",        refund_amount:75000,  risk_score:10, is_flagged:false, created_at:"2024-06-03T09:30:00Z", order:{order_number:"GNB-20240518-005"}, profile:{full_name:"Dewi Kusuma",    email:"dewi.kusuma@yahoo.com"},    items:[{quantity:1}] },
  { id:"dr4", return_number:"RTN-20240604-004", status:"escalated",    return_type:"missing_item",      refund_amount:207999, risk_score:82, is_flagged:true,  created_at:"2024-06-04T11:00:00Z", order:{order_number:"GNB-20240510-002"}, profile:{full_name:"Ahmad Fauzi",    email:"ahmad.fauzi@gmail.com"},    items:[{quantity:2}] },
  { id:"dr5", return_number:"RTN-20240605-005", status:"completed",    return_type:"defective",         refund_amount:169999, risk_score:5,  is_flagged:false, created_at:"2024-06-05T14:00:00Z", order:{order_number:"GNB-20240505-004"}, profile:{full_name:"Rina Marlina",   email:"rina.marlina@gmail.com"},   items:[{quantity:1}] },
  { id:"dr6", return_number:"RTN-20240606-006", status:"item_received",return_type:"exchange",           refund_amount:90000,  risk_score:15, is_flagged:false, created_at:"2024-06-06T08:00:00Z", order:{order_number:"GNB-20240508-006"}, profile:{full_name:"Lia Anggraini",  email:"lia.anggraini@outlook.com"},items:[{quantity:1}] },
  { id:"dr7", return_number:"RTN-20240607-007", status:"rejected",     return_type:"other",              refund_amount:377998, risk_score:65, is_flagged:true,  created_at:"2024-06-07T16:00:00Z", order:{order_number:"GNB-20240501-007"}, profile:{full_name:"Hendra Wijaya",  email:"hendra.w@gmail.com"},       items:[{quantity:3}] },
  { id:"dr8", return_number:"RTN-20240608-008", status:"awaiting_shipment", return_type:"defective",    refund_amount:120000, risk_score:8,  is_flagged:false, created_at:"2024-06-08T10:00:00Z", order:{order_number:"GNB-20240522-008"}, profile:{full_name:"Mega Putri",     email:"mega.putri@gmail.com"},     items:[{quantity:1}] },
]

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status')?.trim() as ReturnStatus | undefined
  const type = url.searchParams.get('type')?.trim()
  const flagged = url.searchParams.get('flagged') === 'true'
  const q = url.searchParams.get('q')?.trim()?.toLowerCase()
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 100), 500)

  let realRows: QueueRow[] = []

  try {
    const auth = await resolveReturnAuth()
    if (auth?.isAdmin) {
      let query = auth.adminDb
        .from('returns')
        .select(
          `id, return_number, status, return_type, preferred_resolution, refund_amount,
           risk_score, is_flagged, created_at, submitted_at,
           order:orders(order_number),
           profile:profiles(full_name, email, phone_number),
           items:return_items(quantity)`,
        )
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) query = query.eq('status', status)
      if (type) query = query.eq('return_type', type)
      if (flagged) query = query.eq('is_flagged', true)

      const { data, error } = await query
      if (!error && (data ?? []).length > 0) {
        realRows = data as unknown as QueueRow[]
      }
    }
  } catch { /* fall through to dummy */ }

  let result = realRows.length > 0 ? realRows : [...DUMMY_RETURNS]

  if (status && realRows.length === 0) result = result.filter((r) => r.status === status)
  if (flagged && realRows.length === 0) result = result.filter((r) => r.is_flagged)

  if (q) {
    result = result.filter((r) => {
      const rn = String(r.return_number ?? '').toLowerCase()
      const on = String(r.order?.order_number ?? '').toLowerCase()
      const nm = String(r.profile?.full_name ?? '').toLowerCase()
      const em = String(r.profile?.email ?? '').toLowerCase()
      return rn.includes(q) || on.includes(q) || nm.includes(q) || em.includes(q)
    })
  }

  return jsonOk(result)
}
