export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { data: customer, error } = await supabase
      .from("Customer")
      .select("*, orders:Order(*), bookings:Booking(*)")
      .eq("id", params.id)
      .single();

    if (error) return jsonError("Not found", 404);
    if (!customer) return jsonError("Not found", 404);

    type OrderItem = {
      productName: string;
      quantity: number;
      unitPriceMinor: number;
    };

    type Order = {
      orderNumber: string;
      status: string;
      totalMinor: number;
      currency: string;
      createdAt: string;
      items: OrderItem[];
    };

    type BookingSlot = {
      startAt: string;
      endAt: string;
    };

    type Booking = {
      bookingNumber: string;
      status: string;
      createdAt: string;
      slot: BookingSlot;
    };

    const orders: Order[] = Array.isArray(customer.orders)
      ? (customer.orders as Order[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : [];

    const bookings: Booking[] = Array.isArray(customer.bookings)
      ? (customer.bookings as Booking[]).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : [];

    return jsonOk({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      orders: orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalMinor: o.totalMinor,
        currency: o.currency,
        createdAt: o.createdAt,
        items: Array.isArray(o.items)
          ? o.items.map((i) => ({
              productName: i.productName,
              quantity: i.quantity,
              unitPriceMinor: i.unitPriceMinor
            }))
          : []
      })),
      bookings: bookings.map((b) => ({
        bookingNumber: b.bookingNumber,
        status: b.status,
        createdAt: b.createdAt,
        slot: { startAt: b.slot.startAt, endAt: b.slot.endAt }
      }))
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
