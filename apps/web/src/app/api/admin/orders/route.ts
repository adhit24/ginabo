export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    let query = supabase
      .from("orders")
      .select("id, order_number, status, total_amount, created_at, profile_id, customer:profiles(id, full_name, email, phone_number), payments(status, payment_type, created_at)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) throw new Error(error.message);

    let filteredOrders = orders ?? [];

    if (q) {
      const lq = q.toLowerCase();
      filteredOrders = filteredOrders.filter((o) => {
        const customer = o.customer as { full_name?: string; email?: string } | null;
        const matchOrderNumber = o.order_number?.toLowerCase().includes(lq);
        const matchName = customer?.full_name?.toLowerCase().includes(lq);
        const matchEmail = customer?.email?.toLowerCase().includes(lq);
        return matchOrderNumber || matchName || matchEmail;
      });
    }

    return jsonOk(
      filteredOrders.map((o) => {
        const customer = o.customer as { id: string; full_name?: string; email?: string; phone_number?: string } | null;
        const payments = Array.isArray(o.payments) ? [...o.payments] : [];
        const sortedPayments = payments.sort(
          (a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return {
          id: o.id,
          orderNumber: o.order_number,
          status: o.status,
          totalMinor: o.total_amount,
          currency: "IDR",
          createdAt: o.created_at,
          customer: {
            id: customer?.id ?? o.profile_id,
            name: customer?.full_name ?? "—",
            email: customer?.email ?? null,
            phone: customer?.phone_number ?? null,
          },
          payment: sortedPayments[0]
            ? {
                provider: (sortedPayments[0] as { payment_type?: string }).payment_type ?? null,
                status: (sortedPayments[0] as { status?: string }).status ?? null,
                providerRef: null,
              }
            : null,
        };
      })
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
