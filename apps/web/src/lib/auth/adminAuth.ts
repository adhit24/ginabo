import { cookies } from 'next/headers'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server'
import { getAdminSessionCookieName, verifyAdminSessionToken } from '@/lib/auth'
import { jsonError } from '@/lib/http'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface AdminAuthResult {
  authorized: boolean
  adminEmail: string | null
  adminUserId: string | null
  adminDb: SupabaseClient
  errorResponse?: Response
}

/**
 * Enforces admin authorization for Customer 360 and backoffice APIs.
 * Supports:
 *   1. Supabase Auth session with admin verification (profile role or active admin_users)
 *   2. Legacy ginabo_admin_session JWT cookie
 */
export async function requireAdminAuth(req?: Request): Promise<AdminAuthResult> {
  const adminDb = createAdminClient()

  // 1. Check Supabase Auth session
  try {
    const userDb = await createServerSupabaseClient()
    const {
      data: { user },
    } = await userDb.auth.getUser()

    if (user) {
      // Check admin_users table
      const { data: adminUser } = await adminDb
        .from('admin_users')
        .select('id, is_active')
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      // Also check profile role
      const { data: profile } = await adminDb
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const adminUserRecord = adminUser as { id: string; is_active: boolean } | null
      const profileRecord = profile as { role?: string } | null
      const isProfileAdmin = profileRecord?.role === 'admin' || profileRecord?.role === 'superadmin'

      if (adminUserRecord || isProfileAdmin) {
        return {
          authorized: true,
          adminEmail: user.email ?? null,
          adminUserId: adminUserRecord?.id ?? user.id,
          adminDb,
        }
      }
    }
  } catch {
    // Continue to legacy check
  }

  // 2. Check legacy admin JWT session cookie
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(getAdminSessionCookieName())?.value
    if (token) {
      const session = await verifyAdminSessionToken(token)
      if (session && session.role === 'ADMIN') {
        return {
          authorized: true,
          adminEmail: session.email,
          adminUserId: session.userId,
          adminDb,
        }
      }
    }
  } catch {
    // Cookie store or verification failed
  }

  // Unauthorized response
  return {
    authorized: false,
    adminEmail: null,
    adminUserId: null,
    adminDb,
    errorResponse: jsonError('Akses ditolak. Diperlukan autentikasi administrator.', 403),
  }
}

/**
 * Strips any sensitive authentication or internal credentials from customer data before returning to clients.
 */
export function sanitizeCustomerPayload<T extends Record<string, any>>(customer: T): T {
  const sensitiveKeys = [
    'password',
    'password_hash',
    'token',
    'refresh_token',
    'provider_token',
    'auth_metadata',
    'raw_user_meta_data',
    'encrypted_password',
  ]

  const clean = { ...customer }
  for (const key of sensitiveKeys) {
    delete (clean as any)[key]
  }

  return clean
}
