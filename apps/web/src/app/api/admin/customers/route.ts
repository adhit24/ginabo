export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();

    let query = supabase
      .from("profiles")
      .select("id, email, full_name, phone_number, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (q) {
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,phone_number.ilike.%${q}%`
      );
    }

    const { data: customers, error } = await query;

    if (error) return jsonError("Server error", 500, error.message);

    return jsonOk(
      (customers ?? []).map((c) => ({
        id: c.id,
        name: c.full_name ?? c.email ?? "—",
        email: c.email,
        phone: c.phone_number,
        createdAt: c.created_at,
      }))
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
