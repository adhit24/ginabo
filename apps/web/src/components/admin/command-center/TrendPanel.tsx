"use client";

import type { TrendPoint } from "@/features/command-center/types";
import { formatDate } from "@/features/command-center/format";

const W = 480;
const H = 120;
const PAD = 24;

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

export function TrendPanel({ trend }: { trend: TrendPoint[] }) {
  if (trend.length === 0) return null;

  const revenues = trend.map((t) => t.revenue);
  const normRev = normalize(revenues);

  const points = normRev
    .map((v, i) => {
      const x = PAD + (i / (trend.length - 1)) * (W - PAD * 2);
      const y = PAD + (1 - v) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const totalRev = revenues.reduce((a, b) => a + b, 0);
  const totalOrd = trend.reduce((a, b) => a + b.orders, 0);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Tren Pendapatan {trend.length} Hari</h2>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-white">
            Rp{(totalRev / 1_000_000).toFixed(1).replace(".", ",")} jt
          </p>
          <p className="text-xs text-white/40">{totalOrd} order total</p>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {normRev.map((v, i) => {
          const x = PAD + (i / (trend.length - 1)) * (W - PAD * 2);
          const y = PAD + (1 - v) * (H - PAD * 2);
          return <circle key={i} cx={x} cy={y} r="3" fill="#a855f7" />;
        })}
      </svg>
      <div className="mt-2 flex justify-between">
        {trend.map((t, i) => (
          <span key={i} className="text-[9px] text-white/30 hidden sm:block">{formatDate(t.date)}</span>
        ))}
      </div>
    </section>
  );
}
