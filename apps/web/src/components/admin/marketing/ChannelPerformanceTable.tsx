"use client";

import type { MarketingChannel } from "@/features/command-center/types";

const PLATFORM_ICON: Record<string, string> = {
  meta: "📘", google: "🔵", tiktok: "🎵", email: "📧",
  affiliate: "🤝", influencer: "⭐", referral: "🔗", organic: "🌱",
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

export function ChannelPerformanceTable({ channels }: { channels: MarketingChannel[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">
        Performa Channel Marketing
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Channel", "Spend", "Revenue", "ROAS", "CAC", "Konversi", "Conv. Rate"].map((h) => (
                <th key={h} className="pb-2 pr-4 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((c) => (
              <tr key={c.name} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span>{PLATFORM_ICON[c.platform] ?? "📊"}</span>
                    <span className="font-medium text-white">{c.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-white/60">{formatCurrency(c.spend)}</td>
                <td className="py-2.5 pr-4 font-medium text-emerald-400">{formatCurrency(c.revenue)}</td>
                <td className="py-2.5 pr-4">
                  <span className={`font-bold ${c.roas >= 5 ? "text-emerald-400" : c.roas >= 3 ? "text-amber-400" : "text-rose-400"}`}>
                    {c.roas}x
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-white/60">{formatCurrency(c.cac)}</td>
                <td className="py-2.5 pr-4 text-white/60">{c.conversions.toLocaleString("id-ID")}</td>
                <td className="py-2.5 text-violet-400 font-medium">{c.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
