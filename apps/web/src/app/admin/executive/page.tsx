"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type {
  ExecutiveDashboardSummary,
  ExecutivePeriod,
  KpiMetricItem,
} from "@/lib/executive/types";

function KpiCard({
  title,
  subtitle,
  metric,
  accent,
}: {
  title: string;
  subtitle?: string;
  metric: KpiMetricItem;
  accent?: string;
}) {
  const hasChange = metric.percentageChange !== null;
  const isZeroChange = metric.percentageChange === 0;
  const isPositive = (metric.percentageChange ?? 0) > 0;

  // Determine badge color based on polarity & favorability
  let deltaBg = "bg-white/10 text-white/70";
  if (hasChange && !isZeroChange) {
    if (metric.isFavorable) {
      deltaBg = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    } else {
      deltaBg = "bg-rose-500/20 text-rose-400 border border-rose-500/30";
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xs transition hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">{title}</p>
        {hasChange && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${deltaBg}`}>
            {isPositive ? "↑" : isZeroChange ? "•" : "↓"}{" "}
            {Math.abs(metric.percentageChange!)}%
          </span>
        )}
      </div>
      <p className={`mt-3 text-2xl font-extrabold tracking-tight ${accent ?? "text-white"}`}>
        {metric.formattedCurrent}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs text-white/40">
        <span>{subtitle ?? "vs periode sebelumnya"}</span>
        <span className="text-white/60">{metric.formattedPrevious}</span>
      </div>
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const [period, setPeriod] = useState<ExecutivePeriod>("7d");
  const [data, setData] = useState<ExecutiveDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (selectedPeriod: ExecutivePeriod) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/dashboard/summary?period=${selectedPeriod}`);
      const json = await res.json();
      if (!json.ok || !json.data) {
        throw new Error(json.error?.message ?? "Gagal memuat dashboard eksekutif");
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard(period);
  }, [period, loadDashboard]);

  const periodsList: Array<{ key: ExecutivePeriod; label: string }> = [
    { key: "today", label: "Hari Ini" },
    { key: "yesterday", label: "Kemarin" },
    { key: "7d", label: "7 Hari" },
    { key: "30d", label: "30 Hari" },
    { key: "this_month", label: "Bulan Ini" },
    { key: "last_month", label: "Bulan Lalu" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans antialiased text-white">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Executive KPI & Business Dashboard
              </h1>
              <p className="text-xs text-white/50">
                Pusat keputusan strategis pemilik GINABO: Keuangan, Operasional, Retensi & Logistik
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.06] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {periodsList.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === p.key
                  ? "bg-fuchsia-600 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {loading || !data ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-white/10 bg-white/[0.04]" />
          ))}
        </div>
      ) : (
        <>
          {/* Top Actions Panel ("Apa yang perlu saya lakukan hari ini?") */}
          <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] to-amber-600/[0.03] p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Prioritas Tindakan Owner Hari Ini ({data.actions.length} Rekomendasi)
                </h2>
              </div>
              <span className="text-[11px] text-white/40">
                Data real-time diperbarui pukul {new Date(data.generatedAt).toLocaleTimeString("id-ID")} WIB
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.actions.map((act) => (
                <Link
                  key={act.id}
                  href={act.href}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.09] hover:border-amber-400/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-sm text-white group-hover:text-amber-200">
                        {act.title}
                      </span>
                      {act.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          act.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {act.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2">{act.description}</p>
                  </div>
                  <span className="mt-3 inline-flex items-center text-xs font-semibold text-amber-300 hover:underline">
                    Buka Halaman Modul &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Primary Executive KPIs - Row 1 */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
              Metrik Finansial & Transaksi Utama ({data.periodLabel})
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Net Revenue (Bersih)"
                subtitle="Gross - Refund Selesai"
                metric={data.kpis.netRevenue}
                accent="text-emerald-400"
              />
              <KpiCard
                title="Transaksi Sukses (Paid)"
                subtitle="Pesanan Sah Lunas"
                metric={data.kpis.paidOrders}
                accent="text-white"
              />
              <KpiCard
                title="Average Order Value"
                subtitle="Rata-rata Nilai Order"
                metric={data.kpis.averageOrderValue}
                accent="text-violet-300"
              />
              <KpiCard
                title="Conversion Rate"
                subtitle="Orders / Sesi Pengunjung"
                metric={data.kpis.conversionRate}
                accent="text-teal-300"
              />
            </div>
          </div>

          {/* Secondary Executive KPIs - Row 2 */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
              Kesehatan Akuisisi, Retensi & Mutu ({data.periodLabel})
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Pelanggan Baru (New)"
                subtitle="Pembeli Pertama Kali"
                metric={data.kpis.newCustomers}
                accent="text-sky-300"
              />
              <KpiCard
                title="Repeat Purchase Rate"
                subtitle="Rasio Pembeli Berulang"
                metric={data.kpis.repeatPurchaseRate}
                accent="text-cyan-300"
              />
              <KpiCard
                title="Rasio Refund"
                subtitle="Refund Value / Gross"
                metric={data.kpis.refundRate}
                accent="text-amber-300"
              />
              <KpiCard
                title="Biaya Promo / Diskon"
                subtitle="Total Potongan Voucher"
                metric={data.kpis.discountCost}
                accent="text-rose-300"
              />
            </div>
          </div>

          {/* Operational Backlog & Pipeline Bar */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Status Pipeline Pesanan (Operasional Saat Ini)
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Total {data.orderStatus.totalBacklog} pesanan siap diproses dan dikirim kurir
                </p>
              </div>
              <Link href="/admin/orders" className="text-xs font-semibold text-violet-400 hover:underline">
                Kelola Semua Pesanan &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <span className="text-white/40 block text-[10px] uppercase font-bold">Pending</span>
                <span className="mt-1 block text-lg font-bold text-white">{data.orderStatus.pending}</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <span className="text-white/40 block text-[10px] uppercase font-bold">Paid</span>
                <span className="mt-1 block text-lg font-bold text-white">{data.orderStatus.paid}</span>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.08] p-3">
                <span className="text-amber-300 block text-[10px] uppercase font-bold">Processing</span>
                <span className="mt-1 block text-lg font-bold text-amber-200">{data.orderStatus.processing}</span>
              </div>
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.08] p-3">
                <span className="text-blue-300 block text-[10px] uppercase font-bold">Shipped</span>
                <span className="mt-1 block text-lg font-bold text-blue-200">{data.orderStatus.shipped}</span>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] p-3">
                <span className="text-emerald-300 block text-[10px] uppercase font-bold">Delivered</span>
                <span className="mt-1 block text-lg font-bold text-emerald-200">{data.orderStatus.delivered}</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <span className="text-white/40 block text-[10px] uppercase font-bold">Completed</span>
                <span className="mt-1 block text-lg font-bold text-white">{data.orderStatus.completed}</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <span className="text-white/40 block text-[10px] uppercase font-bold">Cancelled</span>
                <span className="mt-1 block text-lg font-bold text-white/50">{data.orderStatus.cancelled}</span>
              </div>
            </div>
          </section>

          {/* Daily Revenue Trend & Module Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Daily Trend (2 cols) */}
            <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Tren Harian Penjualan & Pesanan
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    Grafik nominal pergerakan omzet bersih dalam rentang {data.periodLabel}
                  </p>
                </div>
              </div>

              {data.trends.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/40">
                  Belum ada transaksi pada periode ini untuk ditampilkan ke grafik tren.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.trends.map((t) => {
                    const maxRevenue = Math.max(...data.trends.map((x) => x.netRevenueMinor), 1);
                    const widthPercent = (t.netRevenueMinor / maxRevenue) * 100;
                    return (
                      <div key={t.date} className="text-xs">
                        <div className="flex items-center justify-between mb-1 text-white/60">
                          <span className="font-mono">{t.date}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">
                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(t.netRevenueMinor)}
                            </span>
                            <span className="text-white/40">({t.ordersCount} order)</span>
                          </div>
                        </div>
                        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-500"
                            style={{ width: `${Math.max(widthPercent, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Quick Intelligence Summary Cards (1 col) */}
            <div className="space-y-4">
              {/* Inventory Health */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Kesehatan Stok Barang
                  </h3>
                  <Link href="/admin/inventory" className="text-xs text-amber-400 hover:underline font-medium">
                    Lihat Stok &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <span className="text-white/40 block text-[10px] uppercase">Habis Stok</span>
                    <span className={`text-xl font-bold mt-1 block ${data.inventory.outOfStockCount > 0 ? "text-rose-400" : "text-white"}`}>
                      {data.inventory.outOfStockCount} SKU
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <span className="text-white/40 block text-[10px] uppercase">Stok Kritis</span>
                    <span className={`text-xl font-bold mt-1 block ${data.inventory.criticalCount > 0 ? "text-amber-400" : "text-white"}`}>
                      {data.inventory.criticalCount} SKU
                    </span>
                  </div>
                </div>
              </div>

              {/* Marketing Top Channels */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Top Channel Marketing
                  </h3>
                  <Link href="/admin/marketing" className="text-xs text-violet-400 hover:underline font-medium">
                    Atribusi &rarr;
                  </Link>
                </div>
                <div className="space-y-2 text-xs">
                  {data.marketing.topChannels.length === 0 ? (
                    <p className="text-white/40">Belum ada channel teratribusi.</p>
                  ) : (
                    data.marketing.topChannels.map((c) => (
                      <div key={c.channel} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <span className="font-semibold text-white">{c.channel}</span>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold block">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(c.revenueMinor)}
                          </span>
                          <span className="text-[10px] text-white/40">{c.orders} order (CVR: {c.cvr}%)</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Returns & Quality */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Retur & Refund Selesai
                  </h3>
                  <Link href="/admin/returns" className="text-xs text-rose-400 hover:underline font-medium">
                    Modul Retur &rarr;
                  </Link>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white/40 block">Nilai Pengembalian</span>
                    <span className="text-lg font-bold text-rose-300 mt-0.5 block">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(data.returns.refundValueMinor)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40 block">Total Refund</span>
                    <span className="text-lg font-bold text-white mt-0.5 block">
                      {data.returns.completedRefundsCount} Transaksi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
