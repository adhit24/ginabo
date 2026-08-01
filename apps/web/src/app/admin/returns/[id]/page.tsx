"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/returns/StatusBadge";
import { RETURN_STATUS_LABELS, RETURN_TYPE_LABELS, type ReturnStatus, type ReturnType } from "@/types/returns";

interface AdminReturnDetail {
  id: string;
  return_number: string;
  status: ReturnStatus;
  return_type: ReturnType;
  preferred_resolution: string;
  customer_note: string | null;
  rejection_reason: string | null;
  refund_amount: number;
  risk_score: number;
  risk_flags: string[];
  is_flagged: boolean;
  return_tracking_number: string | null;
  created_at: string;
  order: { order_number: string; total_amount: number; status: string } | null;
  profile: { id: string; full_name: string | null; email: string | null; phone_number: string | null } | null;
  items: { id: string; product_name: string; variant_name: string | null; quantity: number; unit_price: number; inspection_result: string }[];
  refund: { method: string; amount: number; status: string; voucher_code: string | null }[] | null;
  exchange: { exchange_type: string; price_difference: number; status: string }[] | null;
  timeline: { from_status: string | null; to_status: ReturnStatus; actor_type: string; reason: string | null; created_at: string }[];
  notes: { id: string; author_type: string; visibility: string; body: string; created_at: string }[];
  evidence: { id: string; media_type: string; url: string | null; caption: string | null; usage_history: string | null }[];
}

