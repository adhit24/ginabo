import type {
  CustomerIntelligenceData,
  Customer360Data,
  LogisticsData,
  InventoryIntelligenceData,
  ReturnIntelligenceData,
  MarketingData,
  ExecutiveDashboardData,
  SkincareData,
  AlertCenterData,
} from "./types";

// ─── Customer Intelligence Demo ──────────────────────────────────────────

export const getDemoCustomerIntelligence = async (): Promise<CustomerIntelligenceData> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    metrics: {
      totalCustomers: 8_240,
      newCustomers: 312,
      returningCustomers: 1_847,
      vipCustomers: 214,
      dormantCustomers: 1_103,
      atRiskCustomers: 487,
      churnRiskCustomers: 198,
      avgLifetimeValue: 1_840_000,
      avgPurchaseFrequency: 2.8,
      avgPurchaseIntervalDays: 42,
      repeatPurchaseRate: 61.4,
      retentionRate: 73.2,
    },
    segments: [
      { segment: "vip", label: "VIP", count: 214, percentage: 2.6, avgLtv: 12_400_000, color: "#e879f9" },
      { segment: "loyal", label: "Loyal", count: 832, percentage: 10.1, avgLtv: 5_200_000, color: "#8b5cf6" },
      { segment: "high_value", label: "High Value", count: 1_120, percentage: 13.6, avgLtv: 3_800_000, color: "#06b6d4" },
      { segment: "potential_vip", label: "Potential VIP", count: 674, percentage: 8.2, avgLtv: 2_100_000, color: "#10b981" },
      { segment: "frequent_buyer", label: "Frequent Buyer", count: 1_543, percentage: 18.7, avgLtv: 1_650_000, color: "#3b82f6" },
      { segment: "discount_seeker", label: "Discount Seeker", count: 987, percentage: 12.0, avgLtv: 820_000, color: "#f59e0b" },
      { segment: "at_risk", label: "At Risk", count: 487, percentage: 5.9, avgLtv: 1_200_000, color: "#f97316" },
      { segment: "churn_risk", label: "Churn Risk", count: 198, percentage: 2.4, avgLtv: 940_000, color: "#ef4444" },
      { segment: "dormant", label: "Dormant", count: 1_103, percentage: 13.4, avgLtv: 480_000, color: "#6b7280" },
      { segment: "new", label: "Baru", count: 1_082, percentage: 13.1, avgLtv: 320_000, color: "#a78bfa" },
    ],
    growthTrend: [
      { date: "2026-06-10", newCustomers: 38, returningCustomers: 248, totalOrders: 126 },
      { date: "2026-06-11", newCustomers: 44, returningCustomers: 271, totalOrders: 139 },
      { date: "2026-06-12", newCustomers: 41, returningCustomers: 259, totalOrders: 132 },
      { date: "2026-06-13", newCustomers: 52, returningCustomers: 298, totalOrders: 151 },
      { date: "2026-06-14", newCustomers: 61, returningCustomers: 332, totalOrders: 168 },
      { date: "2026-06-15", newCustomers: 58, returningCustomers: 320, totalOrders: 170 },
      { date: "2026-06-16", newCustomers: 312, returningCustomers: 1847, totalOrders: 184 },
    ],
    customers: [
      { id: "cst-1", name: "Nadia Putri", phone: "081234567890", email: "nadia@email.com", segment: "vip", totalOrders: 42, lifetimeValue: 18_400_000, lastOrderDays: 2, riskScore: 8, loyaltyScore: 94 },
      { id: "cst-2", name: "Rina Amelia", phone: "082345678901", email: "rina@email.com", segment: "loyal", totalOrders: 28, lifetimeValue: 9_200_000, lastOrderDays: 5, riskScore: 12, loyaltyScore: 82 },
      { id: "cst-3", name: "Ayu Larasati", phone: "083456789012", email: "ayu@email.com", segment: "at_risk", totalOrders: 11, lifetimeValue: 2_840_000, lastOrderDays: 67, riskScore: 72, loyaltyScore: 41 },
      { id: "cst-4", name: "Maya Sari", phone: "084567890123", email: "maya@email.com", segment: "churn_risk", totalOrders: 4, lifetimeValue: 1_120_000, lastOrderDays: 94, riskScore: 88, loyaltyScore: 18 },
      { id: "cst-5", name: "Dewi Anggraini", phone: "085678901234", email: "dewi@email.com", segment: "frequent_buyer", totalOrders: 19, lifetimeValue: 4_680_000, lastOrderDays: 8, riskScore: 21, loyaltyScore: 71 },
      { id: "cst-6", name: "Siti Rahayu", phone: "086789012345", email: "siti@email.com", segment: "vip", totalOrders: 55, lifetimeValue: 24_200_000, lastOrderDays: 1, riskScore: 5, loyaltyScore: 98 },
      { id: "cst-7", name: "Putri Handayani", phone: "087890123456", email: "putri@email.com", segment: "high_value", totalOrders: 16, lifetimeValue: 6_100_000, lastOrderDays: 14, riskScore: 28, loyaltyScore: 64 },
      { id: "cst-8", name: "Lestari Wulandari", phone: "088901234567", email: "lestari@email.com", segment: "dormant", totalOrders: 3, lifetimeValue: 680_000, lastOrderDays: 148, riskScore: 91, loyaltyScore: 9 },
    ],
  };
};

