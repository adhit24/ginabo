"use client";

import type { ReturnTrendPoint } from "@/features/command-center/types";

export function ReturnTrendChart({ trend }: { trend: ReturnTrendPoint[] }) {
  const maxVal = Math.max(...trend.map((t) => t.returns + t.refunds + t.exchanges), 1);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Tren Retur 7 Hari</h2>
      <div className="flex items-end gap-2 h-24">
        {trend.map((point) => {
          const retH = (point.returns / maxVal) * 100;
          const refH = (point.refunds / maxVal) * 100;
          const exH = (point.exchanges / maxVal) * 100;
          const dateLabel = new Date(point.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
          return (
            <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end gap-0.5" style={{ height: "80px" }}>
                <div className="flex-1 rounded-t bg-rose-500/70" style={{ height: `${retH}%`, minHeight: 2 }} title={`Retur: ${point.returns}`} />
                <div className="flex-1 rounded-t bg-amber-500/70" style={{ height: `${refH}%`, minHeight: 2 }} title={`Refund: ${point.refunds}`} />
                <div className="flex-1 rounded-t bg-blue-500/70" style={{ height: `${exH}%`, minHeight: 2 }} title={`Tukar: ${point.exchanges}`} />
              </div>
              <span className="text-[9px] text-white/30">{dateLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-500" /><span className="text-xs text-white/40">Retur</span></span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-500" /><span className="text-xs text-white/40">Refund</span></span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-500" /><span className="text-xs text-white/40">Penukaran</span></span>
      </div>
    </section>
  );
}
