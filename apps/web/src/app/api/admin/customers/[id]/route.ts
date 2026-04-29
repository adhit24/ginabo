import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
        bookings: { orderBy: { createdAt: "desc" }, include: { slot: true } }
      }
    });
    if (!customer) return jsonError("Not found", 404);

    return jsonOk({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      orders: customer.orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalMinor: o.totalMinor,
        currency: o.currency,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({ productName: i.productName, quantity: i.quantity, unitPriceMinor: i.unitPriceMinor }))
      })),
      bookings: customer.bookings.map((b) => ({
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

