export const runtime = 'edge';

import { addDays, endOfDay, parseISO, startOfDay } from "date-fns";

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
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

    const { data: slots, error } = await supabase
      .from("BookingSlot")
      .select("*")
      .gte("startAt", startAt.toISOString())
      .lte("startAt", endAt.toISOString())
      .order("startAt", { ascending: true });

    if (error) throw error;
    return jsonOk(slots ?? []);
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
      const { data: rule, error: ruleError } = await supabase
        .from("BookingAvailabilityRule")
        .select("*")
        .eq("id", generateFromRuleId)
        .single();

      if (ruleError || !rule) return jsonError("Rule not found", 404);

      const startDate = startOfDay(parseISO(generateStart));
      if (Number.isNaN(startDate.getTime())) return jsonError("Invalid generateStart", 400);

      const days = Math.min(60, Math.max(1, Math.floor(generateDays)));

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
          // Check for existing slot with same startAt + endAt
          const { data: existing } = await supabase
            .from("BookingSlot")
            .select("id")
            .eq("startAt", c.startAt.toISOString())
            .eq("endAt", c.endAt.toISOString())
            .maybeSingle();

          if (existing) continue;

          const { error: insertError } = await supabase
            .from("BookingSlot")
            .insert({
              ruleId: rule.id,
              startAt: c.startAt.toISOString(),
              endAt: c.endAt.toISOString(),
              capacity: rule.capacity,
              isActive: true
            });

          if (!insertError) createdCount++;
        }
      }

      return jsonOk({ created: createdCount });
    }

    const body = await req.json();
    const parsed = bookingSlotSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const { data: created, error } = await supabase
      .from("BookingSlot")
      .insert({
        startAt: new Date(parsed.data.startAt).toISOString(),
        endAt: new Date(parsed.data.endAt).toISOString(),
        capacity: parsed.data.capacity,
        isActive: parsed.data.isActive
      })
      .select()
      .single();

    if (error) throw error;
    return jsonOk({ id: created!.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
