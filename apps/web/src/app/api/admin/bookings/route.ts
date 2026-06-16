export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    let query = supabase
      .from("bookings")
      .select(`
        id, booking_number, status, created_at, notes,
        slot:booking_slots(id, slot_date, start_time, end_time, capacity, is_available),
        customer:profiles(id, full_name, email, phone_number)
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error } = await query;
    if (error) throw error;

    let results = bookings ?? [];

    if (q) {
      const lower = q.toLowerCase();
      results = results.filter((b) => {
        const customer = b.customer as unknown as { full_name?: string; email?: string; phone_number?: string } | null;
        return (
          b.booking_number?.toLowerCase().includes(lower) ||
          customer?.full_name?.toLowerCase().includes(lower) ||
          customer?.email?.toLowerCase().includes(lower) ||
          customer?.phone_number?.toLowerCase().includes(lower)
        );
      });
    }

    return jsonOk(
      results.map((b) => {
        const slot = b.slot as unknown as {
          id: string; slot_date: string; start_time: string; end_time: string;
          capacity: number; is_available: boolean;
        } | null;
        const customer = b.customer as unknown as {
          id: string; full_name?: string; email?: string; phone_number?: string;
        } | null;

        const startAt = slot ? `${slot.slot_date}T${slot.start_time}+07:00` : "";
        const endAt = slot ? `${slot.slot_date}T${slot.end_time}+07:00` : "";

        return {
          id: b.id,
          bookingNumber: b.booking_number,
          status: b.status,
          createdAt: b.created_at,
          notes: b.notes,
          slot: {
            id: slot?.id ?? "",
            startAt,
            endAt,
            capacity: slot?.capacity ?? 1,
            isActive: slot?.is_available ?? false,
          },
          customer: {
            id: customer?.id ?? "",
            name: customer?.full_name ?? "—",
            email: customer?.email ?? null,
            phone: customer?.phone_number ?? null,
          },
        };
      })
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      slotId: string;
      profileId: string;
      customerName?: string;
      notes?: string;
    };

    if (!body.slotId || !body.profileId) {
      return jsonError("slotId dan profileId wajib diisi", 400);
    }

    // Verify slot available
    const { data: slot, error: slotError } = await supabase
      .from("booking_slots")
      .select("id, is_available, capacity, booked_count")
      .eq("id", body.slotId)
      .single();

    if (slotError || !slot) return jsonError("Slot tidak ditemukan", 404);
    if (!slot.is_available || slot.booked_count >= slot.capacity) {
      return jsonError("Slot tidak tersedia", 400);
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone_number")
      .eq("id", body.profileId)
      .single();

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        profile_id: body.profileId,
        slot_id: body.slotId,
        customer_name: body.customerName ?? profile?.full_name ?? "—",
        customer_email: profile?.email ?? "",
        customer_phone: profile?.phone_number ?? "",
        notes: body.notes ?? null,
        status: "confirmed",
      })
      .select()
      .single();

    if (bookingError || !booking) throw bookingError ?? new Error("Failed to create booking");

    return jsonOk({ bookingNumber: booking.booking_number, id: booking.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
