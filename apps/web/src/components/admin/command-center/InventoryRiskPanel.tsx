"use client";

import Link from "next/link";
import type { InventoryRiskItem } from "@/features/command-center/types";

function RiskBar({ days }: { days: number }) {
  const color = days <= 3 ? "bg-rose-500" : days <= 5 ? "bg-amber-500" : "bg-yellow-500";
  const width = Math.min(100, (days / 7) * 100);
  return (
    <div className="h-1 w-full rounded-full bg-white/10">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export function InventoryRiskPanel({ risks }: { risks: InventoryRiskItem[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Risiko Stok</h2>
        <Link href="/admin/products" className="text-xs text-purple-400 hover:underline">
          Kelola →
        </Link>
      </div>

      {risks.length === 0 ? (
        <p className="text-sm text-emerald-400">Semua stok dalam kondisi aman.</p>
      ) : (
        <div className="space-y-3">
          {risks.slice(0, 5).map((r) => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{r.name}</p>
                  <p className="text-[10px] text-white/40">{r.sku} · {r.stock} unit tersisa</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${r.daysRemaining <= 3 ? "text-rose-400" : r.daysRemaining <= 5 ? "text-amber-400" : "text-yellow-400"}`}>
                    {r.daysRemaining}h
                  </p>
                  <p className="text-[10px] text-white/40">tersisa</p>
                </div>
              </div>
              <RiskBar days={r.daysRemaining} />
              <p className="text-[10px] text-white/30">Restock: {r.recommendedRestock} unit</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
