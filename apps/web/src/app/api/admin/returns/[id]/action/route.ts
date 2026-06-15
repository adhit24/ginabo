// POST /api/admin/returns/[id]/action — drive the return workflow.
// Body: { action: ..., ...payload }
//
// Actions: approve | reject | request_evidence | escalate | assign |
//          mark_received | start_inspection | inspect_item |
//          refund | exchange | complete | add_note | blacklist

import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import {
  canTransition,
  logStatusChange,
  enqueueReturnNotification,
  processRefund,
  getActivePolicy,
} from '@/lib/returns'
import type { ReturnStatus } from '@/types/returns'

const schema = z.object({
  action: z.enum([
    'approve',
    'reject',
    'request_evidence',
    'escalate',
    'assign',
    'mark_received',
    'start_inspection',
    'inspect_item',
    'refund',
    'exchange',
    'complete',
    'add_note',
    'blacklist',
  ]),
  reason: z.string().max(2000).optional(),
  note: z.string().max(2000).optional(),
  visibility: z.enum(['internal', 'customer']).optional(),
  // refund
  refund_method: z.enum(['original_payment', 'store_credit', 'voucher']).optional(),
  refund_amount: z.number().int().nonnegative().optional(),
  // mark_received
  return_tracking_number: z.string().max(120).optional(),
  return_courier: z.string().max(60).optional(),
  // inspect_item
  return_item_id: z.string().uuid().optional(),
  inspection_result: z.enum(['passed', 'failed', 'partial']).optional(),
  inspection_note: z.string().max(1000).optional(),
  restock: z.boolean().optional(),
  // exchange
  exchange_type: z.enum(['same_product', 'different_variant', 'different_product']).optional(),
  new_product_id: z.string().uuid().optional(),
  new_variant_id: z.string().uuid().optional(),
  new_product_name: z.string().max(200).optional(),
  new_value: z.number().int().nonnegative().optional(),
  // blacklist
  blacklist_reason: z.string().max(500).optional(),
})

interface Ctx {
  params: { id: string }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Body JSON tidak valid', 400)
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError('Input tidak valid', 422, parsed.error.flatten())
  const p = parsed.data

  const { data: ret } = await auth.adminDb
    .from('returns')
    .select('id, status, return_number, order_id, profile_id, refund_amount, preferred_resolution')
    .eq('id', params.id)
    .maybeSingle()
  if (!ret) return jsonError('Retur tidak ditemukan', 404)
  const r = ret as {
    id: string
    status: ReturnStatus
    return_number: string
    order_id: string
    profile_id: string
    refund_amount: number
    preferred_resolution: string
  }

  // Resolve customer contact for notifications
  const { data: prof } = await auth.adminDb
    .from('profiles')
    .select('email, whatsapp_number')
    .eq('id', r.profile_id)
    .maybeSingle()
  const email = (prof as { email: string | null } | null)?.email ?? null
  const wa = (prof as { whatsapp_number: string | null } | null)?.whatsapp_number ?? null

  // Helper: transition status with guard + audit + notify
  const transition = async (to: ReturnStatus, reason?: string, extra?: Record<string, unknown>) => {
    if (r.status !== to && !canTransition(r.status, to)) {
      return jsonError(`Transisi status tidak valid: ${r.status} → ${to}`, 409)
    }
    const patch: Record<string, unknown> = { status: to, ...extra }
    if (to === 'under_review' || to === 'approved' || to === 'rejected') {
      patch.reviewed_at = new Date().toISOString()
    }
    if (to === 'completed') patch.completed_at = new Date().toISOString()
    await auth.adminDb.from('returns').update(patch).eq('id', r.id)
    await logStatusChange(auth.adminDb, {
      returnId: r.id,
      from: r.status,
      to,
      changedBy: auth.userId,
      actorType: 'admin',
      reason,
    })
    await enqueueReturnNotification(auth.adminDb, {
      profileId: r.profile_id,
      recipientEmail: email,
      whatsappNumber: wa,
      returnId: r.id,
      returnNumber: r.return_number,
      status: to,
    })
    return null
  }