// ─── Customer 360 Demo ───────────────────────────────────────────────────

export const getDemoCustomer360 = async (id: string): Promise<Customer360Data> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    id,
    name: "Nadia Putri",
    phone: "081234567890",
    email: "nadia.putri@email.com",
    address: "Jl. Kemang Raya No. 12, Jakarta Selatan",
    ageGroup: "25–34",
    gender: "Perempuan",
    skinType: "Kombinasi",
    skinConcern: ["Pori-pori besar", "Flek hitam", "Kulit kusam"],
    acquisitionSource: "Instagram Ads",
    campaignSource: "HARBOLNAS 2025",
    segment: "vip",
    totalOrders: 42,
    lifetimeValue: 18_400_000,
    riskScore: 8,
    loyaltyScore: 94,
    repeatPurchaseRate: 87.5,
    avgOrderValue: 438_000,
    lastOrderDate: "2026-06-14",
    predictedChurnProbability: 3.2,
    predictedNextPurchaseDays: 8,
    predictedLifetimeValue: 28_600_000,
    favoriteProducts: ["Vitamin C Serum", "Barrier Repair Cream", "Daily Sunscreen SPF 50"],
    favoriteCategories: ["Serum", "Sunscreen", "Moisturizer"],
    orderHistory: [
      { orderNumber: "GNB-260614-0168", date: "2026-06-14", totalAmount: 536_000, status: "delivered", products: ["Vitamin C Serum", "Daily Sunscreen SPF 50"] },
      { orderNumber: "GNB-260530-0094", date: "2026-05-30", totalAmount: 398_000, status: "delivered", products: ["Barrier Repair Cream"] },
      { orderNumber: "GNB-260516-0047", date: "2026-05-16", totalAmount: 284_000, status: "delivered", products: ["Gentle Gel Cleanser"] },
      { orderNumber: "GNB-260428-0211", date: "2026-04-28", totalAmount: 672_000, status: "delivered", products: ["Vitamin C Serum", "Retinol Night Cream"] },
    ],
    aiSummary: "Nadia adalah pelanggan VIP yang sangat loyal dengan repeat rate 87.5%. Ia konsisten membeli produk skincare untuk kulit kombinasi dengan fokus pada brightening dan perlindungan UV. Risiko churn sangat rendah (3.2%). Direkomendasikan untuk diprioritaskan dalam program loyalitas eksklusif dan pre-launch product terbaru.",
    registeredAt: "2024-08-12",
  };
};

// ─── Logistics Demo ──────────────────────────────────────────────────────

