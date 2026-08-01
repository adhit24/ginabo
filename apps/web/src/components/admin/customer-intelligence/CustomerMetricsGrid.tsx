"use client";

import type { CustomerMetrics } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(2)}jt`;
  if (v >= 1_000) return `Rp${(v / 1_000).toFixed(0)}rb`;
  return `Rp${v}`;
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

export function CustomerMetricsGrid({ metrics }: { metrics: CustomerMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <MetricCard label="Total Pelanggan" value={metrics.totalCustomers.toLocaleString("id-ID")} />
      <MetricCard label="Rata-rata LTV" value={formatCurrency(metrics.avgLifetimeValue)} sub="lifetime value" />
      <MetricCard label="Repeat Purchase Rate" value={`${metrics.repeatPurchaseRate}%`} sub="membeli ulang" />
      <MetricCard label="Retensi Pelanggan" value={`${metrics.retentionRate}%`} sub="30 hari" />
      <MetricCard label="Frekuensi Pembelian" value={`${metrics.avgPurchaseFrequency}x`} sub="per bulan" />
      <MetricCard label="Interval Beli" value={`${metrics.avgPurchaseIntervalDays} hari`} sub="rata-rata" />
    </div>
  );
}
