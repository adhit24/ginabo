"use client";

import type { CustomerGrowthPoint } from "@/features/command-center/types";

export function CustomerGrowthChart({ trend }: { trend: CustomerGrowthPoint[] }) {
  const maxNew = Math.max(...trend.map((t) => t.newCustomers));
  const maxReturning = Math.max(...trend.map((t) => t.returningCustomers));
  const maxVal = Math.max(maxNew, maxReturning);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
        Pertumbuhan Pelanggan
      </h2>
      <div className="flex items-end gap-2 h-32">
        {trend.map((point) => {
          const newH = maxVal > 0 ? (point.newCustomers / maxVal) * 100 : 0;
          const retH = maxVal > 0 ? (point.returningCustomers / maxVal) * 100 : 0;
          const dateLabel = new Date(point.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end gap-0.5" style={{ height: "100px" }}>
                <div
                  className="flex-1 rounded-t bg-violet-500/70"
                  style={{ height: `${newH}%`, minHeight: 2 }}
                  title={`Baru: ${point.newCustomers}`}
                />
                <div
                  className="flex-1 rounded-t bg-fuchsia-500/70"
                  style={{ height: `${retH}%`, minHeight: 2 }}
                  title={`Kembali: ${point.returningCustomers}`}
                />
              </div>
              <span className="text-[9px] text-white/30">{dateLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-violet-500" />
          <span className="text-xs text-white/40">Pelanggan Baru</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-fuchsia-500" />
          <span className="text-xs text-white/40">Pelanggan Kembali</span>
        </div>
      </div>
    </section>
  );
}
