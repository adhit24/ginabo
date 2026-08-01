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
  const addresses = supabase.from('addresses') as any
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
    await addresses
      .update({ is_default: false } as never)
      .eq('profile_id', user.id)
      .eq('is_default', true)
  }

  const update: Record<string, unknown> = {}
  if ('label' in parsed.data) update.label = parsed.data.label || 'Rumah'
  if ('recipient_name' in parsed.data) update.recipient_name = parsed.data.recipient_name
  if ('phone' in parsed.data) update.phone_number = parsed.data.phone
  if ('address_line1' in parsed.data) update.address_line1 = parsed.data.address_line1
  if ('address_line2' in parsed.data) update.address_line2 = parsed.data.address_line2 || null
  if ('city' in parsed.data) update.kota_kabupaten = parsed.data.city
  if ('province' in parsed.data) update.provinsi = parsed.data.province
  if ('postal_code' in parsed.data) update.postal_code = parsed.data.postal_code
  if ('is_default' in parsed.data) update.is_default = parsed.data.is_default

  const { data, error } = await addresses
    .update(update as never)
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .select()
    .single()

  if (error || !data) return jsonError('Alamat tidak ditemukan', 404, error?.message)

  return jsonOk(data as AddressRow)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const supabase = await createServerSupabaseClient()
  const addresses = supabase.from('addresses') as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return jsonError('Silakan login terlebih dahulu', 401)

  const { data: existing } = await addresses
    .select('id, is_default')
    .eq('id', params.id)
    .eq('profile_id', user.id)
    .single()

  if (!existing) return jsonError('Alamat tidak ditemukan', 404)

  const { error } = await addresses
    .delete()
    .eq('id', params.id)
    .eq('profile_id', user.id)

  if (error) return jsonError('Gagal menghapus alamat', 500, error.message)

  // Promote the most recently added remaining address to default, if one exists.
  if ((existing as { is_default: boolean }).is_default) {
    const { data: next } = await addresses
      .select('id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (next) {
      await addresses
        .update({ is_default: true } as never)
        .eq('id', (next as { id: string }).id)
    }
  }

  return jsonOk({ deleted: true })
}
