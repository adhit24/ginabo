"use client";

import { useEffect, useState } from "react";
import type { CustomerIntelligenceData } from "@/features/command-center/types";
import { getDemoCustomerIntelligence } from "@/features/command-center/demo-v2";
import { CustomerMetricsGrid } from "@/components/admin/customer-intelligence/CustomerMetricsGrid";
import { CustomerSegmentCards } from "@/components/admin/customer-intelligence/CustomerSegmentCards";
import { CustomerGrowthChart } from "@/components/admin/customer-intelligence/CustomerGrowthChart";
import { CustomerSearchTable } from "@/components/admin/customer-intelligence/CustomerSearchTable";

export default function CustomerIntelligencePage() {
  const [data, setData] = useState<CustomerIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoCustomerIntelligence().then((d) => {
      setData(d);
      setLoading(false);
    });
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
          <h1 className="text-lg font-bold text-white">Customer Intelligence Center</h1>
          {data.source === "demo" && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">DATA DEMO</span>
          )}
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      {/* KPI metrics */}
      <CustomerMetricsGrid metrics={data.metrics} />

      {/* At-risk summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.08] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Churn Risk</p>
          <p className="mt-2 text-2xl font-bold text-white">{data.metrics.churnRiskCustomers}</p>
          <p className="mt-1 text-xs text-white/40">Pelanggan berisiko pergi</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">At Risk</p>
          <p className="mt-2 text-2xl font-bold text-white">{data.metrics.atRiskCustomers}</p>
          <p className="mt-1 text-xs text-white/40">Perlu perhatian segera</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Dormant</p>
          <p className="mt-2 text-2xl font-bold text-white">{data.metrics.dormantCustomers}</p>
          <p className="mt-1 text-xs text-white/40">Tidak aktif 90+ hari</p>
        </div>
      </div>

      {/* Segments */}
      <CustomerSegmentCards segments={data.segments} />

      {/* Growth chart + table */}
      <section className="grid gap-4 xl:grid-cols-[1fr_2fr]">
        <CustomerGrowthChart trend={data.growthTrend} />
        <CustomerSearchTable customers={data.customers} />
      </section>
    </div>
  );
}
