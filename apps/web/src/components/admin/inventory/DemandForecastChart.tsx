"use client";

import type { DemandForecastPoint } from "@/features/command-center/types";

export function DemandForecastChart({ forecast }: { forecast: DemandForecastPoint[] }) {
  const maxDemand = Math.max(...forecast.map((f) => f.forecastDemand), 1);
  const maxStock = Math.max(...forecast.map((f) => f.currentStock), 1);
  const maxVal = Math.max(maxDemand, maxStock);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
        Proyeksi Permintaan 7 Hari
      </h2>
      <div className="flex items-end gap-2" style={{ height: "100px" }}>
        {forecast.map((point, i) => {
          const demandH = maxVal > 0 ? (point.forecastDemand / maxVal) * 100 : 0;
          const stockH = maxVal > 0 ? (point.currentStock / maxVal) * 100 : 0;
          const dateLabel = new Date(point.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
          const isStockout = point.currentStock <= 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end gap-0.5" style={{ height: "80px" }}>
                <div
                  className="flex-1 rounded-t bg-fuchsia-500/60"
                  style={{ height: `${demandH}%`, minHeight: 2 }}
                  title={`Perkiraan: ${point.forecastDemand}`}
                />
                <div
                  className={`flex-1 rounded-t ${isStockout ? "bg-rose-500/80" : "bg-emerald-500/60"}`}
                  style={{ height: `${Math.max(stockH, isStockout ? 5 : 0)}%`, minHeight: 2 }}
                  title={`Stok: ${point.currentStock}`}
                />
              </div>
              <span className="text-[9px] text-white/30">{dateLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-fuchsia-500" />
          <span className="text-xs text-white/40">Perkiraan Permintaan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" />
          <span className="text-xs text-white/40">Stok Aktual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-rose-500" />
          <span className="text-xs text-white/40">Stockout</span>
        </div>
      </div>
    </section>
  );
}
