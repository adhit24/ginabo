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