export const getDemoLogistics = async (): Promise<LogisticsData> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    metrics: {
      pendingCount: 24,
      inProgressCount: 87,
      deliveredToday: 142,
      delayedCount: 6,
      failedCount: 3,
      avgDeliveryDays: 2.4,
      successRate: 96.8,
      slaCompliance: 91.2,
    },
    pipeline: [
      { status: "pending", label: "Menunggu", count: 24, totalValue: 8_640_000, urgentCount: 4 },
      { status: "paid", label: "Dibayar", count: 31, totalValue: 12_840_000, urgentCount: 8 },
      { status: "picking", label: "Picking", count: 18, totalValue: 7_200_000, urgentCount: 2 },
      { status: "packing", label: "Packing", count: 22, totalValue: 9_800_000, urgentCount: 3 },
      { status: "ready_pickup", label: "Siap Pickup", count: 16, totalValue: 6_400_000, urgentCount: 1 },
      { status: "shipped", label: "Dikirim", count: 198, totalValue: 84_200_000, urgentCount: 6 },
      { status: "delivered", label: "Terkirim", count: 142, totalValue: 61_400_000, urgentCount: 0 },
      { status: "delayed", label: "Tertunda", count: 6, totalValue: 2_180_000, urgentCount: 6 },
      { status: "failed_delivery", label: "Gagal Kirim", count: 3, totalValue: 1_040_000, urgentCount: 3 },
      { status: "returned", label: "Diretur", count: 9, totalValue: 3_240_000, urgentCount: 2 },
    ],
    couriers: [
      { name: "JNE", totalShipments: 824, deliveredCount: 798, successRate: 96.8, avgDeliveryDays: 2.1, returnRate: 2.4, complaintRate: 1.8, slaCompliance: 94.2 },
      { name: "J&T Express", totalShipments: 612, deliveredCount: 588, successRate: 96.1, avgDeliveryDays: 2.3, returnRate: 2.8, complaintRate: 2.1, slaCompliance: 92.8 },
      { name: "SiCepat", totalShipments: 438, deliveredCount: 416, successRate: 94.9, avgDeliveryDays: 1.9, returnRate: 3.2, complaintRate: 2.6, slaCompliance: 89.4 },
      { name: "GoSend", totalShipments: 284, deliveredCount: 278, successRate: 97.9, avgDeliveryDays: 0.8, returnRate: 1.2, complaintRate: 0.8, slaCompliance: 98.1 },
      { name: "AnterAja", totalShipments: 198, deliveredCount: 187, successRate: 94.4, avgDeliveryDays: 2.8, returnRate: 3.8, complaintRate: 3.1, slaCompliance: 87.6 },
    ],
    delayedOrders: [
      { id: "dly-1", orderNumber: "GNB-260616-0177", customerName: "Siti Rahayu", status: "shipped", courier: "JNE", delayHours: 28, totalAmount: 418_000, reason: "Gudang transit penuh" },
      { id: "dly-2", orderNumber: "GNB-260616-0163", customerName: "Putri Handayani", status: "picking", courier: "J&T Express", delayHours: 18, totalAmount: 284_000, reason: "Staf picking berkurang" },
      { id: "dly-3", orderNumber: "GNB-260616-0151", customerName: "Rina Amelia", status: "paid", courier: "-", delayHours: 14, totalAmount: 536_000, reason: "Order belum diproses" },
    ],
  };
};

// ─── Inventory Intelligence Demo ─────────────────────────────────────────

