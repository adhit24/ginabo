-- Task 6: checkout/payment compatibility hardening.
-- Add provider-neutral DOKU fields without deleting historical Midtrans data.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS gross_amount BIGINT,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS raw_response JSONB;

-- Preserve and correctly classify historical Midtrans rows before defaults are
-- applied to new DOKU records.
UPDATE public.payments
SET provider = 'midtrans'
WHERE provider IS NULL
  AND (midtrans_order_id IS NOT NULL OR midtrans_transaction_id IS NOT NULL);

UPDATE public.payments
SET
  invoice_number = COALESCE(invoice_number, midtrans_order_id),
  gross_amount = COALESCE(gross_amount, midtrans_gross_amount),
  currency = COALESCE(currency, midtrans_currency, 'IDR'),
  checkout_url = COALESCE(checkout_url, snap_redirect_url, payment_url)
WHERE midtrans_order_id IS NOT NULL OR midtrans_transaction_id IS NOT NULL;

ALTER TABLE public.payments
  ALTER COLUMN provider SET DEFAULT 'doku',
  ALTER COLUMN currency SET DEFAULT 'IDR';

-- One provider payment record per order prevents concurrent checkout requests
-- from recording duplicate payment rows for the same provider/order. A normal
-- (non-partial) unique index is intentional: PostgREST can target it directly
-- with `on_conflict=provider,order_id` for idempotent upserts.
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

-- Coupon limits must be claimed atomically. Route-level "count then insert"
-- checks are race-prone: two concurrent checkouts can both observe one slot
-- remaining and both consume it. This function locks the coupon row, re-checks
-- global/per-user limits inside one DB transaction, records the order usage,
-- and self-heals used_count from the canonical usage rows.
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

  -- A retry for the same order is already claimed and must not increment the
  -- counters twice.
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

-- The checkout route invokes this with the service-role server client. Keep
-- the RPC out of the public/anon/authenticated API surface.
REVOKE ALL ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_checkout_coupon(UUID, UUID, UUID) TO service_role;
