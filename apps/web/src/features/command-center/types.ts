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
