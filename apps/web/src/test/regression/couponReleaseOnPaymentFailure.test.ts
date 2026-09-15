// Regression test for Milestone 7 Batch 1 finding: when DOKU checkout
// session creation fails synchronously (before the customer ever sees a
// checkout URL), the coupon reservation claimed during order creation must
// be released so the customer can safely retry — instead of being stuck
// against a consumed usage_per_user slot on an order that can never be paid.
//
// This exercises the real, canonical `handle_failed_doku_payment` +
// `claim_checkout_coupon` RPCs against a live Supabase project (never
// production — the ref is asserted below), matching how
// apps/web/src/app/api/checkout/route.ts now calls the failure RPC in its
// DOKU catch block. It is skipped automatically when staging credentials are
// not available (e.g. in CI), consistent with this repo having no DB test
// harness for RPC-level behavior.
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

describe.skipIf(!hasStagingCreds)("checkout: coupon release on DOKU session-creation failure", () => {
  let admin: SupabaseClient;
  let profileId: string;
  let couponId: string;
  let orderId: string;
  const marker = `regtest_${Date.now()}`;

  beforeAll(async () => {
    // Safety: never run against production, even if misconfigured locally.
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

    const { data: coupon, error: couponErr } = await admin
      .from("coupons")
      .insert({
        code: `REGTEST${marker}`.toUpperCase(),
        discount_type: "fixed_idr",
        discount_value: 10000,
        usage_limit: 10,
        usage_per_user: 1,
        applies_to: "all",
        is_active: true,
        starts_at: new Date(Date.now() - 86400000).toISOString(),
      })
      .select()
      .single();
    if (couponErr) throw couponErr;
    couponId = coupon.id;

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        order_number: `REGTEST-${marker}`,
        profile_id: profileId,
        status: "pending",
        subtotal: 100000,
        shipping_cost: 0,
        discount_amount: 10000,
        total_amount: 90000,
        payment_fee: 0,
        checkout_idempotency_key: `${marker}-idem`,
        coupon_id: couponId,
        coupon_code: coupon.code,
        shipping_address: {},
      })
      .select()
      .single();
    if (orderErr) throw orderErr;
    orderId = order.id;
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.from("payments").delete().eq("order_id", orderId);
    await admin.from("coupon_usages").delete().eq("order_id", orderId);
    await admin.from("orders").delete().eq("id", orderId);
    await admin.from("coupons").delete().eq("id", couponId);
    if (profileId) await admin.auth.admin.deleteUser(profileId);
  });

  it("releases the coupon reservation and cancels the order after a failed DOKU session, allowing retry", async () => {
    // 1. Checkout claims the coupon atomically (mirrors route.ts step 10).
    const { data: claimed, error: claimErr } = await admin.rpc("claim_checkout_coupon", {
      p_coupon_id: couponId,
      p_profile_id: profileId,
      p_order_id: orderId,
    });
    expect(claimErr).toBeNull();
    expect(claimed).toBe(true);

    const { count: usageAfterClaim } = await admin
      .from("coupon_usages")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", couponId);
    expect(usageAfterClaim).toBe(1);

    // 2. Persist the failed payment row exactly as route.ts's DOKU catch block does.
    await admin.from("payments").upsert(
      {
        order_id: orderId,
        invoice_number: `REGTEST-${marker}`,
        provider: "doku",
        gross_amount: 90000,
        currency: "IDR",
        status: "failed",
        checkout_url: null,
      },
      { onConflict: "provider,order_id" },
    );

    // 3. This is the fix under test: route.ts now calls this RPC in its DOKU
    // catch block instead of leaving the order pending and the coupon claimed.
    const { data: releaseData, error: releaseErr } = await admin.rpc("handle_failed_doku_payment", {
      p_invoice_number: `REGTEST-${marker}`,
      p_target_status: "FAILED",
      p_raw_notification: { reason: "doku_session_creation_failed" },
    });
    expect(releaseErr).toBeNull();
    const releaseResult = Array.isArray(releaseData) ? releaseData[0] : releaseData;
    expect(releaseResult.success).toBe(true);

    // 4. Order is cancelled, not left dangling as "pending" forever.
    const { data: orderAfter } = await admin.from("orders").select("status").eq("id", orderId).single();
    expect(orderAfter?.status).toBe("cancelled");

    // 5. Coupon reservation is released: usage row gone, used_count back to 0.
    const { count: usageAfterRelease } = await admin
      .from("coupon_usages")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", couponId);
    expect(usageAfterRelease).toBe(0);

    const { data: couponAfter } = await admin.from("coupons").select("used_count").eq("id", couponId).single();
    expect(couponAfter?.used_count).toBe(0);

    // 6. Customer can now retry: claiming the same coupon for a new order succeeds.
    const { data: retryOrder, error: retryOrderErr } = await admin
      .from("orders")
      .insert({
        order_number: `REGTEST-${marker}-retry`,
        profile_id: profileId,
        status: "pending",
        subtotal: 100000,
        shipping_cost: 0,
        discount_amount: 10000,
        total_amount: 90000,
        payment_fee: 0,
        checkout_idempotency_key: `${marker}-idem-retry`,
        coupon_id: couponId,
        coupon_code: `REGTEST${marker}`.toUpperCase(),
        shipping_address: {},
      })
      .select()
      .single();
    expect(retryOrderErr).toBeNull();

    const { data: retryClaimed, error: retryClaimErr } = await admin.rpc("claim_checkout_coupon", {
      p_coupon_id: couponId,
      p_profile_id: profileId,
      p_order_id: retryOrder!.id,
    });
    expect(retryClaimErr).toBeNull();
    expect(retryClaimed).toBe(true);

    // cleanup the retry order (afterAll only knows about the original orderId)
    await admin.from("coupon_usages").delete().eq("order_id", retryOrder!.id);
    await admin.from("orders").delete().eq("id", retryOrder!.id);
  });
});
