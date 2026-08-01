"use client";

import type { CustomerSegmentStat } from "@/features/command-center/types";

const SEGMENT_LABEL: Record<string, string> = {
  vip: "VIP",
  loyal: "Loyal",
  high_value: "High Value",
  potential_vip: "Potential VIP",
  frequent_buyer: "Frequent Buyer",
  discount_seeker: "Discount Seeker",
  at_risk: "At Risk",
  churn_risk: "Churn Risk",
  dormant: "Dormant",
  new: "Baru",
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `Rp${(v / 1_000).toFixed(0)}rb`;
  return `Rp${v}`;
}

function SegmentCard({ seg }: { seg: CustomerSegmentStat }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: seg.color + "40", color: seg.color }}
        >
          {SEGMENT_LABEL[seg.segment] ?? seg.label}
        </span>
        <span className="text-[10px] text-white/30">{seg.percentage}%</span>
      </div>
      <p className="text-2xl font-bold text-white">{seg.count.toLocaleString("id-ID")}</p>
      <p className="text-xs text-white/40">Rata-rata LTV: {formatCurrency(seg.avgLtv)}</p>
    </div>
  );
}

export function CustomerSegmentCards({ segments }: { segments: CustomerSegmentStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {segments.map((s) => (
        <SegmentCard key={s.segment} seg={s} />
      ))}
    </div>
  );
}
