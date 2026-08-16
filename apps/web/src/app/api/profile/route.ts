// PATCH /api/profile — update the current user's profile fields
// (full_name, phone, date_of_birth, gender, avatar_url)

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { profileUpdateSchema } from '@/lib/validation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@/types/database'
import { normalizeIndonesianPhone } from '@/lib/auth/profileContract'

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const profiles = supabase.from('profiles') as any
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

  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Data profil tidak valid', 400, parsed.error.flatten())
  }

  let normalizedPhone: string | null | undefined
  try {
    normalizedPhone = parsed.data.phone === null
      ? null
      : parsed.data.phone !== undefined
        ? normalizeIndonesianPhone(parsed.data.phone)
        : undefined
  } catch (error) {
    return jsonError('Nomor WhatsApp tidak valid', 400, error instanceof Error ? error.message : String(error))
  }

  const update = {
    ...(parsed.data.full_name !== undefined ? { full_name: parsed.data.full_name.trim() } : {}),
    ...(normalizedPhone !== undefined ? { phone_number: normalizedPhone } : {}),
    ...(parsed.data.date_of_birth !== undefined ? { date_of_birth: parsed.data.date_of_birth } : {}),
    ...(parsed.data.avatar_url !== undefined ? { avatar_url: parsed.data.avatar_url } : {}),
    ...(parsed.data.gender !== undefined ? { gender: parsed.data.gender } : {}),
  }

  const { data, error } = await profiles
    .update(update as never)
    .eq('id', user.id)
    .select('full_name, phone_number, date_of_birth, gender, avatar_url, loyalty_points')
    .single()

  if (error || !data) return jsonError('Gagal menyimpan profil', 500, error?.message)

  return jsonOk({
    full_name: data.full_name,
    phone: data.phone_number,
    date_of_birth: data.date_of_birth,
    gender: data.gender ?? null,
    avatar_url: data.avatar_url,
  } as Pick<ProfileRow, 'full_name' | 'phone' | 'date_of_birth' | 'gender' | 'avatar_url'>)
}
