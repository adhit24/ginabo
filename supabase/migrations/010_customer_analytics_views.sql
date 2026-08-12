CREATE OR REPLACE VIEW public.customer_rfm_summary AS
SELECT
  o.profile_id,
  MAX(o.created_at) AS last_order_at,
  COUNT(*)::INTEGER AS order_count,
  COALESCE(SUM(o.total_amount), 0)::BIGINT AS lifetime_value,
  COALESCE(AVG(o.total_amount), 0)::NUMERIC(14,2) AS average_order_value
FROM public.orders o
WHERE o.status IN ('paid','processing','shipped','delivered','completed')
GROUP BY o.profile_id;

CREATE OR REPLACE VIEW public.product_affinity_summary AS
SELECT oi.product_id, oi.product_name, COUNT(DISTINCT o.profile_id)::INTEGER AS unique_customers, SUM(oi.quantity)::INTEGER AS units_sold, SUM(oi.total_price)::BIGINT AS revenue
FROM public.order_items oi JOIN public.orders o ON o.id = oi.order_id
WHERE o.status IN ('paid','processing','shipped','delivered','completed')
GROUP BY oi.product_id, oi.product_name;

REVOKE ALL ON public.customer_rfm_summary, public.product_affinity_summary FROM anon, authenticated;
GRANT SELECT ON public.customer_rfm_summary, public.product_affinity_summary TO service_role;
