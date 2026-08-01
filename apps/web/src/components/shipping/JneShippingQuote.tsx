"use client";

import { useEffect, useState } from "react";
import type { ShippingOption } from "@/lib/rajaongkir";

type Props = {
  city: string;
  province?: string | null;
  weightGrams: number;
  onSelect: (option: ShippingOption | null) => void;
};

export default function JneShippingQuote({ city, province, weightGrams, onSelect }: Props) {
  const [option, setOption] = useState<ShippingOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setOption(null);
    onSelect(null);
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    fetch("/api/shipping/cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination_city_name: city,
        destination_province_name: province ?? undefined,
        weight_grams: weightGrams,
        couriers: ["jne"],
      }),
    })
      .then(async (response) => {
        const data = await response.json() as { options?: ShippingOption[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Gagal menghitung ongkir JNE.");
        return data.options?.[0] ?? null;
      })
      .then((nextOption) => {
        if (cancelled) return;
        setOption(nextOption);
        onSelect(nextOption);
        if (!nextOption) setError("Layanan JNE belum tersedia untuk kota ini.");
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : "Gagal menghitung ongkir JNE.");
        onSelect(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city, province, weightGrams, onSelect]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
          <img src="/jne-logo.png" alt="JNE Express" className="max-h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900">JNE Express</p>
          <p className="text-xs text-gray-500">
            {loading ? "Menghitung ongkir berdasarkan alamat terpilih…" : option ? `${option.service} · Estimasi ${option.etd}` : "Ongkir otomatis dari alamat terpilih"}
          </p>
        </div>
        <p className="shrink-0 text-sm font-extrabold text-brand-700">
          {loading ? "…" : option ? `Rp ${option.cost.toLocaleString("id-ID")}` : "—"}
        </p>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
