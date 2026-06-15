// GET  /api/returns         — list the current user's returns (Return Center)
// POST /api/returns         — create a return request

import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import {
  getActivePolicy,
  checkEligibility,
  computeRefundAmount,
  decidePostSubmitStatus,
  logStatusChange,
  enqueueReturnNotification,
} from '@/lib/returns'

const createSchema = z.object({
  order_number: z.string().min(3),
  return_type: z.enum([
    'defective',
    'wrong_item',
    'missing_item',
    'expired',
    'allergic_reaction',
    'exchange',
    'other',
  ]),
  preferred_resolution: z
    .enum(['refund', 'exchange', 'store_credit', 'voucher', 'repair_replace'])
    .default('refund'),
  customer_note: z.string().max(2000).optional(),
  usage_history: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        order_item_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
        item_reason: z.string().max(500).optional(),
      }),
    )
    .min(1),
})

// ─── GET (list) ──────────────────────────────────────────────────────────────

export async function GET() {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)

  const { data, error } = await auth.userDb
    .from('returns')
    .select(
      `id, return_number, status, return_type, preferred_resolution, refund_amount,
       created_at, submitted_at, completed_at,
       order:orders(order_number),
       items:return_items(id, product_name, variant_name, image_url, quantity)`,
    )
    .order('created_at', { ascending: false })

  if (error) return jsonError('Gagal memuat retur', 500, error.message)
  return jsonOk(data ?? [])
}

// ─── POST (create) ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Body JSON tidak valid', 400)
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return jsonError('Input tidak valid', 422, parsed.error.flatten())
  const input = parsed.data

  // Blacklist gate
  const { data: blocked } = await auth.adminDb
    .from('return_blacklist')
    .select('id')
    .eq('profile_id', auth.userId)
    .eq('is_active', true)
    .maybeSingle()
  if (blocked) {
    return jsonError('Akun Anda saat ini tidak dapat mengajukan retur. Hubungi customer support.', 403)
  }

  // Load order (RLS ensures it belongs to the user)
  const { data: order } = await auth.userDb
    .from('orders')
    .select(
      `id, order_number, status, delivered_at, created_at,
       items:order_items(id, product_id, variant_id, product_name, variant_name, sku, image_url, quantity, unit_price)`,
    )
    .eq('order_number', input.order_number)
    .maybeSingle()
  if (!order) return jsonError('Pesanan tidak ditemukan', 404)
  const o = order as never as {
    id: string
    order_number: string
    items: {
      id: string
      product_id: string | null
      variant_id: string | null
      product_name: string
      variant_name: string | null
      sku: string | null
      image_url: string | null
      quantity: number
      unit_price: number
    }[]
  }

  const policy = await getActivePolicy(auth.adminDb)

  // Eligibility (re-check server-side)
  const { count: openCount } = await auth.adminDb
    .from('returns')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', o.id)
    .not('status', 'in', '("rejected","cancelled")')
  const eligibility = checkEligibility(order as never, policy, openCount ?? 0)
  if (!eligibility.eligible) {
    return jsonError('Pesanan tidak memenuhi syarat retur', 409, eligibility.reasons)
  }

  // Validate requested items against the order + clamp quantity
  const orderItemMap = new Map(o.items.map((it) => [it.id, it]))
  for (const reqItem of input.items) {
    if (!orderItemMap.has(reqItem.order_item_id)) {
      return jsonError('Salah satu item bukan bagian dari pesanan ini', 422, {
        order_item_id: reqItem.order_item_id,
      })
    }
  }
  const resolvedItems = input.items.map((reqItem) => {
    const src = orderItemMap.get(reqItem.order_item_id)!
    const qty = Math.min(reqItem.quantity, src.quantity)
    return {
      order_item_id: src.id,
      product_id: src.product_id,
      variant_id: src.variant_id,
      product_name: src.product_name,
      variant_name: src.variant_name,
      sku: src.sku,
      image_url: src.image_url,
      quantity: qty,
      unit_price: src.unit_price,
      line_refund_amount: src.unit_price * qty,
      item_reason: reqItem.item_reason ?? null,
    }
  })

  const amount = computeRefundAmount(resolvedItems)

  // Risk scoring (SECURITY DEFINER RPC)
  let riskScore = 0
  let riskFlags: string[] = []
  const { data: risk } = await auth.adminDb.rpc('compute_return_risk', {
    p_profile_id: auth.userId,
    p_order_id: o.id,
    p_amount: amount,
  })
  if (Array.isArray(risk) && risk[0]) {
    riskScore = risk[0].score ?? 0
    riskFlags = (risk[0].flags as string[]) ?? []
  }

  const postStatus = decidePostSubmitStatus(policy, input.return_type, amount, riskScore)
  const now = new Date().toISOString()

  // Insert return header
  const { data: created, error: insErr } = await auth.adminDb
    .from('returns')
    .insert({
      order_id: o.id,
      profile_id: auth.userId,
      policy_id: policy.id !== '00000000-0000-0000-0000-000000000000' ? policy.id : null,
      return_type: input.return_type,
      preferred_resolution: input.preferred_resolution,
      status: postStatus,
      customer_note: input.customer_note ?? null,
      refund_amount: amount,
      risk_score: riskScore,
      risk_flags: riskFlags,
      is_flagged: riskScore >= policy.high_risk_score,
      submitted_at: now,
    })
    .select('id, return_number')
    .single()
  if (insErr) return jsonError('Gagal membuat retur', 500, insErr.message)
  const ret = created as { id: string; return_number: string }

  // Insert items
  const { error: itemsErr } = await auth.adminDb.from('return_items').insert(
    resolvedItems.map((it) => ({ ...it, return_id: ret.id })),
  )
  if (itemsErr) return jsonError('Gagal menyimpan item retur', 500, itemsErr.message)

  // Allergic-reaction usage history → seed an evidence/note record
  if (input.return_type === 'allergic_reaction' && input.usage_history) {
    await auth.adminDb.from('return_notes').insert({
      return_id: ret.id,
      author_id: auth.userId,
      author_type: 'customer',
      visibility: 'internal',
      body: `Riwayat pemakaian: ${input.usage_history}`,
    })
  }

  // Audit log: draft → submitted → postStatus
  await logStatusChange(auth.adminDb, {
    returnId: ret.id,
    from: null,
    to: 'submitted',
    changedBy: auth.userId,
    actorType: 'customer',
    reason: 'Permintaan retur diajukan',
    metadata: { risk_score: riskScore, risk_flags: riskFlags },
  })
  if (postStatus !== 'submitted') {
    await logStatusChange(auth.adminDb, {
      returnId: ret.id,
      from: 'submitted',
      to: postStatus,
      actorType: 'system',
      reason:
        postStatus === 'approved'
          ? 'Auto-approved oleh policy engine'
          : postStatus === 'escalated'
            ? 'Risk score tinggi — dieskalasi'
            : 'Memerlukan tinjauan manual',
    })
  }

  // Notify customer
  await enqueueReturnNotification(auth.adminDb, {
    profileId: auth.userId,
    recipientEmail: auth.email,
    returnId: ret.id,
    returnNumber: ret.return_number,
    status: 'submitted',
  })

  return jsonOk(
    {
      id: ret.id,
      return_number: ret.return_number,
      status: postStatus,
      refund_amount: amount,
      risk_score: riskScore,
      require_evidence: policy.require_evidence,
      min_evidence_count: policy.min_evidence_count,
    },
    { status: 201 },
  )
}
