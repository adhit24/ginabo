export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { bookingRuleSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { data: rules, error } = await supabase
      .from("BookingAvailabilityRule")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return jsonOk(rules ?? []);
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
