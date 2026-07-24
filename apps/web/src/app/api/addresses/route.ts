// GET  /api/addresses — list the current user's saved addresses
// POST /api/addresses — create a new address for the current user

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { addressSchema } from '@/lib/validation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { AddressRow } from '@/types/database'

export async function GET(_req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return jsonError('Silakan login terlebih dahulu', 401)

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return jsonError('Gagal memuat alamat', 500, error.message)

  return jsonOk((data ?? []) as AddressRow[])
}

export async function POST(req: NextRequest) {
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

  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Data alamat tidak valid', 400, parsed.error.flatten())
  }

  // A user's very first address is always their default.
  const { count } = await supabase
    .from('addresses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const isFirstAddress = (count ?? 0) === 0
  const makeDefault = parsed.data.is_default || isFirstAddress

  if (makeDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false } as never)
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label: parsed.data.label || null,
      recipient_name: parsed.data.recipient_name,
      phone: parsed.data.phone,
      address_line1: parsed.data.address_line1,
      address_line2: parsed.data.address_line2 || null,
      city: parsed.data.city,
      province: parsed.data.province,
      postal_code: parsed.data.postal_code,
      country: parsed.data.country,
      is_default: makeDefault,
    } as never)
    .select()
    .single()

  if (error || !data) return jsonError('Gagal menyimpan alamat', 500, error?.message)

  return jsonOk(data as AddressRow, { status: 201 })
}
