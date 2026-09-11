import { createClient } from "@supabase/supabase-js";
import { assertSupabaseEnv } from "./supabase/env";

const supabaseUrl = assertSupabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("<")
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : assertSupabaseEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

