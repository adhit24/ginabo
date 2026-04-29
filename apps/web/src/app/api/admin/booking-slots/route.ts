import { addDays, endOfDay, parseISO, startOfDay } from "date-fns";

import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { bookingSlotSchema } from "@/lib/validation";
import { generateSlotsForDay } from "@/lib/slots";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    if (!start || !end) return jsonError("Missing start/end", 400);

    const startAt = startOfDay(parseISO(start));
    const endAt = endOfDay(parseISO(end));
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return jsonError("Invalid date", 400);

    const slots = await prisma.bookingSlot.findMany({
      where: { startAt: { gte: startAt, lte: endAt } },
      orderBy: { startAt: "asc" }
    });

    return jsonOk(slots);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const generateFromRuleId = url.searchParams.get("generateFromRuleId");
    const generateStart = url.searchParams.get("generateStart");
    const generateDays = Number(url.searchParams.get("generateDays") ?? "14");

    if (generateFromRuleId && generateStart) {
      const rule = await prisma.bookingAvailabilityRule.findUnique({ where: { id: generateFromRuleId } });
      if (!rule) return jsonError("Rule not found", 404);

      const startDate = startOfDay(parseISO(generateStart));
      if (Number.isNaN(startDate.getTime())) return jsonError("Invalid generateStart", 400);

      const days = Math.min(60, Math.max(1, Math.floor(generateDays)));

      const created = await prisma.$transaction(async (tx) => {
        let createdCount = 0;
        for (let i = 0; i < days; i++) {
          const date = addDays(startDate, i);
          if (date.getDay() !== rule.weekday) continue;
          const candidates = generateSlotsForDay({
            date,
            startTime: rule.startTime,
            endTime: rule.endTime,
            slotDurationMinutes: rule.slotDurationMinutes
          });

          for (const c of candidates) {
            const existing = await tx.bookingSlot.findUnique({
              where: { startAt_endAt: { startAt: c.startAt, endAt: c.endAt } }
            });
            if (existing) continue;
            await tx.bookingSlot.create({
              data: { ruleId: rule.id, startAt: c.startAt, endAt: c.endAt, capacity: rule.capacity, isActive: true }
            });
            createdCount++;
          }
        }
        return createdCount;
      });

      return jsonOk({ created });
    }

    const body = await req.json();
    const parsed = bookingSlotSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const created = await prisma.bookingSlot.create({
      data: {
        startAt: new Date(parsed.data.startAt),
        endAt: new Date(parsed.data.endAt),
        capacity: parsed.data.capacity,
        isActive: parsed.data.isActive
      }
    });
    return jsonOk({ id: created.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

