// Server-side Supabase clients — for Server Components, Route Handlers, and Server Actions
// Uses @supabase/ssr so the session is read from (and refreshed via) cookies —
// the same cookies the browser client and middleware read/write.

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

/**
 * Creates a Supabase client for Server Components and Route Handlers.
 * Reads the session from cookies so RLS policies apply for the current user.
 *
 * Usage (App Router server component):
 *   const supabase = await createServerSupabaseClient()
 *   const { data } = await supabase.from('products').select('*')
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component render — cookies() is read-only there.
          // Middleware refreshes the session cookie on every request instead.
        }
      },
    },
  })
}

/**
 * Creates a Supabase admin client using the service role key.
 * Bypasses RLS — use only in trusted server contexts (cron jobs, webhooks, admin APIs).
 * NEVER expose this client to the browser or pass it to client components.
 */
export function createAdminClient() {
  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
