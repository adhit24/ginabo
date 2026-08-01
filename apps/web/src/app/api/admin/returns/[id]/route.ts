// GET /api/admin/returns/[id] — full admin detail (incl. internal notes, all evidence, risk)

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { resolveReturnAuth } from '@/lib/returns-auth'
import type { ReturnStatus, ReturnType } from '@/types/returns'

interface Ctx {
  params: { id: string }
}

type DummyDetail = {
  id: string; return_number: string; status: ReturnStatus; return_type: ReturnType;
  preferred_resolution: string; customer_note: string | null; rejection_reason: string | null;
  refund_amount: number; risk_score: number; risk_flags: string[]; is_flagged: boolean;
  return_tracking_number: string | null; created_at: string;
  order: { order_number: string; total_amount: number; status: string } | null;
  profile: { id: string; full_name: string | null; email: string | null; phone_number: string | null } | null;
  items: { id: string; product_name: string; variant_name: string | null; quantity: number; unit_price: number; inspection_result: string }[];
  refund: { method: string; amount: number; status: string; voucher_code: string | null }[] | null;
  exchange: { exchange_type: string; price_difference: number; status: string }[] | null;
  timeline: { from_status: string | null; to_status: ReturnStatus; actor_type: string; reason: string | null; created_at: string }[];
  notes: { id: string; author_type: string; visibility: string; body: string; created_at: string }[];
  evidence: { id: string; media_type: string; url: string | null; caption: string | null; usage_history: string | null }[];
};

