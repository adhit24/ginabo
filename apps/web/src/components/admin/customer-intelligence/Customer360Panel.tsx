"use client";

import type { Customer360Data } from "@/features/command-center/types";

function formatCurrency(v: number) {
  if (v >= 1_000_000_000) return `Rp${(v / 1_000_000_000).toFixed(2)}M`;
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(2)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-2">
      <span className="text-xs text-white/40 shrink-0 w-36">{label}</span>
      <span className="text-xs text-white text-right">{value}</span>
    </div>
  );
}

const RISK_COLOR = (score: number) =>
  score >= 70 ? "text-rose-400" : score >= 40 ? "text-amber-400" : "text-emerald-400";

export function Customer360Panel({ data }: { data: Customer360Data }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-white">{data.name}</h2>
            <p className="text-sm text-white/40 mt-0.5">{data.email} · {data.phone}</p>
          </div>
          <span
            className="rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)", color: "white" }}
          >
            {data.segment.replace("_", " ")}
          </span>
        </div>

        {/* Score bars */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Loyalty Score</p>
            <p className="text-2xl font-bold text-violet-400">{data.loyaltyScore}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Risk Score</p>
            <p className={`text-2xl font-bold ${RISK_COLOR(data.riskScore)}`}>{data.riskScore}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Lifetime Value</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(data.lifetimeValue)}</p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">
          ✨ Ringkasan AI
        </p>
        <p className="text-sm text-white/80 leading-relaxed">{data.aiSummary}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Identity */}
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Profil</h3>
          <InfoRow label="Alamat" value={data.address} />
          <InfoRow label="Grup Usia" value={data.ageGroup} />
          <InfoRow label="Gender" value={data.gender} />
          <InfoRow label="Tipe Kulit" value={data.skinType} />
          <InfoRow label="Masalah Kulit" value={data.skinConcern.join(", ")} />
          <InfoRow label="Sumber Akuisisi" value={data.acquisitionSource} />
          <InfoRow label="Kampanye Asal" value={data.campaignSource} />
          <InfoRow label="Bergabung" value={data.registeredAt} />
        </section>

        {/* Predictions */}
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Prediksi AI</h3>
          <InfoRow label="Risiko Churn" value={`${data.predictedChurnProbability}%`} />
          <InfoRow label="Pembelian Berikutnya" value={`${data.predictedNextPurchaseDays} hari lagi`} />
          <InfoRow label="Prediksi LTV" value={formatCurrency(data.predictedLifetimeValue)} />
          <InfoRow label="Repeat Purchase Rate" value={`${data.repeatPurchaseRate}%`} />
          <InfoRow label="Rata-rata Order" value={formatCurrency(data.avgOrderValue)} />
          <InfoRow label="Total Order" value={`${data.totalOrders}x`} />
          <InfoRow label="Terakhir Beli" value={data.lastOrderDate} />
        </section>
      </div>

      {/* Order History */}
      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Riwayat Order</h3>
        <div className="space-y-2">
          {data.orderHistory.map((o) => (
            <div key={o.orderNumber} className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <div>
                <p className="text-sm font-medium text-white">{o.orderNumber}</p>
                <p className="text-xs text-white/40">{o.date} · {o.products.join(", ")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{formatCurrency(o.totalAmount)}</p>
                <p className="text-xs text-emerald-400">{o.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
