"use client";

import { useEffect, useState } from "react";
import type { LogisticsData } from "@/features/command-center/types";
import { getDemoLogistics } from "@/features/command-center/demo-v2";
import { LogisticsKpiRow } from "@/components/admin/logistics/LogisticsKpiRow";
import { OrderPipelineBoard } from "@/components/admin/logistics/OrderPipelineBoard";
import { CourierPerformanceTable } from "@/components/admin/logistics/CourierPerformanceTable";
import { DelayedOrdersAlert } from "@/components/admin/logistics/DelayedOrdersAlert";

export default function LogisticsPage() {
  const [data, setData] = useState<LogisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoLogistics().then((d) => { setData(d); setLoading(false); });
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
          <h1 className="text-lg font-bold text-white">Logistics Command Center</h1>
          {data.source === "demo" && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ml-2">DATA DEMO</span>
          )}
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      <LogisticsKpiRow metrics={data.metrics} />

      {data.delayedOrders.length > 0 && <DelayedOrdersAlert orders={data.delayedOrders} />}

      <OrderPipelineBoard pipeline={data.pipeline} />

      <CourierPerformanceTable couriers={data.couriers} />
    </div>
  );
}
