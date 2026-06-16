"use client";

import { useState } from "react";
import Link from "next/link";
import type { AlertItem, AlertSeverity } from "@/features/command-center/types";
import { AlertBadge } from "./AlertBadge";

const CATEGORY_ICON: Record<AlertItem["category"], string> = {
  revenue: "💰",
  inventory: "📦",
  customer: "👥",
  logistics: "🚚",
  fraud: "🚨",
  marketing: "📣",
  system: "⚙️",
};

const ROW_STYLE: Record<AlertSeverity, string> = {
  critical: "border-rose-500/40 bg-rose-500/[0.06]",
  high: "border-amber-500/30 bg-amber-500/[0.04]",
  medium: "border-yellow-500/20 bg-yellow-500/[0.03]",
  low: "border-white/10 bg-white/[0.02]",
};

type FilterType = "all" | AlertSeverity;

export function AlertFeed({ alerts, counts }: {
  alerts: AlertItem[];
  counts: { critical: number; high: number; medium: number; low: number };
}) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const tabs: { key: FilterType; label: string; count: number; color: string }[] = [
    { key: "all", label: "Semua", count: alerts.length, color: "text-white" },
    { key: "critical", label: "Kritikal", count: counts.critical, color: "text-rose-400" },
    { key: "high", label: "Tinggi", count: counts.high, color: "text-amber-400" },
    { key: "medium", label: "Sedang", count: counts.medium, color: "text-yellow-400" },
    { key: "low", label: "Rendah", count: counts.low, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === t.key
                ? "bg-white/10 text-white"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            <span className={t.color}>{t.label}</span>
            {t.count > 0 && (
              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px]">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-white/30 py-4 text-center">Tidak ada alert pada kategori ini.</p>
        ) : (
          filtered.map((alert) => {
            const inner = (
              <div
                className={`rounded-xl border p-4 transition-opacity hover:opacity-90 ${ROW_STYLE[alert.severity]} ${!alert.isRead ? "opacity-100" : "opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5 shrink-0">{CATEGORY_ICON[alert.category]}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{alert.title}</span>
                        {!alert.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-white/60">{alert.detail}</p>
                      <p className="mt-1.5 text-xs font-medium text-white/80">→ {alert.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AlertBadge severity={alert.severity} />
                    {alert.count > 1 && (
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                        ×{alert.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
            return alert.href ? (
              <Link key={alert.id} href={alert.href}>{inner}</Link>
            ) : (
              <div key={alert.id}>{inner}</div>
            );
          })
        )}
      </div>
    </div>
  );
}
