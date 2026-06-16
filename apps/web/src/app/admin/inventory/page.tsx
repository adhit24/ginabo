"use client";

import { useEffect, useState } from "react";
import type { InventoryIntelligenceData } from "@/features/command-center/types";
import { getDemoInventoryIntelligence } from "@/features/command-center/demo-v2";
import { InventoryHealthScore } from "@/components/admin/inventory/InventoryHealthScore";
import { StockStatusTable } from "@/components/admin/inventory/StockStatusTable";
import { DemandForecastChart } from "@/components/admin/inventory/DemandForecastChart";
import { RestockRecommendations } from "@/components/admin/inventory/RestockRecommendations";

export default function InventoryIntelligencePage() {
  const [data, setData] = useState<InventoryIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoInventoryIntelligence().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-white/10 bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-white">Inventory Intelligence Center</h1>
          {data.source === "demo" && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ml-2">DATA DEMO</span>
          )}
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      <InventoryHealthScore metrics={data.metrics} />

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <RestockRecommendations recommendations={data.restockRecommendations} />
        <DemandForecastChart forecast={data.demandForecast} />
      </section>

      <StockStatusTable items={data.items} />
    </div>
  );
}
