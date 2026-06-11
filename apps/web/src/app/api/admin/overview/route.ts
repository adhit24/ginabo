export const runtime = 'edge';

import { subDays } from "date-fns";

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const since = subDays(new Date(), 30).toISOString();

    const [
      { count: customers },
      { count: orders },
      { count: bookings },
      { data: recentOrders },
      { count: ordersLast30d },
      { count: bookingsLast30d }
    ] = await Promise.all([
      supabase.from("Customer").select("*", { count: "exact", head: true }),
      supabase.from("Order").select("*", { count: "exact", head: true }),
      supabase.from("Booking").select("*", { count: "exact", head: true }),
      supabase
        .from("Order")
        .select("*, customer:Customer(*)")
        .order("createdAt", { ascending: false })
        .limit(8),
      supabase
        .from("Order")
        .select("*", { count: "exact", head: true })
        .gte("createdAt", since),
      supabase
        .from("Booking")
        .select("*", { count: "exact", head: true })
        .gte("createdAt", since)
    ]);

    return jsonOk({
      totals: { customers: customers ?? 0, orders: orders ?? 0, bookings: bookings ?? 0 },
      last30d: { orders: ordersLast30d ?? 0, bookings: bookingsLast30d ?? 0 },
      recentOrders: (recentOrders ?? []).map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalMinor: o.totalMinor,
        currency: o.currency,
        customerName: o.customer?.name,
        createdAt: o.createdAt
      }))
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
