// PATCH /api/profile — update the current user's profile fields
// (full_name, phone, date_of_birth, gender, avatar_url)

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { profileUpdateSchema } from '@/lib/validation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@/types/database'

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

  const update = {
    ...(parsed.data.full_name !== undefined ? { full_name: parsed.data.full_name } : {}),
    ...(parsed.data.phone !== undefined ? { phone_number: parsed.data.phone } : {}),
    ...(parsed.data.date_of_birth !== undefined ? { date_of_birth: parsed.data.date_of_birth } : {}),
    ...(parsed.data.avatar_url !== undefined ? { avatar_url: parsed.data.avatar_url } : {}),
  }

  const { data, error } = await profiles
    .update(update as never)
    .eq('id', user.id)
    .select('full_name, phone_number, date_of_birth, avatar_url')
    .single()

  if (error || !data) return jsonError('Gagal menyimpan profil', 500, error?.message)

  // Older staging databases may not have this optional column yet. Never
  // make saving the other profile fields fail because of that drift.
  if (parsed.data.gender !== undefined) {
    await profiles.update({ gender: parsed.data.gender }).eq('id', user.id)
  }

  return jsonOk({
    full_name: data.full_name,
    phone: data.phone_number,
    date_of_birth: data.date_of_birth,
    gender: parsed.data.gender ?? null,
    avatar_url: data.avatar_url,
  } as Pick<ProfileRow, 'full_name' | 'phone' | 'date_of_birth' | 'gender' | 'avatar_url'>)
}
