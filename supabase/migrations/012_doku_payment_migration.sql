-- Migration: Add DOKU and provider-neutral fields to payments table.
-- Retains all historical midtrans_* fields to ensure existing Midtrans orders remain readable.

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'doku',
  ADD COLUMN IF NOT EXISTS checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Create index on provider and invoice_number for quick lookup
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_number ON public.payments(invoice_number);

COMMENT ON COLUMN public.payments.provider IS 'Payment gateway provider name e.g. doku, midtrans, manual';
COMMENT ON COLUMN public.payments.checkout_url IS 'DOKU Checkout URL or payment link';
COMMENT ON COLUMN public.payments.invoice_number IS 'DOKU invoice/order reference number';
