"use client";

import type { ReturnMetrics } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ?? "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

export function ReturnMetricsPanel({ metrics }: { metrics: ReturnMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <MetricCard label="Return Rate" value={`${metrics.returnRate}%`} sub="dari total order" accent={metrics.returnRate > 5 ? "text-rose-400" : "text-emerald-400"} />
      <MetricCard label="Refund Rate" value={`${metrics.refundRate}%`} sub="dari order" accent={metrics.refundRate > 3 ? "text-rose-400" : "text-white"} />
      <MetricCard label="Exchange Rate" value={`${metrics.exchangeRate}%`} sub="penukaran" />
      <MetricCard label="Nilai Refund" value={formatCurrency(metrics.totalRefundValue)} sub="30 hari" accent="text-rose-300" />
      <MetricCard label="Biaya Retur" value={formatCurrency(metrics.avgReturnCost)} sub="rata-rata/retur" />
      <MetricCard label="Total Retur" value={String(metrics.returnCount)} sub={`${metrics.refundCount} refund + ${metrics.exchangeCount} tukar`} />
    </div>
  );
}
