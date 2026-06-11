export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { bookingSlotSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = bookingSlotSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const updateData: Record<string, unknown> = {};
    if (parsed.data.startAt !== undefined) updateData.startAt = new Date(parsed.data.startAt).toISOString();
    if (parsed.data.endAt !== undefined) updateData.endAt = new Date(parsed.data.endAt).toISOString();
    if (parsed.data.capacity !== undefined) updateData.capacity = parsed.data.capacity;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

    const { data: updated, error } = await supabase
      .from("BookingSlot")
      .update(updateData)
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
      .from("BookingSlot")
      .delete()
      .eq("id", params.id);

    if (error) throw error;
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
