export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { generateBookingNumber } from "@/lib/ids";
import { supabase } from "@/lib/supabase";
import { bookingCreateSchema } from "@/lib/validation";
import { enqueueBookingNotifications } from "@/lib/notifications";

function isDatabaseUnavailableError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("Environment variable not found: DATABASE_URL") || msg.includes("Can't reach database server") || msg.includes("P1001");
}

function normalizeString(v?: string) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const customerInput = parsed.data.customer;
    const email = normalizeString(customerInput.email ?? undefined);
    const phone = normalizeString(customerInput.phone ?? undefined);
    const notes = normalizeString(parsed.data.notes ?? undefined);

    try {
      // Fetch the slot
      const { data: slot, error: slotError } = await supabase
        .from("BookingSlot")
        .select("*")
        .eq("id", parsed.data.slotId)
        .single();

      if (slotError || !slot || !slot.isActive) {
        return jsonError("Slot tidak tersedia", 400);
      }

      // Count confirmed bookings for this slot
      const { count: usedCount } = await supabase
        .from("Booking")
        .select("*", { count: "exact", head: true })
        .eq("slotId", slot.id)
        .eq("status", "CONFIRMED");

      const used = usedCount ?? 0;
      if (used >= slot.capacity) return jsonError("Slot penuh", 400);

      // Upsert customer
      let customerId: string;

      if (email) {
        const { data: existing } = await supabase
          .from("Customer")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          const { data: updated } = await supabase
            .from("Customer")
            .update({ name: customerInput.name, phone: phone ?? existing.phone })
            .eq("id", existing.id)
            .select()
            .single();
          customerId = updated!.id;
        } else {
          const { data: created } = await supabase
            .from("Customer")
            .insert({ name: customerInput.name, email, phone })
            .select()
            .single();
          customerId = created!.id;
        }
      } else if (phone) {
        const { data: existing } = await supabase
          .from("Customer")
          .select("*")
          .eq("phone", phone)
          .maybeSingle();

        if (existing) {
          const { data: updated } = await supabase
            .from("Customer")
            .update({ name: customerInput.name, email: email ?? existing.email })
            .eq("id", existing.id)
            .select()
            .single();
          customerId = updated!.id;
        } else {
          const { data: created } = await supabase
            .from("Customer")
            .insert({ name: customerInput.name, email, phone })
            .select()
            .single();
          customerId = created!.id;
        }
      } else {
        const { data: created } = await supabase
          .from("Customer")
          .insert({ name: customerInput.name })
          .select()
          .single();
        customerId = created!.id;
      }

      // Generate unique booking number
      let bookingNumber = generateBookingNumber();
      for (let i = 0; i < 3; i++) {
        const { data: exists } = await supabase
          .from("Booking")
          .select("id")
          .eq("bookingNumber", bookingNumber)
          .maybeSingle();
        if (!exists) break;
        bookingNumber = generateBookingNumber();
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("Booking")
        .insert({ bookingNumber, status: "CONFIRMED", customerId, slotId: slot.id, notes })
        .select()
        .single();

      if (bookingError || !booking) throw bookingError ?? new Error("Failed to create booking");

      await enqueueBookingNotifications({
        bookingNumber: booking.bookingNumber,
        customer: { name: customerInput.name, email, phone },
        startAt: slot.startAt
      });

      return jsonOk({
        bookingNumber: booking.bookingNumber,
        slot: { startAt: slot.startAt, endAt: slot.endAt }
      });
    } catch (e) {
      if (!isDatabaseUnavailableError(e)) throw e;
      const slotId = parsed.data.slotId;
      const demoStartAt = slotId.startsWith("demo-") ? new Date(slotId.slice(5)) : new Date();
      const startAt = Number.isNaN(demoStartAt.getTime()) ? new Date() : demoStartAt;
      const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);
      return jsonOk({
        bookingNumber: generateBookingNumber(),
        slot: { startAt, endAt }
      });
    }
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
