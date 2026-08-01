export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

type CustomerProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  orders: Array<{
    orderNumber: string; status: string; totalMinor: number; currency: string; createdAt: string;
    items: Array<{ productName: string; quantity: number; unitPriceMinor: number }>;
  }>;
  bookings: Array<{
    bookingNumber: string; status: string; createdAt: string; slot: { startAt: string; endAt: string };
  }>;
};

const DUMMY_PROFILES: Record<string, CustomerProfile> = {
  dc1:  { id:"dc1",  name:"Siti Rahayu",     email:"siti.rahayu@gmail.com",     phone:"081234567890", createdAt:"2024-05-01T08:00:00Z", orders:[{ orderNumber:"GNB-20240601-001", status:"delivered",  totalMinor:287999, currency:"IDR", createdAt:"2024-06-01T08:30:00Z", items:[{productName:"Ginabo Complete Skin Nutrition Set",quantity:1,unitPriceMinor:287999}] }], bookings:[{bookingNumber:"BK-20240601-001",status:"confirmed",createdAt:"2024-06-01T08:00:00Z",slot:{startAt:"2024-06-15T10:00:00+07:00",endAt:"2024-06-15T10:30:00+07:00"}}] },
  dc2:  { id:"dc2",  name:"Budi Santoso",     email:"budi.santoso@gmail.com",    phone:"082345678901", createdAt:"2024-05-03T10:00:00Z", orders:[{ orderNumber:"GNB-20240602-002", status:"processing", totalMinor:207999, currency:"IDR", createdAt:"2024-06-02T10:15:00Z", items:[{productName:"Repair & Glow Set",quantity:1,unitPriceMinor:207999}] }], bookings:[{bookingNumber:"BK-20240606-006",status:"cancelled",createdAt:"2024-06-06T08:00:00Z",slot:{startAt:"2024-06-12T13:00:00+07:00",endAt:"2024-06-12T13:30:00+07:00"}}] },
  dc3:  { id:"dc3",  name:"Dewi Kusuma",      email:"dewi.kusuma@yahoo.com",     phone:"083456789012", createdAt:"2024-05-05T09:30:00Z", orders:[{ orderNumber:"GNB-20240603-003", status:"shipped",    totalMinor:120000, currency:"IDR", createdAt:"2024-06-03T14:00:00Z", items:[{productName:"Hydra Moist Gel Ultimate",quantity:1,unitPriceMinor:120000}] }], bookings:[{bookingNumber:"BK-20240602-002",status:"confirmed",createdAt:"2024-06-02T10:00:00Z",slot:{startAt:"2024-06-15T11:00:00+07:00",endAt:"2024-06-15T11:30:00+07:00"}}] },
  dc4:  { id:"dc4",  name:"Ahmad Fauzi",      email:"ahmad.fauzi@gmail.com",     phone:"084567890123", createdAt:"2024-05-08T14:00:00Z", orders:[{ orderNumber:"GNB-20240604-004", status:"pending",    totalMinor:197999, currency:"IDR", createdAt:"2024-06-04T09:20:00Z", items:[{productName:"Daily Skin Barrier Set",quantity:1,unitPriceMinor:197999}] }], bookings:[] },
  dc5:  { id:"dc5",  name:"Rina Marlina",     email:"rina.marlina@gmail.com",    phone:"085678901234", createdAt:"2024-05-10T11:00:00Z", orders:[{ orderNumber:"GNB-20240605-005", status:"delivered",  totalMinor:169999, currency:"IDR", createdAt:"2024-06-05T11:45:00Z", items:[{productName:"Bright Renewal Set",quantity:1,unitPriceMinor:169999}] }], bookings:[{bookingNumber:"BK-20240603-003",status:"pending",createdAt:"2024-06-03T09:30:00Z",slot:{startAt:"2024-06-16T14:00:00+07:00",endAt:"2024-06-16T14:30:00+07:00"}}] },
  dc6:  { id:"dc6",  name:"Yusuf Hidayat",    email:"yusuf.h@gmail.com",         phone:"086789012345", createdAt:"2024-05-12T08:45:00Z", orders:[{ orderNumber:"GNB-20240606-006", status:"cancelled",  totalMinor:75000,  currency:"IDR", createdAt:"2024-06-06T16:00:00Z", items:[{productName:"Bright & Care Moisture Cream",quantity:1,unitPriceMinor:75000}] }], bookings:[] },
  dc7:  { id:"dc7",  name:"Lia Anggraini",    email:"lia.anggraini@outlook.com", phone:"087890123456", createdAt:"2024-05-14T16:00:00Z", orders:[{ orderNumber:"GNB-20240607-007", status:"delivered",  totalMinor:495998, currency:"IDR", createdAt:"2024-06-07T08:00:00Z", items:[{productName:"Ginabo Complete Skin Nutrition Set",quantity:1,unitPriceMinor:287999},{productName:"Repair & Glow Set",quantity:1,unitPriceMinor:207999}] }], bookings:[{bookingNumber:"BK-20240604-004",status:"completed",createdAt:"2024-06-04T14:00:00Z",slot:{startAt:"2024-06-10T09:00:00+07:00",endAt:"2024-06-10T09:30:00+07:00"}}] },
  dc8:  { id:"dc8",  name:"Hendra Wijaya",    email:"hendra.w@gmail.com",        phone:"088901234567", createdAt:"2024-05-16T10:30:00Z", orders:[{ orderNumber:"GNB-20240608-008", status:"processing", totalMinor:90000,  currency:"IDR", createdAt:"2024-06-08T13:30:00Z", items:[{productName:"GlowAge Multi-Active Serum",quantity:1,unitPriceMinor:90000}] }], bookings:[] },
  dc9:  { id:"dc9",  name:"Mega Putri",       email:"mega.putri@gmail.com",      phone:"089012345678", createdAt:"2024-05-18T13:15:00Z", orders:[{ orderNumber:"GNB-20240609-009", status:"shipped",    totalMinor:377998, currency:"IDR", createdAt:"2024-06-09T10:00:00Z", items:[{productName:"Ginabo Complete Skin Nutrition Set",quantity:1,unitPriceMinor:287999},{productName:"GlowAge Multi-Active Serum",quantity:1,unitPriceMinor:90000}] }], bookings:[{bookingNumber:"BK-20240605-005",status:"confirmed",createdAt:"2024-06-05T11:00:00Z",slot:{startAt:"2024-06-17T10:00:00+07:00",endAt:"2024-06-17T10:30:00+07:00"}}] },
  dc10: { id:"dc10", name:"Eko Prasetyo",     email:"eko.prasetyo@gmail.com",    phone:"081123456789", createdAt:"2024-05-20T09:00:00Z", orders:[{ orderNumber:"GNB-20240610-010", status:"delivered",  totalMinor:287999, currency:"IDR", createdAt:"2024-06-10T15:20:00Z", items:[{productName:"Ginabo Complete Skin Nutrition Set",quantity:1,unitPriceMinor:287999}] }], bookings:[] },
  dc11: { id:"dc11", name:"Nurul Hidayah",    email:"nurul.h@gmail.com",         phone:"082234567890", createdAt:"2024-05-22T11:30:00Z", orders:[{ orderNumber:"GNB-20240611-011", status:"delivered",  totalMinor:120000, currency:"IDR", createdAt:"2024-06-11T09:00:00Z", items:[{productName:"Hydra Moist Gel Ultimate",quantity:1,unitPriceMinor:120000}] }], bookings:[{bookingNumber:"BK-20240607-007",status:"completed",createdAt:"2024-06-07T16:00:00Z",slot:{startAt:"2024-06-11T15:00:00+07:00",endAt:"2024-06-11T15:30:00+07:00"}}] },
  dc12: { id:"dc12", name:"Rizky Pratama",    email:"rizky.p@gmail.com",         phone:"083345678901", createdAt:"2024-05-24T15:00:00Z", orders:[{ orderNumber:"GNB-20240612-012", status:"pending",    totalMinor:90000,  currency:"IDR", createdAt:"2024-06-12T14:30:00Z", items:[{productName:"GlowAge Multi-Active Serum",quantity:1,unitPriceMinor:90000}] }], bookings:[] },
  dc13: { id:"dc13", name:"Fitriani Sari",    email:"fitriani.s@gmail.com",      phone:"084456789012", createdAt:"2024-05-26T08:00:00Z", orders:[], bookings:[{bookingNumber:"BK-20240608-008",status:"confirmed",createdAt:"2024-06-08T10:30:00Z",slot:{startAt:"2024-06-18T11:00:00+07:00",endAt:"2024-06-18T11:30:00+07:00"}}] },
  dc14: { id:"dc14", name:"Doni Kusuma",      email:"doni.k@gmail.com",          phone:"085567890123", createdAt:"2024-05-28T10:00:00Z", orders:[], bookings:[] },
  dc15: { id:"dc15", name:"Wulandari Putri",  email:"wulan.putri@gmail.com",     phone:"086678901234", createdAt:"2024-05-30T14:30:00Z", orders:[], bookings:[] },
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    let result: CustomerProfile | null = null;

    try {
      const [{ data: customer, error }, { data: orders }, { data: bookings }] =
        await Promise.all([
          supabase.from("profiles").select("id, email, full_name, phone_number, created_at").eq("id", params.id).single(),
          supabase.from("orders").select("id, order_number, status, total_amount, created_at, order_items(product_name, quantity, unit_price)").eq("profile_id", params.id).order("created_at", { ascending: false }),
          supabase.from("bookings").select("id, booking_number, status, created_at, slot:booking_slots(slot_date, start_time, end_time)").eq("profile_id", params.id).order("created_at", { ascending: false }),
        ]);

      if (!error && customer) {
        result = {
          id: customer.id,
          name: customer.full_name ?? customer.email ?? "—",
          email: customer.email,
          phone: customer.phone_number,
          createdAt: customer.created_at,
          orders: (orders ?? []).map((o) => ({
            orderNumber: o.order_number,
            status: o.status,
            totalMinor: o.total_amount,
            currency: "IDR",
            createdAt: o.created_at,
            items: ((o.order_items as Array<{ product_name: string; quantity: number; unit_price: number }>) ?? []).map((i) => ({
              productName: i.product_name, quantity: i.quantity, unitPriceMinor: i.unit_price,
            })),
          })),
          bookings: (bookings ?? []).map((b) => {
            const slot = b.slot as unknown as { slot_date: string; start_time: string; end_time: string } | null;
            return {
              bookingNumber: b.booking_number,
              status: b.status,
              createdAt: b.created_at,
              slot: { startAt: slot ? `${slot.slot_date}T${slot.start_time}+07:00` : "", endAt: slot ? `${slot.slot_date}T${slot.end_time}+07:00` : "" },
            };
          }),
        };
      }
    } catch { /* fall through to dummy */ }

    if (!result) {
      const dummy = DUMMY_PROFILES[params.id];
      if (!dummy) return jsonError("Not found", 404);
      result = dummy;
    }

    return jsonOk(result);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
