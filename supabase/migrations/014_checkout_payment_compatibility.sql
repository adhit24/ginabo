-- Task 6: checkout/order/payment integrity hardening.
-- Backward-compatible: keeps historical Midtrans columns/data intact while
-- adding the provider-neutral fields required by the DOKU checkout flow.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS gross_amount BIGINT,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS raw_response JSONB;

-- Backfill legacy Midtrans rows only on databases where the old columns still
-- exist. This keeps migration 014 safe both before and after the older
-- destructive migration 013 has been applied in another environment.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name = 'midtrans_order_id'
  ) THEN
    EXECUTE $sql$
      UPDATE public.payments
      SET provider = 'midtrans'
      WHERE provider IS NULL
        AND (midtrans_order_id IS NOT NULL OR midtrans_transaction_id IS NOT NULL)
    $sql$;

    EXECUTE $sql$
      UPDATE public.payments
      SET
        invoice_number = COALESCE(invoice_number, midtrans_order_id),
        gross_amount = COALESCE(gross_amount, midtrans_gross_amount),
        currency = COALESCE(currency, midtrans_currency, 'IDR'),
        checkout_url = COALESCE(checkout_url, snap_redirect_url, payment_url)
      WHERE midtrans_order_id IS NOT NULL OR midtrans_transaction_id IS NOT NULL
    $sql$;
  END IF;
END;
$$;

ALTER TABLE public.payments
  ALTER COLUMN provider SET DEFAULT 'doku',
  ALTER COLUMN currency SET DEFAULT 'IDR';

-- One provider payment row per order. A non-partial unique index is deliberate:
-- PostgREST/Supabase can target it directly with onConflict=provider,order_id.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_order_unique
  ON public.payments(provider, order_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_invoice_unique
  ON public.payments(provider, invoice_number)
  WHERE provider IS NOT NULL AND invoice_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_provider
  ON public.payments(provider);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_number
  ON public.payments(invoice_number);

COMMENT ON COLUMN public.payments.provider IS
  'Payment gateway provider name, e.g. doku or midtrans.';
COMMENT ON COLUMN public.payments.invoice_number IS
  'Provider invoice/order reference used for reconciliation.';
COMMENT ON COLUMN public.payments.checkout_url IS
  'Hosted checkout/payment URL returned by the provider.';
COMMENT ON COLUMN public.payments.raw_response IS
  'Raw provider initiation response retained for audit/reconciliation.';

-- orders + order_items must commit or roll back together. The route has already
-- re-priced and validated the canonical catalog rows; this RPC only owns the
-- persistence boundary so an item insert failure can never leave a header-only
-- order behind.
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

REVOKE ALL ON FUNCTION public.create_checkout_order_atomic(JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_checkout_order_atomic(JSONB, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.create_checkout_order_atomic(JSONB, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_checkout_order_atomic(JSONB, JSONB) TO service_role;

-- Coupon limits must be claimed atomically. Route-level "count then insert"
-- checks are race-prone: two concurrent checkouts can both see one slot left.
CREATE OR REPLACE FUNCTION public.claim_checkout_coupon(
  p_coupon_id UUID,
  p_profile_id UUID,
  p_order_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_global_usage INTEGER;
  v_user_usage INTEGER;
BEGIN
  SELECT *
  INTO v_coupon
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Idempotent retry for an order that already claimed this coupon.
  IF EXISTS (
    SELECT 1
    FROM public.coupon_usages
    WHERE coupon_id = p_coupon_id
      AND profile_id = p_profile_id
      AND order_id = p_order_id
  ) THEN
    RETURN TRUE;
  END IF;

  IF NOT v_coupon.is_active
     OR v_coupon.starts_at > now()
     OR (v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at <= now()) THEN
    RETURN FALSE;
  END IF;

  SELECT count(*)::INTEGER
  INTO v_global_usage
  FROM public.coupon_usages
  WHERE coupon_id = p_coupon_id;

  IF v_coupon.usage_limit IS NOT NULL AND v_global_usage >= v_coupon.usage_limit THEN
    RETURN FALSE;
  END IF;

  SELECT count(*)::INTEGER
  INTO v_user_usage
  FROM public.coupon_usages
  WHERE coupon_id = p_coupon_id
    AND profile_id = p_profile_id;

  IF v_user_usage >= v_coupon.usage_per_user THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.coupon_usages (coupon_id, profile_id, order_id)
  VALUES (p_coupon_id, p_profile_id, p_order_id);

  UPDATE public.coupons
  SET used_count = v_global_usage + 1
  WHERE id = p_coupon_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) TO service_role;
