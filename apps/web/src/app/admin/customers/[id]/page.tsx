"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Customer360Profile, CustomerSegment } from "@/lib/customers/types";
import { formatMoney } from "@/lib/money";
import { formatWhatsAppUrl } from "@/lib/customers/phoneNormalizer";

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

const SEGMENT_BADGES: Record<CustomerSegment, { label: string; bg: string; text: string }> = {
  vip: { label: "VIP Customer", bg: "bg-purple-100", text: "text-purple-800" },
  loyal: { label: "Pelanggan Loyal", bg: "bg-emerald-100", text: "text-emerald-800" },
  repeat_customer: { label: "Repeat Customer", bg: "bg-blue-100", text: "text-blue-800" },
  new_customer: { label: "Pelanggan Baru", bg: "bg-teal-100", text: "text-teal-800" },
  one_time_buyer: { label: "One-Time Buyer", bg: "bg-gray-100", text: "text-gray-800" },
  at_risk: { label: "At Risk (Perlu Follow-Up)", bg: "bg-amber-100", text: "text-amber-800" },
  dormant: { label: "Dormant (Tidak Aktif)", bg: "bg-slate-100", text: "text-slate-700" },
  high_return_risk: { label: "Risiko Retur Tinggi", bg: "bg-rose-100", text: "text-rose-800" },
};

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Customer360Profile | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustDelta, setAdjustDelta] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustMsg, setAdjustMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleAdjustPoints(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustReason.trim()) {
      setAdjustMsg({ type: "error", text: "Alasan penyesuaian poin wajib diisi untuk audit." });
      return;
    }
    if (adjustDelta === 0) {
      setAdjustMsg({ type: "error", text: "Jumlah penyesuaian poin tidak boleh 0." });
      return;
    }
    setAdjustLoading(true);
    setAdjustMsg(null);
    try {
      const res = await fetch("/api/admin/loyalty/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: params.id,
          pointsDelta: Number(adjustDelta),
          reason: adjustReason.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Gagal menyesuaikan poin");
      setCustomerPoints(json.data.newBalance);
      setAdjustMsg({ type: "success", text: `Poin berhasil diperbarui! Saldo baru: ${json.data.newBalance} poin.` });
      setTimeout(() => {
        setAdjustModalOpen(false);
        setAdjustMsg(null);
        setAdjustReason("");
      }, 1800);
    } catch (err) {
      setAdjustMsg({ type: "error", text: err instanceof Error ? err.message : String(err) });
    } finally {
      setAdjustLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch(`/api/admin/customers/${params.id}`);
        const json = await res.json();
        if (!json.ok || !json.data) {
          throw new Error(json.error?.message ?? "Gagal memuat profil customer");
        }
        if (!cancelled) {
          setData(json.data);
          if (json.data.loyaltyPoints !== undefined) {
            setCustomerPoints(json.data.loyaltyPoints);
          }
          setState({ status: "idle" });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            status: "error",
            message: e instanceof Error ? e.message : String(e),
          });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (state.status === "error") {
    return (
      <div className="grid gap-4">
        <Link href="/admin/customers" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          &larr; Kembali ke Daftar Customer
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {state.message}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Memuat Customer 360...</div>;
  }

  const badge = SEGMENT_BADGES[data.segment] ?? {
    label: data.segment,
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  const waUrl = formatWhatsAppUrl(
    data.whatsappNumber ?? data.phone,
    `Halo kak ${data.name}, salam dari tim GINABO Skincare.`
  );

  return (
    <div className="grid gap-6">
      {/* Back link */}
      <div>
        <Link href="/admin/customers" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          &larr; Kembali ke Daftar Customer
        </Link>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div>Email: <span className="font-medium text-gray-900">{data.email ?? "—"}</span></div>
              <div>No. HP: <span className="font-medium text-gray-900">{data.normalizedPhone ?? data.phone ?? "—"}</span></div>
              <div>Terdaftar: <span className="font-medium text-gray-900">{new Date(data.registrationDate).toLocaleDateString("id-ID")}</span></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <span>WhatsApp Customer</span>
              </a>
            )}
          </div>
        </div>

        {/* Recommended Action Box */}
        <div className="mt-6 rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-900">
            Rekomendasi Tindakan Retensi
          </div>
          <p className="mt-1 text-sm text-amber-800 font-medium">
            {data.recommendedAction}
          </p>
        </div>

        {/* Membership & Loyalty Points Summary */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold text-lg shadow-sm">
              ★
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-800">
                Status Membership & Loyalty Points
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-900 uppercase">
                  Tier: {data.membershipTier ?? "Regular"}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  Saldo: <span className="text-brand-700 font-extrabold text-base">{customerPoints ?? data.loyaltyPoints ?? 0}</span> Poin
                </span>
              </div>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                setAdjustDelta(50);
                setAdjustReason("");
                setAdjustMsg(null);
                setAdjustModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-800 shadow-sm hover:bg-brand-50 transition"
            >
              +/- Sesuaikan Poin (Admin Audit)
            </button>
          </div>
        </div>

        {/* Acquisition & Attribution Intelligence */}
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Sumber Akuisisi & Atribusi Pemasaran
          </div>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-white p-3 border border-blue-100/80">
              <span className="text-gray-500 block">Channel Akuisisi</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                {data.acquisitionChannel ?? "Direct"}
              </span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-blue-100/80">
              <span className="text-gray-500 block">Source / UTM</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate" title={data.acquisitionSource ?? "direct"}>
                {data.acquisitionSource ?? "direct"}
              </span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-blue-100/80">
              <span className="text-gray-500 block">Campaign Pertama</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate" title={data.acquisitionCampaign ?? "—"}>
                {data.acquisitionCampaign ?? "—"}
              </span>
            </div>
            <div className="rounded-xl bg-white p-3 border border-blue-100/80">
              <span className="text-gray-500 block">Channel Terakhir</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                {data.latestPurchaseChannel ?? data.acquisitionChannel ?? "Direct"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Point Adjustment Modal */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Penyesuaian Poin Manual</h3>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Setiap penyesuaian akan dicatat di buku besar poin (ledger) dengan identitas admin dan alasan audit.
            </p>

            <form onSubmit={handleAdjustPoints} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Perubahan Poin (Delta)
                </label>
                <p className="text-[11px] text-gray-500">Gunakan angka positif untuk menambah, negatif untuk mengurangi.</p>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="Contoh: 100 atau -50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Alasan Penyesuaian (Wajib Audit)
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="Contoh: Kompensasi keterlambatan kurir order #ORD-1234"
                  required
                />
              </div>

              {adjustMsg && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    adjustMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {adjustMsg.text}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  disabled={adjustLoading}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading || adjustDelta === 0}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition"
                >
                  {adjustLoading ? "Menyimpan..." : "Simpan Penyesuaian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commerce & RFM Metric Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Customer LTV (Net)</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(data.netRevenueMinor, "IDR")}</div>
          <div className="mt-1 text-xs text-gray-500">
            Gross: {formatMoney(data.grossRevenueMinor, "IDR")}
            {data.validRefundsMinor > 0 ? ` (Refund: -${formatMoney(data.validRefundsMinor, "IDR")})` : ""}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Average Order Value (AOV)</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(data.averageOrderValueMinor, "IDR")}</div>
          <div className="mt-1 text-xs text-gray-500">Dari {data.validOrderCount} pesanan valid</div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Siklus & Recency</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {data.daysSinceLastPurchase !== null ? `${data.daysSinceLastPurchase} hari` : "—"}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {data.averageRepurchaseGapDays !== null
              ? `Jeda reorder: ${data.averageRepurchaseGapDays} hari`
              : "Belum repeat order"}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Skor RFM</div>
          <div className="mt-2 text-2xl font-bold text-brand-700">{data.rfm.compositeScore}</div>
          <div className="mt-1 text-xs text-gray-500">
            R:{data.rfm.recencyScore} • F:{data.rfm.frequencyScore} • M:{data.rfm.monetaryScore}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Product Affinity & Risk Signals */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Affinity */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold text-gray-900">Afinitas Produk (Paling Sering Dibeli)</div>
          <div className="mt-4 divide-y divide-gray-100">
            {data.topProducts.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">Belum ada produk yang dibeli.</div>
            ) : (
              data.topProducts.map((p) => (
                <div key={p.productId} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{p.productName}</div>
                    <div className="text-xs text-gray-500">{p.unitsSold} pcs terjual</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {formatMoney(p.totalRevenueMinor, "IDR")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Risk & Retur Summary */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="text-sm font-bold text-gray-900">Analisis Risiko & Retur</div>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Total Pengajuan Retur:</span>
              <span className="font-semibold text-gray-900">{data.returnCount} kali</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Total Nilai Refund:</span>
              <span className="font-semibold text-gray-900">{formatMoney(data.refundedAmountMinor, "IDR")}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Tingkat Retur (Return Rate):</span>
              <span className="font-semibold text-gray-900">{data.returnRatePercent}%</span>
            </div>

            {data.riskSignal && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <div className="font-bold">Perhatian Risiko:</div>
                <ul className="mt-1 list-disc list-inside">
                  {data.riskReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order History Timeline */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="text-sm font-bold text-gray-900">Riwayat Pesanan Pelanggan</div>
        <div className="mt-4 divide-y divide-gray-100">
          {!data.recentOrders || data.recentOrders.length === 0 ? (
            <div className="text-sm text-gray-500 py-4">Belum ada riwayat pesanan.</div>
          ) : (
            data.recentOrders.map((o) => (
              <div key={o.orderId} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <div className="font-semibold text-gray-900">{o.orderNumber}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString("id-ID")} • {o.itemCount} items
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {o.status}
                  </span>
                  <div className="text-sm font-bold text-gray-900">
                    {formatMoney(o.totalAmountMinor, "IDR")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
