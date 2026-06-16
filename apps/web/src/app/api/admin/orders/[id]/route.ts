export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as { status?: string; paymentStatus?: string };
    const status = typeof body.status === "string" ? body.status : undefined;
    const paymentStatus = typeof body.paymentStatus === "string" ? body.paymentStatus : undefined;

    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", params.id)
      .single();

    if (findError || !order) return jsonError("Not found", 404);

    if (status) {
      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", order.id)
        .select()
        .single();

      if (updateError || !updatedOrder) throw new Error(updateError?.message ?? "Failed to update order");
    }

    if (paymentStatus) {
      const { data: payment } = await supabase
        .from("payments")
        .select("id")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (payment) {
        await supabase
          .from("payments")
          .update({ status: paymentStatus })
          .eq("id", payment.id);
      }
    }

    return jsonOk({ id: order.id, status });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
