export const runtime = 'edge';

import { cookies } from "next/headers";

import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) return jsonError("Unauthorized", 401);

  const session = await verifyAdminSessionToken(token);
  if (!session) return jsonError("Unauthorized", 401);

  // The signed JWT itself (verified above) is the source of truth for admin
  // identity here, exactly as every other route gated by this legacy cookie
  // (middleware.ts, the admin order PATCH/tracking routes) already trusts
  // it — no separate re-check needed. This used to re-query a standalone
  // "AdminUser" table that was never part of this project's Supabase schema,
  // so the lookup always errored and turned every valid session into a 401.
  return jsonOk({ user: { id: session.userId, email: session.email, role: session.role } });
}
