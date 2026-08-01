"use client";

import type { InventoryIntelligenceMetrics } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(2)}M`;
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 36;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="36" fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
        />
        <text x="50" y="50" textAnchor="middle" dy="0.35em" fill="white" fontSize="20" fontWeight="bold">
          {score}
        </text>
      </svg>
      <p className="text-xs text-white/40">Inventory Health</p>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}

export function InventoryHealthScore({ metrics }: { metrics: InventoryIntelligenceMetrics }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Inventory Intelligence</h2>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <ScoreGauge score={metrics.healthScore} />
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
          <StatBox label="Nilai Inventori" value={formatCurrency(metrics.totalInventoryValue)} />
          <StatBox label="Total SKU" value={String(metrics.totalSkus)} />
          <StatBox label="SKU Kritikal" value={String(metrics.criticalSkus)} accent={metrics.criticalSkus > 0 ? "text-rose-400" : "text-white"} />
          <StatBox label="Overstock" value={String(metrics.overstockSkus)} accent="text-amber-400" />
          <StatBox label="Dead Stock" value={String(metrics.deadStockSkus)} accent="text-orange-400" />
          <StatBox label="Fast Moving" value={String(metrics.fastMovingSkus)} accent="text-emerald-400" />
        </div>
      </div>
      {metrics.stockoutRiskRevenue > 0 && (
        <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <p className="text-xs font-semibold text-rose-300">
            ⚠ Risiko Stockout: {formatCurrency(metrics.stockoutRiskRevenue)} pendapatan terancam
          </p>
        </div>
      )}
    </section>
  );
}
