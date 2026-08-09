"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { formatMoney } from "@/lib/money";
import { convertIdrToUsdMinor } from "@/lib/currency";

type DisplayCurrency = "IDR" | "USD";

const STORAGE_KEY = "ginabo_currency_v1";

type CurrencyContextValue = {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
  formatPrice: (amountIdr: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("IDR");

  useEffect(() => {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored === "USD" || stored === "IDR") setCurrencyState(stored);
  }, []);

  const setCurrency = useCallback((next: DisplayCurrency) => {
    setCurrencyState(next);
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const formatPrice = useCallback(
    (amountIdr: number) =>
      currency === "USD" ? formatMoney(convertIdrToUsdMinor(amountIdr), "USD") : formatMoney(amountIdr, "IDR"),
    [currency],
  );

  const value = useMemo(() => ({ currency, setCurrency, formatPrice }), [currency, setCurrency, formatPrice]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
