"use client";

import type { InventoryItem, StockStatus } from "@/features/command-center/types";

const STATUS_LABEL: Record<StockStatus, string> = {
  fast_moving: "Fast Moving",
  slow_moving: "Slow Moving",
  dead_stock: "Dead Stock",
  healthy: "Sehat",
  critical: "Kritikal",
  overstock: "Overstock",
};

const STATUS_COLOR: Record<StockStatus, string> = {
  fast_moving: "#10b981",
  slow_moving: "#f59e0b",
  dead_stock: "#f97316",
  healthy: "#06b6d4",
  critical: "#ef4444",
  overstock: "#a78bfa",
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

export function StockStatusTable({ items }: { items: InventoryItem[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
        Status Stok ({items.length} SKU)
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Produk", "Status", "Stok", "Kecepatan", "Sisa", "Nilai Stok", "Restock"].map((h) => (
                <th key={h} className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="py-2.5 pr-4">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-[10px] text-white/30">{item.sku}</p>
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: (STATUS_COLOR[item.stockStatus] ?? "#6b7280") + "30",
                      color: STATUS_COLOR[item.stockStatus] ?? "#6b7280",
                    }}
                  >
                    {STATUS_LABEL[item.stockStatus] ?? item.stockStatus}
                  </span>
                </td>
                <td className="py-2.5 pr-4">
                  <span className={item.currentStock <= item.reorderPoint ? "font-bold text-rose-400" : "text-white/70"}>
                    {item.currentStock}
                  </span>
                  {item.incomingStock > 0 && (
                    <span className="ml-1 text-xs text-emerald-400">+{item.incomingStock}</span>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-white/60">{item.dailyVelocity}/hari</td>
                <td className="py-2.5 pr-4">
                  <span className={
                    item.daysRemaining <= 0 ? "font-bold text-rose-500" :
                    item.daysRemaining <= 7 ? "font-bold text-amber-400" :
                    "text-white/60"
                  }>
                    {item.daysRemaining <= 0 ? "Habis" : `${item.daysRemaining}h`}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-white/60">{formatCurrency(item.stockValue)}</td>
                <td className="py-2.5">
                  {item.recommendedRestock > 0 ? (
                    <span className="text-violet-400 font-medium">{item.recommendedRestock} unit</span>
                  ) : (
                    <span className="text-white/20">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
