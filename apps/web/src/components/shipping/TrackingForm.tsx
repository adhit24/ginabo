"use client";

import { useState } from "react";
import { COURIERS, type CourierCode, type WaybillResult } from "@/lib/rajaongkir";
import TrackingResult from "./TrackingResult";

interface TrackingFormProps {
  defaultWaybill?: string;
  defaultCourier?: CourierCode;
}

export default function TrackingForm({ defaultWaybill, defaultCourier }: TrackingFormProps) {
  const [waybill, setWaybill] = useState(defaultWaybill ?? "");
  const [courier, setCourier] = useState<CourierCode>(defaultCourier ?? "jne");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaybillResult | null>(null);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/shipping/track?waybill=${encodeURIComponent(waybill)}&courier=${courier}`
      );
      const data = await res.json() as WaybillResult & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Nomor resi tidak ditemukan.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleTrack} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Courier selector */}
        <div className="flex flex-col gap-1.5 sm:w-44">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Kurir
          </label>
          <select
            value={courier}
            onChange={(e) => setCourier(e.target.value as CourierCode)}
            className="rounded-xl px-3 py-3 text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {COURIERS.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "#1e0a38" }}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Waybill input */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Nomor Resi
          </label>
          <input
            type="text"
            required
            placeholder="Masukkan nomor resi..."
            value={waybill}
            onChange={(e) => setWaybill(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !waybill.trim()}
          className="rounded-xl px-6 py-3 text-sm font-bold text-white transition disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
        >
          {loading ? "Melacak..." : "Lacak"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && <TrackingResult result={result} />}
    </div>
  );
}
