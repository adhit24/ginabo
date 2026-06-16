"use client";

import { useEffect, useState } from "react";
import type { SkincareData } from "@/features/command-center/types";
import { getDemoSkincareIntelligence } from "@/features/command-center/demo-v2";
import { SkinTypeDistributionChart } from "@/components/admin/skincare/SkinTypeDistributionChart";
import { ProductEffectivenessTable } from "@/components/admin/skincare/ProductEffectivenessTable";
import { SkincareInsightCards } from "@/components/admin/skincare/SkincareInsightCards";

export default function SkincareIntelligencePage() {
  const [data, setData] = useState<SkincareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoSkincareIntelligence().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-white/10 bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h1 className="text-lg font-bold text-white">AI Skincare Intelligence</h1>
            <p className="text-xs text-white/30">Fitur unik Ginabo — analitik kulit pelanggan</p>
          </div>
          {data.source === "demo" && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">DATA DEMO</span>
          )}
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[auto_1fr]">
        <SkinTypeDistributionChart data={data.skinTypeDistribution} />

        {/* Skin concern breakdown */}
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">Distribusi Masalah Kulit</h2>
          <div className="space-y-3">
            {data.skinConcernStats.map((s) => (
              <div key={s.concern}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/70">{s.concern}</span>
                  <span className="text-xs font-bold text-white">{s.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.percentage}%`, background: "linear-gradient(90deg,#8b5cf6,#e879f9)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <SkincareInsightCards insights={data.insights} />

      <ProductEffectivenessTable products={data.productEffectiveness} />

      {/* Top combinations */}
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
          Kombinasi Produk Terpopuler
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {data.topProductCombinations.map((combo, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs font-semibold text-white">{combo.products.join(" + ")}</p>
              <div className="mt-1.5 flex gap-4 text-xs text-white/40">
                <span>Co-buy: {combo.coOccurrenceRate}%</span>
                <span>AOV: Rp{(combo.avgOrderValue / 1000).toFixed(0)}rb</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
