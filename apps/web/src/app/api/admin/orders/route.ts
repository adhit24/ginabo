// GET /api/admin/orders — Admin order listing handler
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jsonError, jsonOk } from "@/lib/http";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Admin Session Token
    const cookieStore = cookies();
    const token = cookieStore.get(getAdminSessionCookieName())?.value;
    if (!token) return jsonError("Unauthorized — Admin session required", 401);
    const session = await verifyAdminSessionToken(token);
    if (!session) return jsonError("Unauthorized — Invalid admin session", 401);

    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const statusFilter = url.searchParams.get("status")?.trim();

    const admin = createAdminClient();

    let query = admin
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        total_amount,
        shipping_courier,
        tracking_number,
        shipped_at,
        delivered_at,
        created_at,
        profile_id,
        customer:profiles!profile_id(id, full_name, email, phone_number),
        payments(id, provider, status, payment_type, settlement_time, created_at)
      `
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: orders, error } = await query;
    if (error) {
      console.error("[admin-orders] DB error:", error.message);
      return jsonError("Gagal mengambil daftar pesanan", 500, error.message);
    }

    const result = ((orders as any[]) ?? []).map((o) => {
      const customer = o.customer as unknown as {
        id: string;
        full_name?: string;
        email?: string;
        phone_number?: string;
      } | null;
      const payments = Array.isArray(o.payments) ? [...o.payments] : [];
      const sortedPayments = payments.sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestPayment = sortedPayments[0] as
        | { provider?: string; status?: string; payment_type?: string }
        | undefined;

      return {
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        totalMinor: o.total_amount,
        currency: "IDR" as const,
        shippingCourier: o.shipping_courier || null,
        trackingNumber: o.tracking_number || null,
        shippedAt: o.shipped_at || null,
        deliveredAt: o.delivered_at || null,
        createdAt: o.created_at,
        customer: {
          id: customer?.id ?? o.profile_id,
          name: customer?.full_name ?? "—",
          email: customer?.email ?? null,
          phone: customer?.phone_number ?? null,
        },
        payment: latestPayment
          ? {
              provider: latestPayment.provider ?? "doku",
              status: latestPayment.status ?? "pending",
              paymentType: latestPayment.payment_type ?? null,
            }
          : null,
      };
    });

    let filtered = result;
    if (q) {
      const lq = q.toLowerCase();
      filtered = result.filter((o) =>
        [o.orderNumber, o.customer.name, o.customer.email ?? "", o.trackingNumber ?? ""].some((x) =>
          x.toLowerCase().includes(lq)
        )
      );
    }

    return jsonOk(filtered);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
