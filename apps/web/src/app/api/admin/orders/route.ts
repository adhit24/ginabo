export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    let query = supabase
      .from("Order")
      .select("*, customer:Customer(*), payments:Payment(*)")
      .order("createdAt", { ascending: false })
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
        const matchOrderNumber = o.orderNumber?.toLowerCase().includes(lq);
        const matchName = o.customer?.name?.toLowerCase().includes(lq);
        const matchEmail = o.customer?.email?.toLowerCase().includes(lq);
        return matchOrderNumber || matchName || matchEmail;
      });
    }

    return jsonOk(
      filteredOrders.map((o) => {
        const sortedPayments = Array.isArray(o.payments)
          ? [...o.payments].sort(
              (a: { createdAt: string }, b: { createdAt: string }) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          : [];

        return {
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalMinor: o.totalMinor,
          currency: o.currency,
          createdAt: o.createdAt,
          customer: {
            id: o.customerId,
            name: o.customer?.name,
            email: o.customer?.email,
            phone: o.customer?.phone
          },
          payment: sortedPayments[0]
            ? {
                provider: sortedPayments[0].provider,
                status: sortedPayments[0].status,
                providerRef: sortedPayments[0].providerRef
              }
            : null
        };
      })
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
