"use client";

import Link from "next/link";
import type { AdvisorAction, CommandCenterSource } from "@/features/command-center/types";

const URGENCY_LABEL: Record<AdvisorAction["urgency"], string> = {
  now: "Sekarang",
  today: "Hari ini",
  this_week: "Minggu ini",
};

const URGENCY_COLOR: Record<AdvisorAction["urgency"], string> = {
  now: "bg-rose-500/20 text-rose-300",
  today: "bg-amber-500/20 text-amber-300",
  this_week: "bg-blue-500/20 text-blue-300",
};

function ActionCard({ action }: { action: AdvisorAction }) {
  const content = (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white">{action.title}</p>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${URGENCY_COLOR[action.urgency]}`}>
          {URGENCY_LABEL[action.urgency]}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/50">{action.reason}</p>
      <p className="mt-1 text-xs text-purple-400">{action.impact}</p>
      <p className="mt-2 text-xs font-medium text-white/70">→ {action.actionLabel}</p>
    </div>
  );

  return action.href ? <Link href={action.href}>{content}</Link> : content;
}

export function AdvisorPanel({ actions, source }: { actions: AdvisorAction[]; source: CommandCenterSource }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">AI Advisor</h2>
        {source === "demo" && (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
            Rekomendasi Demo
          </span>
        )}
      </div>
      {actions.length === 0 ? (
        <p className="text-sm text-white/40">Tidak ada rekomendasi saat ini.</p>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => (
            <ActionCard key={a.id} action={a} />
          ))}
        </div>
      )}
    </section>
  );
}
