-- Canonical customer/order fields used by the current Supabase application.
-- This migration is additive and does not delete legacy data.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 100;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_gender_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_gender_check
      CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'));
  END IF;
END $$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_fee BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_weight_grams INTEGER,
  ADD COLUMN IF NOT EXISTS checkout_idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_profile_idempotency
  ON public.orders(profile_id, checkout_idempotency_key)
  WHERE checkout_idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_default_per_profile
  ON public.addresses(profile_id)
  WHERE is_default = TRUE;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT;

-- Snap returns a token separately from the redirect URL; keep both auditable.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS snap_token TEXT,
  ADD COLUMN IF NOT EXISTS snap_redirect_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_transaction
  ON public.payments(provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_payment_fee_non_negative'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_fee_non_negative CHECK (payment_fee >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'order_items_quantity_positive'
      AND conrelid = 'public.order_items'::regclass
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'order_items_prices_non_negative'
      AND conrelid = 'public.order_items'::regclass
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_prices_non_negative
      CHECK (unit_price >= 0 AND total_price >= 0);
  END IF;
END $$;
