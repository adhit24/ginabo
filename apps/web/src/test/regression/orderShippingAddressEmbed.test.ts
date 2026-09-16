// Regression test for Milestone 7 Batch 2B finding: GET /api/orders/[orderNumber]
// and the customer-facing /order/[orderNumber] page both selected
// `shipping_address:addresses(...)`, PostgREST relationship-embed syntax
// implying a foreign key from orders to an "addresses" table. No such FK
// exists — orders.shipping_address is a plain JSONB snapshot taken at
// checkout time (supabase/migrations/001_initial_schema.sql). PostgREST
// errors on an unresolvable embed, so both order-detail surfaces failed for
// every single order (`error` was truthy, mapped to a generic 404/notFound).
//
// This asserts the real, live schema directly (never production — the ref
// is asserted below): shipping_address is selectable as a plain column, and
// the embed syntax that caused the outage errors.
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

describe.skipIf(!hasStagingCreds)("orders.shipping_address is a JSONB column, not an addresses(...) embed", () => {
  let admin: SupabaseClient;

  beforeAll(() => {
    if (SUPABASE_URL!.includes(PRODUCTION_REF)) {
      throw new Error("SAFETY ABORT: regression test must not target the production Supabase ref");
    }
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });
  });

  it("shipping_address selects as a plain JSONB column", async () => {
    const { error } = await admin.from("orders").select("id, shipping_address").limit(1);
    expect(error).toBeNull();
  });

  it("the addresses(...) embed syntax that broke order-detail routes errors, since no FK exists", async () => {
    const { error } = await admin
      .from("orders")
      .select("id, shipping_address:addresses(recipient_name, phone)")
      .limit(1);
    expect(error).not.toBeNull();
  });
});
