// Browser Supabase client — singleton for client components
// Uses @supabase/supabase-js with localStorage-backed session (default browser auth)

import { createClient as _createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let _browserClient: ReturnType<typeof _createClient<Database>> | null = null

/**
 * Returns a singleton Supabase browser client typed against the Ginabo schema.
 * Safe to call multiple times in client components — returns the same instance.
 */
export function createClient() {
  if (_browserClient) return _browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars'
    )
  }

  _browserClient = _createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      storageKey: 'ginabo-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return _browserClient
}

/** Attach the browser session token to authenticated Route Handler requests. */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const client = createClient()
  const { data: { session } } = await client.auth.getSession()
  const headers = new Headers(init.headers)
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}
