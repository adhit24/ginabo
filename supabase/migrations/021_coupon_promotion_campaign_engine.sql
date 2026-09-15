-- ============================================================
-- Migration 021: Coupon, Promotion & Campaign Engine Hardening (Task 13)
-- ============================================================
-- Implements campaigns entity, customer eligibility targeting,
-- historical discount snapshots on orders, and coupon usage sync triggers.

-- 1. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    objective         TEXT NOT NULL DEFAULT 'conversion' CHECK (objective IN ('acquisition','conversion','retention','winback','loyalty','seasonal')),
    description       TEXT,
    starts_at         TIMESTAMPTZ,
    ends_at           TIMESTAMPTZ,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.campaigns IS 'Marketing & promotional campaigns container for attribution and grouping';

CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON public.campaigns(is_active, starts_at, ends_at);

-- 2. EXTEND COUPONS TABLE WITH TARGETING & CAMPAIGN REFERENCE
ALTER TABLE public.coupons
    ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS customer_eligibility TEXT NOT NULL DEFAULT 'all'
        CHECK (customer_eligibility IN ('all','first_purchase','repeat_customer','specific_segments','specific_tiers','specific_profiles')),
    ADD COLUMN IF NOT EXISTS eligible_segments TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS eligible_tiers TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS eligible_profile_ids UUID[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_coupons_campaign ON public.coupons(campaign_id);
CREATE INDEX IF NOT EXISTS idx_coupons_eligibility ON public.coupons(customer_eligibility);

-- 3. EXTEND ORDERS TABLE WITH HISTORICAL PROMO SNAPSHOT
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS discount_snapshot JSONB;

COMMENT ON COLUMN public.orders.discount_snapshot IS 'Immutable snapshot of applied promotion details at purchase time for refund and audit integrity';

-- Update atomic order creation function to persist discount_snapshot
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
    notes
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
    NULLIF(p_order->>'notes', '')
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

-- 4. SYNCHRONIZE COUPONS.USED_COUNT ON USAGE DELETION (RESERVATION RELEASE)
CREATE OR REPLACE FUNCTION public.handle_coupon_usage_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.coupons
    SET used_count = GREATEST(0, (
        SELECT COUNT(*)::INTEGER FROM public.coupon_usages WHERE coupon_id = OLD.coupon_id
    )),
    updated_at = now()
    WHERE id = OLD.coupon_id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_coupon_usage_deletion ON public.coupon_usages;
CREATE TRIGGER trg_coupon_usage_deletion
    AFTER DELETE ON public.coupon_usages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_coupon_usage_deletion();

-- 5. ROW LEVEL SECURITY POLICIES FOR CAMPAIGNS & COUPONS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns: public can view active" ON public.campaigns;
CREATE POLICY "campaigns: public can view active"
    ON public.campaigns FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "campaigns: service role full access" ON public.campaigns;
CREATE POLICY "campaigns: service role full access"
    ON public.campaigns FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "campaigns: admins full access" ON public.campaigns;
CREATE POLICY "campaigns: admins full access"
    ON public.campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE id = auth.uid() AND is_active = true
        )
    );
