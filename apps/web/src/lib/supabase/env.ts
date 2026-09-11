// Fail-fast Supabase env var access — no fallback to any hardcoded project.
// A missing or placeholder value must break loudly, not silently point at
// whichever Supabase project happens to be hardcoded here.
//
// IMPORTANT: always call this with a literal `process.env.NEXT_PUBLIC_*`
// expression as `value` (e.g. `assertSupabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL")`),
// never `process.env[name]`. Next.js inlines NEXT_PUBLIC_* vars for the Edge
// Runtime by statically matching the literal `process.env.NEXT_PUBLIC_X`
// member expression at build time — a dynamic/bracketed lookup defeats that
// inlining and the value comes back undefined in edge routes.
export function assertSupabaseEnv(value: string | undefined, name: string): string {
  if (!value || value.includes('<')) {
    throw new Error(
      `Missing or placeholder environment variable: ${name}. Set a real value in the current environment (no fallback is used).`
    )
  }
  return value
}
