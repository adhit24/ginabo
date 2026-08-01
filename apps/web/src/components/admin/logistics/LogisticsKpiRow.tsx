"use client";

import type { LogisticsMetrics } from "@/features/command-center/types";

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ?? "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

export function LogisticsKpiRow({ metrics }: { metrics: LogisticsMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      <KpiCard label="Menunggu" value={String(metrics.pendingCount)} sub="order baru" />
      <KpiCard label="Diproses" value={String(metrics.inProgressCount)} sub="picking/packing" accent="text-amber-400" />
      <KpiCard label="Terkirim Hari Ini" value={String(metrics.deliveredToday)} sub="delivered" accent="text-emerald-400" />
      <KpiCard label="Tertunda" value={String(metrics.delayedCount)} sub="melewati SLA" accent={metrics.delayedCount > 0 ? "text-rose-400" : "text-white"} />
      <KpiCard label="Gagal Kirim" value={String(metrics.failedCount)} sub="failed delivery" accent={metrics.failedCount > 0 ? "text-rose-400" : "text-white"} />
      <KpiCard label="Avg Pengiriman" value={`${metrics.avgDeliveryDays} hari`} sub="rata-rata" />
      <KpiCard label="Success Rate" value={`${metrics.successRate}%`} sub="keberhasilan" accent="text-emerald-400" />
      <KpiCard label="SLA Compliance" value={`${metrics.slaCompliance}%`} sub="on-time" accent={metrics.slaCompliance >= 90 ? "text-emerald-400" : "text-amber-400"} />
    </div>
  );
}
