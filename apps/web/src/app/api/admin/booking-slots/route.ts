export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

type SlotRow = {
  id: string;
  ruleId: string | null;
  startAt: string;
  endAt: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  slotType: string | null;
  createdAt: string;
};

// Generate dummy slots for the next 30 days from today
function generateDummySlots(): SlotRow[] {
  const slots: SlotRow[] = [];
  const today = new Date();
  const ruleMap: Record<number, { ruleId: string; times: Array<[string, string]> }> = {
    1: { ruleId: "dr1", times: [["09:00","09:30"],["09:30","10:00"],["10:00","10:30"],["10:30","11:00"],["11:00","11:30"],["11:30","12:00"]] },
    2: { ruleId: "dr2", times: [["13:00","13:30"],["13:30","14:00"],["14:00","14:30"],["14:30","15:00"],["15:00","15:30"],["15:30","16:00"],["16:00","16:30"],["16:30","17:00"]] },
    6: { ruleId: "dr3", times: [["10:00","10:45"],["10:45","11:30"],["11:30","12:15"],["12:15","13:00"],["13:00","13:45"],["13:45","14:30"]] },
  };

  let id = 1;
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const weekday = date.getDay();
    const rule = ruleMap[weekday];
    if (!rule) continue;

    const dateStr = date.toISOString().slice(0, 10);
    for (const [start, end] of rule.times) {
      const bookedCount = Math.random() < 0.3 ? 1 : 0;
      slots.push({
        id: `ds${id++}`,
        ruleId: rule.ruleId,
        startAt: `${dateStr}T${start}:00+07:00`,
        endAt: `${dateStr}T${end}:00+07:00`,
        slotDate: dateStr,
        startTime: start,
        endTime: end,
        capacity: 2,
        bookedCount,
        isActive: true,
        slotType: "online",
        createdAt: new Date(date.getTime() - 86400000 * 7).toISOString(),
      });
    }
  }
  return slots;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    let realRows: SlotRow[] = [];

    try {
      let query = supabase
        .from("booking_slots")
        .select("*")
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (start) query = query.gte("slot_date", start);
      if (end) query = query.lte("slot_date", end);

      const { data: slots, error } = await query;
      if (!error && (slots ?? []).length > 0) {
        realRows = slots!.map((s) => ({
          id: s.id,
          ruleId: s.rule_id ?? null,
          startAt: `${s.slot_date}T${s.start_time}+07:00`,
          endAt: `${s.slot_date}T${s.end_time}+07:00`,
          slotDate: s.slot_date,
          startTime: s.start_time,
          endTime: s.end_time,
          capacity: s.capacity,
          bookedCount: s.booked_count,
          isActive: s.is_available,
          slotType: s.slot_type,
          createdAt: s.created_at,
        }));
      }
    } catch { /* fall through to dummy */ }

    if (realRows.length > 0) {
      return jsonOk(realRows);
    }

    // Filter dummy slots by requested date range
    let dummySlots = generateDummySlots();
    if (start) dummySlots = dummySlots.filter((s) => s.slotDate >= start);
    if (end) dummySlots = dummySlots.filter((s) => s.slotDate <= end);

    return jsonOk(dummySlots);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { slotDate: string; startTime: string; endTime: string; capacity?: number; slotType?: string };
    if (!body.slotDate || !body.startTime || !body.endTime) {
      return jsonError("slotDate, startTime, dan endTime wajib diisi", 400);
    }

    const { data: created, error } = await supabase
      .from("booking_slots")
      .insert({
        slot_date: body.slotDate,
        start_time: body.startTime,
        end_time: body.endTime,
        capacity: body.capacity ?? 1,
        slot_type: body.slotType ?? "online",
        is_available: true,
      })
      .select()
      .single();

    if (error) throw error;
    return jsonOk({ id: created.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
