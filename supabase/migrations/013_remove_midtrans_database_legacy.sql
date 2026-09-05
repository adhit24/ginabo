-- Migration 013: Remove all Midtrans-specific database structures and columns.
-- Migrates existing Midtrans historical data into provider-neutral payment fields before dropping legacy columns.

-- 1. Ensure provider-neutral columns exist
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS gross_amount BIGINT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'IDR',
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'doku',
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS checkout_url TEXT;

ALTER TABLE public.refunds
  ADD COLUMN IF NOT EXISTS provider_refund_id TEXT;

-- 2. Migrate existing historical values into generic columns
UPDATE public.payments
SET
  invoice_number = COALESCE(invoice_number, midtrans_order_id),
  provider_transaction_id = COALESCE(provider_transaction_id, midtrans_transaction_id),
  gross_amount = COALESCE(gross_amount, midtrans_gross_amount),
  currency = COALESCE(currency, midtrans_currency, 'IDR'),
  checkout_url = COALESCE(checkout_url, snap_redirect_url, payment_url);

-- 3. Independently classify historical provider as 'midtrans' for all rows with legacy indicators
UPDATE public.payments
SET provider = 'midtrans'
WHERE midtrans_order_id IS NOT NULL
   OR midtrans_transaction_id IS NOT NULL
   OR snap_token IS NOT NULL
   OR snap_redirect_url IS NOT NULL;

-- 4. Migrate refunds provider_refund_id
UPDATE public.refunds
SET provider_refund_id = midtrans_refund_id
WHERE provider_refund_id IS NULL AND midtrans_refund_id IS NOT NULL;

-- 5. Re-create view v_order_summary without midtrans_transaction_status & safe against order duplication
CREATE OR REPLACE VIEW public.v_order_summary AS
SELECT DISTINCT ON (o.id)
    o.id AS order_id,
    o.order_number,
    p.full_name AS customer_name,
    p.email AS customer_email,
    p.phone_number,
    o.status,
    o.total_amount,
    o.shipping_courier,
    o.tracking_number,
    o.created_at,
    pay.payment_type,
    pay.status AS payment_status
FROM public.orders o
JOIN public.profiles p   ON p.id = o.profile_id
LEFT JOIN public.payments pay ON pay.order_id = o.id
ORDER BY o.id, pay.created_at DESC NULLS LAST;

COMMENT ON VIEW public.v_order_summary IS 'Convenience view for admin order list — JOIN between orders, profiles, latest payment';

-- 6. Drop Midtrans-specific indexes and constraints
DROP INDEX IF EXISTS public.idx_payments_midtrans_order;
DROP INDEX IF EXISTS public.idx_payments_midtrans_txn;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_midtrans_order_id_key;

-- 7. Ensure generic indexes exist for performance & lookup
CREATE INDEX IF NOT EXISTS idx_payments_invoice_number ON public.payments(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments(provider);

-- 8. Drop Midtrans-specific columns
ALTER TABLE public.payments
  DROP COLUMN IF EXISTS midtrans_order_id,
  DROP COLUMN IF EXISTS midtrans_transaction_id,
  DROP COLUMN IF EXISTS midtrans_gross_amount,
  DROP COLUMN IF EXISTS midtrans_currency,
  DROP COLUMN IF EXISTS midtrans_status_code,
  DROP COLUMN IF EXISTS midtrans_transaction_status,
  DROP COLUMN IF EXISTS midtrans_fraud_status,
  DROP COLUMN IF EXISTS snap_token,
  DROP COLUMN IF EXISTS snap_redirect_url;

ALTER TABLE public.refunds
  DROP COLUMN IF EXISTS midtrans_refund_id;

-- 9. Update table and column comments
COMMENT ON TABLE public.payments IS 'Payment gateway records (DOKU Checkout / provider-neutral); raw_notification stores full webhook payload';
COMMENT ON COLUMN public.payments.payment_type IS 'Payment method channel e.g. VIRTUAL_ACCOUNT_BCA, QRIS, CREDIT_CARD';
