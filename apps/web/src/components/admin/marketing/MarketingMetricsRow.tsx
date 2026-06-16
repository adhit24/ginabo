"use client";

import type { MarketingMetrics } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(2)}M`;
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</p>
      <p className={`mt-2 text-xl font-bold ${accent ?? "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

export function MarketingMetricsRow({ metrics }: { metrics: MarketingMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricCard label="Total Belanja Iklan" value={formatCurrency(metrics.totalSpend)} sub="bulan ini" />
      <MetricCard label="Revenue dari Marketing" value={formatCurrency(metrics.totalRevenue)} sub="bulan ini" accent="text-emerald-400" />
      <MetricCard label="Blended ROAS" value={`${metrics.blendedRoas}x`} sub="return on ad spend" accent={metrics.blendedRoas >= 4 ? "text-emerald-400" : "text-amber-400"} />
      <MetricCard label="CAC Rata-rata" value={formatCurrency(metrics.avgCac)} sub="cost per customer" />
      <MetricCard label="Konversi" value={metrics.totalConversions.toLocaleString("id-ID")} sub="total order dari ads" />
      <MetricCard label="Conversion Rate" value={`${metrics.avgConversionRate}%`} sub="rata-rata" accent="text-violet-400" />
      <MetricCard label="Customer LTV" value={formatCurrency(metrics.customerLtv)} sub="lifetime value" />
      <MetricCard label="LTV:CAC Ratio" value={`${metrics.ltvCacRatio}x`} sub="ideal >3x" accent={metrics.ltvCacRatio >= 3 ? "text-emerald-400" : "text-rose-400"} />
    </div>
  );
}
