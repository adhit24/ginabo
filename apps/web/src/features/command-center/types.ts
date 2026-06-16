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

// ─── V2: Customer Intelligence ─────────────────────────────────────────────

export type CustomerSegmentType =
  | "vip" | "loyal" | "high_value" | "potential_vip"
  | "discount_seeker" | "dormant" | "at_risk" | "churn_risk"
  | "impulse_buyer" | "frequent_buyer" | "new";

export interface CustomerSegmentStat {
  segment: CustomerSegmentType;
  label: string;
  count: number;
  percentage: number;
  avgLtv: number;
  color: string;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  vipCustomers: number;
  dormantCustomers: number;
  atRiskCustomers: number;
  churnRiskCustomers: number;
  avgLifetimeValue: number;
  avgPurchaseFrequency: number;
  avgPurchaseIntervalDays: number;
  repeatPurchaseRate: number;
  retentionRate: number;
}

export interface CustomerGrowthPoint {
  date: string;
  newCustomers: number;
  returningCustomers: number;
  totalOrders: number;
}

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  segment: CustomerSegmentType;
  totalOrders: number;
  lifetimeValue: number;
  lastOrderDays: number;
  riskScore: number;
  loyaltyScore: number;
}

export interface CustomerIntelligenceData {
  source: CommandCenterSource;
  generatedAt: string;
  metrics: CustomerMetrics;
  segments: CustomerSegmentStat[];
  growthTrend: CustomerGrowthPoint[];
  customers: CustomerListItem[];
}

// Customer 360 Profile
export interface OrderHistoryItem {
  orderNumber: string;
  date: string;
  totalAmount: number;
  status: string;
  products: string[];
}

export interface Customer360Data {
  source: CommandCenterSource;
  generatedAt: string;
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  ageGroup: string;
  gender: string;
  skinType: string;
  skinConcern: string[];
  acquisitionSource: string;
  campaignSource: string;
  segment: CustomerSegmentType;
  totalOrders: number;
  lifetimeValue: number;
  riskScore: number;
  loyaltyScore: number;
  repeatPurchaseRate: number;
  avgOrderValue: number;
  lastOrderDate: string;
  predictedChurnProbability: number;
  predictedNextPurchaseDays: number;
  predictedLifetimeValue: number;
  favoriteProducts: string[];
  favoriteCategories: string[];
  orderHistory: OrderHistoryItem[];
  aiSummary: string;
  registeredAt: string;
}

// ─── V2: Logistics Command Center ─────────────────────────────────────────

export type LogisticsOrderStatus =
  | "pending" | "paid" | "picking" | "packing"
  | "ready_pickup" | "shipped" | "delivered"
  | "delayed" | "failed_delivery" | "returned" | "refunded"
  | "lost" | "damaged";

export interface LogisticsPipelineColumn {
  status: LogisticsOrderStatus;
  label: string;
  count: number;
  totalValue: number;
  urgentCount: number;
}

export interface CourierPerformance {
  name: string;
  totalShipments: number;
  deliveredCount: number;
  successRate: number;
  avgDeliveryDays: number;
  returnRate: number;
  complaintRate: number;
  slaCompliance: number;
}

export interface DelayedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: LogisticsOrderStatus;
  courier: string;
  delayHours: number;
  totalAmount: number;
  reason: string;
}

export interface LogisticsMetrics {
  pendingCount: number;
  inProgressCount: number;
  deliveredToday: number;
  delayedCount: number;
  failedCount: number;
  avgDeliveryDays: number;
  successRate: number;
  slaCompliance: number;
}

export interface LogisticsData {
  source: CommandCenterSource;
  generatedAt: string;
  metrics: LogisticsMetrics;
  pipeline: LogisticsPipelineColumn[];
  couriers: CourierPerformance[];
  delayedOrders: DelayedOrder[];
}

// ─── V2: Inventory Intelligence ───────────────────────────────────────────

export type StockStatus = "fast_moving" | "slow_moving" | "dead_stock" | "healthy" | "critical" | "overstock";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reservedStock: number;
  incomingStock: number;
  dailyVelocity: number;
  daysRemaining: number;
  stockStatus: StockStatus;
  stockValue: number;
  reorderPoint: number;
  recommendedRestock: number;
  estimatedRevenueImpact: number;
  expiryDate?: string;
  supplierName: string;
  lastRestockDate: string;
}

export interface DemandForecastPoint {
  date: string;
  forecastDemand: number;
  currentStock: number;
  safetyStock: number;
}

export interface InventoryIntelligenceMetrics {
  healthScore: number;
  totalInventoryValue: number;
  totalSkus: number;
  criticalSkus: number;
  overstockSkus: number;
  deadStockSkus: number;
  fastMovingSkus: number;
  avgStockTurnover: number;
  stockoutRiskRevenue: number;
}

export interface RestockRecommendation {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  daysRemaining: number;
  recommendedQty: number;
  estimatedCost: number;
  estimatedRevenueProtected: number;
  urgency: "critical" | "high" | "medium";
  supplierName: string;
}

