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
-- from recording duplicate payment rows for the same DOKU order. Invoice
-- numbers are unique within a provider as an additional reconciliation guard.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_order_unique
  ON public.payments(provider, order_id)
  WHERE provider IS NOT NULL;

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
