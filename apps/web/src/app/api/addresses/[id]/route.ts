// PATCH  /api/addresses/[id] — update one of the current user's addresses
// DELETE /api/addresses/[id] — delete one of the current user's addresses

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { addressUpdateSchema } from '@/lib/validation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { AddressRow } from '@/types/database'

interface RouteContext {
  params: { id: string }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return jsonError('Silakan login terlebih dahulu', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Request body tidak valid', 400)
  }

  const parsed = addressUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Data alamat tidak valid', 400, parsed.error.flatten())
  }

  if (parsed.data.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false } as never)
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const update: Record<string, unknown> = { ...parsed.data }
  if ('label' in update && !update.label) update.label = null
  if ('address_line2' in update && !update.address_line2) update.address_line2 = null

  const { data, error } = await supabase
    .from('addresses')
    .update(update as never)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return jsonError('Alamat tidak ditemukan', 404, error?.message)

  return jsonOk(data as AddressRow)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return jsonError('Silakan login terlebih dahulu', 401)

  const { data: existing } = await supabase
    .from('addresses')
    .select('id, is_default')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!existing) return jsonError('Alamat tidak ditemukan', 404)

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return jsonError('Gagal menghapus alamat', 500, error.message)

  // Promote the most recently added remaining address to default, if one exists.
  if ((existing as { is_default: boolean }).is_default) {
    const { data: next } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (next) {
      await supabase
        .from('addresses')
        .update({ is_default: true } as never)
        .eq('id', (next as { id: string }).id)
    }
  }

  return jsonOk({ deleted: true })
}
