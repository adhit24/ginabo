"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CommandCenterData, CommandCenterPeriod } from "@/features/command-center/types";
import { formatSyncTime } from "@/features/command-center/format";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { KpiGrid } from "./KpiGrid";
import { TrendPanel } from "./TrendPanel";
import { HealthPanel } from "./HealthPanel";
import { AlertsPanel } from "./AlertsPanel";
import { AdvisorPanel } from "./AdvisorPanel";
import { OrderQueuePanel } from "./OrderQueuePanel";
import { InventoryRiskPanel } from "./InventoryRiskPanel";

const REFRESH_INTERVAL_MS = 60_000;

export function CommandCenterDashboard() {
  const [period, setPeriod] = useState<CommandCenterPeriod>("7d");
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(
    async (isBackground = false) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      if (!isBackground) {
        if (!data) setLoading(true);
        else setRefreshing(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      try {
        const res = await fetch(`/api/admin/command-center?period=${period}`, {
          signal: ctrl.signal,
        });
        const json = (await res.json()) as { ok: boolean; data?: CommandCenterData; error?: string };
        if (!json.ok) throw new Error(json.error ?? "Server error");
        setData(json.data!);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message ?? "Gagal memuat data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, data],
  );

  // Initial + period-change fetch
  useEffect(() => {
    void fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Auto-refresh every 60s when tab is visible
  useEffect(() => {
    function scheduleRefresh() {
      timerRef.current = setTimeout(() => {
        if (document.visibilityState === "visible") {
          void fetchData(true);
        }
        scheduleRefresh();
      }, REFRESH_INTERVAL_MS);
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void fetchData(true);
      }
    }

    scheduleRefresh();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  if (loading && !data) {
    return (
      <div className="p-4 sm:p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">Command Center</h1>
            {data?.source === "demo" && (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                DATA DEMO
              </span>
            )}
            {refreshing && (
              <span className="text-xs text-white/30 animate-pulse">Memperbarui…</span>
            )}
          </div>
          {data && (
            <p className="text-xs text-white/30">
              Diperbarui {formatSyncTime(data.synchronizedAt)} WIB
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as CommandCenterPeriod)}
            className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white"
          >
            <option value="7d">7 Hari</option>
            <option value="30d">30 Hari</option>
          </select>
          <button
            onClick={() => void fetchData(true)}
            aria-busy={refreshing}
            disabled={refreshing}
            className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white hover:bg-white/[0.10] disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-300">Gagal memuat data</p>
          <p className="mt-1 text-xs text-rose-400/70">{error}</p>
          <button
            onClick={() => void fetchData(false)}
            className="mt-2 text-xs text-rose-300 underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {data && (
        <>
          {/* KPIs */}
          <KpiGrid metrics={data.summary} />

          {/* Trend + Health */}
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
            <TrendPanel trend={data.trend} />
            <HealthPanel health={data.health} />
          </section>

          {/* Alerts + Advisor */}
          <section className="grid gap-4 xl:grid-cols-2">
            <AlertsPanel alerts={data.alerts} />
            <AdvisorPanel actions={data.advisorActions} source={data.source} />
          </section>

          {/* Orders + Inventory */}
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
            <OrderQueuePanel orders={data.orderQueue} />
            <InventoryRiskPanel risks={data.inventoryRisks} />
          </section>
        </>
      )}
    </div>
  );
}
