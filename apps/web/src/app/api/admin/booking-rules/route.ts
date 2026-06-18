export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { bookingRuleSchema } from "@/lib/validation";

type RuleRow = {
  id: string;
  title: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  capacity: number;
  timezone: string;
  isActive: boolean;
};

const DUMMY_RULES: RuleRow[] = [
  { id:"dr1", title:"Konsultasi Pagi (Senin-Jumat)", weekday:1, startTime:"09:00", endTime:"12:00", slotDurationMinutes:30, capacity:2, timezone:"Asia/Jakarta", isActive:true },
  { id:"dr2", title:"Konsultasi Siang (Selasa-Kamis)", weekday:2, startTime:"13:00", endTime:"17:00", slotDurationMinutes:30, capacity:1, timezone:"Asia/Jakarta", isActive:true },
  { id:"dr3", title:"Konsultasi Sabtu", weekday:6, startTime:"10:00", endTime:"14:00", slotDurationMinutes:45, capacity:1, timezone:"Asia/Jakarta", isActive:true },
];

export async function GET() {
  try {
    let realRows: RuleRow[] = [];

    try {
      const { data: rules, error } = await supabase
        .from("BookingAvailabilityRule")
        .select("*")
        .order("createdAt", { ascending: false });

      if (!error && (rules ?? []).length > 0) {
        realRows = rules!.map((r) => ({
          id: r.id,
          title: r.title,
          weekday: r.weekday,
          startTime: r.startTime ?? r.start_time,
          endTime: r.endTime ?? r.end_time,
          slotDurationMinutes: r.slotDurationMinutes ?? r.slot_duration_minutes ?? 30,
          capacity: r.capacity ?? 1,
          timezone: r.timezone ?? "Asia/Jakarta",
          isActive: r.isActive ?? r.is_active ?? true,
        }));
      }
    } catch { /* fall through to dummy */ }

    return jsonOk(realRows.length > 0 ? realRows : DUMMY_RULES);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookingRuleSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const { data: created, error } = await supabase
      .from("BookingAvailabilityRule")
      .insert(parsed.data)
      .select()
      .single();

    if (error) throw error;
    return jsonOk({ id: created!.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
