import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createAdminSessionToken, getAdminSessionCookieName } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    // Authenticate against the real Supabase Auth user (same account type as
    // every other admin, customer, etc.) rather than the legacy standalone
    // "AdminUser" table, which was never migrated into this project's schema
    // (the live tables are profiles/admin_users) — that made this endpoint
    // fail closed on every attempt, since the lookup always errored.
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (signInError || !signInData.user) return jsonError("Email atau password salah", 401);

    // Authorize: same rule as requireAdminAuth — an active admin_users row,
    // or a profile flagged admin/superadmin.
    const adminDb = createAdminClient();
    const { data: adminUser } = await adminDb
      .from("admin_users")
      .select("id, is_active")
      .eq("profile_id", signInData.user.id)
      .eq("is_active", true)
      .maybeSingle();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .maybeSingle();
    const profileRecord = profile as { role?: string } | null;
    const isProfileAdmin = profileRecord?.role === "admin" || profileRecord?.role === "superadmin";

    if (!adminUser && !isProfileAdmin) return jsonError("Email atau password salah", 401);

    const token = await createAdminSessionToken({
      sub: signInData.user.id,
      role: "ADMIN",
      email: signInData.user.email ?? parsed.data.email,
    });
    const cookieStore = cookies();
    cookieStore.set(getAdminSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return jsonOk({ user: { id: signInData.user.id, email: signInData.user.email, role: "ADMIN" } });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: { message: "Method not allowed" } }, { status: 405 });
}
