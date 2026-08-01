"use client";

import { useEffect, useState } from "react";
import type { ReturnIntelligenceData } from "@/features/command-center/types";
import { getDemoReturnIntelligence } from "@/features/command-center/demo-v2";
import { ReturnMetricsPanel } from "@/components/admin/returns-intelligence/ReturnMetricsPanel";
import { TopReturnedProducts } from "@/components/admin/returns-intelligence/TopReturnedProducts";
import { ReturnTrendChart } from "@/components/admin/returns-intelligence/ReturnTrendChart";
import { FraudDetectionPanel } from "@/components/admin/returns-intelligence/FraudDetectionPanel";

export default function ReturnIntelligencePage() {
  const [data, setData] = useState<ReturnIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoReturnIntelligence().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-white/10 bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">Return Intelligence Center</h1>
          {data.source === "demo" && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ml-2">DATA DEMO</span>
          )}
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      <ReturnMetricsPanel metrics={data.metrics} />

      <section className="grid gap-4 xl:grid-cols-2">
        <ReturnTrendChart trend={data.returnTrend} />
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">Alasan Retur Terbanyak</h2>
          <div className="space-y-2">
            {data.topReturnReasons.map((r) => (
              <div key={r.reason} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">{r.reason}</span>
                    <span className="text-xs font-bold text-white">{r.percentage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500/70" style={{ width: `${r.percentage}%` }} />
                  </div>
                </div>
                <span className="text-xs text-white/30 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <TopReturnedProducts products={data.topReturnedProducts} />

      <FraudDetectionPanel flags={data.fraudFlags} />
    </div>
  );
}
