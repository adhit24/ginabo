"use client";

import type { SkinTypeDistribution } from "@/features/command-center/types";

const SKIN_COLORS = ["#8b5cf6", "#e879f9", "#06b6d4", "#10b981", "#f59e0b"];

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

export function SkinTypeDistributionChart({ data }: { data: SkinTypeDistribution[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  let cumulative = 0;

  const segments = data.map((d, i) => {
    const pct = d.count / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const r = 70;
    const cx = 80, cy = 80;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { ...d, path, color: SKIN_COLORS[i % SKIN_COLORS.length] };
  });

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Distribusi Tipe Kulit</h2>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
          {segments.map((s) => (
            <path key={s.skinType} d={s.path} fill={s.color} opacity="0.85" />
          ))}
          <circle cx="80" cy="80" r="36" fill="#0f0a1e" />
          <text x="80" y="76" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Tipe</text>
          <text x="80" y="90" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Kulit</text>
        </svg>

        <div className="flex flex-col gap-2 flex-1">
          {segments.map((s) => (
            <div key={s.skinType} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                <span className="text-xs text-white/70">{s.skinType}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white">{s.percentage}%</span>
                <p className="text-[10px] text-white/30">LTV: {formatCurrency(s.avgLtv)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
