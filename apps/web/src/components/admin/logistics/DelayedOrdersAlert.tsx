"use client";

import type { DelayedOrder } from "@/features/command-center/types";

function formatCurrency(v: number) {
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

export function DelayedOrdersAlert({ orders }: { orders: DelayedOrder[] }) {
  if (orders.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">Order Tertunda</h2>
        <p className="text-sm text-emerald-400">Tidak ada order yang melewati SLA.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rose-400">
        ⚠ Order Tertunda ({orders.length})
      </h2>
      <div className="space-y-2">
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-rose-500/20 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{o.orderNumber}</p>
                <p className="text-xs text-white/40">{o.customerName} · {o.courier}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-rose-400">+{o.delayHours}j</p>
                <p className="text-xs text-white/40">{formatCurrency(o.totalAmount)}</p>
              </div>
            </div>
            <p className="mt-1.5 text-xs text-white/50">📌 {o.reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
