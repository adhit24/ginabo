// Regression test for Milestone 7 Batch 2B finding: executiveService.ts and
// attributionService.ts queried a table named "order_refunds" (the real
// table is "refunds", supabase/migrations/004_returns_system.sql) and an
// orders.payment_status column that never existed (orders only has
// `status`; payment status lives on payments.status). Both queries errored
// silently — the callers only logged or ignored `error` and fell back to an
// empty array — so refund totals in the Executive KPI dashboard were always
// zero, and every customer's acquisition-channel attribution in Customer
// 360 silently fell back to "Direct" regardless of their real first-touch
// channel.
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

describe.skipIf(!hasStagingCreds)("refunds table and orders.status column contract", () => {
  let admin: SupabaseClient;

  beforeAll(() => {
    if (SUPABASE_URL!.includes(PRODUCTION_REF)) {
      throw new Error("SAFETY ABORT: regression test must not target the production Supabase ref");
    }
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, { auth: { persistSession: false } });
  });

  it("refunds (not order_refunds) is the real table executiveService/attributionService must query", async () => {
    const { error: realTable } = await admin.from("refunds").select("amount, status, created_at").limit(1);
    expect(realTable).toBeNull();

    const { error: phantomTable } = await admin.from("order_refunds").select("amount").limit(1);
    expect(phantomTable).not.toBeNull();
  });

  it("orders has no payment_status column — validity must be derived from status", async () => {
    const { error } = await admin.from("orders").select("id, payment_status").limit(1);
    expect(error).not.toBeNull();
  });
});
