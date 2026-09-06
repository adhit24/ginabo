-- Migration 014: Atomic DOKU Payment Settlement & Failure Handling
-- Provides atomic database RPC functions for DOKU webhook processing with strict row locking,
-- inventory decrement idempotency, terminal success state protection, and coupon reservation release.

-- 1. Atomic DOKU Payment Settlement RPC
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
        UPDATE public.product_variants
        SET stock_quantity = stock_quantity - v_item.quantity, updated_at = now()
        WHERE id = v_item.variant_id AND stock_quantity >= v_item.quantity;
      ELSE
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_item.quantity, updated_at = now()
        WHERE id = v_item.product_id AND stock_quantity >= v_item.quantity;
      END IF;

      GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
      IF v_updated_rows <> 1 THEN
        RAISE EXCEPTION 'insufficient stock during settlement';
      END IF;
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

COMMENT ON FUNCTION public.settle_doku_payment IS 'Atomic payment settlement function for DOKU webhooks (service_role only)';

REVOKE ALL ON FUNCTION public.settle_doku_payment FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_doku_payment TO service_role;


-- 2. Atomic DOKU Payment Failure / Expiry Handling RPC
CREATE OR REPLACE FUNCTION public.handle_failed_doku_payment(
  p_invoice_number TEXT,
  p_target_status TEXT,
  p_raw_notification JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  order_id UUID,
  profile_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_order RECORD;
  v_new_payment_status TEXT;
BEGIN
  -- Lock payment row for UPDATE
  SELECT id, status, order_id
  INTO v_payment
  FROM public.payments
  WHERE invoice_number = p_invoice_number AND provider = 'doku'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Payment record not found for provider doku', NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Lock order row for UPDATE
  SELECT id, status, profile_id
  INTO v_order
  FROM public.orders
  WHERE id = v_payment.order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Order record not found', NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Protect terminal success state: do not demote paid payments
  IF v_payment.status IN ('success', 'paid') OR v_order.status IN ('paid', 'processing', 'shipped', 'delivered', 'completed') THEN
    UPDATE public.payments
    SET raw_notification = p_raw_notification,
        updated_at = now()
    WHERE id = v_payment.id;

    RETURN QUERY SELECT TRUE, 'Terminal success payment preserved', v_order.id, v_order.profile_id;
    RETURN;
  END IF;

  -- Map payment status safely
  IF UPPER(p_target_status) IN ('EXPIRED', 'EXPIRE') THEN
    v_new_payment_status := 'expired';
  ELSE
    v_new_payment_status := 'failed';
  END IF;

  -- Update payment
  UPDATE public.payments
  SET status = v_new_payment_status,
      raw_notification = p_raw_notification,
      updated_at = now()
  WHERE id = v_payment.id;

  -- Cancel pending order and release coupon usage reservation
  IF v_order.status = 'pending' THEN
    UPDATE public.orders
    SET status = 'cancelled',
        updated_at = now()
    WHERE id = v_order.id;

    -- Release coupon reservation if any exists for this order
    DELETE FROM public.coupon_usages WHERE order_id = v_order.id;
  END IF;

  RETURN QUERY SELECT TRUE, 'Payment marked failed/expired and order cancelled', v_order.id, v_order.profile_id;
  RETURN;
END;
$$;

COMMENT ON FUNCTION public.handle_failed_doku_payment IS 'Atomic payment failure and expiry handling for DOKU webhooks (service_role only)';

REVOKE ALL ON FUNCTION public.handle_failed_doku_payment FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_failed_doku_payment TO service_role;
