"use client";

import type { ExecutiveKpi, MetricDirection } from "@/features/command-center/types";

function formatValue(value: number, unit: ExecutiveKpi["unit"]) {
  if (unit === "currency") {
    if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(2)}M`;
    if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`;
    return `Rp${(value / 1_000).toFixed(0)}rb`;
  }
  if (unit === "percent") return `${value}%`;
  return String(value);
}

const DIR_ICON: Record<MetricDirection, string> = { up: "↑", down: "↓", flat: "→" };
const DIR_COLOR: Record<MetricDirection, string> = {
  up: "text-emerald-400", down: "text-rose-400", flat: "text-white/40",
};

function KpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{kpi.label}</p>
      <p className="mt-2 text-xl font-bold text-white">{formatValue(kpi.value, kpi.unit)}</p>
      <p className={`mt-1 text-xs ${DIR_COLOR[kpi.trend]}`}>
        {DIR_ICON[kpi.trend]} {kpi.trendPercent}%
      </p>
    </div>
  );
}

export function ExecutiveKpiRow({ kpis }: { kpis: ExecutiveKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {kpis.map((k) => (
        <KpiCard key={k.label} kpi={k} />
      ))}
    </div>
  );
}
