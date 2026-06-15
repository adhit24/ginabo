// Shared auth resolution for return routes.
// Returns the authenticated user, whether they are an admin, and a service-role
// client for privileged writes (status logs, notifications, refunds).

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import type { DB } from '@/lib/returns'

export interface ReturnAuthContext {
  userId: string
  email: string | null
  isAdmin: boolean
  adminUserId: string | null
  userDb: DB
  adminDb: DB
}

export async function resolveReturnAuth(): Promise<ReturnAuthContext | null> {
  const userDb = (await createServerSupabaseClient()) as unknown as DB
  const {
    data: { user },
  } = await userDb.auth.getUser()
  if (!user) return null

  const adminDb = createAdminClient() as unknown as DB
  const { data: adminRecord } = await adminDb
    .from('admin_users')
    .select('id, is_active')
    .eq('profile_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  return {
    userId: user.id,
    email: user.email ?? null,
    isAdmin: adminRecord !== null,
    adminUserId: (adminRecord as { id: string } | null)?.id ?? null,
    userDb,
    adminDb,
  }
}
