-- Payment webhook and fulfillment idempotency.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS inventory_decremented_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.fulfill_paid_order(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
  updated_rows INTEGER;
BEGIN
  -- Serialize all retries for one order before checking the fulfillment marker.
  PERFORM 1 FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  IF EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id AND inventory_decremented_at IS NOT NULL) THEN
    RETURN FALSE;
  END IF;

  FOR item IN SELECT product_id, variant_id, quantity FROM public.order_items WHERE order_id = p_order_id LOOP
    IF item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_quantity = stock_quantity - item.quantity, updated_at = now()
      WHERE id = item.variant_id AND stock_quantity >= item.quantity;
    ELSE
      UPDATE public.products
      SET stock_quantity = stock_quantity - item.quantity, updated_at = now()
      WHERE id = item.product_id AND stock_quantity >= item.quantity;
    END IF;
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    IF updated_rows <> 1 THEN RAISE EXCEPTION 'insufficient stock during fulfillment'; END IF;
  END LOOP;

  UPDATE public.orders SET inventory_decremented_at = now() WHERE id = p_order_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_paid_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fulfill_paid_order(UUID) TO service_role;
