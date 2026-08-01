"use client";

import { useCurrency } from "./CurrencyProvider";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center rounded-full border border-gray-200 bg-white p-0.5 text-[11px] font-bold" role="group" aria-label="Pilih mata uang">
      {(["IDR", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`rounded-full px-2.5 py-1 transition ${
            currency === c ? "bg-brand-700 text-white" : "text-gray-500 hover:text-brand-700"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