const DUMMY_DETAILS: Record<string, DummyDetail> = {
  dr1: {
    id:"dr1", return_number:"RTN-20240601-001", status:"submitted", return_type:"defective",
    preferred_resolution:"refund", customer_note:"Produk bocor saat pertama kali dibuka.", rejection_reason:null,
    refund_amount:120000, risk_score:20, risk_flags:[], is_flagged:false, return_tracking_number:null, created_at:"2024-06-01T08:00:00Z",
    order:{order_number:"GNB-20240520-003", total_amount:120000, status:"delivered"},
    profile:{id:"dc1", full_name:"Siti Rahayu", email:"siti.rahayu@gmail.com", phone_number:"081234567890"},
    items:[{id:"ri1", product_name:"Hydra Moist Gel Ultimate", variant_name:null, quantity:1, unit_price:120000, inspection_result:"pending"}],
    refund:null, exchange:null,
    timeline:[{from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-01T08:00:00Z"}],
    notes:[{id:"rn1", author_type:"system", visibility:"internal", body:"Retur diajukan otomatis.", created_at:"2024-06-01T08:01:00Z"}],
    evidence:[],
  },
  dr2: {
    id:"dr2", return_number:"RTN-20240602-002", status:"under_review", return_type:"allergic_reaction",
    preferred_resolution:"refund", customer_note:"Muka memerah setelah 2 hari pemakaian.", rejection_reason:null,
    refund_amount:287999, risk_score:75, risk_flags:["repeat_return","high_value"], is_flagged:true, return_tracking_number:null, created_at:"2024-06-02T10:00:00Z",
    order:{order_number:"GNB-20240515-001", total_amount:287999, status:"delivered"},
    profile:{id:"dc2", full_name:"Budi Santoso", email:"budi.santoso@gmail.com", phone_number:"082345678901"},
    items:[{id:"ri2", product_name:"Ginabo Complete Skin Nutrition Set", variant_name:null, quantity:1, unit_price:287999, inspection_result:"pending"}],
    refund:null, exchange:null,
    timeline:[
      {from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-02T10:00:00Z"},
      {from_status:"submitted", to_status:"under_review", actor_type:"system", reason:"Skor risiko tinggi — perlu tinjauan manual", created_at:"2024-06-02T10:05:00Z"},
    ],
    notes:[{id:"rn2", author_type:"admin", visibility:"internal", body:"Cek riwayat order pelanggan ini sebelum approve.", created_at:"2024-06-02T11:00:00Z"}],
    evidence:[],
  },
  dr3: {
    id:"dr3", return_number:"RTN-20240603-003", status:"approved", return_type:"wrong_item",
    preferred_resolution:"exchange", customer_note:"Dikirim produk salah varian.", rejection_reason:null,
    refund_amount:75000, risk_score:10, risk_flags:[], is_flagged:false, return_tracking_number:null, created_at:"2024-06-03T09:30:00Z",
    order:{order_number:"GNB-20240518-005", total_amount:75000, status:"delivered"},
    profile:{id:"dc3", full_name:"Dewi Kusuma", email:"dewi.kusuma@yahoo.com", phone_number:"083456789012"},
    items:[{id:"ri3", product_name:"Bright & Care Moisture Cream", variant_name:null, quantity:1, unit_price:75000, inspection_result:"pending"}],
    refund:null, exchange:null,
    timeline:[
      {from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-03T09:30:00Z"},
      {from_status:"submitted", to_status:"approved", actor_type:"admin", reason:"Barang salah kirim — konfirmasi gudang.", created_at:"2024-06-03T10:00:00Z"},
    ],
    notes:[], evidence:[],
  },
  dr4: {
    id:"dr4", return_number:"RTN-20240604-004", status:"escalated", return_type:"missing_item",
    preferred_resolution:"refund", customer_note:"2 item tidak ada dalam paket.", rejection_reason:null,
    refund_amount:207999, risk_score:82, risk_flags:["high_value","repeat_return","suspected_fraud"], is_flagged:true, return_tracking_number:null, created_at:"2024-06-04T11:00:00Z",
    order:{order_number:"GNB-20240510-002", total_amount:207999, status:"delivered"},
    profile:{id:"dc4", full_name:"Ahmad Fauzi", email:"ahmad.fauzi@gmail.com", phone_number:"084567890123"},
    items:[{id:"ri4", product_name:"Repair & Glow Set", variant_name:null, quantity:2, unit_price:103999, inspection_result:"pending"}],
    refund:null, exchange:null,
    timeline:[
      {from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-04T11:00:00Z"},
      {from_status:"submitted", to_status:"under_review", actor_type:"system", reason:"Skor risiko tinggi.", created_at:"2024-06-04T11:05:00Z"},
      {from_status:"under_review", to_status:"escalated", actor_type:"admin", reason:"Indikasi kecurangan — eskalasi ke tim fraud.", created_at:"2024-06-04T14:00:00Z"},
    ],
    notes:[{id:"rn4", author_type:"admin", visibility:"internal", body:"Sudah 3x retur dalam 2 bulan terakhir.", created_at:"2024-06-04T14:01:00Z"}],
    evidence:[],
  },
  dr5: {
    id:"dr5", return_number:"RTN-20240605-005", status:"completed", return_type:"defective",
    preferred_resolution:"refund", customer_note:"Tekstur produk berubah, berbau aneh.", rejection_reason:null,
    refund_amount:169999, risk_score:5, risk_flags:[], is_flagged:false, return_tracking_number:"JNE-001234567", created_at:"2024-06-05T14:00:00Z",
    order:{order_number:"GNB-20240505-004", total_amount:169999, status:"delivered"},
    profile:{id:"dc5", full_name:"Rina Marlina", email:"rina.marlina@gmail.com", phone_number:"085678901234"},
    items:[{id:"ri5", product_name:"Bright Renewal Set", variant_name:null, quantity:1, unit_price:169999, inspection_result:"passed"}],
    refund:[{method:"original_payment", amount:169999, status:"completed", voucher_code:null}], exchange:null,
    timeline:[
      {from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-05T14:00:00Z"},
      {from_status:"submitted", to_status:"approved", actor_type:"admin", reason:"Produk rusak terkonfirmasi.", created_at:"2024-06-05T15:00:00Z"},
      {from_status:"approved", to_status:"awaiting_shipment", actor_type:"system", reason:null, created_at:"2024-06-05T15:01:00Z"},
      {from_status:"awaiting_shipment", to_status:"item_received", actor_type:"admin", reason:null, created_at:"2024-06-07T09:00:00Z"},
      {from_status:"item_received", to_status:"quality_inspection", actor_type:"admin", reason:null, created_at:"2024-06-07T10:00:00Z"},
      {from_status:"quality_inspection", to_status:"refund_approved", actor_type:"admin", reason:"QC: item rusak, refund disetujui.", created_at:"2024-06-07T11:00:00Z"},
      {from_status:"refund_approved", to_status:"completed", actor_type:"admin", reason:null, created_at:"2024-06-08T09:00:00Z"},
    ],
    notes:[], evidence:[],
  },
  dr6: { id:"dr6", return_number:"RTN-20240606-006", status:"item_received", return_type:"exchange", preferred_resolution:"exchange", customer_note:null, rejection_reason:null, refund_amount:90000, risk_score:15, risk_flags:[], is_flagged:false, return_tracking_number:"SICEPAT-ABC123", created_at:"2024-06-06T08:00:00Z", order:{order_number:"GNB-20240508-006", total_amount:90000, status:"delivered"}, profile:{id:"dc7", full_name:"Lia Anggraini", email:"lia.anggraini@outlook.com", phone_number:"087890123456"}, items:[{id:"ri6", product_name:"GlowAge Multi-Active Serum", variant_name:null, quantity:1, unit_price:90000, inspection_result:"pending"}], refund:null, exchange:null, timeline:[{from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-06T08:00:00Z"},{from_status:"submitted", to_status:"approved", actor_type:"admin", reason:null, created_at:"2024-06-06T09:00:00Z"},{from_status:"approved", to_status:"awaiting_shipment", actor_type:"system", reason:null, created_at:"2024-06-06T09:01:00Z"},{from_status:"awaiting_shipment", to_status:"item_received", actor_type:"admin", reason:null, created_at:"2024-06-08T10:00:00Z"}], notes:[], evidence:[] },
  dr7: { id:"dr7", return_number:"RTN-20240607-007", status:"rejected", return_type:"other", preferred_resolution:"refund", customer_note:"Tidak puas dengan hasil.", rejection_reason:"Produk digunakan lebih dari 30 hari, di luar batas return policy.", refund_amount:377998, risk_score:65, risk_flags:["late_return"], is_flagged:true, return_tracking_number:null, created_at:"2024-06-07T16:00:00Z", order:{order_number:"GNB-20240501-007", total_amount:377998, status:"delivered"}, profile:{id:"dc8", full_name:"Hendra Wijaya", email:"hendra.w@gmail.com", phone_number:"088901234567"}, items:[{id:"ri7", product_name:"Ginabo Complete Skin Nutrition Set", variant_name:null, quantity:1, unit_price:287999, inspection_result:"pending"},{id:"ri7b", product_name:"Repair & Glow Set", variant_name:null, quantity:1, unit_price:89999, inspection_result:"pending"}], refund:null, exchange:null, timeline:[{from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-07T16:00:00Z"},{from_status:"submitted", to_status:"rejected", actor_type:"admin", reason:"Di luar batas waktu return 30 hari.", created_at:"2024-06-07T17:00:00Z"}], notes:[], evidence:[] },
  dr8: { id:"dr8", return_number:"RTN-20240608-008", status:"awaiting_shipment", return_type:"defective", preferred_resolution:"refund", customer_note:"Pompa dispenser tidak berfungsi.", rejection_reason:null, refund_amount:120000, risk_score:8, risk_flags:[], is_flagged:false, return_tracking_number:null, created_at:"2024-06-08T10:00:00Z", order:{order_number:"GNB-20240522-008", total_amount:120000, status:"delivered"}, profile:{id:"dc9", full_name:"Mega Putri", email:"mega.putri@gmail.com", phone_number:"089012345678"}, items:[{id:"ri8", product_name:"Hydra Moist Gel Ultimate", variant_name:null, quantity:1, unit_price:120000, inspection_result:"pending"}], refund:null, exchange:null, timeline:[{from_status:null, to_status:"submitted", actor_type:"customer", reason:null, created_at:"2024-06-08T10:00:00Z"},{from_status:"submitted", to_status:"approved", actor_type:"admin", reason:"Cacat pabrik terkonfirmasi.", created_at:"2024-06-08T11:00:00Z"},{from_status:"approved", to_status:"awaiting_shipment", actor_type:"system", reason:null, created_at:"2024-06-08T11:01:00Z"}], notes:[{id:"rn8", author_type:"admin", visibility:"customer", body:"Silakan kirim barang ke alamat gudang kami: Jl. Industri No.5, Jakarta Utara. Sertakan nomor retur di dalam paket.", created_at:"2024-06-08T11:02:00Z"}], evidence:[] },
};

export async function GET(_req: NextRequest, { params }: Ctx) {
  let dummy: DummyDetail | undefined;

  try {
    const auth = await resolveReturnAuth()
    if (auth?.isAdmin) {
      const { data: ret, error } = await auth.adminDb
        .from('returns')
        .select(
          `*, order:orders(id, order_number, total_amount, status, shipping_address, delivered_at, created_at),
           profile:profiles(id, full_name, email, phone_number, whatsapp_number),
           items:return_items(*), refund:refunds(*), exchange:exchanges(*)`,
        )
        .eq('id', params.id)
        .maybeSingle()

      if (!error && ret) {
        const { data: timeline } = await auth.adminDb.from('return_status_logs').select('from_status, to_status, actor_type, reason, metadata, created_at').eq('return_id', params.id).order('created_at', { ascending: true })
        const { data: notes } = await auth.adminDb.from('return_notes').select('id, author_type, visibility, body, created_at').eq('return_id', params.id).order('created_at', { ascending: true })
        const { data: evidence } = await auth.adminDb.from('return_evidence').select('id, media_type, storage_path, caption, usage_history, is_validated, created_at').eq('return_id', params.id).order('created_at', { ascending: true })
        const evidenceWithUrls = await Promise.all(
          (evidence ?? []).map(async (ev: { storage_path: string; [k: string]: unknown }) => {
            const { data: signed } = await auth.adminDb.storage.from('return-evidence').createSignedUrl(ev.storage_path, 3600)
            return { ...ev, url: signed?.signedUrl ?? null }
          }),
        )
        return jsonOk({ ...ret, timeline: timeline ?? [], notes: notes ?? [], evidence: evidenceWithUrls })
      }
    }
  } catch { /* fall through to dummy */ }

  dummy = DUMMY_DETAILS[params.id]
  if (!dummy) return jsonError('Retur tidak ditemukan', 404)
  return jsonOk(dummy)
}