export const getDemoInventoryIntelligence = async (): Promise<InventoryIntelligenceData> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    metrics: {
      healthScore: 74,
      totalInventoryValue: 842_400_000,
      totalSkus: 87,
      criticalSkus: 5,
      overstockSkus: 8,
      deadStockSkus: 4,
      fastMovingSkus: 23,
      avgStockTurnover: 4.2,
      stockoutRiskRevenue: 48_600_000,
    },
    items: [
      { id: "inv-1", name: "Vitamin C Serum", sku: "GNB-VCS-30", category: "Serum", currentStock: 18, reservedStock: 4, incomingStock: 0, dailyVelocity: 4.5, daysRemaining: 4, stockStatus: "critical", stockValue: 9_000_000, reorderPoint: 30, recommendedRestock: 120, estimatedRevenueImpact: 18_600_000, supplierName: "PT Kosmetik Prima", lastRestockDate: "2026-05-28" },
      { id: "inv-2", name: "Barrier Repair Cream", sku: "GNB-BRC-30", category: "Moisturizer", currentStock: 21, reservedStock: 3, incomingStock: 50, dailyVelocity: 4.1, daysRemaining: 5, stockStatus: "critical", stockValue: 8_400_000, reorderPoint: 30, recommendedRestock: 100, estimatedRevenueImpact: 14_200_000, supplierName: "PT Kosmetik Prima", lastRestockDate: "2026-05-30" },
      { id: "inv-3", name: "Gentle Gel Cleanser", sku: "GNB-GGC-100", category: "Cleanser", currentStock: 33, reservedStock: 6, incomingStock: 0, dailyVelocity: 5.3, daysRemaining: 6, stockStatus: "fast_moving", stockValue: 6_600_000, reorderPoint: 40, recommendedRestock: 140, estimatedRevenueImpact: 12_400_000, supplierName: "CV Sumber Bahan", lastRestockDate: "2026-06-01" },
      { id: "inv-4", name: "Retinol Night Cream", sku: "GNB-RNC-20", category: "Treatment", currentStock: 14, reservedStock: 2, incomingStock: 0, dailyVelocity: 2.0, daysRemaining: 7, stockStatus: "critical", stockValue: 11_200_000, reorderPoint: 20, recommendedRestock: 60, estimatedRevenueImpact: 8_400_000, supplierName: "PT Bahan Aktif", lastRestockDate: "2026-05-20" },
      { id: "inv-5", name: "Daily Sunscreen SPF 50", sku: "GNB-DS50-40", category: "Sunscreen", currentStock: 42, reservedStock: 8, incomingStock: 100, dailyVelocity: 5.8, daysRemaining: 7, stockStatus: "fast_moving", stockValue: 12_600_000, reorderPoint: 45, recommendedRestock: 150, estimatedRevenueImpact: 16_800_000, supplierName: "CV Sumber Bahan", lastRestockDate: "2026-06-03" },
      { id: "inv-6", name: "Niacinamide Toner", sku: "GNB-NIA-150", category: "Toner", currentStock: 284, reservedStock: 12, incomingStock: 0, dailyVelocity: 1.2, daysRemaining: 237, stockStatus: "overstock", stockValue: 28_400_000, reorderPoint: 30, recommendedRestock: 0, estimatedRevenueImpact: 0, supplierName: "PT Bahan Aktif", lastRestockDate: "2026-04-10" },
      { id: "inv-7", name: "AHA BHA Exfoliator", sku: "GNB-AHA-60", category: "Treatment", currentStock: 0, reservedStock: 0, incomingStock: 60, dailyVelocity: 2.8, daysRemaining: 0, stockStatus: "dead_stock", stockValue: 0, reorderPoint: 20, recommendedRestock: 80, estimatedRevenueImpact: 9_800_000, supplierName: "PT Kosmetik Prima", lastRestockDate: "2026-03-15" },
    ],
    demandForecast: [
      { date: "2026-06-17", forecastDemand: 48, currentStock: 18, safetyStock: 14 },
      { date: "2026-06-18", forecastDemand: 51, currentStock: 0, safetyStock: 14 },
      { date: "2026-06-19", forecastDemand: 53, currentStock: 0, safetyStock: 14 },
      { date: "2026-06-20", forecastDemand: 46, currentStock: 0, safetyStock: 14 },
      { date: "2026-06-21", forecastDemand: 49, currentStock: 0, safetyStock: 14 },
      { date: "2026-06-22", forecastDemand: 55, currentStock: 0, safetyStock: 14 },
      { date: "2026-06-23", forecastDemand: 58, currentStock: 0, safetyStock: 14 },
    ],
    restockRecommendations: [
      { id: "rec-1", productName: "Vitamin C Serum", sku: "GNB-VCS-30", currentStock: 18, daysRemaining: 4, recommendedQty: 120, estimatedCost: 14_400_000, estimatedRevenueProtected: 18_600_000, urgency: "critical", supplierName: "PT Kosmetik Prima" },
      { id: "rec-2", productName: "Barrier Repair Cream", sku: "GNB-BRC-30", currentStock: 21, daysRemaining: 5, recommendedQty: 100, estimatedCost: 12_000_000, estimatedRevenueProtected: 14_200_000, urgency: "critical", supplierName: "PT Kosmetik Prima" },
      { id: "rec-3", productName: "AHA BHA Exfoliator", sku: "GNB-AHA-60", currentStock: 0, daysRemaining: 0, recommendedQty: 80, estimatedCost: 9_600_000, estimatedRevenueProtected: 9_800_000, urgency: "critical", supplierName: "PT Kosmetik Prima" },
      { id: "rec-4", productName: "Gentle Gel Cleanser", sku: "GNB-GGC-100", currentStock: 33, daysRemaining: 6, recommendedQty: 140, estimatedCost: 11_200_000, estimatedRevenueProtected: 12_400_000, urgency: "high", supplierName: "CV Sumber Bahan" },
    ],
  };
};

// ─── Returns Intelligence Demo ───────────────────────────────────────────

