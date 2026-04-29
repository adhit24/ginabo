import { addMinutes, endOfDay, parseISO, startOfDay } from "date-fns";

import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

function isDatabaseUnavailableError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("Environment variable not found: DATABASE_URL") || msg.includes("Can't reach database server") || msg.includes("P1001");
}

function demoSlotsForDay(day: Date) {
  const base = startOfDay(day);
  const starts = [
    addMinutes(base, 10 * 60),
    addMinutes(base, 13 * 60),
    addMinutes(base, 16 * 60)
  ];
  return starts.map((startAt) => {
    const endAt = addMinutes(startAt, 30);
    const id = `demo-${startAt.toISOString()}`;
    return {
      id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      capacity: 2,
      used: 0,
      remaining: 2,
      isAvailable: true
    };
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    if (!start || !end) return jsonError("Missing start/end", 400);

    const startAt = startOfDay(parseISO(start));
    const endAt = endOfDay(parseISO(end));
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return jsonError("Invalid date", 400);

    try {
      const slots = await prisma.bookingSlot.findMany({
        where: { isActive: true, startAt: { gte: startAt, lte: endAt } },
        orderBy: { startAt: "asc" }
      });

      const counts = await prisma.booking.groupBy({
        by: ["slotId"],
        where: { slotId: { in: slots.map((s) => s.id) }, status: "CONFIRMED" },
        _count: { _all: true }
      });

      const countBySlot = new Map(counts.map((c) => [c.slotId, c._count._all]));

      return jsonOk(
        slots.map((s) => {
          const used = countBySlot.get(s.id) ?? 0;
          const remaining = Math.max(0, s.capacity - used);
          return {
            id: s.id,
            startAt: s.startAt,
            endAt: s.endAt,
            capacity: s.capacity,
            used,
            remaining,
            isAvailable: remaining > 0
          };
        })
      );
    } catch (e) {
      if (!isDatabaseUnavailableError(e)) throw e;
      return jsonOk(demoSlotsForDay(startAt));
    }
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
