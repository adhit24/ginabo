"use client";

import { useEffect, useState } from "react";
import type { MarketingData } from "@/features/command-center/types";
import { getDemoMarketing } from "@/features/command-center/demo-v2";
import { MarketingMetricsRow } from "@/components/admin/marketing/MarketingMetricsRow";
import { ChannelPerformanceTable } from "@/components/admin/marketing/ChannelPerformanceTable";

export default function MarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoMarketing().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-white/10 bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">Marketing Intelligence Center</h1>
          {data.source === "demo" && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ml-2">DATA DEMO</span>
          )}
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      <MarketingMetricsRow metrics={data.metrics} />

      <ChannelPerformanceTable channels={data.channels} />

      {/* Marketing funnel */}
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Marketing Funnel</h2>
        <div className="space-y-3">
          {data.funnel.map((step, i) => {
            const maxCount = data.funnel[0]?.count ?? 1;
            const width = (step.count / maxCount) * 100;
            return (
              <div key={step.stage}>
                <div className="flex items-center justify-between mb-1 gap-3">
                  <span className="text-xs text-white/70">{step.stage}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-white font-medium">{step.count.toLocaleString("id-ID")}</span>
                    {i > 0 && <span className="text-rose-400">-{step.dropoffRate}%</span>}
                  </div>
                </div>
                <div className="h-6 rounded-lg bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-2"
                    style={{ width: `${Math.max(width, 2)}%`, background: "linear-gradient(90deg,#8b5cf6,#e879f9)" }}
                  >
                    {width > 15 && <span className="text-[10px] font-bold text-white">{step.conversionRate}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