export const getDemoReturnIntelligence = async (): Promise<ReturnIntelligenceData> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    metrics: {
      returnRate: 3.1,
      refundRate: 2.2,
      exchangeRate: 0.9,
      totalRefundValue: 12_840_000,
      avgReturnCost: 48_000,
      returnCount: 268,
      refundCount: 189,
      exchangeCount: 79,
    },
    topReturnedProducts: [
      { productName: "Retinol Night Cream", sku: "GNB-RNC-20", returnCount: 28, returnRate: 8.4, topReason: "Iritasi kulit", qualityIssue: true, packagingIssue: false },
      { productName: "AHA BHA Exfoliator", sku: "GNB-AHA-60", returnCount: 22, returnRate: 6.8, topReason: "Terlalu keras untuk kulit sensitif", qualityIssue: false, packagingIssue: false },
      { productName: "Vitamin C Serum", sku: "GNB-VCS-30", returnCount: 18, returnRate: 4.1, topReason: "Produk bocor", qualityIssue: false, packagingIssue: true },
      { productName: "Niacinamide Toner", sku: "GNB-NIA-150", returnCount: 14, returnRate: 3.6, topReason: "Tidak cocok dengan kulit", qualityIssue: false, packagingIssue: false },
    ],
    returnTrend: [
      { date: "2026-06-10", returns: 34, refunds: 24, exchanges: 10 },
      { date: "2026-06-11", returns: 41, refunds: 29, exchanges: 12 },
      { date: "2026-06-12", returns: 38, refunds: 27, exchanges: 11 },
      { date: "2026-06-13", returns: 36, refunds: 25, exchanges: 11 },
      { date: "2026-06-14", returns: 44, refunds: 31, exchanges: 13 },
      { date: "2026-06-15", returns: 47, refunds: 33, exchanges: 14 },
      { date: "2026-06-16", returns: 28, refunds: 20, exchanges: 8 },
    ],
    topReturnReasons: [
      { reason: "Produk tidak sesuai deskripsi", count: 84, percentage: 31.3 },
      { reason: "Reaksi kulit / iritasi", count: 72, percentage: 26.9 },
      { reason: "Kemasan rusak", count: 48, percentage: 17.9 },
      { reason: "Produk tidak efektif", count: 36, percentage: 13.4 },
      { reason: "Ukuran tidak sesuai", count: 28, percentage: 10.4 },
    ],
    fraudFlags: [
      { id: "fraud-1", customerId: "cst-88", customerName: "Budi Santoso", fraudScore: 91, riskLevel: "critical", reasons: ["7 retur dalam 30 hari", "Semua alasan berbeda", "Tidak ada foto bukti"], totalOrders: 9, totalReturns: 7, totalRefundValue: 4_200_000, lastActivity: "2026-06-15" },
      { id: "fraud-2", customerId: "cst-124", customerName: "Agus Wijaya", fraudScore: 76, riskLevel: "high", reasons: ["4 retur dalam 14 hari", "Pola refund berulang"], totalOrders: 6, totalReturns: 4, totalRefundValue: 1_840_000, lastActivity: "2026-06-14" },
      { id: "fraud-3", customerId: "cst-201", customerName: "Hendra Kusuma", fraudScore: 64, riskLevel: "medium", reasons: ["3 retur di 3 transaksi berbeda", "Nomor penerima berbeda"], totalOrders: 4, totalReturns: 3, totalRefundValue: 980_000, lastActivity: "2026-06-13" },
    ],
  };
};

// ─── Marketing Intelligence Demo ─────────────────────────────────────────

export const getDemoMarketing = async (): Promise<MarketingData> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    metrics: {
      totalSpend: 48_400_000,
      totalRevenue: 312_800_000,
      blendedRoas: 6.46,
      avgCac: 84_000,
      totalConversions: 1_847,
      avgConversionRate: 3.2,
      customerLtv: 1_840_000,
      ltvCacRatio: 21.9,
    },
    channels: [
      { name: "Meta Ads", platform: "meta", spend: 18_400_000, revenue: 128_800_000, roas: 7.0, cac: 76_000, conversions: 842, conversionRate: 3.8, impressions: 1_240_000, clicks: 24_800, ctr: 2.0 },
      { name: "Google Ads", platform: "google", spend: 12_800_000, revenue: 84_200_000, roas: 6.6, cac: 88_000, conversions: 614, conversionRate: 2.9, impressions: 842_000, clicks: 18_400, ctr: 2.2 },
      { name: "TikTok Ads", platform: "tiktok", spend: 8_400_000, revenue: 54_200_000, roas: 6.5, cac: 92_000, conversions: 284, conversionRate: 2.4, impressions: 2_840_000, clicks: 42_000, ctr: 1.5 },
      { name: "Email Campaign", platform: "email", spend: 2_400_000, revenue: 28_400_000, roas: 11.8, cac: 28_000, conversions: 84, conversionRate: 8.4, impressions: 48_000, clicks: 4_800, ctr: 10.0 },
      { name: "Affiliate", platform: "affiliate", spend: 4_200_000, revenue: 12_400_000, roas: 2.9, cac: 124_000, conversions: 38, conversionRate: 1.8, impressions: 0, clicks: 8_400, ctr: 0 },
      { name: "Influencer", platform: "influencer", spend: 2_200_000, revenue: 4_800_000, roas: 2.2, cac: 148_000, conversions: 18, conversionRate: 1.2, impressions: 420_000, clicks: 8_400, ctr: 2.0 },
    ],
    funnel: [
      { stage: "Awareness (Reach)", count: 4_120_000, conversionRate: 100, dropoffRate: 0 },
      { stage: "Interest (Click)", count: 98_400, conversionRate: 2.39, dropoffRate: 97.6 },
      { stage: "Consideration (Visit)", count: 42_800, conversionRate: 43.5, dropoffRate: 56.5 },
      { stage: "Intent (Add to Cart)", count: 12_400, conversionRate: 29.0, dropoffRate: 71.0 },
      { stage: "Purchase (Order)", count: 1_847, conversionRate: 14.9, dropoffRate: 85.1 },
    ],
  };
};

