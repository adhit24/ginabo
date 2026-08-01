// PATCH /api/profile — update the current user's profile fields
// (full_name, phone, date_of_birth, gender, avatar_url)

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { profileUpdateSchema } from '@/lib/validation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@/types/database'

export async function PATCH(req: NextRequest) {
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

  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Data profil tidak valid', 400, parsed.error.flatten())
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(parsed.data as never)
    .eq('id', user.id)
    .select('full_name, phone, date_of_birth, gender, avatar_url')
    .single()

  if (error || !data) return jsonError('Gagal menyimpan profil', 500, error?.message)

  return jsonOk(data as Pick<ProfileRow, 'full_name' | 'phone' | 'date_of_birth' | 'gender' | 'avatar_url'>)
}
