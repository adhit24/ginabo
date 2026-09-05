import { createAdminClient } from "@/lib/supabase/server";
import type {
  CommandCenterData,
  CommandCenterProvider,
  CommandCenterProviderInput,
  HealthStatus,
  OperationalAlert,
} from "./types";

export interface LiveCommandCenterRepository {
  getOrdersSince(iso: string): Promise<unknown[]>;
  getProducts(): Promise<unknown[]>;
  getPaymentsSince(iso: string): Promise<unknown[]>;
  getProfilesSince(iso: string): Promise<unknown[]>;
  getReturnsSince(iso: string): Promise<unknown[]>;
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  profiles?: { full_name?: string } | null;
}

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
}

interface ReturnRow {
  id: string;
  status: string;
  refund_amount: number;
  risk_score: number;
  created_at: string;
}

function healthStatus(score: number): HealthStatus {
  if (score >= 80) return "healthy";
  if (score >= 60) return "watch";
  return "critical";
}

export function aggregateRows({
  period,
  now,
  orders,
  products,
  payments,
  profiles,
  returns,
}: {
  period: "7d" | "30d";
  now: Date;
  orders: unknown[];
  products: unknown[];
  payments: unknown[];
  profiles: unknown[];
  returns: unknown[];
}): CommandCenterData {
  const typedOrders = orders as OrderRow[];
  const typedProducts = products as ProductRow[];
  const typedReturns = returns as ReturnRow[];

  const nowMs = now.getTime();
  const windowDays = period === "30d" ? 30 : 7;

  // Revenue from paid/processing/shipped/delivered orders
  const revenueOrders = typedOrders.filter((o) =>
    ["paid", "processing", "shipped", "delivered"].includes(o.status),
  );
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
  const orderCount = typedOrders.length;
  const aov = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  // Fulfillment: delivered / total (excluding cancelled)
  const nonCancelled = typedOrders.filter((o) => o.status !== "cancelled");
  const delivered = typedOrders.filter((o) => o.status === "delivered" || o.status === "completed");
  const fulfillmentRate = nonCancelled.length > 0
    ? Math.round((delivered.length / nonCancelled.length) * 1000) / 10
    : 100;

  // Returns
  const returnCount = typedReturns.length;
  const returnRate = orderCount > 0
    ? Math.round((returnCount / orderCount) * 1000) / 10
    : 0;
  const riskyReturns = typedReturns.filter((r) => (r.risk_score ?? 0) >= 70);

  // Orders needing attention: older than 4h and in pending/paid/processing
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
  const orderQueue = typedOrders
    .filter((o) => ["paid", "processing"].includes(o.status))
    .slice(0, 5)
    .map((o) => {
      const ageMs = nowMs - new Date(o.created_at).getTime();
      const ageMinutes = Math.floor(ageMs / 60000);
      return {
        id: o.id,
        orderNumber: o.order_number,
        customerName: (o.profiles as { full_name?: string } | null)?.full_name ?? "Pelanggan",
        status: o.status,
        totalAmount: o.total_amount ?? 0,
        ageMinutes,
        needsAttention: ageMs > FOUR_HOURS_MS,
      };
    });

  const attentionCount = typedOrders.filter((o) => {
    const ageMs = nowMs - new Date(o.created_at).getTime();
    return ["paid", "processing"].includes(o.status) && ageMs > FOUR_HOURS_MS;
  }).length;

  // Inventory risks: products with < 7 days of stock at estimated velocity
  const inventoryRisks = typedProducts
    .filter((p) => p.stock_quantity > 0)
    .map((p) => {
      const dailyVelocity = Math.max(1, Math.round((orderCount / windowDays) * 0.1 * 10) / 10);
      const daysRemaining = Math.floor(p.stock_quantity / dailyVelocity);
      return { ...p, dailyVelocity, daysRemaining, recommendedRestock: Math.ceil(dailyVelocity * 30) };
    })
    .filter((p) => p.daysRemaining <= 7)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock_quantity,
      dailyVelocity: p.dailyVelocity,
      daysRemaining: p.daysRemaining,
      recommendedRestock: p.recommendedRestock,
    }));

  const inventoryRiskCount = typedProducts.filter((p) => {
    const dv = Math.max(1, Math.round((orderCount / windowDays) * 0.1 * 10) / 10);
    return p.stock_quantity / dv <= 7;
  }).length;

  // Trend: build per-day buckets for last 7 days
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(nowMs - (6 - i) * 86_400_000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = typedOrders.filter((o) => o.created_at?.slice(0, 10) === dateStr);
    const dayRevenue = dayOrders
      .filter((o) => ["paid", "processing", "shipped", "delivered"].includes(o.status))
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    return { date: dateStr, revenue: dayRevenue, orders: dayOrders.length };
  });

  // Health scores
  const opsScore = Math.max(0, Math.min(100, Math.round(fulfillmentRate - attentionCount * 3)));
  const invScore = Math.max(0, Math.min(100, 100 - inventoryRiskCount * 5));
  const custScore = Math.max(0, Math.min(100, Math.round(100 - returnRate * 5)));
  const finScore = Math.max(0, Math.min(100, totalRevenue > 0 ? 80 : 50));

  const health = [
    { key: "operations" as const, label: "Operasional", score: opsScore, status: healthStatus(opsScore), explanation: `Fulfillment ${fulfillmentRate}%, ${attentionCount} order melewati SLA.` },
    { key: "inventory" as const, label: "Inventori", score: invScore, status: healthStatus(invScore), explanation: `${inventoryRiskCount} SKU perlu keputusan restock.` },
    { key: "customer" as const, label: "Pelanggan", score: custScore, status: healthStatus(custScore), explanation: `Return rate ${returnRate}%, ${profiles.length} pelanggan baru.` },
    { key: "financial" as const, label: "Finansial", score: finScore, status: healthStatus(finScore), explanation: `Total pendapatan ${windowDays}h: Rp${(totalRevenue / 1_000_000).toFixed(1)} jt.` },
  ];

  // Alerts
  const alerts: OperationalAlert[] = [];
  if (attentionCount > 0) {
    alerts.push({ id: "delayed-orders", severity: "critical", title: "Order melewati SLA", context: `${attentionCount} order belum diproses lebih dari 4 jam.`, action: "Prioritaskan picking dan packing.", count: attentionCount, href: "/admin/orders" });
  }
  if (inventoryRiskCount > 0) {
    alerts.push({ id: "low-stock", severity: "high", title: "Stok mendekati habis", context: `${inventoryRiskCount} SKU memiliki stok kurang dari 7 hari.`, action: "Buat keputusan restock hari ini.", count: inventoryRiskCount, href: "/admin/products" });
  }
  if (riskyReturns.length > 0) {
    alerts.push({ id: "risky-returns", severity: "high", title: "Retur berisiko", context: `${riskyReturns.length} pengajuan memiliki risk score di atas 70.`, action: "Lakukan review manual.", count: riskyReturns.length, href: "/admin/returns" });
  }

  const generatedAt = now.toISOString();

  return {
    source: "live",
    period,
    generatedAt,
    synchronizedAt: generatedAt,
    summary: [
      { key: "revenue", label: "Pendapatan", value: totalRevenue, unit: "currency", comparisonPercent: 0, comparisonDirection: "flat", comparisonLabel: `vs ${windowDays} hari lalu` },
      { key: "orders", label: "Total order", value: orderCount, unit: "count", comparisonPercent: 0, comparisonDirection: "flat", comparisonLabel: `vs ${windowDays} hari lalu` },
      { key: "aov", label: "Rata-rata order", value: aov, unit: "currency", comparisonPercent: 0, comparisonDirection: "flat", comparisonLabel: `vs ${windowDays} hari lalu` },
      { key: "fulfillment", label: "Fulfillment", value: fulfillmentRate, unit: "percent", comparisonPercent: 0, comparisonDirection: "flat", comparisonLabel: `vs ${windowDays} hari lalu` },
      { key: "returns", label: "Return rate", value: returnRate, unit: "percent", comparisonPercent: 0, comparisonDirection: "flat", comparisonLabel: `vs ${windowDays} hari lalu` },
      { key: "inventoryRisk", label: "Stok berisiko", value: inventoryRiskCount, unit: "count", comparisonPercent: 0, comparisonDirection: "flat", comparisonLabel: "SKU perlu tindakan" },
    ],
    trend,
    health,
    alerts,
    advisorActions: [
      ...(inventoryRisks.length > 0 ? [{ id: "restock", title: `Restock ${inventoryRisks[0].name}`, reason: `Stok habis dalam ${inventoryRisks[0].daysRemaining} hari.`, impact: "Cegah kehabisan stok.", urgency: "now" as const, actionLabel: "Buka produk", href: "/admin/products" }] : []),
      ...(attentionCount > 0 ? [{ id: "clear-queue", title: "Kosongkan antrean order lama", reason: `${attentionCount} order melewati SLA internal.`, impact: "Jaga fulfillment rate.", urgency: "today" as const, actionLabel: "Buka order", href: "/admin/orders" }] : []),
      ...(riskyReturns.length > 0 ? [{ id: "review-returns", title: "Review retur berisiko", reason: `${riskyReturns.length} retur perlu keputusan manual.`, impact: "Kurangi refund tidak valid.", urgency: "today" as const, actionLabel: "Buka retur", href: "/admin/returns" }] : []),
    ],
    orderQueue,
    inventoryRisks,
  };
}

