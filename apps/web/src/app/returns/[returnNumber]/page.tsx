"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/returns/StatusBadge";
import { RETURN_STATUS_LABELS, RETURN_TYPE_LABELS, type ReturnStatus, type ReturnType } from "@/types/returns";

interface ReturnDetail {
  id: string;
  return_number: string;
  status: ReturnStatus;
  return_type: ReturnType;
  preferred_resolution: string;
  customer_note: string | null;
  rejection_reason: string | null;
  refund_amount: number;
  return_courier: string | null;
  return_tracking_number: string | null;
  created_at: string;
  order: { order_number: string } | null;
  items: { id: string; product_name: string; variant_name: string | null; image_url: string | null; quantity: number; unit_price: number }[];
  refund: { method: string; amount: number; status: string; voucher_code: string | null }[] | null;
  exchange: { exchange_type: string; new_product_name: string | null; price_difference: number; status: string; tracking_number: string | null }[] | null;
  timeline: { from_status: string | null; to_status: ReturnStatus; actor_type: string; reason: string | null; created_at: string }[];
  notes: { id: string; author_type: string; body: string; created_at: string }[];
  evidence: { id: string; media_type: string; url: string | null; caption: string | null }[];
}

export default function ReturnDetailPage({ params }: { params: { returnNumber: string } }) {
  const { returnNumber } = params;
  const [data, setData] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/returns/${returnNumber}`);
      const json = await res.json();
      if (!json.ok) setError(json.error?.message ?? "Gagal memuat");
      else setData(json.data as ReturnDetail);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnNumber]);

  async function cancel() {
    if (!confirm("Batalkan permintaan retur ini?")) return;
    setCancelling(true);
    await fetch(`/api/returns/${returnNumber}/cancel`, { method: "POST" });
    setCancelling(false);
    void load();
  }

  if (loading) return <div className="py-16 text-center text-sm text-gray-400">Memuat…</div>;
  if (error || !data)
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-gray-500">{error ?? "Retur tidak ditemukan"}</p>
        <Link href="/returns" className="mt-3 inline-block text-sm text-emerald-600 hover:underline">
          ← Pusat Retur
        </Link>
      </main>
    );

  const refund = data.refund?.[0];
  const exchange = data.exchange?.[0];
  const cancellable = ["draft", "submitted", "under_review", "more_evidence_required", "approved", "awaiting_shipment"].includes(
    data.status,
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/returns" className="text-sm text-gray-500 hover:text-gray-900">
        ← Pusat Retur
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold text-gray-900">{data.return_number}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {RETURN_TYPE_LABELS[data.return_type]} · Order {data.order?.order_number ?? "-"}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {data.status === "rejected" && data.rejection_reason && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Alasan penolakan</p>
          <p className="mt-1">{data.rejection_reason}</p>
        </div>
      )}

      {data.status === "awaiting_shipment" && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
          Retur kamu disetujui. Mohon kirim barang kembali dan masukkan nomor resi ke tim kami via WhatsApp.
        </div>
      )}

      {/* Items */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Produk</h2>
        <ul className="space-y-3">
          {data.items.map((it) => (
            <li key={it.id} className="flex items-center gap-3">
              {it.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{it.product_name}</p>
                {it.variant_name && <p className="text-xs text-gray-500">{it.variant_name}</p>}
              </div>
              <p className="text-sm text-gray-700">
                {formatMoney(it.unit_price)} × {it.quantity}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm">
          <span className="text-gray-500">Estimasi refund</span>
          <span className="font-semibold text-gray-900">{formatMoney(data.refund_amount)}</span>
        </div>
      </section>

      {/* Resolution outcome */}
      {refund && (
        <section className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-sm">
          <p className="font-medium text-teal-800">Refund {refund.status === "completed" ? "selesai" : "diproses"}</p>
          <p className="mt-1 text-teal-700">
            {formatMoney(refund.amount)} via {refund.method.replace("_", " ")}
            {refund.voucher_code && (
              <>
                {" "}— kode voucher: <span className="font-mono font-semibold">{refund.voucher_code}</span>
              </>
            )}
          </p>
        </section>
      )}
      {exchange && (
        <section className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-sm">
          <p className="font-medium text-teal-800">Penukaran ({exchange.exchange_type.replace("_", " ")})</p>
          {exchange.new_product_name && <p className="mt-1 text-teal-700">Barang pengganti: {exchange.new_product_name}</p>}
          {exchange.price_difference !== 0 && (
            <p className="mt-1 text-teal-700">
              {exchange.price_difference > 0 ? "Tambahan bayar: " : "Selisih refund: "}
              {formatMoney(Math.abs(exchange.price_difference))}
            </p>
          )}
          {exchange.tracking_number && <p className="mt-1 text-teal-700">Resi: {exchange.tracking_number}</p>}
        </section>
      )}

      {/* Evidence */}
      {data.evidence.length > 0 && (
        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Bukti</h2>
          <div className="flex flex-wrap gap-2">
            {data.evidence.map((ev) =>
              ev.url ? (
                ev.media_type === "video" ? (
                  <video key={ev.id} src={ev.url} controls className="h-24 w-24 rounded-lg object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={ev.id} href={ev.url} target="_blank" rel="noreferrer">
                    <img src={ev.url} alt={ev.caption ?? ""} className="h-24 w-24 rounded-lg object-cover" />
                  </a>
                )
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Riwayat Status</h2>
        <ol className="relative space-y-4 border-l border-gray-200 pl-5">
          {data.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
              <p className="text-sm font-medium text-gray-900">{RETURN_STATUS_LABELS[t.to_status] ?? t.to_status}</p>
              {t.reason && <p className="text-xs text-gray-500">{t.reason}</p>}
              <p className="mt-0.5 text-xs text-gray-400">
                {new Date(t.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Customer-visible notes */}
      {data.notes.length > 0 && (
        <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Pesan dari Tim</h2>
          <ul className="space-y-3">
            {data.notes.map((n) => (
              <li key={n.id} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                {n.body}
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cancellable && (
        <button
          onClick={cancel}
          disabled={cancelling}
          className="mt-6 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
        >
          {cancelling ? "Membatalkan…" : "Batalkan Permintaan Retur"}
        </button>
      )}
    </main>
  );
}
