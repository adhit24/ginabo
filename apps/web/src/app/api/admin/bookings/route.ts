export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { bookingCreateSchema } from "@/lib/validation";
import { generateBookingNumber } from "@/lib/ids";

function normalizeString(v?: string) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    let query = supabase
      .from("Booking")
      .select("*, customer:Customer(*), slot:BookingSlot(*)")
      .order("createdAt", { ascending: false })
      .limit(200);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    let results = bookings ?? [];

    // Apply search filter in JS when q is provided
    if (q) {
      const lower = q.toLowerCase();
      results = results.filter((b) => {
        return (
          b.bookingNumber?.toLowerCase().includes(lower) ||
          b.customer?.name?.toLowerCase().includes(lower) ||
          b.customer?.email?.toLowerCase().includes(lower) ||
          b.customer?.phone?.toLowerCase().includes(lower)
        );
      });
    }

    return jsonOk(
      results.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        status: b.status,
        createdAt: b.createdAt,
        notes: b.notes,
        slot: { id: b.slotId, startAt: b.slot.startAt, endAt: b.slot.endAt, capacity: b.slot.capacity, isActive: b.slot.isActive },
        customer: { id: b.customerId, name: b.customer.name, email: b.customer.email, phone: b.customer.phone }
      }))
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
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

    // Fetch slot
    const { data: slot, error: slotError } = await supabase
      .from("BookingSlot")
      .select("*")
      .eq("id", parsed.data.slotId)
      .single();

    if (slotError || !slot || !slot.isActive) return jsonError("Slot tidak tersedia", 400);

    // Count confirmed bookings
    const { count: usedCount } = await supabase
      .from("Booking")
      .select("*", { count: "exact", head: true })
      .eq("slotId", slot.id)
      .eq("status", "CONFIRMED");

    if ((usedCount ?? 0) >= slot.capacity) return jsonError("Slot penuh", 400);

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

    return jsonOk({ bookingNumber: booking.bookingNumber, id: booking.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
