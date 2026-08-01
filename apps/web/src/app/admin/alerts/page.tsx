"use client";

import { useEffect, useState } from "react";
import type { AlertCenterData } from "@/features/command-center/types";
import { getDemoAlertCenter } from "@/features/command-center/demo-v2";
import { AlertFeed } from "@/components/admin/alerts/AlertFeed";

export default function AlertCenterPage() {
  const [data, setData] = useState<AlertCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDemoAlertCenter().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-white/10 bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <h1 className="text-lg font-bold text-white">Alert Center</h1>
            {data.totalUnread > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                {data.totalUnread} baru
              </span>
            )}
            {data.source === "demo" && (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">DATA DEMO</span>
            )}
          </div>
          <p className="mt-1 text-xs text-white/30">
            {data.criticalCount} kritikal · {data.highCount} tinggi · {data.mediumCount} sedang · {data.lowCount} rendah
          </p>
        </div>
        <p className="text-xs text-white/30">{new Date(data.generatedAt).toLocaleString("id-ID")}</p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/[0.08] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Kritikal</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.criticalCount}</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Tinggi</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.highCount}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">Sedang</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.mediumCount}</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Rendah</p>
          <p className="mt-2 text-3xl font-bold text-white">{data.lowCount}</p>
        </div>
      </div>

      <AlertFeed
        alerts={data.alerts}
        counts={{ critical: data.criticalCount, high: data.highCount, medium: data.mediumCount, low: data.lowCount }}
      />
    </div>
  );
}
