# Ginabo Operations Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/admin` with a responsive operations command center backed by deterministic demo data today and a switchable Supabase aggregation provider for production data later.

**Architecture:** A typed feature module owns the dashboard contract, provider selection, demo fixtures, and Supabase aggregation. A single admin API route returns that contract, while a client dashboard component handles loading, retry, refresh, and responsive presentation without knowing which provider produced the data.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Supabase JS, Vitest, Testing Library, jsdom.

---

## File Map

- Modify `apps/web/package.json`: add test scripts and minimal test dependencies.
- Create `apps/web/vitest.config.ts`: configure TypeScript aliases and jsdom.
- Create `apps/web/src/test/setup.ts`: register DOM matchers and cleanup.
- Create `apps/web/src/features/command-center/types.ts`: shared dashboard contract.
- Create `apps/web/src/features/command-center/demo.ts`: deterministic demo provider.
- Create `apps/web/src/features/command-center/live.ts`: Supabase aggregation provider.
- Create `apps/web/src/features/command-center/provider.ts`: source selection and provider interface.
- Create `apps/web/src/features/command-center/format.ts`: presentation helpers used by UI and tests.
- Create `apps/web/src/features/command-center/*.test.ts`: provider and formatting unit tests.
- Create `apps/web/src/app/api/admin/command-center/route.ts`: authenticated admin endpoint.
- Create `apps/web/src/app/api/admin/command-center/route.test.ts`: route response tests.
- Create `apps/web/src/components/admin/command-center/CommandCenterDashboard.tsx`: client data lifecycle and page composition.
- Create `apps/web/src/components/admin/command-center/CommandCenterDashboard.test.tsx`: loading, error, demo, and empty-state tests.
- Create focused presentational components under `apps/web/src/components/admin/command-center/` for KPI, trend, health, alerts, advisor, orders, inventory, and skeleton states.
- Modify `apps/web/src/app/admin/page.tsx`: render the command center.
- Modify `apps/web/src/components/admin/AdminShell.tsx`: add responsive navigation and operational destinations.
- Modify `apps/web/.env.local.example`: document `COMMAND_CENTER_DATA_SOURCE`.

## Task 1: Install and Configure the Test Harness

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/test/setup.ts`
- Test: `apps/web/src/test/smoke.test.ts`

- [ ] **Step 1: Add test dependencies and scripts**

Run:

```powershell
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Then add these scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.ts`:

```ts
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    clearMocks: true,
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

- [ ] **Step 3: Write a smoke test**

Create `src/test/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs TypeScript tests", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 4: Run the harness**

Run: `npm test -- src/test/smoke.test.ts`

Expected: one passing test.

- [ ] **Step 5: Commit the harness**

```powershell
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/smoke.test.ts
git commit -m "test: configure command center test harness"
```

## Task 2: Define the Contract and Demo Provider

**Files:**
- Create: `apps/web/src/features/command-center/types.ts`
- Create: `apps/web/src/features/command-center/demo.ts`
- Create: `apps/web/src/features/command-center/demo.test.ts`

- [ ] **Step 1: Write the failing demo-provider test**

Create `demo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getDemoCommandCenterData } from "./demo";

