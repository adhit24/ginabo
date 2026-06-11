export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { bookingRuleSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = bookingRuleSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const { data: updated, error } = await supabase
      .from("BookingAvailabilityRule")
      .update(parsed.data)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return jsonOk({ id: updated!.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("BookingAvailabilityRule")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
