"use client";

import { useEffect, useState, useTransition } from "react";
import type { AttributionMetrics, AttributionReconciliationReport, MarketingChannelName } from "@/lib/attribution/types";

function formatIDR(amountMinor: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amountMinor);
}

const CHANNEL_ICONS: Record<MarketingChannelName, string> = {
  Direct: "🏠",
  "Organic Search": "🔍",
  "Paid Search": "🎯",
  "Organic Social": "📱",
  "Paid Social": "📢",
  WhatsApp: "💬",
  Marketplace: "🛍️",
  Referral: "🔗",
  Email: "✉️",
  Campaign: "🚀",
  Unknown: "❓",
};

export default function MarketingAttributionPage() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [data, setData] = useState<AttributionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reconciliation report
  const [reconciliation, setReconciliation] = useState<AttributionReconciliationReport | null>(null);
  const [reconLoading, setReconLoading] = useState(false);
  const [showReconDetails, setShowReconDetails] = useState(false);

  // Channel sort
  const [channelSortField, setChannelSortField] = useState<"revenueMinor" | "orders" | "conversionRatePercent">("revenueMinor");
  const [channelSortOrder, setChannelSortOrder] = useState<"asc" | "desc">("desc");

  async function loadOverview(selectedPeriod: "today" | "7d" | "30d" | "all") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/marketing/overview?period=${selectedPeriod}`);
      const json = await res.json();
      if (!json.ok || !json.data) {
        throw new Error(json.error?.message ?? "Gagal memuat analitik pemasaran");
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function runReconciliation() {
    setReconLoading(true);
    try {
      const res = await fetch("/api/admin/marketing/reconciliation");
      const json = await res.json();
      if (json.ok && json.data) {
        setReconciliation(json.data);
      }
    } catch (err) {
      console.error("[Marketing] Reconciliation error:", err);
    } finally {
      setReconLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview(period);
  }, [period]);

  const sortedChannels = [...(data?.channels || [])].sort((a, b) => {
    const diff = a[channelSortField] - b[channelSortField];
    return channelSortOrder === "asc" ? diff : -diff;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans antialiased text-white">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Marketing Attribution & Conversion Analytics</h1>
            <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-300 border border-violet-500/30">
              V1 Deterministic
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Server-authoritative attribution (First Touch + Last Non-Direct), privacy-preserving, dan funnel conversion tanpa manipulasi data.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 bg-white/[0.06] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {(
            [
              { key: "today", label: "Hari Ini" },
              { key: "7d", label: "7 Hari" },
              { key: "30d", label: "30 Hari" },
              { key: "all", label: "Semua" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPeriod(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === item.key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ad Spend & Integrity Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.08] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🛡️</span>
          <div>
            <span className="font-semibold text-amber-300">Integritas Metrik Komersial:</span>{" "}
            <span className="text-amber-200/80">
              Ad Spend belum terhubung secara API (Status: <code>unavailable</code>). Metrik ROAS dan CAC tidak difabrikasi demi keakuratan pembukuan owner.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={runReconciliation}
          disabled={reconLoading}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium border border-white/15 transition disabled:opacity-50"
        >
          {reconLoading ? "Memeriksa..." : "Audit Rekonsiliasi Data"}
        </button>
      </div>

      {/* Reconciliation Audit Results (if triggered) */}
      {reconciliation && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-bold text-sm">Laporan Rekonsiliasi & Kualitas Data Atribusi</span>
              <span className="text-[11px] text-blue-300/60">
                Diaudit pada {new Date(reconciliation.auditedAt).toLocaleTimeString("id-ID")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowReconDetails(!showReconDetails)}
              className="text-xs text-blue-300 underline hover:text-blue-200"
            >
              {showReconDetails ? "Sembunyikan Detail" : "Lihat Detail Anomali"}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-white/50 block">Total Order Terverifikasi</span>
              <span className="font-bold text-white text-base mt-0.5 block">{reconciliation.totalOrdersChecked}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-white/50 block">Order Belum Teratribusi (Unknown)</span>
              <span className={`font-bold text-base mt-0.5 block ${reconciliation.unattributedOrdersCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {reconciliation.unattributedOrdersCount}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="text-white/50 block">Duplikasi Event Pembayaran</span>
              <span className={`font-bold text-base mt-0.5 block ${reconciliation.duplicatePaymentEventsCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {reconciliation.duplicatePaymentEventsCount}
              </span>
            </div>
          </div>

          {showReconDetails && reconciliation.anomalies.length > 0 && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-1.5 text-[11px] bg-black/30 p-3 rounded-lg border border-white/5">
              {reconciliation.anomalies.map((a, idx) => (
                <div key={idx} className="text-amber-300 flex items-start gap-2">
                  <span>•</span>
                  <span>{a.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {loading || !data ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-white/10 bg-white/[0.04]" />
          ))}
        </div>
      ) : (
        <>
          {/* Topline Metric Cards (Requirements #30) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Sesi Pengunjung</p>
              <p className="mt-2 text-2xl font-bold text-white">{data.totalSessions.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-xs text-white/40">Denominator Traffic</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Transaksi Sukses (Paid)</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{data.paidOrders.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-xs text-white/40">Valid & Settled</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Overall Conversion Rate</p>
              <p className="mt-2 text-2xl font-bold text-violet-400">{data.conversionRatePercent}%</p>
              <p className="mt-1 text-xs text-white/40">Orders / Sesi</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pelanggan Baru (New)</p>
              <p className="mt-2 text-2xl font-bold text-teal-300">{data.newCustomersCount.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-xs text-white/40">Pembelian Pertama</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gross Revenue (Bruto)</p>
              <p className="mt-2 text-xl font-bold text-white">{formatIDR(data.grossRevenueMinor)}</p>
              <p className="mt-1 text-xs text-white/40">Sebelum Refund</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Net Revenue (Bersih)</p>
              <p className="mt-2 text-xl font-bold text-emerald-300">{formatIDR(data.netRevenueMinor)}</p>
              <p className="mt-1 text-xs text-white/40">Gross - Refund Selesai</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Biaya Promo / Diskon</p>
              <p className="mt-2 text-xl font-bold text-amber-300">{formatIDR(data.discountCostMinor)}</p>
              <p className="mt-1 text-xs text-white/40">Voucher & Potongan Kupon</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Repeat Revenue</p>
              <p className="mt-2 text-xl font-bold text-sky-300">{formatIDR(data.repeatRevenueMinor)}</p>
              <p className="mt-1 text-xs text-white/40">Dari Pembeli Loyal</p>
            </div>
          </div>

          {/* Marketing Channel Breakdown Table (Requirements #32) */}
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                  Performa Channel Marketing
                </h2>
                <p className="text-xs text-white/40">
                  Klasifikasi deterministik: Direct, Search, Social, WhatsApp, Marketplace, dan Referral
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>Urutkan:</span>
                <select
                  aria-label="Urutkan performa channel"
                  value={channelSortField}
                  onChange={(e) => setChannelSortField(e.target.value as any)}
                  className="bg-white/10 rounded-lg px-2.5 py-1 text-white border border-white/10"
                >
                  <option value="revenueMinor" className="bg-gray-900">Revenue</option>
                  <option value="orders" className="bg-gray-900">Pesanan</option>
                  <option value="conversionRatePercent" className="bg-gray-900">Konversi (CVR)</option>
                </select>
                <button
                  type="button"
                  onClick={() => setChannelSortOrder(channelSortOrder === "asc" ? "desc" : "asc")}
                  className="bg-white/10 px-2 py-1 rounded-lg border border-white/10 hover:bg-white/20"
                >
                  {channelSortOrder === "desc" ? "↓ Tertinggi" : "↑ Terendah"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-left">Channel</th>
                    <th className="pb-3 text-right">Sesi</th>
                    <th className="pb-3 text-right">Pesanan</th>
                    <th className="pb-3 text-right">CVR</th>
                    <th className="pb-3 text-right">Pelanggan Baru</th>
                    <th className="pb-3 text-right">Revenue Bersih</th>
                    <th className="pb-3 text-right">AOV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedChannels.map((c) => (
                    <tr key={c.channel} className="hover:bg-white/[0.03] transition">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{CHANNEL_ICONS[c.channel] ?? "📊"}</span>
                          <span className="font-semibold text-white">{c.channel}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-white/70">{c.sessions.toLocaleString("id-ID")}</td>
                      <td className="py-3 text-right font-medium text-white">{c.orders.toLocaleString("id-ID")}</td>
                      <td className="py-3 text-right font-semibold text-violet-400">{c.conversionRatePercent}%</td>
                      <td className="py-3 text-right text-teal-300">{c.newCustomers.toLocaleString("id-ID")}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{formatIDR(c.revenueMinor)}</td>
                      <td className="py-3 text-right text-white/70">{formatIDR(c.averageOrderValueMinor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Campaign Performance Table (Requirements #33) */}
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Performa UTM Campaign
              </h2>
              <p className="text-xs text-white/40">
                Integrasi campaign marketing aktif dengan total konversi dan alokasi diskon voucher
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 text-left">Nama Campaign</th>
                    <th className="pb-3 text-left">Objektif</th>
                    <th className="pb-3 text-right">Sesi</th>
                    <th className="pb-3 text-right">Pesanan</th>
                    <th className="pb-3 text-right">CVR</th>
                    <th className="pb-3 text-right">Pelanggan Baru</th>
                    <th className="pb-3 text-right">Net Revenue</th>
                    <th className="pb-3 text-right">Biaya Diskon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-white/40 text-xs">
                        Belum ada order dengan parameter UTM Campaign pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    data.campaigns.map((camp) => (
                      <tr key={camp.campaignName} className="hover:bg-white/[0.03] transition">
                        <td className="py-3 font-semibold text-white">
                          <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono text-violet-300">
                            {camp.campaignName}
                          </span>
                        </td>
                        <td className="py-3 text-white/60 text-xs">{camp.objective}</td>
                        <td className="py-3 text-right text-white/70">{camp.sessions.toLocaleString("id-ID")}</td>
                        <td className="py-3 text-right font-medium text-white">{camp.orders.toLocaleString("id-ID")}</td>
                        <td className="py-3 text-right font-semibold text-violet-400">{camp.conversionRatePercent}%</td>
                        <td className="py-3 text-right text-teal-300">{camp.newCustomers.toLocaleString("id-ID")}</td>
                        <td className="py-3 text-right font-bold text-emerald-400">{formatIDR(camp.netRevenueMinor)}</td>
                        <td className="py-3 text-right text-amber-300">{formatIDR(camp.discountCostMinor)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Conversion Funnel Section (Requirements #18, #47) */}
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Conversion Funnel Penjualan (6 Tahap)
              </h2>
              <p className="text-xs text-white/40">
                Sesi Pengunjung &rarr; Lihat Produk &rarr; Tambah Keranjang &rarr; Mulai Checkout &rarr; Order Terbuat &rarr; Pembayaran Sukses
              </p>
            </div>

            <div className="space-y-4">
              {data.funnel.map((step, i) => {
                const maxCount = data.funnel[0]?.count ?? 1;
                const widthPercent = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
                return (
                  <div key={step.stage}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white/80">
                          {i + 1}. {step.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-bold">{step.count.toLocaleString("id-ID")} user</span>
                        {i > 0 && (
                          <span className="text-rose-400 font-medium">
                            Dropoff: -{step.dropoffRatePercent}%
                          </span>
                        )}
                        <span className="text-violet-300 font-semibold">
                          CVR: {step.conversionRatePercent}%
                        </span>
                      </div>
                    </div>
                    <div className="h-6 rounded-lg bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center px-2.5 transition-all duration-500"
                        style={{
                          width: `${Math.max(widthPercent, 2)}%`,
                          background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                        }}
                      >
                        {widthPercent > 10 && (
                          <span className="text-[10px] font-bold text-white drop-shadow-xs">
                            {widthPercent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
