export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    let query = supabase
      .from("booking_slots")
      .select("*")
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (start) query = query.gte("slot_date", start);
    if (end) query = query.lte("slot_date", end);

    const { data: slots, error } = await query;
    if (error) throw error;

    // Return in a format compatible with existing UI (startAt/endAt as ISO strings)
    return jsonOk(
      (slots ?? []).map((s) => ({
        id: s.id,
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
      }))
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      slotDate: string;
      startTime: string;
      endTime: string;
      capacity?: number;
      slotType?: string;
    };

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
