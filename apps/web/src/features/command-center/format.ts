import type { SummaryMetric } from "./types";

const idIDCurrency = new Intl.NumberFormat("id-ID");

export function formatMetricValue(metric: Pick<SummaryMetric, "value" | "unit">): string {
  if (metric.unit === "currency") {
    const abs = Math.abs(metric.value);
    if (abs >= 1_000_000_000) return `Rp${(metric.value / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
    if (abs >= 1_000_000) return `Rp${(metric.value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
    if (abs >= 1_000) return `Rp${(metric.value / 1_000).toFixed(0)} rb`;
    return `Rp${idIDCurrency.format(metric.value)}`;
  }
  if (metric.unit === "percent") {
    return `${String(metric.value).replace(".", ",")}%`;
  }
  return String(metric.value);
}

export function formatAge(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
}

export function formatSyncTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
