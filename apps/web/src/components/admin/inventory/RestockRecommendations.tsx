"use client";

import type { RestockRecommendation } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

const URGENCY_STYLE = {
  critical: "border-rose-500/40 bg-rose-500/[0.08]",
  high: "border-amber-500/40 bg-amber-500/[0.06]",
  medium: "border-blue-500/30 bg-blue-500/[0.04]",
};
const URGENCY_BADGE = {
  critical: "bg-rose-500 text-white",
  high: "bg-amber-500 text-black",
  medium: "bg-blue-500 text-white",
};
const URGENCY_LABEL = { critical: "Kritikal", high: "Segera", medium: "Sedang" };

export function RestockRecommendations({ recommendations }: { recommendations: RestockRecommendation[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
        ✨ Rekomendasi Restock AI ({recommendations.length})
      </h2>
      <div className="space-y-2">
        {recommendations.map((r) => (
          <div key={r.id} className={`rounded-lg border p-3 ${URGENCY_STYLE[r.urgency]}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{r.productName}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${URGENCY_BADGE[r.urgency]}`}>
                    {URGENCY_LABEL[r.urgency]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-white/40">{r.sku} · {r.supplierName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{r.recommendedQty} unit</p>
                <p className="text-xs text-white/40">~{formatCurrency(r.estimatedCost)}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-white/50">
              <span>Stok: {r.currentStock} ({r.daysRemaining <= 0 ? "habis" : `${r.daysRemaining} hari`})</span>
              <span className="text-emerald-400">Proteksi pendapatan: {formatCurrency(r.estimatedRevenueProtected)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
