"use client";

import type { WaybillResult } from "@/lib/rajaongkir";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DELIVERED:  { label: "Terkirim",    color: "#22c55e" },
  ON_PROCESS: { label: "Diproses",    color: "#f59e0b" },
  ON_TRANSIT: { label: "Dalam Pengiriman", color: "#3b82f6" },
  NOT_FOUND:  { label: "Tidak Ditemukan", color: "#ef4444" },
};

export default function TrackingResult({ result }: { result: WaybillResult }) {
  const statusInfo = STATUS_LABELS[result.status] ?? { label: result.status, color: "#a855f7" };

  return (
    <div
      className="mt-5 rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/40">Nomor Resi</p>
          <p className="text-lg font-bold tracking-wider text-white">{result.waybill_number}</p>
          <p className="text-sm text-white/60">
            {result.courier_name} · {result.service}
          </p>
        </div>
        <span
          className="rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
          style={{ background: statusInfo.color + "33", color: statusInfo.color, border: `1px solid ${statusInfo.color}55` }}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Route */}
      <div
        className="mb-4 grid grid-cols-2 gap-3 rounded-xl p-3 text-sm"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div>
          <p className="text-xs text-white/40">Pengirim</p>
          <p className="font-medium text-white">{result.shipper_name}</p>
          <p className="text-xs text-white/50">{result.origin}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Penerima</p>
          <p className="font-medium text-white">{result.receiver_name}</p>
          <p className="text-xs text-white/50">{result.destination}</p>
        </div>
      </div>

      {/* Manifest timeline */}
      {result.manifests.length > 0 && (
        <div className="flex flex-col gap-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Riwayat Pengiriman
          </p>
          {result.manifests.map((m, i) => (
            <div key={i} className="flex gap-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                  style={{
                    background: i === 0 ? "#a855f7" : "rgba(255,255,255,0.2)",
                    boxShadow: i === 0 ? "0 0 8px #a855f7" : "none",
                  }}
                />
                {i < result.manifests.length - 1 && (
                  <div className="w-px flex-1" style={{ background: "rgba(255,255,255,0.1)", minHeight: 24 }} />
                )}
              </div>

              {/* Content */}
              <div className="pb-4">
                <p className="text-sm font-medium text-white">{m.manifest_description}</p>
                <p className="text-xs text-white/40">
                  {m.city_name && <span>{m.city_name} · </span>}
                  {m.manifest_date} {m.manifest_time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
