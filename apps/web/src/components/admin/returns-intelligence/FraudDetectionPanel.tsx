"use client";

import type { FraudFlag, FraudRiskLevel } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

const RISK_STYLE: Record<FraudRiskLevel, string> = {
  critical: "border-rose-500/50 bg-rose-500/[0.08]",
  high: "border-amber-500/40 bg-amber-500/[0.06]",
  medium: "border-yellow-500/30 bg-yellow-500/[0.04]",
  low: "border-white/10 bg-white/[0.03]",
};

const RISK_BADGE: Record<FraudRiskLevel, string> = {
  critical: "bg-rose-500 text-white",
  high: "bg-amber-500 text-black",
  medium: "bg-yellow-400 text-black",
  low: "bg-blue-500 text-white",
};

const RISK_LABEL: Record<FraudRiskLevel, string> = {
  critical: "Kritikal", high: "Tinggi", medium: "Sedang", low: "Rendah",
};

export function FraudDetectionPanel({ flags }: { flags: FraudFlag[] }) {
  if (flags.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">Deteksi Fraud</h2>
        <p className="text-sm text-emerald-400">Tidak ada aktivitas fraud terdeteksi.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-rose-400">
        🚨 Deteksi Fraud ({flags.length})
      </h2>
      <div className="space-y-3">
        {flags.map((f) => (
          <div key={f.id} className={`rounded-lg border p-4 ${RISK_STYLE[f.riskLevel]}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{f.customerName}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${RISK_BADGE[f.riskLevel]}`}>
                    {RISK_LABEL[f.riskLevel]} · Score {f.fraudScore}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-white/40">
                  {f.totalOrders} order · {f.totalReturns} retur · Refund total: {formatCurrency(f.totalRefundValue)}
                </p>
              </div>
              <p className="text-xs text-white/30">Aktivitas: {f.lastActivity}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {f.reasons.map((r) => (
                <span key={r} className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
