import { createClient } from "@supabase/supabase-js";

// Dedicated client for public, unauthenticated catalog reads (product list,
// product detail, category/search data). Deliberately uses only the anon
// key — never the service role — so these reads stay subject to RLS
// ("products: anyone can view active products", etc.) instead of silently
// inheriting whatever elevated privilege the shared admin client happens to
// have configured. Admin/privileged routes must keep using their own
// service-role client, not this one.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
