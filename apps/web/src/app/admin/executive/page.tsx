"use client";

import { useEffect, useState } from "react";
import type { ExecutiveDashboardData } from "@/features/command-center/types";
import { getDemoExecutiveDashboard } from "@/features/command-center/demo-v2";
import { ExecutiveKpiRow } from "@/components/admin/executive/ExecutiveKpiRow";
import { BusinessScoreCard } from "@/components/admin/executive/BusinessScoreCard";
import { AIExecutiveBriefing } from "@/components/admin/executive/AIExecutiveBriefing";

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoExecutiveDashboard().then((d) => { setData(d); setLoading(false); });
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
          <span className="text-2xl">👑</span>
          <div>
            <h1 className="text-lg font-bold text-white">CEO Executive Dashboard</h1>
            <p className="text-xs text-white/30">Ginabo Business Operating System</p>
          </div>
          {data.source === "demo" && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">DATA DEMO</span>
          )}
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      <ExecutiveKpiRow kpis={data.kpis} />

      <BusinessScoreCard data={data} />

      <AIExecutiveBriefing insights={data.insights} />
    </div>
  );
}