export interface InventoryIntelligenceData {
  source: CommandCenterSource;
  generatedAt: string;
  metrics: InventoryIntelligenceMetrics;
  items: InventoryItem[];
  demandForecast: DemandForecastPoint[];
  restockRecommendations: RestockRecommendation[];
}

// ─── V2: Returns Intelligence + Fraud ────────────────────────────────────

export interface ReturnMetrics {
  returnRate: number;
  refundRate: number;
  exchangeRate: number;
  totalRefundValue: number;
  avgReturnCost: number;
  returnCount: number;
  refundCount: number;
  exchangeCount: number;
}

export interface TopReturnedProduct {
  productName: string;
  sku: string;
  returnCount: number;
  returnRate: number;
  topReason: string;
  qualityIssue: boolean;
  packagingIssue: boolean;
}

export interface ReturnTrendPoint {
  date: string;
  returns: number;
  refunds: number;
  exchanges: number;
}

export type FraudRiskLevel = "low" | "medium" | "high" | "critical";

export interface FraudFlag {
  id: string;
  customerId: string;
  customerName: string;
  fraudScore: number;
  riskLevel: FraudRiskLevel;
  reasons: string[];
  totalOrders: number;
  totalReturns: number;
  totalRefundValue: number;
  lastActivity: string;
}

export interface ReturnIntelligenceData {
  source: CommandCenterSource;
  generatedAt: string;
  metrics: ReturnMetrics;
  topReturnedProducts: TopReturnedProduct[];
  returnTrend: ReturnTrendPoint[];
  topReturnReasons: { reason: string; count: number; percentage: number }[];
  fraudFlags: FraudFlag[];
}

// ─── V2: Marketing Intelligence ──────────────────────────────────────────

export interface MarketingChannel {
  name: string;
  platform: "meta" | "google" | "tiktok" | "email" | "affiliate" | "influencer" | "referral" | "organic";
  spend: number;
  revenue: number;
  roas: number;
  cac: number;
  conversions: number;
  conversionRate: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface MarketingMetrics {
  totalSpend: number;
  totalRevenue: number;
  blendedRoas: number;
  avgCac: number;
  totalConversions: number;
  avgConversionRate: number;
  customerLtv: number;
  ltvCacRatio: number;
}

export interface MarketingFunnelStep {
  stage: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface MarketingData {
  source: CommandCenterSource;
  generatedAt: string;
  metrics: MarketingMetrics;
  channels: MarketingChannel[];
  funnel: MarketingFunnelStep[];
}

// ─── V2: CEO Executive Dashboard ─────────────────────────────────────────

export interface ExecutiveKpi {
  label: string;
  value: number;
  unit: "currency" | "percent" | "count";
  trend: MetricDirection;
  trendPercent: number;
}

export interface ExecutiveInsight {
  id: string;
  category: "revenue" | "customer" | "inventory" | "marketing" | "risk" | "opportunity";
  title: string;
  detail: string;
  impact: string;
  urgency: "now" | "today" | "this_week" | "this_month";
}

export interface ExecutiveDashboardData {
  source: CommandCenterSource;
  generatedAt: string;
  revenueToday: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  netProfit: number;
  grossProfit: number;
  cashFlow: number;
  inventoryValue: number;
  customerGrowthRate: number;
  repeatPurchaseRate: number;
  refundRate: number;
  marketingRoi: number;
  businessHealthScore: number;
  growthScore: number;
  forecastRevenue: number;
  forecastProfit: number;
  kpis: ExecutiveKpi[];
  insights: ExecutiveInsight[];
}

// ─── V2: AI Skincare Intelligence ────────────────────────────────────────

export interface SkinTypeDistribution {
  skinType: string;
  count: number;
  percentage: number;
  avgLtv: number;
  topProduct: string;
  repeatPurchaseRate: number;
}

export interface SkinConcernStat {
  concern: string;
  count: number;
  percentage: number;
  revenueContribution: number;
  topProducts: string[];
}

export interface ProductEffectiveness {
  productName: string;
  sku: string;
  skinType: string;
  repeatPurchaseRate: number;
  avgRating: number;
  reviewCount: number;
  effectivenessScore: number;
}

export interface SkincareInsight {
  id: string;
  title: string;
  detail: string;
  action: string;
  revenueOpportunity: number;
}

export interface SkincareData {
  source: CommandCenterSource;
  generatedAt: string;
  skinTypeDistribution: SkinTypeDistribution[];
  skinConcernStats: SkinConcernStat[];
  productEffectiveness: ProductEffectiveness[];
  insights: SkincareInsight[];
  topProductCombinations: { products: string[]; coOccurrenceRate: number; avgOrderValue: number }[];
}

// ─── V2: Alert Center ────────────────────────────────────────────────────

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  category: "revenue" | "inventory" | "customer" | "logistics" | "fraud" | "marketing" | "system";
  title: string;
  detail: string;
  action: string;
  count: number;
  href?: string;
  timestamp: string;
  isRead: boolean;
}

export interface AlertCenterData {
  source: CommandCenterSource;
  generatedAt: string;
  alerts: AlertItem[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalUnread: number;
}
