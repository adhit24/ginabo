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
      </div>

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
