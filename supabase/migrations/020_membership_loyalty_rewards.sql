-- ============================================================
-- Migration 020: Membership, Loyalty & Rewards Subsystem
-- Project: lvmyjtzfohlorocrjvcx (ginabo.id)
-- Currency: GINABO Points | Scope: Local migration file only
-- ============================================================

-- 1. Ensure loyalty_points constraint on profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_loyalty_points_non_negative'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_loyalty_points_non_negative CHECK (loyalty_points >= 0);
  END IF;
END $$;

-- 2. Create Immutable Points Ledger Table
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'earn_purchase',   -- points earned from valid completed order
        'redeem',          -- points redeemed for rewards/vouchers
        'adjustment',      -- manual adjustment by administrator
        'reversal',        -- points reversed due to order refund
        'welcome_bonus',   -- initial registration welcome bonus
        'expiry'           -- points expired
    )),
    points_delta     INTEGER NOT NULL,                     -- positive or negative integer
    balance_after    INTEGER NOT NULL CHECK (balance_after >= 0),
    source_type      TEXT NOT NULL CHECK (source_type IN ('order', 'refund', 'admin', 'registration', 'manual')),
    source_id        TEXT NOT NULL,                        -- order_id, refund_id, or admin_user_id
    description      TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.loyalty_transactions IS 'Immutable audit ledger for all GINABO loyalty points credits, debits, and adjustments';

-- 3. Indexes for Fast Reads and Audit Queries
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_profile
    ON public.loyalty_transactions(profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_source
    ON public.loyalty_transactions(source_type, source_id);

-- 4. Idempotency Constraint: Prevent duplicate earning/reversal for the same source
CREATE UNIQUE INDEX IF NOT EXISTS uq_loyalty_transaction_source
    ON public.loyalty_transactions(profile_id, transaction_type, source_type, source_id);

-- 5. Row Level Security Policies
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loyalty_transactions' AND policyname = 'loyalty_transactions_own_read'
  ) THEN
    CREATE POLICY loyalty_transactions_own_read ON public.loyalty_transactions
      FOR SELECT TO authenticated
      USING (profile_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loyalty_transactions' AND policyname = 'loyalty_transactions_service_role'
  ) THEN
    CREATE POLICY loyalty_transactions_service_role ON public.loyalty_transactions
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 6. Guard profile loyalty_points against direct client tampering
CREATE OR REPLACE FUNCTION public.protect_profile_system_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (auth.jwt()->>'role' = 'authenticated' AND NOT public.is_admin()) THEN
    IF NEW.loyalty_points IS DISTINCT FROM OLD.loyalty_points THEN
      RAISE EXCEPTION 'Unauthorized to mutate loyalty_points' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_system_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_system_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_system_fields();

