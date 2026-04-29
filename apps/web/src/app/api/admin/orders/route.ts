import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(q
          ? {
              OR: [
                { orderNumber: { contains: q, mode: "insensitive" } },
                { customer: { name: { contains: q, mode: "insensitive" } } },
                { customer: { email: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {})
      },
      include: { customer: true, payments: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return jsonOk(
      orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalMinor: o.totalMinor,
        currency: o.currency,
        createdAt: o.createdAt,
        customer: { id: o.customerId, name: o.customer.name, email: o.customer.email, phone: o.customer.phone },
        payment: o.payments[0]
          ? { provider: o.payments[0].provider, status: o.payments[0].status, providerRef: o.payments[0].providerRef }
          : null
      }))
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