// ─── Executive Dashboard Demo ─────────────────────────────────────────────

export const getDemoExecutiveDashboard = async (): Promise<ExecutiveDashboardData> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    revenueToday: 48_240_000,
    revenueThisMonth: 1_284_600_000,
    revenueThisYear: 8_421_200_000,
    netProfit: 248_800_000,
    grossProfit: 384_200_000,
    cashFlow: 184_400_000,
    inventoryValue: 842_400_000,
    customerGrowthRate: 14.2,
    repeatPurchaseRate: 61.4,
    refundRate: 2.2,
    marketingRoi: 548,
    businessHealthScore: 84,
    growthScore: 78,
    forecastRevenue: 1_480_000_000,
    forecastProfit: 296_000_000,
    kpis: [
      { label: "Pendapatan Hari Ini", value: 48_240_000, unit: "currency", trend: "up", trendPercent: 12.4 },
      { label: "Pendapatan Bulan Ini", value: 1_284_600_000, unit: "currency", trend: "up", trendPercent: 18.2 },
      { label: "Laba Bersih Bulan Ini", value: 248_800_000, unit: "currency", trend: "up", trendPercent: 8.6 },
      { label: "Repeat Purchase Rate", value: 61.4, unit: "percent", trend: "up", trendPercent: 3.2 },
      { label: "Customer Growth", value: 14.2, unit: "percent", trend: "up", trendPercent: 2.8 },
      { label: "Business Health", value: 84, unit: "count", trend: "up", trendPercent: 4.0 },
    ],
    insights: [
      { id: "ins-1", category: "revenue", title: "Pendapatan naik 18.2% bulan ini", detail: "Didorong oleh peningkatan repeat purchase dan kampanye Meta Ads yang efisien (ROAS 7.0x).", impact: "+Rp196 juta vs bulan lalu", urgency: "this_week" },
      { id: "ins-2", category: "inventory", title: "5 SKU kritikal mengancam Rp48.6 juta pendapatan", detail: "Vitamin C Serum, Barrier Repair Cream, dan AHA BHA Exfoliator akan habis dalam 4–7 hari tanpa restock.", impact: "Risiko kehilangan Rp48.6 juta", urgency: "now" },
      { id: "ins-3", category: "customer", title: "198 pelanggan berisiko churn minggu ini", detail: "Segmen Churn Risk memiliki LTV rata-rata Rp940 ribu. Intervensi kampanye win-back diperlukan.", impact: "Potensi recovery Rp186 juta", urgency: "today" },
      { id: "ins-4", category: "marketing", title: "Email campaign ROAS terbaik: 11.8x", detail: "Email menghasilkan ROAS 11.8x dengan CAC hanya Rp28.000. Alokasi budget perlu ditingkatkan.", impact: "Peluang efisiensi spend", urgency: "this_week" },
      { id: "ins-5", category: "risk", title: "Deteksi potensi fraud 3 pelanggan", detail: "3 akun menunjukkan pola retur abnormal dengan fraud score di atas 60. Perlu review manual.", impact: "Melindungi Rp7 juta dari refund tidak valid", urgency: "today" },
    ],
  };
};

// ─── Skincare Intelligence Demo ───────────────────────────────────────────

