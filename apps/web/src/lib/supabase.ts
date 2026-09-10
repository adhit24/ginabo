import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = rawUrl && !rawUrl.includes("<") ? rawUrl : "https://lvmyjtzfohlorocrjvcx.supabase.co";
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = rawKey && !rawKey.includes("<") ? rawKey : "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

