import { subDays } from "date-fns";

import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const since = subDays(new Date(), 30);

    const [customers, orders, bookings, recentOrders] = await Promise.all([
      prisma.customer.count(),
      prisma.order.count(),
      prisma.booking.count(),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { customer: true }
      })
    ]);

    const [ordersLast30d, bookingsLast30d] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.booking.count({ where: { createdAt: { gte: since } } })
    ]);

    return jsonOk({
      totals: { customers, orders, bookings },
      last30d: { orders: ordersLast30d, bookings: bookingsLast30d },
      recentOrders: recentOrders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalMinor: o.totalMinor,
        currency: o.currency,
        customerName: o.customer.name,
        createdAt: o.createdAt
      }))
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

