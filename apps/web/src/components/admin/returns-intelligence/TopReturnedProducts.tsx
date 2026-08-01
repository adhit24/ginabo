"use client";

import type { TopReturnedProduct } from "@/features/command-center/types";

export function TopReturnedProducts({ products }: { products: TopReturnedProduct[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
        Produk Retur Tertinggi
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Produk", "Retur", "Return Rate", "Alasan Utama", "Isu"].map((h) => (
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
                <td className="py-2.5 pr-4 text-white/70">{p.returnCount}x</td>
                <td className="py-2.5 pr-4">
                  <span className={`font-bold ${p.returnRate > 6 ? "text-rose-400" : p.returnRate > 3 ? "text-amber-400" : "text-white/60"}`}>
                    {p.returnRate}%
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-white/60 text-xs">{p.topReason}</td>
                <td className="py-2.5">
                  <div className="flex gap-1 flex-wrap">
                    {p.qualityIssue && <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-400">Kualitas</span>}
                    {p.packagingIssue && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">Kemasan</span>}
                    {!p.qualityIssue && !p.packagingIssue && <span className="text-white/20 text-xs">—</span>}
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
