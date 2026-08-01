"use client";

import type { SkincareInsight } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

export function SkincareInsightCards({ insights }: { insights: SkincareInsight[] }) {
  return (
    <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span>✨</span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">AI Skincare Insights</h2>
      </div>
      <div className="space-y-3">
        {insights.map((ins) => (
          <div key={ins.id} className="rounded-lg border border-emerald-500/20 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">{ins.title}</p>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">{ins.detail}</p>
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-emerald-300 font-medium">→ {ins.action}</p>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Peluang: {formatCurrency(ins.revenueOpportunity)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
