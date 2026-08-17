"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type TierKey = "starter" | "growth" | "premier";

export interface TierInfo {
  key: TierKey;
  name: string;
  short: string;
  modal: string;
  rate: number;
  margin: string;
  profit: string;
}

export const TIERS: Record<TierKey, TierInfo> = {
  starter: { key: "starter", name: "Starter Partner", short: "Starter", modal: "Rp3,5 jt", rate: 0.3, margin: "Margin hingga 30%", profit: "Rp1.050.000" },
  growth: { key: "growth", name: "Growth Partner", short: "Growth", modal: "Rp10 jt", rate: 0.35, margin: "Margin hingga 35%", profit: "Rp3.500.000" },
  premier: { key: "premier", name: "Premier Partner", short: "Premier", modal: "Rp25 jt", rate: 0.4, margin: "Margin hingga 40%", profit: "Rp10.000.000" },
};

export const TIER_ORDER: TierKey[] = ["starter", "growth", "premier"];

export function fmtRp(n: number) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

export function partnerPrice(retail: number, tier: TierKey) {
  const rate = TIERS[tier].rate;
  return Math.round((retail * (1 - rate)) / 500) * 500;
}

interface ResellerTierContextValue {
  tier: TierKey;
  setTier: (tier: TierKey) => void;
  picked: TierInfo;
}

const ResellerTierContext = createContext<ResellerTierContextValue | null>(null);

export function ResellerTierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTierState] = useState<TierKey>("growth");

  const setTier = useCallback((next: TierKey) => {
    setTierState(next);
  }, []);

  const value = useMemo(() => ({ tier, setTier, picked: TIERS[tier] }), [tier, setTier]);

  return <ResellerTierContext.Provider value={value}>{children}</ResellerTierContext.Provider>;
}

export function useResellerTier() {
  const ctx = useContext(ResellerTierContext);
  if (!ctx) throw new Error("useResellerTier must be used inside ResellerTierProvider");
  return ctx;
}
