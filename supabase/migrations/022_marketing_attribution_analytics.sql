-- ============================================================
-- Migration 022: Marketing Attribution & Conversion Analytics (Task 14)
-- ============================================================
-- Extends orders with marketing attribution snapshot, expands
-- customer_events taxonomy, and updates atomic order creation RPC.

-- 1. EXTEND ORDERS TABLE WITH ATTRIBUTION SNAPSHOT
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS utm_content TEXT,
    ADD COLUMN IF NOT EXISTS utm_term TEXT,
    ADD COLUMN IF NOT EXISTS referrer TEXT,
    ADD COLUMN IF NOT EXISTS landing_page TEXT,
    ADD COLUMN IF NOT EXISTS attribution_channel TEXT,
    ADD COLUMN IF NOT EXISTS attribution_model TEXT NOT NULL DEFAULT 'last_non_direct',
    ADD COLUMN IF NOT EXISTS attribution_snapshot JSONB;

COMMENT ON COLUMN public.orders.attribution_channel IS 'Classified marketing channel e.g. Direct, Organic Search, Paid Social, WhatsApp, etc.';
COMMENT ON COLUMN public.orders.attribution_snapshot IS 'Immutable snapshot of first touch, last non-direct touch, and visitor context at checkout';

CREATE INDEX IF NOT EXISTS idx_orders_attribution_channel ON public.orders(attribution_channel);
CREATE INDEX IF NOT EXISTS idx_orders_utm_source ON public.orders(utm_source);
CREATE INDEX IF NOT EXISTS idx_orders_utm_campaign ON public.orders(utm_campaign);

-- 2. EXPAND CUSTOMER_EVENTS TAXONOMY & PERFORMANCE INDEXES
-- Drop old check constraint and recreate with extended events
ALTER TABLE public.customer_events
    DROP CONSTRAINT IF EXISTS customer_events_event_name_check;

ALTER TABLE public.customer_events
    ADD CONSTRAINT customer_events_event_name_check
    CHECK (event_name IN (
        'session_started',
        'product_viewed',
        'search_submitted',
        'add_to_cart',
        'remove_from_cart',
        'checkout_started',
        'order_created',
        'payment_success',
        'payment_failed',
        'coupon_applied'
    ));

CREATE INDEX IF NOT EXISTS idx_customer_events_occurred_name
    ON public.customer_events(event_name, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_events_session_occurred
    ON public.customer_events(anonymous_session_id, occurred_at DESC)
    WHERE anonymous_session_id IS NOT NULL;

-- 3. UPDATE ATOMIC ORDER CREATION RPC WITH ATTRIBUTION FIELDS
CREATE OR REPLACE FUNCTION public.create_checkout_order_atomic(
  p_order JSONB,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'checkout order requires at least one item'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.orders (
    order_number,
    profile_id,
    status,
    subtotal,
    shipping_cost,
    discount_amount,
    tax_amount,
    total_amount,
    payment_fee,
    shipping_weight_grams,
    checkout_idempotency_key,
    coupon_id,
    coupon_code,
    discount_snapshot,
    shipping_address,
    shipping_courier,
    shipping_service,
    notes,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer,
    landing_page,
    attribution_channel,
    attribution_model,
    attribution_snapshot
  ) VALUES (
    p_order->>'order_number',
    (p_order->>'profile_id')::UUID,
    COALESCE(NULLIF(p_order->>'status', ''), 'pending'),
    (p_order->>'subtotal')::BIGINT,
    (p_order->>'shipping_cost')::BIGINT,
    (p_order->>'discount_amount')::BIGINT,
    (p_order->>'tax_amount')::BIGINT,
    (p_order->>'total_amount')::BIGINT,
    (p_order->>'payment_fee')::BIGINT,
    NULLIF(p_order->>'shipping_weight_grams', '')::INTEGER,
    NULLIF(p_order->>'checkout_idempotency_key', ''),
    NULLIF(p_order->>'coupon_id', '')::UUID,
    NULLIF(p_order->>'coupon_code', ''),
    p_order->'discount_snapshot',
    p_order->'shipping_address',
    NULLIF(p_order->>'shipping_courier', ''),
    NULLIF(p_order->>'shipping_service', ''),
    NULLIF(p_order->>'notes', ''),
    NULLIF(p_order->>'utm_source', ''),
    NULLIF(p_order->>'utm_medium', ''),
    NULLIF(p_order->>'utm_campaign', ''),
    NULLIF(p_order->>'utm_content', ''),
    NULLIF(p_order->>'utm_term', ''),
    NULLIF(p_order->>'referrer', ''),
    NULLIF(p_order->>'landing_page', ''),
    COALESCE(NULLIF(p_order->>'attribution_channel', ''), 'Direct'),
    COALESCE(NULLIF(p_order->>'attribution_model', ''), 'last_non_direct'),
    p_order->'attribution_snapshot'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (
    order_id,
    product_id,
    variant_id,
    product_name,
    variant_name,
    quantity,
    unit_price,
    total_price
  )
  SELECT
    v_order_id,
    (item->>'product_id')::UUID,
    NULLIF(item->>'variant_id', '')::UUID,
    item->>'product_name',
    NULLIF(item->>'variant_name', ''),
    (item->>'quantity')::INTEGER,
    (item->>'unit_price')::BIGINT,
    (item->>'total_price')::BIGINT
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order_atomic(JSONB, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_checkout_order_atomic(JSONB, JSONB) TO service_role;
