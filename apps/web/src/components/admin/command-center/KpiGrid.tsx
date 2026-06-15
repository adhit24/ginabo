"use client";

import type { SummaryMetric, MetricDirection } from "@/features/command-center/types";
import { formatMetricValue } from "@/features/command-center/format";

const DIRECTION_LABEL: Record<MetricDirection, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

const DIRECTION_COLOR: Record<MetricDirection, string> = {
  up: "text-emerald-400",
  down: "text-rose-400",
  flat: "text-white/40",
};

function KpiCard({ metric }: { metric: SummaryMetric }) {
  const isGoodDown = metric.key === "returns";
  const dir = metric.comparisonDirection;
  const colorClass = dir === "flat"
    ? "text-white/40"
    : dir === "down"
      ? isGoodDown ? "text-emerald-400" : "text-rose-400"
      : "text-emerald-400";

  return (
    <div
      data-testid="command-center-kpi"
      className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{metric.label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{formatMetricValue(metric)}</p>
      <p className={`mt-1 text-xs ${colorClass}`}>
        {DIRECTION_LABEL[dir]} {metric.comparisonPercent}% {metric.comparisonLabel}
      </p>
    </div>
  );
}

export function KpiGrid({ metrics }: { metrics: SummaryMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {metrics.map((m) => (
        <KpiCard key={m.key} metric={m} />
      ))}
    </div>
  );
}
