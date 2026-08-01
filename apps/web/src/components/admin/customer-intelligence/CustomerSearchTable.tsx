"use client";

import { useState } from "react";
import Link from "next/link";
import type { CustomerListItem, CustomerSegmentType } from "@/features/command-center/types";

const SEGMENT_COLOR: Record<CustomerSegmentType, string> = {
  vip: "#e879f9",
  loyal: "#8b5cf6",
  high_value: "#06b6d4",
  potential_vip: "#10b981",
  frequent_buyer: "#3b82f6",
  discount_seeker: "#f59e0b",
  at_risk: "#f97316",
  churn_risk: "#ef4444",
  dormant: "#6b7280",
  impulse_buyer: "#a78bfa",
  new: "#a78bfa",
};

const SEGMENT_LABEL: Record<CustomerSegmentType, string> = {
  vip: "VIP", loyal: "Loyal", high_value: "High Value",
  potential_vip: "Pot. VIP", frequent_buyer: "Frequent",
  discount_seeker: "Diskon", at_risk: "At Risk",
  churn_risk: "Churn Risk", dormant: "Dormant",
  impulse_buyer: "Impulse", new: "Baru",
};

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `Rp${(v / 1_000_000).toFixed(1)}jt`;
  return `Rp${(v / 1_000).toFixed(0)}rb`;
}

export function CustomerSearchTable({ customers }: { customers: CustomerListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query),
  );

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
          Daftar Pelanggan ({filtered.length})
        </h2>
        <input
          type="search"
          placeholder="Cari nama, email, telepon…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-violet-500/50"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Nama</th>
              <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Segmen</th>
              <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Order</th>
              <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">LTV</th>
              <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Terakhir Beli</th>
              <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="py-2.5">
                  <Link href={`/admin/intelligence/${c.id}`} className="text-white hover:text-violet-300">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-white/30">{c.phone}</p>
                  </Link>
                </td>
                <td className="py-2.5">
                  <span
                    className="rounded px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: (SEGMENT_COLOR[c.segment] ?? "#6b7280") + "30",
                      color: SEGMENT_COLOR[c.segment] ?? "#6b7280",
                    }}
                  >
                    {SEGMENT_LABEL[c.segment] ?? c.segment}
                  </span>
                </td>
                <td className="py-2.5 text-right text-white/70">{c.totalOrders}</td>
                <td className="py-2.5 text-right font-medium text-white">{formatCurrency(c.lifetimeValue)}</td>
                <td className="py-2.5 text-right text-white/40">
                  {c.lastOrderDays === 0 ? "Hari ini" : `${c.lastOrderDays} hr lalu`}
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`text-xs font-bold ${
                      c.riskScore >= 70
                        ? "text-rose-400"
                        : c.riskScore >= 40
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }`}
                  >
                    {c.riskScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
