"use client";

import type { ExecutiveInsight } from "@/features/command-center/types";

const CATEGORY_ICON: Record<ExecutiveInsight["category"], string> = {
  revenue: "📈",
  customer: "👥",
  inventory: "📦",
  marketing: "📣",
  risk: "🚨",
  opportunity: "💡",
};

const URGENCY_STYLE = {
  now: "border-rose-500/40 bg-rose-500/[0.08]",
  today: "border-amber-500/40 bg-amber-500/[0.06]",
  this_week: "border-blue-500/30 bg-blue-500/[0.04]",
  this_month: "border-white/10 bg-white/[0.03]",
};

const URGENCY_BADGE = {
  now: "bg-rose-500 text-white",
  today: "bg-amber-500 text-black",
  this_week: "bg-blue-500 text-white",
  this_month: "bg-white/10 text-white/60",
};

const URGENCY_LABEL = {
  now: "Segera", today: "Hari Ini", this_week: "Minggu Ini", this_month: "Bulan Ini",
};

export function AIExecutiveBriefing({ insights }: { insights: ExecutiveInsight[] }) {
  return (
    <section className="rounded-xl border border-violet-500/30 bg-violet-500/[0.05] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-violet-400">AI Executive Briefing</h2>
      </div>
      <div className="space-y-3">
        {insights.map((ins) => (
          <div key={ins.id} className={`rounded-lg border p-4 ${URGENCY_STYLE[ins.urgency]}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">{CATEGORY_ICON[ins.category]}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{ins.title}</p>
                  <p className="mt-1 text-xs text-white/60 leading-relaxed">{ins.detail}</p>
                  <p className="mt-1.5 text-xs font-medium text-violet-300">Impact: {ins.impact}</p>
                </div>
              </div>
              <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${URGENCY_BADGE[ins.urgency]}`}>
                {URGENCY_LABEL[ins.urgency]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