export const getDemoSkincareIntelligence = async (): Promise<SkincareData> => {
  const now = new Date().toISOString();
  return {
    source: "demo",
    generatedAt: now,
    skinTypeDistribution: [
      { skinType: "Kombinasi", count: 2_840, percentage: 34.5, avgLtv: 2_100_000, topProduct: "Vitamin C Serum", repeatPurchaseRate: 68.4 },
      { skinType: "Berminyak", count: 2_184, percentage: 26.5, avgLtv: 1_840_000, topProduct: "Niacinamide Toner", repeatPurchaseRate: 62.1 },
      { skinType: "Kering", count: 1_648, percentage: 20.0, avgLtv: 2_420_000, topProduct: "Barrier Repair Cream", repeatPurchaseRate: 74.2 },
      { skinType: "Sensitif", count: 984, percentage: 11.9, avgLtv: 2_680_000, topProduct: "Gentle Gel Cleanser", repeatPurchaseRate: 78.6 },
      { skinType: "Normal", count: 584, percentage: 7.1, avgLtv: 1_240_000, topProduct: "Daily Sunscreen SPF 50", repeatPurchaseRate: 54.3 },
    ],
    skinConcernStats: [
      { concern: "Pori-pori besar", count: 3_284, percentage: 39.8, revenueContribution: 284_200_000, topProducts: ["Niacinamide Toner", "Vitamin C Serum"] },
      { concern: "Flek hitam / hiperpigmentasi", count: 2_848, percentage: 34.6, revenueContribution: 248_400_000, topProducts: ["Vitamin C Serum", "AHA BHA Exfoliator"] },
      { concern: "Kulit kusam", count: 2_412, percentage: 29.3, revenueContribution: 198_600_000, topProducts: ["Vitamin C Serum", "Gentle Gel Cleanser"] },
      { concern: "Jerawat", count: 1_984, percentage: 24.1, revenueContribution: 164_800_000, topProducts: ["Niacinamide Toner", "AHA BHA Exfoliator"] },
      { concern: "Kulit sensitif / iritasi", count: 1_248, percentage: 15.1, revenueContribution: 142_400_000, topProducts: ["Gentle Gel Cleanser", "Barrier Repair Cream"] },
    ],
    productEffectiveness: [
      { productName: "Vitamin C Serum", sku: "GNB-VCS-30", skinType: "Kombinasi", repeatPurchaseRate: 84.2, avgRating: 4.7, reviewCount: 1_284, effectivenessScore: 91 },
      { productName: "Barrier Repair Cream", sku: "GNB-BRC-30", skinType: "Kering", repeatPurchaseRate: 88.6, avgRating: 4.8, reviewCount: 842, effectivenessScore: 94 },
      { productName: "Gentle Gel Cleanser", sku: "GNB-GGC-100", skinType: "Sensitif", repeatPurchaseRate: 79.4, avgRating: 4.6, reviewCount: 1_048, effectivenessScore: 88 },
      { productName: "Niacinamide Toner", sku: "GNB-NIA-150", skinType: "Berminyak", repeatPurchaseRate: 74.8, avgRating: 4.5, reviewCount: 948, effectivenessScore: 82 },
      { productName: "Daily Sunscreen SPF 50", sku: "GNB-DS50-40", skinType: "Semua", repeatPurchaseRate: 71.2, avgRating: 4.6, reviewCount: 2_184, effectivenessScore: 86 },
    ],
    insights: [
      { id: "ski-1", title: "Kulit kering memiliki LTV tertinggi (Rp2.42 juta)", detail: "Pelanggan dengan kulit kering membeli lebih sering (repeat rate 74.2%) dan cenderung loyal pada Barrier Repair Cream.", action: "Buat bundel perawatan kulit kering dan tawarkan subscription bulanan.", revenueOpportunity: 84_200_000 },
      { id: "ski-2", title: "Kulit sensitif menunjukkan repeat rate tertinggi", detail: "78.6% repeat rate pada segmen sensitif. Produk gentle membangun kepercayaan jangka panjang.", action: "Kembangkan lini Sensitive Care dan promosikan ke segmen ini.", revenueOpportunity: 62_400_000 },
      { id: "ski-3", title: "Kombinasi Vitamin C + Sunscreen paling populer", detail: "42% pelanggan yang membeli Vitamin C Serum juga membeli Daily Sunscreen dalam 30 hari.", action: "Buat bundel morning routine dan tawarkan diskon 10%.", revenueOpportunity: 48_800_000 },
    ],
    topProductCombinations: [
      { products: ["Vitamin C Serum", "Daily Sunscreen SPF 50"], coOccurrenceRate: 42.1, avgOrderValue: 684_000 },
      { products: ["Barrier Repair Cream", "Gentle Gel Cleanser"], coOccurrenceRate: 38.4, avgOrderValue: 598_000 },
      { products: ["Niacinamide Toner", "AHA BHA Exfoliator"], coOccurrenceRate: 31.2, avgOrderValue: 524_000 },
      { products: ["Vitamin C Serum", "Retinol Night Cream"], coOccurrenceRate: 28.8, avgOrderValue: 812_000 },
    ],
  };
};

