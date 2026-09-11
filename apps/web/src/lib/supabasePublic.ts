import { createClient } from "@supabase/supabase-js";

// Dedicated client for public, unauthenticated catalog reads (product list,
// product detail, category/search data). Deliberately uses only the anon
// key — never the service role — so these reads stay subject to RLS
// ("products: anyone can view active products", etc.) instead of silently
// inheriting whatever elevated privilege the shared admin client happens to
// have configured. Admin/privileged routes must keep using their own
// service-role client, not this one.
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl && !rawUrl.includes("<") ? rawUrl : "https://lvmyjtzfohlorocrjvcx.supabase.co";
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey = rawAnonKey && !rawAnonKey.includes("<") ? rawAnonKey : "placeholder-key";

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