describe("getDemoCommandCenterData", () => {
  it("returns a complete deterministic operations snapshot", async () => {
    const now = new Date("2026-06-16T02:00:00.000Z");
    const data = await getDemoCommandCenterData({ period: "7d", now });

    expect(data.source).toBe("demo");
    expect(data.period).toBe("7d");
    expect(data.summary).toHaveLength(6);
    expect(data.trend).toHaveLength(7);
    expect(data.health.map((item) => item.key)).toEqual([
      "operations",
      "inventory",
      "customer",
      "financial",
    ]);
    expect(data.alerts.some((item) => item.severity === "critical")).toBe(true);
    expect(data.advisorActions).toHaveLength(3);
    expect(data.generatedAt).toBe(now.toISOString());
  });

  it("does not mutate shared fixtures between calls", async () => {
    const first = await getDemoCommandCenterData({ period: "7d", now: new Date(0) });
    first.alerts.length = 0;
    const second = await getDemoCommandCenterData({ period: "7d", now: new Date(0) });
    expect(second.alerts.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/features/command-center/demo.test.ts`

Expected: FAIL because `./demo` does not exist.

- [ ] **Step 3: Define the shared contract**

Create `types.ts` with these exported types:

```ts
export type CommandCenterPeriod = "7d" | "30d";
export type CommandCenterSource = "demo" | "live";
export type MetricDirection = "up" | "down" | "flat";
export type HealthStatus = "healthy" | "watch" | "critical";
export type AlertSeverity = "critical" | "high" | "medium" | "low";

export interface SummaryMetric {
  key: "revenue" | "orders" | "aov" | "fulfillment" | "returns" | "inventoryRisk";
  label: string;
  value: number;
  unit: "currency" | "count" | "percent";
  comparisonPercent: number;
  comparisonDirection: MetricDirection;
  comparisonLabel: string;
}

export interface TrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface HealthScore {
  key: "operations" | "inventory" | "customer" | "financial";
  label: string;
  score: number;
  status: HealthStatus;
  explanation: string;
}

export interface OperationalAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  context: string;
  action: string;
  count: number;
  href?: string;
}

export interface AdvisorAction {
  id: string;
  title: string;
  reason: string;
  impact: string;
  urgency: "now" | "today" | "this_week";
  actionLabel: string;
  href?: string;
}

export interface OrderQueueItem {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  ageMinutes: number;
  needsAttention: boolean;
}

export interface InventoryRiskItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  dailyVelocity: number;
  daysRemaining: number;
  recommendedRestock: number;
}

export interface CommandCenterData {
  source: CommandCenterSource;
  period: CommandCenterPeriod;
  generatedAt: string;
  synchronizedAt: string;
  summary: SummaryMetric[];
  trend: TrendPoint[];
  health: HealthScore[];
  alerts: OperationalAlert[];
  advisorActions: AdvisorAction[];
  orderQueue: OrderQueueItem[];
  inventoryRisks: InventoryRiskItem[];
}

export interface CommandCenterProviderInput {
  period: CommandCenterPeriod;
  now?: Date;
}

export type CommandCenterProvider = (
  input: CommandCenterProviderInput,
) => Promise<CommandCenterData>;
```

- [ ] **Step 4: Implement deterministic demo data**

Create `demo.ts`. Define one immutable snapshot containing six metrics, seven trend points, four health scores, four alerts, three advisor actions, five order rows, and five inventory risks. Implement the provider by cloning the snapshot and replacing timestamps:

```ts
import type { CommandCenterData, CommandCenterProvider } from "./types";

const SNAPSHOT: Omit<CommandCenterData, "generatedAt" | "synchronizedAt" | "period"> = {
  source: "demo",
  summary: [
    { key: "revenue", label: "Pendapatan hari ini", value: 48240000, unit: "currency", comparisonPercent: 12.4, comparisonDirection: "up", comparisonLabel: "vs kemarin" },
    { key: "orders", label: "Order hari ini", value: 184, unit: "count", comparisonPercent: 8.2, comparisonDirection: "up", comparisonLabel: "vs kemarin" },
    { key: "aov", label: "Rata-rata order", value: 262174, unit: "currency", comparisonPercent: 3.6, comparisonDirection: "up", comparisonLabel: "vs kemarin" },
    { key: "fulfillment", label: "Fulfillment", value: 92.8, unit: "percent", comparisonPercent: 1.1, comparisonDirection: "up", comparisonLabel: "vs 7 hari lalu" },
    { key: "returns", label: "Return rate", value: 3.1, unit: "percent", comparisonPercent: 0.7, comparisonDirection: "down", comparisonLabel: "vs 7 hari lalu" },
    { key: "inventoryRisk", label: "Stok berisiko", value: 12, unit: "count", comparisonPercent: 20, comparisonDirection: "up", comparisonLabel: "SKU perlu tindakan" },
  ],
  trend: [
    { date: "2026-06-10", revenue: 31800000, orders: 126 },
    { date: "2026-06-11", revenue: 35200000, orders: 139 },
    { date: "2026-06-12", revenue: 33700000, orders: 132 },
    { date: "2026-06-13", revenue: 40100000, orders: 151 },
    { date: "2026-06-14", revenue: 43800000, orders: 168 },
    { date: "2026-06-15", revenue: 42900000, orders: 170 },
    { date: "2026-06-16", revenue: 48240000, orders: 184 },
  ],
  health: [
    { key: "operations", label: "Operasional", score: 88, status: "healthy", explanation: "Fulfillment stabil, 6 order melewati SLA." },
    { key: "inventory", label: "Inventori", score: 74, status: "watch", explanation: "12 SKU membutuhkan keputusan restock." },
    { key: "customer", label: "Pelanggan", score: 85, status: "healthy", explanation: "Return rate turun dan repeat order naik." },
    { key: "financial", label: "Finansial", score: 81, status: "healthy", explanation: "Pendapatan dan AOV bergerak positif." },
  ],
  alerts: [
    { id: "delayed-orders", severity: "critical", title: "Order melewati SLA", context: "6 order belum diproses lebih dari 4 jam.", action: "Prioritaskan picking dan packing.", count: 6, href: "/admin/orders" },
    { id: "low-stock", severity: "high", title: "Stok mendekati habis", context: "12 SKU memiliki stok kurang dari 7 hari.", action: "Buat keputusan restock hari ini.", count: 12, href: "/admin/products" },
    { id: "risky-returns", severity: "high", title: "Retur berisiko", context: "3 pengajuan memiliki risk score di atas 70.", action: "Lakukan review manual.", count: 3, href: "/admin/returns" },
    { id: "failed-payments", severity: "medium", title: "Pembayaran gagal", context: "9 transaksi gagal dalam dua jam terakhir.", action: "Periksa pola provider pembayaran.", count: 9, href: "/admin/orders" },
  ],
  advisorActions: [
    { id: "restock-vit-c", title: "Restock Vitamin C Serum", reason: "Stok diperkirakan habis dalam 4 hari.", impact: "Melindungi potensi pendapatan Rp18,6 juta.", urgency: "now", actionLabel: "Buka produk", href: "/admin/products" },
    { id: "clear-order-queue", title: "Kosongkan antrean order lama", reason: "6 order telah melewati SLA internal.", impact: "Menjaga fulfillment rate di atas 92%.", urgency: "today", actionLabel: "Buka order", href: "/admin/orders" },
    { id: "review-returns", title: "Review tiga retur berisiko", reason: "Risk score tinggi memerlukan keputusan manual.", impact: "Mengurangi potensi refund tidak valid.", urgency: "today", actionLabel: "Buka retur", href: "/admin/returns" },
  ],
  orderQueue: [
    { id: "ord-1", orderNumber: "GNB-260616-0184", customerName: "Nadia Putri", status: "processing", totalAmount: 418000, ageMinutes: 286, needsAttention: true },
    { id: "ord-2", orderNumber: "GNB-260616-0183", customerName: "Rina Amelia", status: "paid", totalAmount: 279000, ageMinutes: 244, needsAttention: true },
    { id: "ord-3", orderNumber: "GNB-260616-0182", customerName: "Ayu Larasati", status: "processing", totalAmount: 536000, ageMinutes: 121, needsAttention: false },
    { id: "ord-4", orderNumber: "GNB-260616-0181", customerName: "Maya Sari", status: "paid", totalAmount: 198000, ageMinutes: 94, needsAttention: false },
    { id: "ord-5", orderNumber: "GNB-260616-0180", customerName: "Dewi Anggraini", status: "processing", totalAmount: 347000, ageMinutes: 72, needsAttention: false },
  ],
  inventoryRisks: [
    { id: "sku-1", name: "Vitamin C Serum", sku: "GNB-VCS-30", stock: 18, dailyVelocity: 4.5, daysRemaining: 4, recommendedRestock: 120 },
    { id: "sku-2", name: "Barrier Repair Cream", sku: "GNB-BRC-30", stock: 21, dailyVelocity: 4.1, daysRemaining: 5, recommendedRestock: 100 },
    { id: "sku-3", name: "Gentle Gel Cleanser", sku: "GNB-GGC-100", stock: 33, dailyVelocity: 5.3, daysRemaining: 6, recommendedRestock: 140 },
    { id: "sku-4", name: "Retinol Night Cream", sku: "GNB-RNC-20", stock: 14, dailyVelocity: 2, daysRemaining: 7, recommendedRestock: 60 },
    { id: "sku-5", name: "Daily Sunscreen SPF 50", sku: "GNB-DS50-40", stock: 42, dailyVelocity: 5.8, daysRemaining: 7, recommendedRestock: 150 },
  ],
};

export const getDemoCommandCenterData: CommandCenterProvider = async ({ period, now = new Date() }) => {
  const timestamp = now.toISOString();
  return structuredClone({ ...SNAPSHOT, period, generatedAt: timestamp, synchronizedAt: timestamp });
};
```

- [ ] **Step 5: Run the demo tests and verify GREEN**

Run: `npm test -- src/features/command-center/demo.test.ts`

Expected: two passing tests.

- [ ] **Step 6: Commit the contract and demo provider**

```powershell
git add src/features/command-center/types.ts src/features/command-center/demo.ts src/features/command-center/demo.test.ts
git commit -m "feat: add command center data contract and demo provider"
```

## Task 3: Implement Provider Selection and Supabase Aggregation

**Files:**
- Create: `apps/web/src/features/command-center/provider.ts`
- Create: `apps/web/src/features/command-center/provider.test.ts`
- Create: `apps/web/src/features/command-center/live.ts`
- Create: `apps/web/src/features/command-center/live.test.ts`

- [ ] **Step 1: Write failing provider-selection tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { resolveCommandCenterProvider } from "./provider";

describe("resolveCommandCenterProvider", () => {
  it("uses demo when the variable is absent", () => {
    const demo = vi.fn();
    const live = vi.fn();
    expect(resolveCommandCenterProvider(undefined, { demo, live })).toBe(demo);
  });

  it("uses live only for the explicit live value", () => {
    const demo = vi.fn();
    const live = vi.fn();
    expect(resolveCommandCenterProvider("live", { demo, live })).toBe(live);
  });

  it("rejects unknown values", () => {
    expect(() => resolveCommandCenterProvider("staging", { demo: vi.fn(), live: vi.fn() }))
      .toThrow("Unsupported COMMAND_CENTER_DATA_SOURCE: staging");
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- src/features/command-center/provider.test.ts`

Expected: FAIL because `provider.ts` does not exist.

- [ ] **Step 3: Implement strict provider selection**

```ts
import { getDemoCommandCenterData } from "./demo";
import { getLiveCommandCenterData } from "./live";
import type { CommandCenterProvider } from "./types";

export interface CommandCenterProviders {
  demo: CommandCenterProvider;
  live: CommandCenterProvider;
}

export function resolveCommandCenterProvider(
  source: string | undefined,
  providers: CommandCenterProviders = { demo: getDemoCommandCenterData, live: getLiveCommandCenterData },
): CommandCenterProvider {
  if (!source || source === "demo") return providers.demo;
  if (source === "live") return providers.live;
  throw new Error(`Unsupported COMMAND_CENTER_DATA_SOURCE: ${source}`);
}
```

- [ ] **Step 4: Write failing aggregation tests with an injected repository**

In `live.test.ts`, define a repository fixture containing orders, products, payments, profiles, and returns. Assert that `buildLiveSnapshot(repository, input)`:

- sums paid/processing/shipped/delivered order totals for revenue
- calculates AOV from counted orders
- counts orders older than four hours as attention-required
- calculates inventory days remaining using seven-day sales velocity
- counts returns with `risk_score >= 70`
- returns `source: "live"`
- throws when any repository query returns an error

Use fixed timestamps and exact expected values so the test is deterministic.

- [ ] **Step 5: Run and verify RED**

Run: `npm test -- src/features/command-center/live.test.ts`

Expected: FAIL because `buildLiveSnapshot` does not exist.

- [ ] **Step 6: Implement the live repository and aggregator**

Create `live.ts` with two boundaries:

Define `aggregateRows` in the same module as a pure function accepting the six fields passed below. It performs all normalization and calculations covered by `live.test.ts`; exporting it makes those calculations testable without Supabase.

```ts
import { createAdminClient } from "@/lib/supabase/server";
import type { CommandCenterData, CommandCenterProvider, CommandCenterProviderInput } from "./types";

export interface LiveCommandCenterRepository {
  getOrdersSince(iso: string): Promise<unknown[]>;
  getProducts(): Promise<unknown[]>;
  getPaymentsSince(iso: string): Promise<unknown[]>;
  getProfilesSince(iso: string): Promise<unknown[]>;
  getReturnsSince(iso: string): Promise<unknown[]>;
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

  return aggregateRows({
    period: input.period,
    now,
    orders,
    products,
    payments,
    profiles,
    returns,
  });
}

function createSupabaseRepository(): LiveCommandCenterRepository {
  const db = createAdminClient();
  return {
    async getOrdersSince(iso) {
      const { data, error } = await db.from("orders").select("id, order_number, status, total_amount, user_id, created_at, updated_at, profiles:user_id(full_name)").gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
    async getProducts() {
      const { data, error } = await db.from("products").select("id, name, sku, stock, is_active").eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    async getPaymentsSince(iso) {
      const { data, error } = await db.from("payments").select("id, status, gross_amount, created_at").gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
    async getProfilesSince(iso) {
      const { data, error } = await db.from("profiles").select("id, created_at").gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
    async getReturnsSince(iso) {
      const query = db.from("returns" as never) as unknown as {
        select(columns: string): { gte(column: string, value: string): Promise<{ data: unknown[] | null; error: Error | null }> };
      };
      const { data, error } = await query.select("id, status, refund_amount, risk_score, created_at").gte("created_at", iso);
      if (error) throw error;
      return data ?? [];
    },
  };
}

export const getLiveCommandCenterData: CommandCenterProvider = (input) =>
  buildLiveSnapshot(createSupabaseRepository(), input);
```

Do not silently call the demo provider from this module. A live failure must reach the API error response.

- [ ] **Step 7: Run provider tests and type-check**

Run:

```powershell
npm test -- src/features/command-center/provider.test.ts src/features/command-center/live.test.ts
npm run typecheck
```

Expected: provider tests pass and TypeScript exits with code 0.

- [ ] **Step 8: Commit provider selection and live aggregation**

```powershell
git add src/features/command-center/provider.ts src/features/command-center/provider.test.ts src/features/command-center/live.ts src/features/command-center/live.test.ts
git commit -m "feat: add live command center provider"
```

## Task 4: Expose the Admin Command Center API

**Files:**
- Create: `apps/web/src/app/api/admin/command-center/route.ts`
- Create: `apps/web/src/app/api/admin/command-center/route.test.ts`
- Modify: `apps/web/.env.local.example`

- [ ] **Step 1: Write failing route tests**

Mock `resolveCommandCenterProvider` and test `GET(new Request(...))` directly:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const provider = vi.fn();
vi.mock("@/features/command-center/provider", () => ({
  resolveCommandCenterProvider: () => provider,
}));

import { GET } from "./route";

describe("GET /api/admin/command-center", () => {
  beforeEach(() => provider.mockReset());

  it("returns the provider snapshot for a supported period", async () => {
    provider.mockResolvedValue({ source: "demo", period: "30d" });
    const response = await GET(new Request("http://localhost/api/admin/command-center?period=30d"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, data: { source: "demo", period: "30d" } });
    expect(provider).toHaveBeenCalledWith({ period: "30d" });
  });

  it("rejects an unsupported period", async () => {
    const response = await GET(new Request("http://localhost/api/admin/command-center?period=90d"));
    expect(response.status).toBe(400);
  });

  it("returns 500 without replacing a live failure with demo data", async () => {
    provider.mockRejectedValue(new Error("Supabase unavailable"));
    const response = await GET(new Request("http://localhost/api/admin/command-center"));
    expect(response.status).toBe(500);
    expect(provider).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- src/app/api/admin/command-center/route.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement the route**

```ts
export const runtime = "edge";

import { jsonError, jsonOk } from "@/lib/http";
import { resolveCommandCenterProvider } from "@/features/command-center/provider";
import type { CommandCenterPeriod } from "@/features/command-center/types";

export async function GET(request: Request) {
  const periodParam = new URL(request.url).searchParams.get("period") ?? "7d";
  if (periodParam !== "7d" && periodParam !== "30d") {
    return jsonError("Unsupported command center period", 400);
  }

  try {
    const provider = resolveCommandCenterProvider(process.env.COMMAND_CENTER_DATA_SOURCE);
    const data = await provider({ period: periodParam as CommandCenterPeriod });
    return jsonOk(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(
      "Command center data could not be loaded",
      500,
      error instanceof Error ? error.message : String(error),
    );
  }
}
```

- [ ] **Step 4: Document source configuration**

Add to `.env.local.example`:

```dotenv
# demo (default) or live
COMMAND_CENTER_DATA_SOURCE=demo
```

- [ ] **Step 5: Run route tests and type-check**

Run:

```powershell
npm test -- src/app/api/admin/command-center/route.test.ts
npm run typecheck
```

Expected: route tests pass and TypeScript exits with code 0.

- [ ] **Step 6: Commit the endpoint**

```powershell
git add src/app/api/admin/command-center/route.ts src/app/api/admin/command-center/route.test.ts .env.local.example
git commit -m "feat: expose command center admin API"
```

## Task 5: Build Formatting Helpers and Presentational Components

**Files:**
- Create: `apps/web/src/features/command-center/format.ts`
- Create: `apps/web/src/features/command-center/format.test.ts`
- Create: `apps/web/src/components/admin/command-center/KpiGrid.tsx`
- Create: `apps/web/src/components/admin/command-center/TrendPanel.tsx`
- Create: `apps/web/src/components/admin/command-center/HealthPanel.tsx`
- Create: `apps/web/src/components/admin/command-center/AlertsPanel.tsx`
- Create: `apps/web/src/components/admin/command-center/AdvisorPanel.tsx`
- Create: `apps/web/src/components/admin/command-center/OrderQueuePanel.tsx`
- Create: `apps/web/src/components/admin/command-center/InventoryRiskPanel.tsx`
- Create: `apps/web/src/components/admin/command-center/DashboardSkeleton.tsx`

- [ ] **Step 1: Write failing formatting tests**

Test exact Indonesian output for currency, percent, count, duration, and sync time:

```ts
expect(formatMetricValue({ value: 48240000, unit: "currency" })).toBe("Rp48,2 jt");
expect(formatMetricValue({ value: 92.8, unit: "percent" })).toBe("92,8%");
expect(formatMetricValue({ value: 184, unit: "count" })).toBe("184");
expect(formatAge(286)).toBe("4j 46m");
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- src/features/command-center/format.test.ts`

Expected: FAIL because `format.ts` does not exist.

- [ ] **Step 3: Implement formatting helpers**

Use `Intl.NumberFormat("id-ID")` and compact display rules. Keep all formatting out of provider data so raw values remain reusable.

- [ ] **Step 4: Run and verify GREEN**

Run: `npm test -- src/features/command-center/format.test.ts`

Expected: formatting tests pass.

- [ ] **Step 5: Implement focused presentational components**

Use these boundaries:

- `KpiGrid`: six metric cards with text direction indicators.
- `TrendPanel`: responsive inline SVG using viewBox coordinates; revenue line, order bars, legend, and textual summary.
- `HealthPanel`: four labeled scores with status text and compact progress visualization.
- `AlertsPanel`: ordered severity list with action links and an empty state.
- `AdvisorPanel`: exactly three ranked recommendations and explicit “Demo recommendation” wording when source is demo.
- `OrderQueuePanel`: desktop table and mobile stacked rows, maximum five items.
- `InventoryRiskPanel`: maximum five restock rows and empty state.
- `DashboardSkeleton`: layout-matched `animate-pulse` blocks with `aria-label="Memuat command center"`.

All panels use `rounded-xl border border-white/10 bg-white/[0.04]`. Status colors include a visible text label; color is never the only signal.

- [ ] **Step 6: Type-check the components**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 7: Commit formatting and presentational components**

```powershell
git add src/features/command-center/format.ts src/features/command-center/format.test.ts src/components/admin/command-center
git commit -m "feat: add command center presentation components"
```

## Task 6: Implement Client Data Lifecycle and Page Composition

**Files:**
- Create: `apps/web/src/components/admin/command-center/CommandCenterDashboard.tsx`
- Create: `apps/web/src/components/admin/command-center/CommandCenterDashboard.test.tsx`
- Modify: `apps/web/src/app/admin/page.tsx`

- [ ] **Step 1: Write failing dashboard behavior tests**

Cover these behaviors with mocked `fetch` and fake timers:

1. skeleton appears before the first response
2. demo badge, synchronization time, and six KPIs appear after success
3. changing period requests `?period=30d`
4. refresh button refetches without replacing the whole page with a skeleton
5. failed request shows retry and retry can recover
6. empty alerts, orders, and inventory display explicit healthy empty states
7. unmount aborts the active request

Representative test:

```tsx
it("shows the demo source and operational snapshot", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true, data: demoSnapshot }),
  }));

  render(<CommandCenterDashboard />);
  expect(screen.getByLabelText("Memuat command center")).toBeInTheDocument();
  expect(await screen.findByText("DATA DEMO")).toBeInTheDocument();
  expect(screen.getAllByTestId("command-center-kpi")).toHaveLength(6);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- src/components/admin/command-center/CommandCenterDashboard.test.tsx`

Expected: FAIL because `CommandCenterDashboard` does not exist.

- [ ] **Step 3: Implement client data lifecycle**

`CommandCenterDashboard.tsx` must:

- hold `period`, `data`, `loading`, `refreshing`, and `error` state
- fetch `/api/admin/command-center?period=${period}` with an `AbortController`
- parse the `{ ok, data }` response shape
- refresh every 60 seconds only while `document.visibilityState === "visible"`
- listen to `visibilitychange` and trigger a refresh when the tab becomes visible
- abort the previous request before starting a replacement
- clean up timer, listener, and controller on unmount
- expose a manual refresh button with `aria-busy`
- keep existing data visible during background refresh

Compose the page in this order:

```tsx
<header />
<KpiGrid />
<section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]" />
<section className="grid gap-4 xl:grid-cols-2" />
<section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]" />
```

- [ ] **Step 4: Replace the current admin overview**

Make `src/app/admin/page.tsx` a thin entry point:

```tsx
import { CommandCenterDashboard } from "@/components/admin/command-center/CommandCenterDashboard";

export default function AdminOverviewPage() {
  return <CommandCenterDashboard />;
}
```

- [ ] **Step 5: Run dashboard tests and type-check**

Run:

```powershell
npm test -- src/components/admin/command-center/CommandCenterDashboard.test.tsx
npm run typecheck
```

Expected: all dashboard tests pass and TypeScript exits with code 0.

- [ ] **Step 6: Commit the dashboard page**

```powershell
git add src/components/admin/command-center/CommandCenterDashboard.tsx src/components/admin/command-center/CommandCenterDashboard.test.tsx src/app/admin/page.tsx
git commit -m "feat: build operations command center dashboard"
```

## Task 7: Make the Admin Shell Responsive and Operational

**Files:**
- Modify: `apps/web/src/components/admin/AdminShell.tsx`
- Create: `apps/web/src/components/admin/AdminShell.test.tsx`

- [ ] **Step 1: Write failing shell tests**

Test that:

- navigation includes Dashboard, Orders, Products, Customers, Bookings, Returns, Bundle, and Flash Sale
- `/admin/returns/analytics` marks Returns active using prefix matching
- the mobile menu button exposes `aria-expanded`
- selecting a mobile link closes the menu

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- src/components/admin/AdminShell.test.tsx`

Expected: FAIL because current navigation is incomplete and has no mobile menu.

- [ ] **Step 3: Refactor the shell**

Keep the current authentication behavior, but:

- replace exact-only active matching with `pathname === href || pathname.startsWith(`${href}/`)`, except `/admin`
- add the missing operational nav destinations
- use a fixed sidebar at `lg` and a compact top bar plus slide-over navigation below `lg`
- preserve the dark theme and purple active state
- use text or CSS icons only; do not add an icon dependency
- close the mobile menu on route selection and Escape
- add an accessible backdrop button labeled `Tutup navigasi`

- [ ] **Step 4: Run shell tests**

Run: `npm test -- src/components/admin/AdminShell.test.tsx`

Expected: shell tests pass.

- [ ] **Step 5: Commit the shell changes**

```powershell
git add src/components/admin/AdminShell.tsx src/components/admin/AdminShell.test.tsx
git commit -m "feat: make admin shell responsive for operations"
```

## Task 8: Full Verification and Browser Review

**Files:**
- Review: all command-center files
- Modify only if verification finds defects.

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Expected:

- Vitest reports zero failing tests
- TypeScript exits with code 0
- ESLint exits with code 0
- Next.js production build exits with code 0

- [ ] **Step 2: Start the application**

Run: `npm run dev`

Expected: Next.js reports a local URL without compilation errors.

- [ ] **Step 3: Verify in the in-app browser**

Open `/admin` and verify:

- login redirect still works when no admin session exists
- authenticated admin sees DATA DEMO prominently
- six KPI values render
- period selector updates the request and screen
- refresh retains existing data while updating
- alerts and action links point to existing admin destinations
- no horizontal overflow at 375px, 768px, and desktop width
- sidebar becomes mobile navigation below `lg`
- browser console has no errors
- reduced-motion mode does not rely on animation for status feedback

- [ ] **Step 4: Review requirements against the design spec**

Confirm every included milestone item in `docs/superpowers/specs/2026-06-16-operations-command-center-design.md` has an implementation and that excluded items were not accidentally added.

- [ ] **Step 5: Inspect the final diff**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; status contains only intentional command-center changes or pre-existing user changes.

- [ ] **Step 6: Commit verification fixes if any**

```powershell
git add apps/web docs/superpowers/plans/2026-06-16-operations-command-center.md
git commit -m "fix: finalize operations command center verification"
```

Skip this commit when verification required no fixes and all feature work is already committed.
