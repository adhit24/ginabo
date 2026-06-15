"use client";

import Link from "next/link";
import type { OperationalAlert, AlertSeverity } from "@/features/command-center/types";

const SEV_LABEL: Record<AlertSeverity, string> = {
  critical: "Kritis",
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const SEV_COLOR: Record<AlertSeverity, string> = {
  critical: "border-rose-500/50 bg-rose-500/10",
  high: "border-amber-500/50 bg-amber-500/10",
  medium: "border-yellow-500/50 bg-yellow-500/10",
  low: "border-blue-500/50 bg-blue-500/10",
};

const SEV_BADGE: Record<AlertSeverity, string> = {
  critical: "bg-rose-500 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
};

function AlertRow({ alert }: { alert: OperationalAlert }) {
  const inner = (
    <div className={`rounded-lg border p-3 transition-opacity hover:opacity-90 ${SEV_COLOR[alert.severity]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-white">{alert.title}</span>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${SEV_BADGE[alert.severity]}`}>
          {SEV_LABEL[alert.severity]} · {alert.count}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/60">{alert.context}</p>
      <p className="mt-1 text-xs font-medium text-white/80">→ {alert.action}</p>
    </div>
  );

  return alert.href ? <Link href={alert.href}>{inner}</Link> : inner;
}

export function AlertsPanel({ alerts }: { alerts: OperationalAlert[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
        Peringatan Operasional {alerts.length > 0 ? `(${alerts.length})` : ""}
      </h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-emerald-400">Semua sistem berjalan normal.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <AlertRow key={a.id} alert={a} />
          ))}
        </div>
      )}
    </section>
  );
}
