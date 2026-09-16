// Regression test for Milestone 7 Batch 2B finding: POST /api/admin/auth/login
// looked up credentials in a standalone "AdminUser" table that was never
// migrated into this project's Supabase schema (the live tables are
// profiles/admin_users), so the lookup always errored and login could never
// succeed for any admin. The route now authenticates via Supabase Auth
// (signInWithPassword) and authorizes with the same rule requireAdminAuth()
// already uses elsewhere: an active admin_users row, or profiles.role in
// ('admin', 'superadmin').
//
// This exercises that exact auth + authorization sequence against a real,
// live Supabase project (never production — the ref is asserted below). It
// is skipped automatically when staging credentials are not available.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

function loadLocalEnv(): Record<string, string> {
  const envPath = path.resolve(__dirname, "../../../.env.local");
  if (!existsSync(envPath)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
  }
  return out;
}

const env = { ...loadLocalEnv(), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const STAGING_REF = "qnvrfoidfipjmrmdrvsz";
const PRODUCTION_REF = "lvmyjtzfohlorocrjvcx";

const hasStagingCreds = Boolean(
  SUPABASE_URL && ANON_KEY && SERVICE_KEY && SUPABASE_URL.includes(STAGING_REF)
);

describe.skipIf(!hasStagingCreds)("admin login: authenticates via Supabase Auth + admin_users authorization", () => {
  let admin: SupabaseClient;
  const marker = `regtest_adminlogin_${Date.now()}`;
  const password = `Passw0rd!${marker}`;
  let adminProfileId: string;
  let nonAdminProfileId: string;

  beforeAll(async () => {
    if (SUPABASE_URL!.includes(PRODUCTION_REF)) {
      throw new Error("SAFETY ABORT: regression test must not target the production Supabase ref");
    }
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });

    const { data: adminAuthUser, error: adminAuthErr } = await admin.auth.admin.createUser({
      email: `${marker}_admin@example.com`,
      password,
      email_confirm: true,
    });
    if (adminAuthErr) throw adminAuthErr;
    adminProfileId = adminAuthUser.user.id;

    const { error: adminUsersErr } = await admin.from("admin_users").insert({
      profile_id: adminProfileId,
      is_active: true,
      permissions: {},
    });
    if (adminUsersErr) throw adminUsersErr;

    const { data: nonAdminAuthUser, error: nonAdminAuthErr } = await admin.auth.admin.createUser({
      email: `${marker}_customer@example.com`,
      password,
      email_confirm: true,
    });
    if (nonAdminAuthErr) throw nonAdminAuthErr;
    nonAdminProfileId = nonAdminAuthUser.user.id;
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.from("admin_users").delete().eq("profile_id", adminProfileId);
    if (adminProfileId) await admin.auth.admin.deleteUser(adminProfileId);
    if (nonAdminProfileId) await admin.auth.admin.deleteUser(nonAdminProfileId);
  });

  it("signs in an active admin_users profile and authorizes them", async () => {
    const authClient = createClient(SUPABASE_URL!, ANON_KEY!, { auth: { persistSession: false } });
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: `${marker}_admin@example.com`,
      password,
    });
    expect(signInError).toBeNull();
    expect(signInData.user?.id).toBe(adminProfileId);

    const { data: adminUser } = await admin
      .from("admin_users")
      .select("id, is_active")
      .eq("profile_id", signInData.user!.id)
      .eq("is_active", true)
      .maybeSingle();
    expect(adminUser).not.toBeNull();
  });

  it("rejects a customer profile with no admin_users row and no admin role", async () => {
    const authClient = createClient(SUPABASE_URL!, ANON_KEY!, { auth: { persistSession: false } });
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: `${marker}_customer@example.com`,
      password,
    });
    expect(signInError).toBeNull();
    expect(signInData.user?.id).toBe(nonAdminProfileId);

    const { data: adminUser } = await admin
      .from("admin_users")
      .select("id, is_active")
      .eq("profile_id", signInData.user!.id)
      .eq("is_active", true)
      .maybeSingle();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", signInData.user!.id)
      .maybeSingle();

    expect(adminUser).toBeNull();
    expect(["admin", "superadmin"]).not.toContain((profile as { role?: string } | null)?.role);
  });

  it("rejects a wrong password before any admin_users lookup happens", async () => {
    const authClient = createClient(SUPABASE_URL!, ANON_KEY!, { auth: { persistSession: false } });
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: `${marker}_admin@example.com`,
      password: "definitely-the-wrong-password",
    });
    expect(signInError).not.toBeNull();
    expect(signInData.user).toBeNull();
  });
});
