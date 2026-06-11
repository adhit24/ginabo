export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: { orderNumber: string } }) {
  try {
    const { data: order, error } = await supabase
      .from("Order")
      .select("*, items:OrderItem(*), customer:Customer(*), payments:Payment(*)")
      .eq("orderNumber", params.orderNumber)
      .single();

    if (error || !order) return jsonError("Not found", 404);

    const sortedPayments = Array.isArray(order.payments)
      ? [...order.payments].sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : [];

    return jsonOk({
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotalMinor: order.subtotalMinor,
      totalMinor: order.totalMinor,
      createdAt: order.createdAt,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone
      },
      items: (order.items ?? []).map((i: { productName: string; unitPriceMinor: number; quantity: number }) => ({
        productName: i.productName,
        unitPriceMinor: i.unitPriceMinor,
        quantity: i.quantity
      })),
      payment: sortedPayments[0]
        ? {
            provider: sortedPayments[0].provider,
            status: sortedPayments[0].status,
            providerRef: sortedPayments[0].providerRef
          }
        : null
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
