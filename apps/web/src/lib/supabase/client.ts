// Browser Supabase client — singleton for client components
// Uses @supabase/ssr so the session lives in cookies (readable by middleware
// and Server Components), not just in localStorage.

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { assertSupabaseEnv } from './env'

let _browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Returns a singleton Supabase browser client typed against the Ginabo schema.
 * Safe to call multiple times in client components — returns the same instance.
 */
export function createClient() {
  if (_browserClient) return _browserClient

  const url = assertSupabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = assertSupabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

  _browserClient = createBrowserClient<Database>(url, anonKey)

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
