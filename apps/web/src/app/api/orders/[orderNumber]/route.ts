import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { orderNumber: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { items: true, customer: true, payments: { orderBy: { createdAt: "desc" } } }
    });
    if (!order) return jsonError("Not found", 404);
    return jsonOk({
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotalMinor: order.subtotalMinor,
      totalMinor: order.totalMinor,
      createdAt: order.createdAt,
      customer: { name: order.customer.name, email: order.customer.email, phone: order.customer.phone },
      items: order.items.map((i) => ({
        productName: i.productName,
        unitPriceMinor: i.unitPriceMinor,
        quantity: i.quantity
      })),
      payment: order.payments[0]
        ? { provider: order.payments[0].provider, status: order.payments[0].status, providerRef: order.payments[0].providerRef }
        : null
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

