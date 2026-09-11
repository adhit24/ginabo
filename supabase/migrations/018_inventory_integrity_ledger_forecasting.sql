-- Migration 018: Inventory Integrity, Stock Ledger & Anomaly Reconciliation
-- Adds non-negative stock constraints, append-only inventory_movements table,
-- updates settlement / cancellation / return restock RPCs to record movements atomically,
-- provides manual stock adjustment RPC, and provides anomaly reconciliation RPC.

-- 1. Check constraints for non-negative stock
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_stock_non_negative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock_quantity >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_variants_stock_non_negative'
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT chk_variants_stock_non_negative CHECK (stock_quantity >= 0);
  END IF;
END $$;

-- 2. Inventory Movements Ledger Table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    movement_type   TEXT NOT NULL CHECK (movement_type IN (
        'sale',
        'cancellation_restoration',
        'return_restock',
        'manual_adjustment',
        'receiving'
    )),
    quantity_delta  INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after  INTEGER NOT NULL,
    reference_type  TEXT CHECK (reference_type IN ('order', 'return_item', 'manual', 'replenishment')),
    reference_id    UUID,
    reason          TEXT,
    created_by      UUID REFERENCES public.profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.inventory_movements IS 'Append-only audit ledger of stock movements and inventory adjustments';

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON public.inventory_movements(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type    ON public.inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON public.inventory_movements(created_at DESC);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'inventory_movements: admins view all' AND tablename = 'inventory_movements'
  ) THEN
    CREATE POLICY "inventory_movements: admins view all"
        ON public.inventory_movements FOR SELECT TO authenticated
        USING (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'inventory_movements: service role' AND tablename = 'inventory_movements'
  ) THEN
    CREATE POLICY "inventory_movements: service role"
        ON public.inventory_movements FOR ALL TO service_role
        USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;


