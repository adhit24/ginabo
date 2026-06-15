"use client";

import type { HealthScore, HealthStatus } from "@/features/command-center/types";

const STATUS_LABEL: Record<HealthStatus, string> = {
  healthy: "Sehat",
  watch: "Perhatian",
  critical: "Kritis",
};

const STATUS_COLOR: Record<HealthStatus, string> = {
  healthy: "text-emerald-400",
  watch: "text-amber-400",
  critical: "text-rose-400",
};

const BAR_COLOR: Record<HealthStatus, string> = {
  healthy: "bg-emerald-500",
  watch: "bg-amber-500",
  critical: "bg-rose-500",
};

function HealthRow({ item }: { item: HealthScore }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{item.label}</span>
        <span className={`text-xs font-bold ${STATUS_COLOR[item.status]}`}>
          {item.score} — {STATUS_LABEL[item.status]}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${BAR_COLOR[item.status]}`}
          style={{ width: `${item.score}%` }}
        />
      </div>
      <p className="text-xs text-white/40">{item.explanation}</p>
    </div>
  );
}

export function HealthPanel({ health }: { health: HealthScore[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Kesehatan Bisnis</h2>
      {health.map((h) => (
        <HealthRow key={h.key} item={h} />
      ))}
    </section>
  );
}
