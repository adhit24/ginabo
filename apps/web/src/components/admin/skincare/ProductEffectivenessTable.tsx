"use client";

import type { ProductEffectiveness } from "@/features/command-center/types";

export function ProductEffectivenessTable({ products }: { products: ProductEffectiveness[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
        Efektivitas Produk per Tipe Kulit
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Produk", "Tipe Kulit", "Repeat Rate", "Rating", "Ulasan", "Skor"].map((h) => (
                <th key={h} className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.sku} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="py-2.5 pr-4">
                  <p className="font-medium text-white">{p.productName}</p>
                  <p className="text-[10px] text-white/30">{p.sku}</p>
                </td>
                <td className="py-2.5 pr-4 text-white/60">{p.skinType}</td>
                <td className="py-2.5 pr-4">
                  <span className={`font-bold ${p.repeatPurchaseRate >= 80 ? "text-emerald-400" : p.repeatPurchaseRate >= 60 ? "text-amber-400" : "text-white/60"}`}>
                    {p.repeatPurchaseRate}%
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-amber-400 font-medium">★ {p.avgRating}</td>
                <td className="py-2.5 pr-4 text-white/50">{p.reviewCount.toLocaleString("id-ID")}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${p.effectivenessScore}%` }} />
                    </div>
                    <span className="text-xs font-bold text-violet-400">{p.effectivenessScore}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
