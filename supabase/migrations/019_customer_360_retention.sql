-- Migration 019: Customer 360, Retention & Segmentation Views
-- Project: lvmyjtzfohlorocrjvcx (ginabo.id)
-- Local migration only. Production Supabase is NOT modified directly.

-- Performance indexes for customer metrics aggregation
CREATE INDEX IF NOT EXISTS idx_orders_customer_metrics
  ON public.orders(profile_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_refunds_customer_metrics
  ON public.refunds(profile_id, status, amount);

CREATE INDEX IF NOT EXISTS idx_returns_customer_metrics
  ON public.returns(profile_id, status);

CREATE INDEX IF NOT EXISTS idx_order_items_product_metrics
  ON public.order_items(product_id, quantity, total_price);

-- Customer 360 Canonical Metrics View (Gross/Net Revenue, Orders, Returns, AOV, Recency)
CREATE OR REPLACE VIEW public.customer_360_metrics AS
WITH valid_orders AS (
  SELECT
    o.profile_id,
    COUNT(o.id)::INTEGER AS valid_order_count,
    COUNT(CASE WHEN o.status = 'paid' THEN 1 END)::INTEGER AS paid_order_count,
    COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::INTEGER AS completed_order_count,
    COALESCE(SUM(o.total_amount), 0)::BIGINT AS gross_revenue,
    MIN(o.created_at) AS first_order_at,
    MAX(o.created_at) AS last_order_at
  FROM public.orders o
  WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered', 'completed')
  GROUP BY o.profile_id
),
valid_items AS (
  SELECT
    o.profile_id,
    COALESCE(SUM(oi.quantity), 0)::INTEGER AS total_units_purchased
  FROM public.orders o
  JOIN public.order_items oi ON oi.order_id = o.id
  WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered', 'completed')
  GROUP BY o.profile_id
),
refund_totals AS (
  SELECT
    r.profile_id,
    COALESCE(SUM(r.amount), 0)::BIGINT AS total_refunded_amount
  FROM public.refunds r
  WHERE r.status IN ('pending', 'processing', 'completed')
  GROUP BY r.profile_id
),
return_totals AS (
  SELECT
    ret.profile_id,
    COUNT(ret.id)::INTEGER AS total_returns_count
  FROM public.returns ret
  WHERE ret.status NOT IN ('draft', 'cancelled')
  GROUP BY ret.profile_id
),
cancelled_orders AS (
  SELECT
    o.profile_id,
    COUNT(o.id)::INTEGER AS cancelled_order_count
  FROM public.orders o
  WHERE o.status = 'cancelled'
  GROUP BY o.profile_id
)
SELECT
  p.id AS profile_id,
  p.email,
  p.full_name,
  p.phone_number,
  p.whatsapp_number,
  p.created_at AS registration_date,
  COALESCE(vo.valid_order_count, 0) AS valid_order_count,
  COALESCE(vo.paid_order_count, 0) AS paid_order_count,
  COALESCE(vo.completed_order_count, 0) AS completed_order_count,
  COALESCE(vo.gross_revenue, 0) AS gross_revenue,
  COALESCE(rt.total_refunded_amount, 0) AS total_refunded_amount,
  (COALESCE(vo.gross_revenue, 0) - COALESCE(rt.total_refunded_amount, 0))::BIGINT AS net_revenue,
  CASE
    WHEN COALESCE(vo.valid_order_count, 0) > 0 THEN
      ROUND((COALESCE(vo.gross_revenue, 0) - COALESCE(rt.total_refunded_amount, 0)) / vo.valid_order_count)::BIGINT
    ELSE 0
  END AS average_order_value,
  COALESCE(vi.total_units_purchased, 0) AS total_units_purchased,
  vo.first_order_at,
  vo.last_order_at,
  COALESCE(ret.total_returns_count, 0) AS return_count,
  COALESCE(co.cancelled_order_count, 0) AS cancelled_order_count,
  CASE
    WHEN COALESCE(vo.valid_order_count, 0) > 0 THEN
      ROUND((COALESCE(ret.total_returns_count, 0)::NUMERIC / vo.valid_order_count::NUMERIC) * 100, 2)
    ELSE 0.00
  END AS return_rate_percent,
  CASE
    WHEN COALESCE(vo.valid_order_count, 0) >= 2 THEN TRUE
    ELSE FALSE
  END AS is_repeat_customer,
  TO_CHAR(vo.first_order_at, 'YYYY-MM') AS first_purchase_month
FROM public.profiles p
LEFT JOIN valid_orders vo ON vo.profile_id = p.id
LEFT JOIN valid_items vi ON vi.profile_id = p.id
LEFT JOIN refund_totals rt ON rt.profile_id = p.id
LEFT JOIN return_totals ret ON ret.profile_id = p.id
LEFT JOIN cancelled_orders co ON co.profile_id = p.id;

REVOKE ALL ON public.customer_360_metrics FROM anon, authenticated;
GRANT SELECT ON public.customer_360_metrics TO service_role;
