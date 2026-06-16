"use client";

import type { ExecutiveDashboardData } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(2)}M`;
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export function BusinessScoreCard({ data }: { data: ExecutiveDashboardData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Health scores */}
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Skor Kesehatan Bisnis</h2>
        <div className="space-y-4">
          <ScoreBar score={data.businessHealthScore} label="Business Health Score" color="#10b981" />
          <ScoreBar score={data.growthScore} label="Growth Score" color="#8b5cf6" />
          <ScoreBar score={data.marketingRoi} label="Marketing ROI %" color="#e879f9" />
        </div>
      </section>

      {/* Forecast */}
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Proyeksi Bulan Depan</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Forecast Pendapatan</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(data.forecastRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Forecast Laba</p>
            <p className="text-2xl font-bold text-violet-400">{formatCurrency(data.forecastProfit)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-white/40">Customer Growth</p>
              <p className="text-lg font-bold text-emerald-400">+{data.customerGrowthRate}%</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Refund Rate</p>
              <p className={`text-lg font-bold ${data.refundRate > 3 ? "text-rose-400" : "text-white"}`}>{data.refundRate}%</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
