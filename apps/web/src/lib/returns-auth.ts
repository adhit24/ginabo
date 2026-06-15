// Shared auth resolution for return routes.
//
// Supports BOTH auth systems used in this codebase:
//   1. Supabase Auth (customer + admins whose profile is in admin_users) — primary.
//   2. Legacy admin JWT cookie (ginabo_admin_session) — the existing /admin panel.
//
// Returns the caller, whether they are an admin, and a service-role client for
// privileged writes (status logs, notifications, refunds).

import { cookies } from 'next/headers'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { getAdminSessionCookieName, verifyAdminSessionToken } from '@/lib/auth'
import type { DB } from '@/lib/returns'

export interface ReturnAuthContext {
  userId: string | null // null when authorized via the legacy admin cookie
  email: string | null
  isAdmin: boolean
  adminUserId: string | null
  userDb: DB // RLS-scoped client (admins via legacy cookie get the service-role client)
  adminDb: DB // service-role client
}

export async function resolveReturnAuth(): Promise<ReturnAuthContext | null> {
  const adminDb = createAdminClient() as unknown as DB

  // ── 1. Supabase Auth ───────────────────────────────────────────────────────
  const userDb = (await createServerSupabaseClient()) as unknown as DB
  const {
    data: { user },
  } = await userDb.auth.getUser()

  if (user) {
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

  // ── 2. Legacy admin JWT cookie (existing /admin panel) ──────────────────────
  const token = (await cookies()).get(getAdminSessionCookieName())?.value
  if (token) {
    try {
      const session = await verifyAdminSessionToken(token)
      if (session) {
        // Try to map the admin email to an admin_users row for assignment/logging.
        let adminUserId: string | null = null
        const { data: prof } = await adminDb
          .from('profiles')
          .select('id')
          .eq('email', session.email)
          .maybeSingle()
        if (prof) {
          const { data: au } = await adminDb
            .from('admin_users')
            .select('id')
            .eq('profile_id', (prof as { id: string }).id)
            .maybeSingle()
          adminUserId = (au as { id: string } | null)?.id ?? null
        }
        return {
          userId: null,
          email: session.email,
          isAdmin: true,
          adminUserId,
          userDb: adminDb, // service-role: legacy admins bypass RLS
          adminDb,
        }
      }
    } catch {
      // fall through — invalid/expired token
    }
  }

  return null
}
