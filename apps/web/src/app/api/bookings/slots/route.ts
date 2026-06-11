export const runtime = 'edge';

import { addMinutes, endOfDay, parseISO, startOfDay } from "date-fns";

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

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
      const { data: slots, error: slotsError } = await supabase
        .from("BookingSlot")
        .select("*")
        .gte("startAt", startAt.toISOString())
        .lte("startAt", endAt.toISOString())
        .eq("isActive", true)
        .order("startAt", { ascending: true });

      if (slotsError) throw slotsError;

      const slotIds = (slots ?? []).map((s) => s.id);

      const { data: confirmedBookings, error: bookingsError } = await supabase
        .from("Booking")
        .select("slotId")
        .in("slotId", slotIds.length ? slotIds : ["__none__"])
        .eq("status", "CONFIRMED");

      if (bookingsError) throw bookingsError;

      // Count bookings per slot in JS
      const countBySlot = new Map<string, number>();
      for (const b of confirmedBookings ?? []) {
        countBySlot.set(b.slotId, (countBySlot.get(b.slotId) ?? 0) + 1);
      }

      return jsonOk(
        (slots ?? []).map((s) => {
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
