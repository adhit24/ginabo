"use client";

import Link from "next/link";
import type { OrderQueueItem } from "@/features/command-center/types";
import { formatAge } from "@/features/command-center/format";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-blue-500/20 text-blue-300",
    processing: "bg-amber-500/20 text-amber-300",
    shipped: "bg-purple-500/20 text-purple-300",
    delivered: "bg-emerald-500/20 text-emerald-300",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${map[status] ?? "bg-white/10 text-white/50"}`}>
      {status}
    </span>
  );
}

export function OrderQueuePanel({ orders }: { orders: OrderQueueItem[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Antrean Order</h2>
        <Link href="/admin/orders" className="text-xs text-purple-400 hover:underline">
          Lihat semua →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-emerald-400">Tidak ada order dalam antrean.</p>
      ) : (
        <>
          {/* Desktop table */}
          <table className="hidden w-full text-xs sm:table">
            <thead>
              <tr className="text-white/30">
                <th className="pb-2 text-left font-medium">Order</th>
                <th className="pb-2 text-left font-medium">Pelanggan</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Umur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className={o.needsAttention ? "opacity-100" : "opacity-70"}>
                  <td className="py-2 font-mono text-white/80">{o.orderNumber}</td>
                  <td className="py-2 text-white/70">{o.customerName}</td>
                  <td className="py-2"><StatusBadge status={o.status} /></td>
                  <td className="py-2 text-right">
                    <span className={o.needsAttention ? "text-rose-400 font-bold" : "text-white/40"}>
                      {formatAge(o.ageMinutes)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile stacked */}
          <div className="space-y-2 sm:hidden">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className={`rounded-lg border border-white/10 p-3 ${o.needsAttention ? "border-rose-500/40" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white/80">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-white/50">{o.customerName}</span>
                  <span className={`text-xs ${o.needsAttention ? "text-rose-400 font-bold" : "text-white/40"}`}>
                    {formatAge(o.ageMinutes)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