-- 3. Update settle_doku_payment RPC with atomic ledger movement logging
CREATE OR REPLACE FUNCTION public.settle_doku_payment(
  p_invoice_number TEXT,
  p_provider_transaction_id TEXT,
  p_payment_type TEXT,
  p_gross_amount BIGINT,
  p_raw_notification JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  order_id UUID,
  profile_id UUID,
  already_settled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_order RECORD;
  v_item RECORD;
  v_updated_rows INTEGER;
  v_qty_before INTEGER;
  v_qty_after INTEGER;
BEGIN
  -- Lock payment row for UPDATE
  SELECT id, status, gross_amount, order_id
  INTO v_payment
  FROM public.payments
  WHERE invoice_number = p_invoice_number AND provider = 'doku'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Payment record not found for provider doku', NULL::UUID, NULL::UUID, FALSE;
    RETURN;
  END IF;

  -- Lock order row for UPDATE
  SELECT id, status, total_amount, profile_id, inventory_decremented_at
  INTO v_order
  FROM public.orders
  WHERE id = v_payment.order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Order record not found', NULL::UUID, NULL::UUID, FALSE;
    RETURN;
  END IF;

  -- Verify gross amount matches both payment and order canonical values
  IF v_payment.gross_amount <> p_gross_amount OR v_order.total_amount <> p_gross_amount THEN
    UPDATE public.payments
    SET status = 'failed',
        raw_notification = p_raw_notification,
        updated_at = now()
    WHERE id = v_payment.id;

    RETURN QUERY SELECT FALSE, 'Gross amount mismatch', v_order.id, v_order.profile_id, FALSE;
    RETURN;
  END IF;

  -- Check if already settled / paid (Idempotent success check)
  IF v_payment.status IN ('success', 'paid') AND v_order.status IN ('paid', 'processing', 'shipped', 'delivered', 'completed') THEN
    UPDATE public.payments
    SET provider_transaction_id = COALESCE(p_provider_transaction_id, provider_transaction_id),
        payment_type = COALESCE(p_payment_type, payment_type),
        raw_notification = p_raw_notification,
        updated_at = now()
    WHERE id = v_payment.id;

    RETURN QUERY SELECT TRUE, 'Already settled', v_order.id, v_order.profile_id, TRUE;
    RETURN;
  END IF;

  -- Decrement inventory if not already decremented
  IF v_order.inventory_decremented_at IS NULL THEN
    FOR v_item IN SELECT product_id, variant_id, quantity FROM public.order_items WHERE order_id = v_order.id LOOP
      IF v_item.variant_id IS NOT NULL THEN
        SELECT stock_quantity INTO v_qty_before
        FROM public.product_variants
        WHERE id = v_item.variant_id
        FOR UPDATE;

        UPDATE public.product_variants
        SET stock_quantity = stock_quantity - v_item.quantity, updated_at = now()
        WHERE id = v_item.variant_id AND stock_quantity >= v_item.quantity;

        GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
        IF v_updated_rows <> 1 THEN
          RAISE EXCEPTION 'insufficient stock during settlement';
        END IF;

        v_qty_after := v_qty_before - v_item.quantity;
      ELSE
        SELECT stock_quantity INTO v_qty_before
        FROM public.products
        WHERE id = v_item.product_id
        FOR UPDATE;

        UPDATE public.products
        SET stock_quantity = stock_quantity - v_item.quantity, updated_at = now()
        WHERE id = v_item.product_id AND stock_quantity >= v_item.quantity;

        GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
        IF v_updated_rows <> 1 THEN
          RAISE EXCEPTION 'insufficient stock during settlement';
        END IF;

        v_qty_after := v_qty_before - v_item.quantity;
      END IF;

      -- Insert inventory movement ledger record
      INSERT INTO public.inventory_movements (
        product_id, variant_id, movement_type, quantity_delta, quantity_before, quantity_after, reference_type, reference_id, reason
      ) VALUES (
        v_item.product_id, v_item.variant_id, 'sale', -v_item.quantity, v_qty_before, v_qty_after, 'order', v_order.id, 'Payment settlement order decrement'
      );
    END LOOP;

    UPDATE public.orders
    SET inventory_decremented_at = now()
    WHERE id = v_order.id;
  END IF;

  -- Update payment status to success
  UPDATE public.payments
  SET status = 'success',
      provider_transaction_id = COALESCE(p_provider_transaction_id, provider_transaction_id),
      payment_type = COALESCE(p_payment_type, payment_type),
      gross_amount = p_gross_amount,
      raw_notification = p_raw_notification,
      settlement_time = COALESCE(settlement_time, now()),
      updated_at = now()
  WHERE id = v_payment.id;

  -- Update order status to paid if currently pending
  IF v_order.status = 'pending' THEN
    UPDATE public.orders
    SET status = 'paid',
        updated_at = now()
    WHERE id = v_order.id;
  END IF;

  RETURN QUERY SELECT TRUE, 'Settlement successful', v_order.id, v_order.profile_id, FALSE;
  RETURN;
END;
$$;


-- 4. Update restore_cancelled_order_stock RPC with atomic ledger movement logging
CREATE OR REPLACE FUNCTION public.restore_cancelled_order_stock(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_qty_before INTEGER;
  v_qty_after INTEGER;
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
      SELECT stock_quantity INTO v_qty_before
      FROM public.product_variants
      WHERE id = v_item.variant_id
      FOR UPDATE;

      UPDATE public.product_variants
      SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
      WHERE id = v_item.variant_id;

      v_qty_after := v_qty_before + v_item.quantity;
    ELSE
      SELECT stock_quantity INTO v_qty_before
      FROM public.products
      WHERE id = v_item.product_id
      FOR UPDATE;

      UPDATE public.products
      SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
      WHERE id = v_item.product_id;

      v_qty_after := v_qty_before + v_item.quantity;
    END IF;

    -- Insert inventory movement ledger record
    INSERT INTO public.inventory_movements (
      product_id, variant_id, movement_type, quantity_delta, quantity_before, quantity_after, reference_type, reference_id, reason
    ) VALUES (
      v_item.product_id, v_item.variant_id, 'cancellation_restoration', v_item.quantity, v_qty_before, v_qty_after, 'order', p_order_id, 'Cancelled paid order stock restoration'
    );
  END LOOP;

  -- Stamp inventory_restored_at
  UPDATE public.orders
  SET inventory_restored_at = now()
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;


-- 5. Update restock_returned_item RPC with atomic ledger movement logging
CREATE OR REPLACE FUNCTION public.restock_returned_item(p_return_item_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_qty_before INTEGER;
  v_qty_after INTEGER;
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
    SELECT stock_quantity INTO v_qty_before
    FROM public.product_variants
    WHERE id = v_item.variant_id
    FOR UPDATE;

    UPDATE public.product_variants
    SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
    WHERE id = v_item.variant_id;

    v_qty_after := v_qty_before + v_item.quantity;
  ELSE
    SELECT stock_quantity INTO v_qty_before
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    UPDATE public.products
    SET stock_quantity = stock_quantity + v_item.quantity, updated_at = now()
    WHERE id = v_item.product_id;

    v_qty_after := v_qty_before + v_item.quantity;
  END IF;

  -- Insert inventory movement ledger record
  INSERT INTO public.inventory_movements (
    product_id, variant_id, movement_type, quantity_delta, quantity_before, quantity_after, reference_type, reference_id, reason
  ) VALUES (
    v_item.product_id, v_item.variant_id, 'return_restock', v_item.quantity, v_qty_before, v_qty_after, 'return_item', p_return_item_id, 'Returned item quality inspection restock'
  );

  -- Stamp restocked_at
  UPDATE public.return_items
  SET restocked_at = now()
  WHERE id = p_return_item_id;

  RETURN TRUE;
END;
$$;


-- 6. New Manual Inventory Adjustment RPC
CREATE OR REPLACE FUNCTION public.adjust_inventory_manual(
  p_product_id UUID,
  p_variant_id UUID,
  p_new_quantity INTEGER,
  p_reason TEXT,
  p_admin_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  quantity_before INTEGER,
  quantity_after INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qty_before INTEGER;
  v_delta INTEGER;
BEGIN
  IF p_new_quantity < 0 THEN
    RETURN QUERY SELECT FALSE, 'Stock quantity cannot be negative', 0, 0;
    RETURN;
  END IF;

  IF p_variant_id IS NOT NULL THEN
    SELECT stock_quantity INTO v_qty_before
    FROM public.product_variants
    WHERE id = p_variant_id AND product_id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Product variant not found', 0, 0;
      RETURN;
    END IF;

    v_delta := p_new_quantity - v_qty_before;

    UPDATE public.product_variants
    SET stock_quantity = p_new_quantity, updated_at = now()
    WHERE id = p_variant_id;
  ELSE
    SELECT stock_quantity INTO v_qty_before
    FROM public.products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN QUERY SELECT FALSE, 'Product not found', 0, 0;
      RETURN;
    END IF;

    v_delta := p_new_quantity - v_qty_before;

    UPDATE public.products
    SET stock_quantity = p_new_quantity, updated_at = now()
    WHERE id = p_product_id;
  END IF;

  -- Insert ledger entry if delta != 0
  IF v_delta <> 0 THEN
    INSERT INTO public.inventory_movements (
      product_id, variant_id, movement_type, quantity_delta, quantity_before, quantity_after, reference_type, reason, created_by
    ) VALUES (
      p_product_id, p_variant_id, 'manual_adjustment', v_delta, v_qty_before, p_new_quantity, 'manual', COALESCE(p_reason, 'Manual stock adjustment'), p_admin_id
    );
  END IF;

  RETURN QUERY SELECT TRUE, 'Stock updated successfully', v_qty_before, p_new_quantity;
  RETURN;
END;
$$;

COMMENT ON FUNCTION public.adjust_inventory_manual IS 'Atomic manual inventory adjustment function with ledger auditing (service_role only)';

REVOKE ALL ON FUNCTION public.adjust_inventory_manual(UUID, UUID, INTEGER, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_inventory_manual(UUID, UUID, INTEGER, TEXT, UUID) TO service_role;


-- 7. New Inventory Anomaly Reconciliation RPC
CREATE OR REPLACE FUNCTION public.reconcile_inventory_anomalies()
RETURNS TABLE (
  anomaly_type TEXT,
  entity_type TEXT,
  entity_id UUID,
  details TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Negative stock on products
  RETURN QUERY
  SELECT 'negative_product_stock'::TEXT, 'products'::TEXT, id, ('Stock is ' || stock_quantity::TEXT)::TEXT
  FROM public.products
  WHERE stock_quantity < 0;

  -- 2. Negative stock on variants
  RETURN QUERY
  SELECT 'negative_variant_stock'::TEXT, 'product_variants'::TEXT, id, ('Stock is ' || stock_quantity::TEXT)::TEXT
  FROM public.product_variants
  WHERE stock_quantity < 0;

  -- 3. Paid orders without inventory_decremented_at
  RETURN QUERY
  SELECT 'un_decremented_paid_order'::TEXT, 'orders'::TEXT, id, ('Order status is ' || status || ' but inventory_decremented_at is null')::TEXT
  FROM public.orders
  WHERE status IN ('paid', 'processing', 'shipped', 'delivered', 'completed')
    AND inventory_decremented_at IS NULL;

  -- 4. Cancelled orders with inventory_decremented_at set but inventory_restored_at null
  RETURN QUERY
  SELECT 'un_restored_cancelled_order'::TEXT, 'orders'::TEXT, id, 'Cancelled paid order inventory was decremented but never restored'::TEXT
  FROM public.orders
  WHERE status = 'cancelled'
    AND inventory_decremented_at IS NOT NULL
    AND inventory_restored_at IS NULL;

  -- 5. Restocked return items without restocked_at timestamp
  RETURN QUERY
  SELECT 'un_stamped_returned_item'::TEXT, 'return_items'::TEXT, id, 'Return item restock is true but restocked_at is null'::TEXT
  FROM public.return_items
  WHERE restock = TRUE AND restocked_at IS NULL;
END;
$$;

COMMENT ON FUNCTION public.reconcile_inventory_anomalies IS 'Returns detected inventory anomalies and integrity mismatches (service_role only)';

REVOKE ALL ON FUNCTION public.reconcile_inventory_anomalies() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_inventory_anomalies() TO service_role;
