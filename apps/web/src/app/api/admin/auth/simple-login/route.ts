export const runtime = 'edge';

import { cookies } from "next/headers";

import { createAdminSessionToken, getAdminSessionCookieName } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { ADMIN_CREDS } from "@/lib/adminStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) return jsonError("Invalid input", 400);
    if (username !== ADMIN_CREDS.username || password !== ADMIN_CREDS.password) {
      return jsonError("Username atau password salah", 401);
    }

    const token = await createAdminSessionToken({
      sub: "ginabo_admin",
      role: "ADMIN",
      email: "admin@ginabo.id",
    });

    const cookieStore = cookies();
    cookieStore.set(getAdminSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
