export const runtime = 'edge';

import { cookies } from "next/headers";

import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) return jsonError("Unauthorized", 401);

  const session = await verifyAdminSessionToken(token);
  if (!session) return jsonError("Unauthorized", 401);

  const { data: user, error } = await supabase
    .from("AdminUser")
    .select("*")
    .eq("id", session.userId)
    .single();
  if (error || !user) return jsonError("Unauthorized", 401);

  return jsonOk({ user: { id: user.id, email: user.email, role: user.role } });
}
