// Regression test for Milestone 7 Batch 2B finding: five call sites
// (types/database.ts OrderRow, GET /api/orders/[orderNumber],
// GET /api/admin/orders, PATCH /api/admin/orders/[id]/tracking, and the
// customer-facing /order/[orderNumber] page) referenced an orders.shipping_provider
// column that never existed in the schema — only shipping_courier
// (supabase/migrations/001_initial_schema.sql /
// 003_rajaongkir_fields.sql) does. Any SELECT or UPDATE naming the phantom
// column fails outright (PostgREST errors on an unknown column), which broke
// the tracking-submission route with a 500 and silently 404'd the
// order-detail routes.
//
// This asserts the real, live schema directly (never production — the ref
// is asserted below).
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, it, expect, beforeAll } from "vitest";

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

describe.skipIf(!hasStagingCreds)("orders table shipping-courier column contract", () => {
  let admin: SupabaseClient;

  beforeAll(() => {
    if (SUPABASE_URL!.includes(PRODUCTION_REF)) {
      throw new Error("SAFETY ABORT: regression test must not target the production Supabase ref");
    }
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });
  });

  it("shipping_courier is selectable (the real column every route should use)", async () => {
    const { error } = await admin.from("orders").select("id, shipping_courier").limit(1);
    expect(error).toBeNull();
  });

  it("shipping_provider does not exist — a query naming it must error, not silently return null", async () => {
    const { error } = await admin.from("orders").select("id, shipping_provider").limit(1);
    expect(error).not.toBeNull();
  });
});