  switch (p.action) {
    case 'approve': {
      const err = await transition('approved', p.reason ?? 'Disetujui oleh admin')
      if (err) return err
      // Move to awaiting shipment so the customer ships the item back.
      await auth.adminDb.from('returns').update({ status: 'awaiting_shipment' }).eq('id', r.id)
      await logStatusChange(auth.adminDb, {
        returnId: r.id,
        from: 'approved',
        to: 'awaiting_shipment',
        actorType: 'system',
        reason: 'Menunggu pelanggan mengirim barang kembali',
      })
      return jsonOk({ status: 'awaiting_shipment' })
    }

    case 'reject': {
      if (!p.reason) return jsonError('Alasan penolakan wajib diisi', 422)
      await auth.adminDb.from('returns').update({ rejection_reason: p.reason }).eq('id', r.id)
      const err = await transition('rejected', p.reason)
      if (err) return err
      return jsonOk({ status: 'rejected' })
    }

    case 'request_evidence': {
      const err = await transition('more_evidence_required', p.reason ?? 'Butuh bukti tambahan')
      if (err) return err
      if (p.note) {
        await auth.adminDb.from('return_notes').insert({
          return_id: r.id,
          author_id: auth.userId,
          author_type: 'admin',
          visibility: 'customer',
          body: p.note,
        })
      }
      return jsonOk({ status: 'more_evidence_required' })
    }

    case 'escalate': {
      const err = await transition('escalated', p.reason ?? 'Dieskalasi untuk tinjauan lanjutan', {
        is_flagged: true,
      })
      if (err) return err
      return jsonOk({ status: 'escalated' })
    }

    case 'assign': {
      await auth.adminDb.from('returns').update({ assigned_admin_id: auth.adminUserId }).eq('id', r.id)
      return jsonOk({ assigned_admin_id: auth.adminUserId })
    }

    case 'mark_received': {
      const err = await transition('item_received', 'Barang retur diterima', {
        received_at: new Date().toISOString(),
        return_tracking_number: p.return_tracking_number ?? null,
        return_courier: p.return_courier ?? null,
      })
      if (err) return err
      return jsonOk({ status: 'item_received' })
    }

    case 'start_inspection': {
      const err = await transition('quality_inspection', 'Mulai pemeriksaan kualitas')
      if (err) return err
      return jsonOk({ status: 'quality_inspection' })
    }

    case 'inspect_item': {
      if (!p.return_item_id || !p.inspection_result) {
        return jsonError('return_item_id dan inspection_result wajib diisi', 422)
      }
      await auth.adminDb
        .from('return_items')
        .update({
          inspection_result: p.inspection_result,
          inspection_note: p.inspection_note ?? null,
          restock: p.restock ?? false,
        })
        .eq('id', p.return_item_id)
        .eq('return_id', r.id)
      return jsonOk({ ok: true })
    }

    case 'refund': {
      const method = p.refund_method ?? 'original_payment'
      const amount = p.refund_amount ?? r.refund_amount
      if (amount <= 0) return jsonError('Jumlah refund harus lebih dari 0', 422)

      // find original payment
      const { data: pay } = await auth.adminDb
        .from('payments')
        .select('id')
        .eq('order_id', r.order_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const policy = await getActivePolicy(auth.adminDb)
      const result = await processRefund(auth.adminDb, {
        returnId: r.id,
        orderId: r.order_id,
        profileId: r.profile_id,
        paymentId: (pay as { id: string } | null)?.id ?? null,
        method,
        amount,
        storeCreditBonusPct: method === 'store_credit' ? policy.store_credit_bonus_pct : 0,
        processedByAdminId: auth.adminUserId,
      })

      await auth.adminDb.from('returns').update({ refund_amount: amount }).eq('id', r.id)
      const err = await transition('refund_approved', `Refund via ${method}`)
      if (err) return err
      // Mark order refunded
      await auth.adminDb.from('orders').update({ status: 'refunded' }).eq('id', r.order_id)
      return jsonOk(result)
    }

    case 'exchange': {
      if (!p.exchange_type) return jsonError('exchange_type wajib diisi', 422)
      const newValue = p.new_value ?? r.refund_amount
      const priceDiff = newValue - r.refund_amount
      const { data: ex, error: exErr } = await auth.adminDb
        .from('exchanges')
        .insert({
          return_id: r.id,
          order_id: r.order_id,
          profile_id: r.profile_id,
          exchange_type: p.exchange_type,
          new_product_id: p.new_product_id ?? null,
          new_variant_id: p.new_variant_id ?? null,
          new_product_name: p.new_product_name ?? null,
          original_value: r.refund_amount,
          new_value: newValue,
          price_difference: priceDiff,
          status: priceDiff > 0 ? 'awaiting_payment' : 'approved',
          processed_by: auth.adminUserId,
        })
        .select('id, price_difference, status')
        .single()
      if (exErr) return jsonError('Gagal membuat penukaran', 500, exErr.message)

      const err = await transition('exchange_approved', `Penukaran (${p.exchange_type})`)
      if (err) return err
      return jsonOk(ex)
    }

    case 'complete': {
      const err = await transition('completed', p.reason ?? 'Kasus ditutup')
      if (err) return err
      return jsonOk({ status: 'completed' })
    }

    case 'add_note': {
      if (!p.note) return jsonError('Catatan kosong', 422)
      const { data, error } = await auth.adminDb
        .from('return_notes')
        .insert({
          return_id: r.id,
          author_id: auth.userId,
          author_type: 'admin',
          visibility: p.visibility ?? 'internal',
          body: p.note,
        })
        .select('id')
        .single()
      if (error) return jsonError('Gagal menyimpan catatan', 500, error.message)
      return jsonOk({ id: (data as { id: string }).id })
    }

    case 'blacklist': {
      if (!p.blacklist_reason) return jsonError('Alasan blacklist wajib diisi', 422)
      await auth.adminDb.from('return_blacklist').upsert(
        {
          profile_id: r.profile_id,
          reason: p.blacklist_reason,
          blocked_by: auth.adminUserId,
          is_active: true,
        },
        { onConflict: 'profile_id' },
      )
      return jsonOk({ blacklisted: true })
    }

    default:
      return jsonError('Aksi tidak dikenali', 400)
  }
}
