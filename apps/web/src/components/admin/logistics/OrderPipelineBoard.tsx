"use client";

import type { LogisticsPipelineColumn } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "border-white/20 bg-white/[0.04]",
  paid: "border-blue-500/30 bg-blue-500/[0.06]",
  picking: "border-amber-500/30 bg-amber-500/[0.06]",
  packing: "border-amber-500/30 bg-amber-500/[0.06]",
  ready_pickup: "border-violet-500/30 bg-violet-500/[0.06]",
  shipped: "border-cyan-500/30 bg-cyan-500/[0.06]",
  delivered: "border-emerald-500/30 bg-emerald-500/[0.06]",
  delayed: "border-rose-500/30 bg-rose-500/[0.06]",
  failed_delivery: "border-rose-500/40 bg-rose-500/[0.10]",
  returned: "border-orange-500/30 bg-orange-500/[0.06]",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-white/40",
  paid: "bg-blue-400",
  picking: "bg-amber-400",
  packing: "bg-amber-500",
  ready_pickup: "bg-violet-400",
  shipped: "bg-cyan-400",
  delivered: "bg-emerald-400",
  delayed: "bg-rose-500",
  failed_delivery: "bg-rose-600",
  returned: "bg-orange-400",
};

function PipelineCol({ col }: { col: LogisticsPipelineColumn }) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-1.5 ${STATUS_COLOR[col.status] ?? "border-white/10 bg-white/[0.04]"}`}>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${STATUS_DOT[col.status] ?? "bg-white/40"}`} />
        <span className="text-[11px] font-bold text-white/70">{col.label}</span>
        {col.urgentCount > 0 && (
          <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-[9px] font-bold text-white">
            {col.urgentCount}!
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{col.count}</p>
      <p className="text-[10px] text-white/30">{formatCurrency(col.totalValue)}</p>
    </div>
  );
}

export function OrderPipelineBoard({ pipeline }: { pipeline: LogisticsPipelineColumn[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
        Pipeline Order
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {pipeline.map((col) => (
          <PipelineCol key={col.status} col={col} />
        ))}
      </div>
    </section>
  );
}
