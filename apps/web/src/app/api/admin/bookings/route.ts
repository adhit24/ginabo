export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

type BookingRow = {
  id: string;
  bookingNumber: string;
  status: string;
  createdAt: string;
  notes: string | null;
  slot: { id: string; startAt: string; endAt: string; capacity: number; isActive: boolean };
  customer: { id: string; name: string; email: string | null; phone: string | null };
};

const DUMMY_BOOKINGS: BookingRow[] = [
  { id:"db1", bookingNumber:"BK-20240601-001", status:"confirmed",  createdAt:"2024-06-01T08:00:00Z", notes:"Konsultasi kulit berminyak",        slot:{id:"ds1",startAt:"2024-06-15T10:00:00+07:00",endAt:"2024-06-15T10:30:00+07:00",capacity:2,isActive:true},  customer:{id:"dc1", name:"Siti Rahayu",   email:"siti.rahayu@gmail.com",   phone:"081234567890"} },
  { id:"db2", bookingNumber:"BK-20240602-002", status:"confirmed",  createdAt:"2024-06-02T10:00:00Z", notes:null,                                  slot:{id:"ds2",startAt:"2024-06-15T11:00:00+07:00",endAt:"2024-06-15T11:30:00+07:00",capacity:2,isActive:true},  customer:{id:"dc3", name:"Dewi Kusuma",   email:"dewi.kusuma@yahoo.com",   phone:"083456789012"} },
  { id:"db3", bookingNumber:"BK-20240603-003", status:"pending",    createdAt:"2024-06-03T09:30:00Z", notes:"Alergi produk tertentu",               slot:{id:"ds3",startAt:"2024-06-16T14:00:00+07:00",endAt:"2024-06-16T14:30:00+07:00",capacity:1,isActive:true},  customer:{id:"dc5", name:"Rina Marlina",  email:"rina.marlina@gmail.com",  phone:"085678901234"} },
  { id:"db4", bookingNumber:"BK-20240604-004", status:"completed",  createdAt:"2024-06-04T14:00:00Z", notes:null,                                  slot:{id:"ds4",startAt:"2024-06-10T09:00:00+07:00",endAt:"2024-06-10T09:30:00+07:00",capacity:2,isActive:true},  customer:{id:"dc7", name:"Lia Anggraini", email:"lia.anggraini@outlook.com",phone:"087890123456"} },
  { id:"db5", bookingNumber:"BK-20240605-005", status:"confirmed",  createdAt:"2024-06-05T11:00:00Z", notes:"Perlu rekomendasi skincare routine",   slot:{id:"ds5",startAt:"2024-06-17T10:00:00+07:00",endAt:"2024-06-17T10:30:00+07:00",capacity:1,isActive:true},  customer:{id:"dc9", name:"Mega Putri",    email:"mega.putri@gmail.com",    phone:"089012345678"} },
  { id:"db6", bookingNumber:"BK-20240606-006", status:"cancelled",  createdAt:"2024-06-06T08:00:00Z", notes:null,                                  slot:{id:"ds6",startAt:"2024-06-12T13:00:00+07:00",endAt:"2024-06-12T13:30:00+07:00",capacity:2,isActive:false}, customer:{id:"dc2", name:"Budi Santoso",  email:"budi.santoso@gmail.com",  phone:"082345678901"} },
  { id:"db7", bookingNumber:"BK-20240607-007", status:"completed",  createdAt:"2024-06-07T16:00:00Z", notes:"Kulit sensitif, perlu produk mild",    slot:{id:"ds7",startAt:"2024-06-11T15:00:00+07:00",endAt:"2024-06-11T15:30:00+07:00",capacity:1,isActive:true},  customer:{id:"dc11",name:"Nurul Hidayah", email:"nurul.h@gmail.com",       phone:"082234567890"} },
  { id:"db8", bookingNumber:"BK-20240608-008", status:"confirmed",  createdAt:"2024-06-08T10:30:00Z", notes:null,                                  slot:{id:"ds8",startAt:"2024-06-18T11:00:00+07:00",endAt:"2024-06-18T11:30:00+07:00",capacity:2,isActive:true},  customer:{id:"dc13",name:"Fitriani Sari", email:"fitriani.s@gmail.com",    phone:"084456789012"} },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    let realRows: BookingRow[] = [];

    try {
      let query = supabase
        .from("bookings")
        .select(`
          id, booking_number, status, created_at, notes,
          slot:booking_slots(id, slot_date, start_time, end_time, capacity, is_available),
          customer:profiles(id, full_name, email, phone_number)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (status) query = query.eq("status", status);

      const { data: bookings, error } = await query;
      if (!error && (bookings ?? []).length > 0) {
        realRows = bookings!.map((b) => {
          const slot = b.slot as unknown as { id: string; slot_date: string; start_time: string; end_time: string; capacity: number; is_available: boolean } | null;
          const customer = b.customer as unknown as { id: string; full_name?: string; email?: string; phone_number?: string } | null;
          return {
            id: b.id,
            bookingNumber: b.booking_number,
            status: b.status,
            createdAt: b.created_at,
            notes: b.notes,
            slot: {
              id: slot?.id ?? "",
              startAt: slot ? `${slot.slot_date}T${slot.start_time}+07:00` : "",
              endAt: slot ? `${slot.slot_date}T${slot.end_time}+07:00` : "",
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
        });
      }
    } catch { /* fall through to dummy */ }

    let result = realRows.length > 0 ? realRows : DUMMY_BOOKINGS;

    if (status && realRows.length === 0) {
      result = result.filter((b) => b.status === status);
    }

    if (q) {
      const lq = q.toLowerCase();
      result = result.filter((b) =>
        [b.bookingNumber, b.customer.name, b.customer.email ?? "", b.customer.phone ?? ""].some((x) => x.toLowerCase().includes(lq))
      );
    }

    return jsonOk(result);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { slotId: string; profileId: string; customerName?: string; notes?: string };
    if (!body.slotId || !body.profileId) return jsonError("slotId dan profileId wajib diisi", 400);

    const { data: slot, error: slotError } = await supabase
      .from("booking_slots")
      .select("id, is_available, capacity, booked_count")
      .eq("id", body.slotId)
      .single();

    if (slotError || !slot) return jsonError("Slot tidak ditemukan", 404);
    if (!slot.is_available || slot.booked_count >= slot.capacity) return jsonError("Slot tidak tersedia", 400);

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
