// Regression test for Milestone 7 Batch 2B finding: the AdminUserRow type
// (apps/web/src/types/database.ts) and GET /api/orders/[orderNumber]
// described a stale "admin_users" shape (user_id, email, full_name, role,
// permissions: string[]) that never matched the live schema from
// supabase/migrations/001_initial_schema.sql (profile_id, permissions:
// JSONB, is_active, created_by). The order-detail route queried
// admin_users.eq('user_id', ...) — a column that doesn't exist — so the
// admin-bypass branch always silently failed and treated every admin as a
// plain customer.
//
// This asserts the real, live schema directly (never production — the ref
// is asserted below), so a future migration or type change that drifts
// again fails this test instead of silently degrading admin access.
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
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const STAGING_REF = "qnvrfoidfipjmrmdrvsz";
const PRODUCTION_REF = "lvmyjtzfohlorocrjvcx";

const hasStagingCreds = Boolean(SUPABASE_URL && SERVICE_KEY && SUPABASE_URL.includes(STAGING_REF));

describe.skipIf(!hasStagingCreds)("admin_users table matches the AdminUserRow contract the app queries against", () => {
  let admin: SupabaseClient;
  const marker = `regtest_adminusers_${Date.now()}`;
  let profileId: string;
  let adminUserId: string;

  beforeAll(async () => {
    if (SUPABASE_URL!.includes(PRODUCTION_REF)) {
      throw new Error("SAFETY ABORT: regression test must not target the production Supabase ref");
    }
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });

    const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
      email: `${marker}@example.com`,
      password: `Passw0rd!${marker}`,
      email_confirm: true,
    });
    if (authErr) throw authErr;
    profileId = authUser.user.id;

    const { data: adminUser, error: insertErr } = await admin
      .from("admin_users")
      .insert({ profile_id: profileId, is_active: true, permissions: { orders: true } })
      .select()
      .single();
    if (insertErr) throw insertErr;
    adminUserId = adminUser.id;
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.from("admin_users").delete().eq("id", adminUserId);
    if (profileId) await admin.auth.admin.deleteUser(profileId);
  });

  it("is looked up by profile_id (the real column), matching AdminUserRow and every call site except the fixed one", async () => {
    const { data, error } = await admin
      .from("admin_users")
      .select("id")
      .eq("profile_id", profileId)
      .eq("is_active", true)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.id).toBe(adminUserId);
  });

  it("has no user_id column — the stale query shape this bug used would find nothing", async () => {
    const { data, error } = await admin
      .from("admin_users")
      .select("id")
      // Deliberately using the wrong (pre-fix) column name.
      .eq("user_id", profileId)
      .maybeSingle();
    // PostgREST errors on an unknown column rather than silently returning
    // no rows, which is exactly why the old code's unchecked `error` masked
    // this as "not an admin" instead of surfacing a schema mismatch.
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
});
