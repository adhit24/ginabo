// GET  /api/addresses — list the current user's saved addresses
// POST /api/addresses — create a new address for the current user

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { addressSchema } from '@/lib/validation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { AddressRow } from '@/types/database'

type DbAddressRow = {
  id: string
  profile_id: string
  label: string
  recipient_name: string
  phone_number: string
  address_line1: string
  address_line2: string | null
  kota_kabupaten: string
  provinsi: string
  postal_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export async function GET(_req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const addresses = supabase.from('addresses') as any
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return jsonError('Silakan login terlebih dahulu', 401)

  const { data, error } = await addresses
    .select('*')
    .eq('profile_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return jsonError('Gagal memuat alamat', 500, error.message)

  return jsonOk((data as DbAddressRow[] ?? []).map((row: DbAddressRow) => ({
    id: row.id,
    user_id: row.profile_id,
    label: row.label,
    recipient_name: row.recipient_name,
    phone: row.phone_number,
    address_line1: row.address_line1,
    address_line2: row.address_line2,
    city: row.kota_kabupaten,
    province: row.provinsi,
    postal_code: row.postal_code,
    country: 'Indonesia',
    is_default: row.is_default,
    created_at: row.created_at,
    updated_at: row.updated_at,
  })) as AddressRow[])
}

export async function POST(req: NextRequest) {
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

  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Data alamat tidak valid', 400, parsed.error.flatten())
  }

  // A user's very first address is always their default.
  const { count } = await addresses
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  const isFirstAddress = (count ?? 0) === 0
  const makeDefault = parsed.data.is_default || isFirstAddress

  if (makeDefault) {
    await addresses
      .update({ is_default: false } as never)
      .eq('profile_id', user.id)
      .eq('is_default', true)
  }

  const { data, error } = await addresses
    .insert({
      profile_id: user.id,
      label: parsed.data.label || 'Rumah',
      recipient_name: parsed.data.recipient_name,
      phone_number: parsed.data.phone,
      address_line1: parsed.data.address_line1,
      address_line2: parsed.data.address_line2 || null,
      kota_kabupaten: parsed.data.city,
      provinsi: parsed.data.province,
      postal_code: parsed.data.postal_code,
      is_default: makeDefault,
    } as never)
    .select()
    .single()

  if (error || !data) return jsonError('Gagal menyimpan alamat', 500, error?.message)

  const saved = data as DbAddressRow
  return jsonOk({
    id: saved.id,
    user_id: saved.profile_id,
    label: saved.label,
    recipient_name: saved.recipient_name,
    phone: saved.phone_number,
    address_line1: saved.address_line1,
    address_line2: saved.address_line2,
    city: saved.kota_kabupaten,
    province: saved.provinsi,
    postal_code: saved.postal_code,
    country: 'Indonesia',
    is_default: saved.is_default,
    created_at: saved.created_at,
    updated_at: saved.updated_at,
  } as AddressRow, { status: 201 })
}
