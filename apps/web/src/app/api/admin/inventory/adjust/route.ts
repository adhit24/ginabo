// POST /api/admin/inventory/adjust — Manual Stock Adjustment with Audit Trail

import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'

const adjustSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional().nullable(),
  new_quantity: z.number().int().min(0),
  reason: z.string().min(3).max(500).optional(),
})

export async function POST(req: NextRequest) {
  const auth = await resolveReturnAuth()
  if (!auth) return jsonError('Silakan login terlebih dahulu', 401)
  if (!auth.isAdmin) return jsonError('Akses ditolak', 403)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Body JSON tidak valid', 400)
  }

  const parsed = adjustSchema.safeParse(body)
  if (!parsed.success) return jsonError('Input tidak valid', 422, parsed.error.flatten())
  const input = parsed.data

  const { data: rpcRes, error: rpcErr } = await auth.adminDb.rpc('adjust_inventory_manual', {
    p_product_id: input.product_id,
    p_variant_id: input.variant_id ?? null,
    p_new_quantity: input.new_quantity,
    p_reason: input.reason ?? 'Penyesuaian stok manual admin',
    p_admin_id: auth.adminUserId ?? auth.userId ?? null,
  })

  if (rpcErr) return jsonError('Gagal memperbarui stok', 500, rpcErr.message)

  const result = (Array.isArray(rpcRes) ? rpcRes[0] : rpcRes) as {
    success: boolean
    message: string
    quantity_before: number
    quantity_after: number
  }

  if (!result?.success) {
    return jsonError(result?.message ?? 'Gagal memperbarui stok', 400)
  }

  return jsonOk({
    success: true,
    message: result.message,
    quantity_before: result.quantity_before,
    quantity_after: result.quantity_after,
  })
}
