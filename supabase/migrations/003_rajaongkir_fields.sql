-- Migration 003: Add RajaOngkir city/province IDs to addresses
-- These IDs are needed for shipping cost calculation via RajaOngkir API

ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS rajaongkir_city_id     TEXT,
  ADD COLUMN IF NOT EXISTS rajaongkir_province_id TEXT;

COMMENT ON COLUMN public.addresses.rajaongkir_city_id     IS 'RajaOngkir city_id for ongkir calculation';
COMMENT ON COLUMN public.addresses.rajaongkir_province_id IS 'RajaOngkir province_id for ongkir calculation';

-- Add courier tracking fields to orders (in case they are missing)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number   TEXT,
  ADD COLUMN IF NOT EXISTS shipping_courier  TEXT,
  ADD COLUMN IF NOT EXISTS shipping_service  TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at        TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_tracking
  ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;

COMMENT ON COLUMN public.orders.tracking_number  IS 'Waybill / resi number from courier';
COMMENT ON COLUMN public.orders.shipping_courier IS 'Courier code: jne, jnt, sicepat, pos, tiki, etc.';
COMMENT ON COLUMN public.orders.shipping_service IS 'Service level: REG, YES, OKE, etc.';
COMMENT ON COLUMN public.orders.shipped_at       IS 'Timestamp when order was handed to courier';