export default function AdminReturnDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<AdminReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // action form state
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<"internal" | "customer">("internal");
  const [refundMethod, setRefundMethod] = useState<"original_payment" | "store_credit" | "voucher">("original_payment");
  const [tracking, setTracking] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/returns/${id}`);
    const json = await res.json();
    if (json.ok) setData(json.data as AdminReturnDetail);
    setLoading(false);
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/returns/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json();
      if (!json.ok) setMsg(json.error?.message ?? "Aksi gagal");
      else {
        setReason("");
        setNote("");
        await load();
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Memuat…</div>;
  if (!data) return <div className="p-6 text-sm text-gray-500">Retur tidak ditemukan.</div>;

  const s = data.status;
  const refund = data.refund?.[0];

  return (
    <div className="p-6">
      <Link href="/admin/returns" className="text-sm text-gray-500 hover:text-gray-900">
        ← Antrean Retur
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-semibold text-gray-900">{data.return_number}</h1>
            <StatusBadge status={s} />
            {data.is_flagged && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                Risk {data.risk_score} · {data.risk_flags.join(", ")}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {RETURN_TYPE_LABELS[data.return_type]} · Penyelesaian diminta: {data.preferred_resolution} · Order{" "}
            {data.order?.order_number}
          </p>
        </div>
      </div>

      {msg && <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{msg}</div>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-5 lg:col-span-2">
          {/* Customer */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Pelanggan</h2>
            <p className="text-sm text-gray-900">{data.profile?.full_name ?? "-"}</p>
            <p className="text-sm text-gray-500">{data.profile?.email}</p>
            <p className="text-sm text-gray-500">{data.profile?.phone_number}</p>
          </section>

          {/* Items */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Produk Diretur</h2>
            <ul className="space-y-2">
              {data.items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-gray-900">{it.product_name}</p>
                    {it.variant_name && <p className="text-xs text-gray-500">{it.variant_name}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      {formatMoney(it.unit_price)} × {it.quantity}
                    </span>
                    {s === "quality_inspection" && (
                      <span className="flex gap-1">
                        <button
                          onClick={() => act("inspect_item", { return_item_id: it.id, inspection_result: "passed", restock: true })}
                          className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100"
                        >
                          Lolos
                        </button>
                        <button
                          onClick={() => act("inspect_item", { return_item_id: it.id, inspection_result: "failed" })}
                          className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                        >
                          Gagal
                        </button>
                      </span>
                    )}
                    {it.inspection_result !== "pending" && (
                      <span className="text-xs text-gray-400">QC: {it.inspection_result}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-500">Total refund</span>
              <span className="font-semibold text-gray-900">{formatMoney(data.refund_amount)}</span>
            </div>
          </section>

          {data.customer_note && (
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Catatan Pelanggan</h2>
              <p className="text-sm text-gray-600">{data.customer_note}</p>
            </section>
          )}

          {/* Evidence */}
          {data.evidence.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Bukti</h2>
              <div className="flex flex-wrap gap-2">
                {data.evidence.map((ev) =>
                  ev.url ? (
                    ev.media_type === "video" ? (
                      <video key={ev.id} src={ev.url} controls className="h-28 w-28 rounded-lg object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <a key={ev.id} href={ev.url} target="_blank" rel="noreferrer">
                        <img src={ev.url} alt="" className="h-28 w-28 rounded-lg object-cover" />
                      </a>
                    )
                  ) : null,
                )}
              </div>
              {data.evidence.some((e) => e.usage_history) && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-medium">Riwayat pemakaian (klaim alergi):</p>
                  {data.evidence.filter((e) => e.usage_history).map((e) => (
                    <p key={e.id}>{e.usage_history}</p>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Timeline */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Timeline</h2>
            <ol className="relative space-y-3 border-l border-gray-200 pl-5">
              {data.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full bg-gray-400 ring-4 ring-white" />
                  <p className="text-sm text-gray-900">
                    {RETURN_STATUS_LABELS[t.to_status] ?? t.to_status}{" "}
                    <span className="text-xs text-gray-400">({t.actor_type})</span>
                  </p>
                  {t.reason && <p className="text-xs text-gray-500">{t.reason}</p>}
                  <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleString("id-ID")}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Catatan Internal & Pesan</h2>
            <ul className="mb-3 space-y-2">
              {data.notes.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-lg p-3 text-sm ${n.visibility === "customer" ? "bg-blue-50 text-blue-800" : "bg-gray-50 text-gray-700"}`}
                >
                  <span className="text-xs font-medium uppercase text-gray-400">
                    {n.author_type} · {n.visibility === "customer" ? "ke pelanggan" : "internal"}
                  </span>
                  <p>{n.body}</p>
                </li>
              ))}
              {data.notes.length === 0 && <li className="text-sm text-gray-400">Belum ada catatan.</li>}
            </ul>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tulis catatan…"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <select
                value={noteVisibility}
                onChange={(e) => setNoteVisibility(e.target.value as "internal" | "customer")}
                className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
              >
                <option value="internal">Internal</option>
                <option value="customer">Kirim ke pelanggan</option>
              </select>
              <button
                onClick={() => act("add_note", { note, visibility: noteVisibility })}
                disabled={busy || !note}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Tambah catatan
              </button>
            </div>
          </section>
        </div>

        {/* Right: action panel */}
        <div className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Aksi</h2>

            {(s === "submitted" || s === "under_review" || s === "escalated" || s === "more_evidence_required") && (
              <div className="space-y-2">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Alasan / catatan (untuk tolak: wajib)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                />
                <button onClick={() => act("approve", { reason })} disabled={busy} className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                  Setujui
                </button>
                <button onClick={() => act("reject", { reason })} disabled={busy || !reason} className="w-full rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  Tolak
                </button>
                <button onClick={() => act("request_evidence", { reason, note: reason })} disabled={busy} className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Minta bukti tambahan
                </button>
                {s !== "escalated" && (
                  <button onClick={() => act("escalate", { reason })} disabled={busy} className="w-full rounded-lg border border-rose-200 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
                    Eskalasi
                  </button>
                )}
              </div>
            )}

            {s === "awaiting_shipment" && (
              <div className="space-y-2">
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Nomor resi balik"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <button onClick={() => act("mark_received", { return_tracking_number: tracking })} disabled={busy} className="w-full rounded-lg bg-cyan-600 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50">
                  Tandai barang diterima
                </button>
              </div>
            )}

            {s === "item_received" && (
              <button onClick={() => act("start_inspection")} disabled={busy} className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
                Mulai pemeriksaan QC
              </button>
            )}

            {(s === "quality_inspection" || s === "approved") && (
              <div className="space-y-2">
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as typeof refundMethod)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="original_payment">Refund ke pembayaran asli</option>
                  <option value="store_credit">Saldo toko</option>
                  <option value="voucher">Voucher</option>
                </select>
                <button onClick={() => act("refund", { refund_method: refundMethod })} disabled={busy} className="w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                  Proses refund {formatMoney(data.refund_amount)}
                </button>
                <button onClick={() => act("exchange", { exchange_type: "same_product", new_value: data.refund_amount })} disabled={busy} className="w-full rounded-lg border border-teal-200 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50">
                  Setujui penukaran
                </button>
              </div>
            )}

            {(s === "refund_approved" || s === "exchange_approved") && (
              <button onClick={() => act("complete")} disabled={busy} className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                Tutup kasus (selesai)
              </button>
            )}

            {["completed", "rejected", "cancelled"].includes(s) && (
              <p className="text-sm text-gray-400">Kasus sudah {RETURN_STATUS_LABELS[s].toLowerCase()}.</p>
            )}
          </section>

          {/* Resolution summary */}
          {refund && (
            <section className="rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-sm">
              <p className="font-medium text-teal-800">Refund {refund.status}</p>
              <p className="text-teal-700">
                {formatMoney(refund.amount)} · {refund.method.replace("_", " ")}
              </p>
              {refund.voucher_code && <p className="font-mono text-teal-700">{refund.voucher_code}</p>}
            </section>
          )}

          {/* Fraud */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Fraud</h2>
            <p className="text-sm text-gray-600">Risk score: {data.risk_score}/100</p>
            <button
              onClick={() => {
                const r = prompt("Alasan blacklist pelanggan?");
                if (r) act("blacklist", { blacklist_reason: r });
              }}
              disabled={busy}
              className="mt-2 w-full rounded-lg border border-rose-200 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              Blacklist pelanggan
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
