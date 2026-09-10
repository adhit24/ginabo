/**
 * Centralized Executive Alert Thresholds & Business Rules
 * All rules are deterministic; thresholds are configurable here.
 */

export const ALERT_THRESHOLDS = {
  // Revenue decrease vs previous period
  REVENUE_DROP_WARNING_PERCENT: 15,
  REVENUE_DROP_CRITICAL_PERCENT: 30,

  // Conversion rate drop vs previous period
  CONVERSION_DROP_WARNING_PERCENT: 20,

  // Refund rate (% of gross revenue or orders)
  REFUND_RATE_WARNING_PERCENT: 5,
  REFUND_RATE_CRITICAL_PERCENT: 10,

  // Operational backlog
  PROCESSING_BACKLOG_WARNING_COUNT: 5,
  PROCESSING_BACKLOG_CRITICAL_COUNT: 15,

  // Inventory critical levels
  OUT_OF_STOCK_WARNING_COUNT: 1,
  CRITICAL_STOCK_WARNING_COUNT: 3,

  // Unattributed traffic percentage
  UNATTRIBUTED_TRAFFIC_WARNING_PERCENT: 40,

  // Customer retention
  AT_RISK_CUSTOMERS_WARNING_COUNT: 10,
} as const
