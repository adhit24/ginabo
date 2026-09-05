export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: "IDR" | "USD";
  createdAt: string;
  customer: { id: string; name: string; email: string | null; phone: string | null };
  payment: { provider: string; status: string; providerRef: string | null } | null;
};

const DUMMY_ORDERS: OrderRow[] = [
  { id:"do1",  orderNumber:"GNB-20240601-001", status:"delivered",  totalMinor:287999, currency:"IDR", createdAt:"2024-06-01T08:30:00Z", customer:{id:"dc1", name:"Siti Rahayu",    email:"siti.rahayu@gmail.com",      phone:"081234567890"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-001"} },
  { id:"do2",  orderNumber:"GNB-20240602-002", status:"processing", totalMinor:207999, currency:"IDR", createdAt:"2024-06-02T10:15:00Z", customer:{id:"dc2", name:"Budi Santoso",   email:"budi.santoso@gmail.com",     phone:"082345678901"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-002"} },
  { id:"do3",  orderNumber:"GNB-20240603-003", status:"shipped",    totalMinor:120000, currency:"IDR", createdAt:"2024-06-03T14:00:00Z", customer:{id:"dc3", name:"Dewi Kusuma",    email:"dewi.kusuma@yahoo.com",      phone:"083456789012"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-003"} },
  { id:"do4",  orderNumber:"GNB-20240604-004", status:"pending",    totalMinor:197999, currency:"IDR", createdAt:"2024-06-04T09:20:00Z", customer:{id:"dc4", name:"Ahmad Fauzi",    email:"ahmad.fauzi@gmail.com",      phone:"084567890123"}, payment:{provider:"DOKU",status:"pending",    providerRef:null} },
  { id:"do5",  orderNumber:"GNB-20240605-005", status:"delivered",  totalMinor:169999, currency:"IDR", createdAt:"2024-06-05T11:45:00Z", customer:{id:"dc5", name:"Rina Marlina",   email:"rina.marlina@gmail.com",     phone:"085678901234"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-005"} },
  { id:"do6",  orderNumber:"GNB-20240606-006", status:"cancelled",  totalMinor:75000,  currency:"IDR", createdAt:"2024-06-06T16:00:00Z", customer:{id:"dc6", name:"Yusuf Hidayat",  email:"yusuf.h@gmail.com",          phone:"086789012345"}, payment:{provider:"DOKU",status:"cancel",    providerRef:null} },
  { id:"do7",  orderNumber:"GNB-20240607-007", status:"delivered",  totalMinor:495998, currency:"IDR", createdAt:"2024-06-07T08:00:00Z", customer:{id:"dc7", name:"Lia Anggraini",  email:"lia.anggraini@outlook.com",  phone:"087890123456"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-007"} },
  { id:"do8",  orderNumber:"GNB-20240608-008", status:"processing", totalMinor:90000,  currency:"IDR", createdAt:"2024-06-08T13:30:00Z", customer:{id:"dc8", name:"Hendra Wijaya",  email:"hendra.w@gmail.com",         phone:"088901234567"}, payment:{provider:"DOKU",status:"capture",   providerRef:"MID-008"} },
  { id:"do9",  orderNumber:"GNB-20240609-009", status:"shipped",    totalMinor:377998, currency:"IDR", createdAt:"2024-06-09T10:00:00Z", customer:{id:"dc9", name:"Mega Putri",     email:"mega.putri@gmail.com",       phone:"089012345678"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-009"} },
  { id:"do10", orderNumber:"GNB-20240610-010", status:"delivered",  totalMinor:287999, currency:"IDR", createdAt:"2024-06-10T15:20:00Z", customer:{id:"dc10",name:"Eko Prasetyo",   email:"eko.prasetyo@gmail.com",     phone:"081123456789"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-010"} },
  { id:"do11", orderNumber:"GNB-20240611-011", status:"delivered",  totalMinor:120000, currency:"IDR", createdAt:"2024-06-11T09:00:00Z", customer:{id:"dc11",name:"Nurul Hidayah",  email:"nurul.h@gmail.com",          phone:"082234567890"}, payment:{provider:"DOKU",status:"settlement",providerRef:"MID-011"} },
  { id:"do12", orderNumber:"GNB-20240612-012", status:"pending",    totalMinor:90000,  currency:"IDR", createdAt:"2024-06-12T14:30:00Z", customer:{id:"dc12",name:"Rizky Pratama",  email:"rizky.p@gmail.com",          phone:"083345678901"}, payment:{provider:"DOKU",status:"pending",    providerRef:null} },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    let realRows: OrderRow[] = [];

    try {
      let query = supabase
        .from("orders")
        .select("id, order_number, status, total_amount, created_at, profile_id, customer:profiles!profile_id(id, full_name, email, phone_number), payments(status, payment_type, created_at)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (status) query = query.eq("status", status);

      const { data: orders, error } = await query;
      if (!error && (orders ?? []).length > 0) {
        realRows = orders!.map((o) => {
          const customer = o.customer as unknown as { id: string; full_name?: string; email?: string; phone_number?: string } | null;
          const payments = Array.isArray(o.payments) ? [...o.payments] : [];
          const sortedPayments = payments.sort(
            (a: { created_at: string }, b: { created_at: string }) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          return {
            id: o.id,
            orderNumber: o.order_number,
            status: o.status,
            totalMinor: o.total_amount,
            currency: "IDR" as const,
            createdAt: o.created_at,
            customer: {
              id: customer?.id ?? o.profile_id,
              name: customer?.full_name ?? "—",
              email: customer?.email ?? null,
              phone: customer?.phone_number ?? null,
            },
            payment: sortedPayments[0]
              ? { provider: (sortedPayments[0] as { payment_type?: string }).payment_type ?? "—", status: (sortedPayments[0] as { status?: string }).status ?? "—", providerRef: null }
              : null,
          };
        });
      }
    } catch { /* fall through to dummy */ }

    let result: OrderRow[] = realRows.length > 0 ? realRows : DUMMY_ORDERS;

    if (status && realRows.length === 0) {
      result = result.filter((o) => o.status === status);
    }

    if (q) {
      const lq = q.toLowerCase();
      result = result.filter((o) =>
        [o.orderNumber, o.customer.name, o.customer.email ?? ""].some((x) => x.toLowerCase().includes(lq))
      );
    }

    return jsonOk(result);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
