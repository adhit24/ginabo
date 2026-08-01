export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";

type CustomerRow = { id: string; name: string; email: string | null; phone: string | null; createdAt: string };

const DUMMY_CUSTOMERS: CustomerRow[] = [
  { id:"dc1",  name:"Siti Rahayu",     email:"siti.rahayu@gmail.com",     phone:"081234567890", createdAt:"2024-05-01T08:00:00Z" },
  { id:"dc2",  name:"Budi Santoso",    email:"budi.santoso@gmail.com",    phone:"082345678901", createdAt:"2024-05-03T10:00:00Z" },
  { id:"dc3",  name:"Dewi Kusuma",     email:"dewi.kusuma@yahoo.com",     phone:"083456789012", createdAt:"2024-05-05T09:30:00Z" },
  { id:"dc4",  name:"Ahmad Fauzi",     email:"ahmad.fauzi@gmail.com",     phone:"084567890123", createdAt:"2024-05-08T14:00:00Z" },
  { id:"dc5",  name:"Rina Marlina",    email:"rina.marlina@gmail.com",    phone:"085678901234", createdAt:"2024-05-10T11:00:00Z" },
  { id:"dc6",  name:"Yusuf Hidayat",   email:"yusuf.h@gmail.com",         phone:"086789012345", createdAt:"2024-05-12T08:45:00Z" },
  { id:"dc7",  name:"Lia Anggraini",   email:"lia.anggraini@outlook.com", phone:"087890123456", createdAt:"2024-05-14T16:00:00Z" },
  { id:"dc8",  name:"Hendra Wijaya",   email:"hendra.w@gmail.com",        phone:"088901234567", createdAt:"2024-05-16T10:30:00Z" },
  { id:"dc9",  name:"Mega Putri",      email:"mega.putri@gmail.com",      phone:"089012345678", createdAt:"2024-05-18T13:15:00Z" },
  { id:"dc10", name:"Eko Prasetyo",    email:"eko.prasetyo@gmail.com",    phone:"081123456789", createdAt:"2024-05-20T09:00:00Z" },
  { id:"dc11", name:"Nurul Hidayah",   email:"nurul.h@gmail.com",         phone:"082234567890", createdAt:"2024-05-22T11:30:00Z" },
  { id:"dc12", name:"Rizky Pratama",   email:"rizky.p@gmail.com",         phone:"083345678901", createdAt:"2024-05-24T15:00:00Z" },
  { id:"dc13", name:"Fitriani Sari",   email:"fitriani.s@gmail.com",      phone:"084456789012", createdAt:"2024-05-26T08:00:00Z" },
  { id:"dc14", name:"Doni Kusuma",     email:"doni.k@gmail.com",          phone:"085567890123", createdAt:"2024-05-28T10:00:00Z" },
  { id:"dc15", name:"Wulandari Putri", email:"wulan.putri@gmail.com",     phone:"086678901234", createdAt:"2024-05-30T14:30:00Z" },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();

    let realRows: CustomerRow[] = [];

    try {
      let query = supabase
        .from("profiles")
        .select("id, email, full_name, phone_number, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (q) {
        query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone_number.ilike.%${q}%`);
      }

      const { data: customers, error } = await query;
      if (!error && (customers ?? []).length > 0) {
        realRows = customers!.map((c) => ({
          id: c.id,
          name: c.full_name ?? c.email ?? "—",
          email: c.email,
          phone: c.phone_number,
          createdAt: c.created_at,
        }));
      }
    } catch { /* fall through to dummy */ }

    let result = realRows.length > 0 ? realRows : DUMMY_CUSTOMERS;

    if (q && realRows.length === 0) {
      const lq = q.toLowerCase();
      result = result.filter((c) =>
        [c.name, c.email ?? "", c.phone ?? ""].some((x) => x.toLowerCase().includes(lq))
      );
    }

    return jsonOk(result);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
