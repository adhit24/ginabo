"use client";

import type { CourierPerformance } from "@/features/command-center/types";

function Rate({ value, good = true }: { value: number; good?: boolean }) {
  const color = good
    ? value >= 95 ? "text-emerald-400" : value >= 90 ? "text-amber-400" : "text-rose-400"
    : value <= 2 ? "text-emerald-400" : value <= 4 ? "text-amber-400" : "text-rose-400";
  return <span className={`font-medium ${color}`}>{value}%</span>;
}

export function CourierPerformanceTable({ couriers }: { couriers: CourierPerformance[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
        Performa Kurir
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Kurir", "Pengiriman", "Success Rate", "Avg Hari", "Return Rate", "Complaint", "SLA"].map((h) => (
                <th key={h} className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {couriers.map((c) => (
              <tr key={c.name} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="py-2.5 pr-4 font-semibold text-white">{c.name}</td>
                <td className="py-2.5 pr-4 text-white/60">{c.totalShipments.toLocaleString("id-ID")}</td>
                <td className="py-2.5 pr-4"><Rate value={c.successRate} /></td>
                <td className="py-2.5 pr-4 text-white/60">{c.avgDeliveryDays}d</td>
                <td className="py-2.5 pr-4"><Rate value={c.returnRate} good={false} /></td>
                <td className="py-2.5 pr-4"><Rate value={c.complaintRate} good={false} /></td>
                <td className="py-2.5"><Rate value={c.slaCompliance} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
