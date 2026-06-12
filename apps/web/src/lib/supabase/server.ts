// Server-side Supabase clients — for Server Components, Route Handlers, and Server Actions
// Uses @supabase/supabase-js with cookie forwarding for session hydration

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

  // Extract the session token from the auth cookie set by the browser client
  const authCookieName = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`
  const sessionCookie = cookieStore.get(authCookieName)?.value ?? null

  const client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: sessionCookie
        ? { Authorization: `Bearer ${_extractAccessToken(sessionCookie)}` }
        : {},
    },
  })

  return client
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

/**
 * Parses a JSON-encoded Supabase session cookie and returns the access_token.
 * Returns an empty string if parsing fails (unauthenticated request).
 */
function _extractAccessToken(rawCookie: string): string {
  try {
    const parsed = JSON.parse(decodeURIComponent(rawCookie)) as unknown
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'access_token' in parsed &&
      typeof (parsed as Record<string, unknown>).access_token === 'string'
    ) {
      return (parsed as { access_token: string }).access_token
    }
    return ''
  } catch {
    return ''
  }
}
