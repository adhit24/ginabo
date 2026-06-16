export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const [{ data: customer, error }, { data: orders }, { data: bookings }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, full_name, phone_number, created_at")
          .eq("id", params.id)
          .single(),

        supabase
          .from("orders")
          .select("id, order_number, status, total_amount, created_at, order_items(product_name, quantity, unit_price)")
          .eq("profile_id", params.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("bookings")
          .select("id, booking_number, status, created_at, slot:booking_slots(slot_date, start_time, end_time)")
          .eq("profile_id", params.id)
          .order("created_at", { ascending: false }),
      ]);

    if (error || !customer) return jsonError("Not found", 404);

    return jsonOk({
      id: customer.id,
      name: customer.full_name ?? customer.email ?? "—",
      email: customer.email,
      phone: customer.phone_number,
      createdAt: customer.created_at,
      orders: (orders ?? []).map((o) => ({
        orderNumber: o.order_number,
        status: o.status,
        totalMinor: o.total_amount,
        currency: "IDR",
        createdAt: o.created_at,
        items: (
          (o.order_items as Array<{ product_name: string; quantity: number; unit_price: number }>) ?? []
        ).map((i) => ({
          productName: i.product_name,
          quantity: i.quantity,
          unitPriceMinor: i.unit_price,
        })),
      })),
      bookings: (bookings ?? []).map((b) => {
        const slot = b.slot as unknown as { slot_date: string; start_time: string; end_time: string } | null;
        const startAt = slot ? `${slot.slot_date}T${slot.start_time}+07:00` : "";
        const endAt = slot ? `${slot.slot_date}T${slot.end_time}+07:00` : "";
        return {
          bookingNumber: b.booking_number,
          status: b.status,
          createdAt: b.created_at,
          slot: { startAt, endAt },
        };
      }),
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