// ─── Alert Center Demo ────────────────────────────────────────────────────

export const getDemoAlertCenter = async (): Promise<AlertCenterData> => {
  const now = new Date().toISOString();
  const alerts = [
    { id: "alc-1", severity: "critical" as const, category: "inventory" as const, title: "Vitamin C Serum akan habis dalam 4 hari", detail: "Stok tersisa 18 unit, kecepatan jual 4.5 unit/hari. Potensi stockout Rp18.6 juta.", action: "Buat PO ke PT Kosmetik Prima segera.", count: 1, href: "/admin/inventory", timestamp: now, isRead: false },
    { id: "alc-2", severity: "critical" as const, category: "fraud" as const, title: "Deteksi fraud: Budi Santoso (score 91)", detail: "7 dari 9 transaksi diretur dalam 30 hari dengan alasan berbeda-beda.", action: "Blokir akun dan investigasi manual.", count: 1, href: "/admin/returns/intelligence", timestamp: now, isRead: false },
    { id: "alc-3", severity: "critical" as const, category: "logistics" as const, title: "6 order melewati SLA", detail: "Order rata-rata tertunda 18 jam dari target SLA fulfillment.", action: "Prioritaskan picking dan packing segera.", count: 6, href: "/admin/logistics", timestamp: now, isRead: false },
    { id: "alc-4", severity: "high" as const, category: "inventory" as const, title: "4 SKU kritikal stok di bawah reorder point", detail: "Barrier Repair Cream, Gentle Gel Cleanser, Retinol Night Cream, AHA BHA Exfoliator.", action: "Review dan buat keputusan restock hari ini.", count: 4, href: "/admin/inventory", timestamp: now, isRead: false },
    { id: "alc-5", severity: "high" as const, category: "customer" as const, title: "198 pelanggan berisiko churn minggu ini", detail: "Belum ada pembelian 60–90 hari. LTV rata-rata Rp940 ribu per pelanggan.", action: "Jalankan kampanye win-back dengan diskon personal.", count: 198, href: "/admin/intelligence", timestamp: now, isRead: false },
    { id: "alc-6", severity: "high" as const, category: "logistics" as const, title: "Tingkat keberhasilan AnterAja di bawah threshold", detail: "Success rate 94.4%, SLA compliance 87.6% — di bawah standar minimum 90%.", action: "Evaluasi penggunaan AnterAja dan pertimbangkan kurir lain.", count: 1, href: "/admin/logistics", timestamp: now, isRead: true },
    { id: "alc-7", severity: "medium" as const, category: "revenue" as const, title: "Pendapatan jam 10–12 turun 22% vs rata-rata", detail: "Pola anomali pendapatan mid-morning terdeteksi dalam 3 hari terakhir.", action: "Cek status payment gateway dan campaign aktif.", count: 1, href: "/admin/executive", timestamp: now, isRead: false },
    { id: "alc-8", severity: "medium" as const, category: "marketing" as const, title: "CTR TikTok Ads turun 18% minggu ini", detail: "CTR turun dari 1.8% ke 1.5%. Creative fatigue kemungkinan penyebab utama.", action: "Refresh creative asset kampanye TikTok.", count: 3, href: "/admin/marketing", timestamp: now, isRead: true },
    { id: "alc-9", severity: "low" as const, category: "inventory" as const, title: "Niacinamide Toner overstock (237 hari)", detail: "Stok melebihi 8x kebutuhan normal. Kapital tertahan Rp28.4 juta.", action: "Pertimbangkan flash sale atau bundle untuk percepat penjualan.", count: 1, href: "/admin/inventory", timestamp: now, isRead: true },
    { id: "alc-10", severity: "low" as const, category: "customer" as const, title: "Review negatif meningkat pada Retinol Night Cream", detail: "3 review bintang 2 dalam 7 hari. Topik: iritasi kulit sensitif.", action: "Update deskripsi produk dengan petunjuk penggunaan yang lebih jelas.", count: 3, href: "/admin/products", timestamp: now, isRead: false },
  ];

  return {
    source: "demo",
    generatedAt: now,
    alerts,
    criticalCount: alerts.filter(a => a.severity === "critical").length,
    highCount: alerts.filter(a => a.severity === "high").length,
    mediumCount: alerts.filter(a => a.severity === "medium").length,
    lowCount: alerts.filter(a => a.severity === "low").length,
    totalUnread: alerts.filter(a => !a.isRead).length,
  };
};