function createSupabaseRepository(): LiveCommandCenterRepository {
  const db = createAdminClient();
  return {
    async getOrdersSince(iso) {
      const { data, error } = await db
        .from("orders")
        .select("id, order_number, status, total_amount, created_at, updated_at, profiles:profile_id(full_name)")
        .gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
    async getProducts() {
      const { data, error } = await db
        .from("products")
        .select("id, name, sku, stock_quantity, is_active")
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    async getPaymentsSince(iso) {
      const { data, error } = await db
        .from("payments")
        .select("id, status, gross_amount, created_at")
        .gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
    async getProfilesSince(iso) {
      const { data, error } = await db
        .from("profiles")
        .select("id, created_at")
        .gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
    async getReturnsSince(iso) {
      const query = db.from("returns" as never) as unknown as {
        select(columns: string): { gte(column: string, value: string): Promise<{ data: unknown[] | null; error: Error | null }> };
      };
      const { data, error } = await query
        .select("id, status, refund_amount, risk_score, created_at")
        .gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
  };
}

export async function buildLiveSnapshot(
  repository: LiveCommandCenterRepository,
  input: CommandCenterProviderInput,
): Promise<CommandCenterData> {
  const now = input.now ?? new Date();
  const windowDays = input.period === "30d" ? 30 : 7;
  const since = new Date(now.getTime() - windowDays * 86_400_000).toISOString();

  const [orders, products, payments, profiles, returns] = await Promise.all([
    repository.getOrdersSince(since),
    repository.getProducts(),
    repository.getPaymentsSince(since),
    repository.getProfilesSince(since),
    repository.getReturnsSince(since),
  ]);

  return aggregateRows({ period: input.period, now, orders, products, payments, profiles, returns });
}

export const getLiveCommandCenterData: CommandCenterProvider = (input) =>
  buildLiveSnapshot(createSupabaseRepository(), input);
