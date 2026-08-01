"use client";

import { useState, useEffect } from "react";
import { COURIERS, type ShippingOption, type CourierCode, type RajaOngkirCity } from "@/lib/rajaongkir";

interface ShippingCalculatorProps {
  weightGrams: number;
  onSelect?: (option: ShippingOption) => void;
  selectedOption?: ShippingOption | null;
}

export default function ShippingCalculator({ weightGrams, onSelect, selectedOption }: ShippingCalculatorProps) {
  const [cities, setCities] = useState<RajaOngkirCity[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCouriers, setSelectedCouriers] = useState<CourierCode[]>(["jne", "jnt", "sicepat"]);
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  useEffect(() => {
    if (citySearch.trim().length < 2) {
      setCities([]);
      setCitiesLoaded(true);
      return;
    }
    setCitiesLoaded(false);
    const timer = window.setTimeout(() => fetch(`/api/shipping/cities?search=${encodeURIComponent(citySearch.trim())}`)
      .then((r) => r.json())
      .then((d: { cities?: RajaOngkirCity[] }) => {
        if (d.cities) setCities(d.cities);
        setCitiesLoaded(true);
      })
      .catch(() => setCitiesLoaded(true)), 300);
    return () => window.clearTimeout(timer);
  }, [citySearch]);

  const filteredCities = cities.slice(0, 10);

  async function handleCalculate() {
    if (!selectedCityId) return;
    setError("");
    setOptions([]);
    setLoading(true);

    try {
      const res = await fetch("/api/shipping/cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_city_id: selectedCityId,
          weight_grams: weightGrams,
          couriers: selectedCouriers,
        }),
      });
      const data = await res.json() as { options?: ShippingOption[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gagal menghitung ongkir.");
      } else {
        setOptions(data.options ?? []);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* City search */}
      <div className="relative flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Kota Tujuan
        </label>
        <input
          type="text"
          placeholder="Ketik nama kota..."
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
          style={inputStyle}
          disabled={!citiesLoaded}
        />
        {filteredCities.length > 0 && (
          <div
            className="absolute top-full z-20 mt-1 w-full rounded-xl py-1 shadow-xl"
            style={{ background: "#1e0a38", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {filteredCities.map((c) => (
              <button
                key={c.city_id}
                type="button"
                onClick={() => {
                  setSelectedCityId(c.city_id);
                  setCitySearch(`${c.type} ${c.city_name}`);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/10"
              >
                {c.type} {c.city_name}
                  <span className="ml-2 text-xs text-white/40">{c.label ?? `${c.city_name} ${c.postal_code ?? ""}`}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Courier checkboxes */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Kurir</p>
        <div className="flex flex-wrap gap-2">
          {COURIERS.map((c) => {
            const checked = selectedCouriers.includes(c.code);
            return (
              <button
                key={c.code}
                type="button"
                onClick={() =>
                  setSelectedCouriers((prev) =>
                    checked ? prev.filter((x) => x !== c.code) : [...prev, c.code]
                  )
                }
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  background: checked ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)",
                  border: checked ? "1px solid rgba(168,85,247,0.6)" : "1px solid rgba(255,255,255,0.12)",
                  color: checked ? "#e9d5ff" : "rgba(255,255,255,0.5)",
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={!selectedCityId || loading || selectedCouriers.length === 0}
        className="rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
      >
        {loading ? "Menghitung..." : "Cek Ongkir"}
      </button>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Results */}
      {options.length > 0 && (
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            const isSelected =
              selectedOption?.courier_code === opt.courier_code &&
              selectedOption?.service === opt.service;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect?.(opt)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-left transition"
                style={{
                  background: isSelected ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.05)",
                  border: isSelected ? "1px solid rgba(168,85,247,0.6)" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {opt.courier_name} <span className="text-white/60">{opt.service}</span>
                  </p>
                  <p className="text-xs text-white/40">
                    {opt.service_description} · Estimasi {opt.etd}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    Rp {opt.cost.toLocaleString("id-ID")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
