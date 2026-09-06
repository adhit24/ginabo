-- Migration 016: Order Fulfillment Lifecycle Timestamps & Idempotent Stock Restoration
-- Adds fulfillment lifecycle timestamp columns to orders table and provides an atomic,
-- idempotent RPC function for restoring inventory when paid/processing orders are cancelled.

-- 1. Add fulfillment timestamp and restoration tracking columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS processing_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inventory_restored_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.processing_at IS 'Timestamp when order processing started';
COMMENT ON COLUMN public.orders.shipped_at IS 'Timestamp when order was shipped and resi input';
COMMENT ON COLUMN public.orders.delivered_at IS 'Timestamp when order was delivered to customer';
COMMENT ON COLUMN public.orders.completed_at IS 'Timestamp when order was completed/closed';
COMMENT ON COLUMN public.orders.cancelled_at IS 'Timestamp when order was cancelled';
COMMENT ON COLUMN public.orders.inventory_restored_at IS 'Timestamp when cancelled order inventory was restored';

-- 2. Idempotent Stock Restoration RPC for Cancelled Paid Orders
CREATE OR REPLACE FUNCTION public.restore_cancelled_order_stock(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- Lock order row for UPDATE
  SELECT id, status, inventory_decremented_at, inventory_restored_at
  INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found for stock restoration';
  END IF;

  -- Only restore stock if inventory was previously decremented and has not yet been restored
  IF v_order.inventory_decremented_at IS NULL OR v_order.inventory_restored_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  -- Increment item stock back to product_variants or products
  FOR v_item IN SELECT product_id, variant_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
      WHERE id = v_item.variant_id;
    ELSE
      UPDATE public.products
      SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
      WHERE id = v_item.product_id;
    END IF;
  END LOOP;

  -- Stamp inventory_restored_at
  UPDATE public.orders
  SET inventory_restored_at = now()
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.restore_cancelled_order_stock IS 'Idempotent stock restoration function for cancelled paid orders (service_role only)';

REVOKE ALL ON FUNCTION public.restore_cancelled_order_stock(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_cancelled_order_stock(UUID) TO service_role;
