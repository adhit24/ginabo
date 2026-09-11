-- Migration 017: Return, Refund & Restock Hardening
-- Adds restocked_at tracking column to return_items table and provides an atomic,
-- idempotent RPC function for restocking returned items upon quality inspection approval.

ALTER TABLE public.return_items
  ADD COLUMN IF NOT EXISTS restocked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.return_items.restocked_at IS 'Timestamp when returned item was restocked back to inventory';

-- Idempotent Stock Restoration RPC for Returned Items
CREATE OR REPLACE FUNCTION public.restock_returned_item(p_return_item_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Lock return item row for UPDATE
  SELECT id, product_id, variant_id, quantity, restock, restocked_at
  INTO v_item
  FROM public.return_items
  WHERE id = p_return_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Return item not found for restocking';
  END IF;

  -- Only restock if restock flag is true and item has not yet been restocked
  IF NOT COALESCE(v_item.restock, FALSE) OR v_item.restocked_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  -- Increment stock back to product_variants or products
  IF v_item.variant_id IS NOT NULL THEN
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
    WHERE id = v_item.variant_id;
  ELSE
    UPDATE public.products
    SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
    WHERE id = v_item.product_id;
  END IF;

  -- Stamp restocked_at
  UPDATE public.return_items
  SET restocked_at = now()
  WHERE id = p_return_item_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.restock_returned_item IS 'Idempotent stock restoration function for returned items (service_role only)';

REVOKE ALL ON FUNCTION public.restock_returned_item(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restock_returned_item(UUID) TO service_role;
