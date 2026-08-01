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
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setOptions([]);
    setSelectedService(null);
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
        return (data.options ?? [])
          .filter((item) => ["REG", "YES"].includes(item.service.trim().toUpperCase()))
          .sort((a, b) => (a.service.toUpperCase() === "REG" ? -1 : b.service.toUpperCase() === "REG" ? 1 : a.cost - b.cost));
      })
      .then((nextOptions) => {
        if (cancelled) return;
        setOptions(nextOptions);
        const defaultOption = nextOptions[0] ?? null;
        setSelectedService(defaultOption?.service ?? null);
        onSelect(defaultOption);
        if (!defaultOption) setError("Layanan JNE REG/YES belum tersedia untuk kota ini.");
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
            {loading ? "Menghitung ongkir berdasarkan alamat terpilih…" : "Pilih layanan pengiriman JNE"}
          </p>
        </div>
      </div>
      {!loading && options.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {options.map((item) => {
            const selected = selectedService === item.service;
            return (
              <button
                key={`${item.courier_code}-${item.service}`}
                type="button"
                onClick={() => {
                  setSelectedService(item.service);
                  onSelect(item);
                }}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${selected ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white hover:border-brand-300"}`}
              >
                <span>
                  <span className="block text-sm font-bold text-gray-900">JNE {item.service}</span>
                  <span className="block text-[11px] text-gray-500">Estimasi {item.etd}</span>
                </span>
                <span className="text-sm font-extrabold text-brand-700">Rp {item.cost.toLocaleString("id-ID")}</span>
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
