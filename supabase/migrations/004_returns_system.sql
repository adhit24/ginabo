-- ============================================================
-- Ginabo Skincare — Return, Refund & Exchange Management System
-- Migration: 004_returns_system.sql
-- Project: lvmyjtzfohlorocrjvcx (ginabo.id)
-- Created: 2026-06-16
-- Currency: IDR (BIGINT integer) | Timezone: WIB (Asia/Jakarta)
-- ============================================================
--
-- Depends on: 001_initial_schema.sql (profiles, orders, order_items,
--             payments, coupons, products, product_variants, notifications,
--             admin_users, is_admin(), handle_updated_at())
--             002_storage_buckets.sql (storage.buckets, storage.objects)
--
-- Tables created:
--   return_policies      — configurable policy engine
--   returns              — return request header (RET-YYYY-NNNNNN)
--   return_items         — line items being returned
--   return_evidence      — uploaded photos/videos/notes
--   return_notes         — internal admin notes & customer messages
--   return_status_logs   — immutable audit timeline (acts as audit_logs)
--   refunds              — refund records (original / store credit / voucher)
--   exchanges            — exchange records (variant / product swaps)
--   customer_wallets     — store-credit balance per profile
--   wallet_transactions  — ledger for wallet debits/credits
--   return_blacklist     — fraud: blocked profiles
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: RETURN POLICY ENGINE
-- ============================================================

CREATE TABLE public.return_policies (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    TEXT NOT NULL,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    -- Windows (in days, counted from order delivered_at)
    return_window_days      INTEGER NOT NULL DEFAULT 7,
    exchange_window_days    INTEGER NOT NULL DEFAULT 7,
    refund_window_days      INTEGER NOT NULL DEFAULT 14,
    -- Eligibility rules
    eligible_category_ids   UUID[] NOT NULL DEFAULT '{}',   -- empty = all categories eligible
    non_returnable_product_ids UUID[] NOT NULL DEFAULT '{}',
    -- Which reasons are allowed to auto-approve (no manual review)
    auto_approve_reasons    TEXT[] NOT NULL DEFAULT ARRAY['missing_item','wrong_item'],
    -- Reasons that ALWAYS require manual review regardless of auto-approve
    manual_review_reasons   TEXT[] NOT NULL DEFAULT ARRAY['allergic_reaction','defective'],
    -- Auto-approval ceiling: orders above this IDR amount go to manual review
    auto_approve_max_amount BIGINT NOT NULL DEFAULT 500000,
    -- Require evidence upload before submission?
    require_evidence        BOOLEAN NOT NULL DEFAULT TRUE,
    min_evidence_count      INTEGER NOT NULL DEFAULT 1,
    -- Fraud thresholds
    max_returns_per_month   INTEGER NOT NULL DEFAULT 5,
    high_risk_score         INTEGER NOT NULL DEFAULT 70,    -- >= this routes to manual/escalate
    -- Store-credit incentive: bonus % when customer accepts store credit instead of cash
    store_credit_bonus_pct  INTEGER NOT NULL DEFAULT 0,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.return_policies IS 'Configurable return/refund/exchange policy. The active row drives the eligibility engine.';

CREATE UNIQUE INDEX idx_return_policies_single_active
    ON public.return_policies(is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_return_policies_updated_at
    BEFORE UPDATE ON public.return_policies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 2: RETURNS (HEADER)
-- ============================================================

CREATE TABLE public.returns (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number       TEXT NOT NULL UNIQUE,        -- RET-YYYY-NNNNNN
    order_id            UUID NOT NULL REFERENCES public.orders(id),
    profile_id          UUID NOT NULL REFERENCES public.profiles(id),
    policy_id           UUID REFERENCES public.return_policies(id),
    -- Classification
    return_type         TEXT NOT NULL CHECK (return_type IN (
        'defective','wrong_item','missing_item','expired','allergic_reaction','exchange','other'
    )),
    -- Desired resolution
    preferred_resolution TEXT NOT NULL DEFAULT 'refund' CHECK (preferred_resolution IN (
        'refund','exchange','store_credit','voucher','repair_replace'
    )),
    -- Status workflow:
    -- draft → submitted → under_review → approved|rejected
    --   → awaiting_shipment → item_received → quality_inspection
    --   → refund_approved|exchange_approved → completed
    status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',
        'submitted',
        'under_review',
        'more_evidence_required',
        'approved',
        'rejected',
        'awaiting_shipment',
        'item_received',
        'quality_inspection',
        'refund_approved',
        'exchange_approved',
        'completed',
        'cancelled',
        'escalated'
    )),
    customer_note       TEXT,
    rejection_reason    TEXT,
    -- Monetary snapshot (IDR)
    refund_amount       BIGINT NOT NULL DEFAULT 0,   -- expected/approved refund total
    -- Return shipping (customer ships item back)
    return_courier      TEXT,
    return_tracking_number TEXT,
    -- Fraud / risk
    risk_score          INTEGER NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    risk_flags          JSONB NOT NULL DEFAULT '[]',
    is_flagged          BOOLEAN NOT NULL DEFAULT FALSE,
    -- Assignment
    assigned_admin_id   UUID REFERENCES public.admin_users(id),
    -- Lifecycle timestamps (WIB)
    submitted_at        TIMESTAMPTZ,
    reviewed_at         TIMESTAMPTZ,
    received_at         TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.returns IS 'Return/refund/exchange requests; return_number format RET-YYYY-NNNNNN; amounts in IDR integer';

CREATE INDEX idx_returns_order      ON public.returns(order_id);
CREATE INDEX idx_returns_profile    ON public.returns(profile_id);
CREATE INDEX idx_returns_status     ON public.returns(status);
CREATE INDEX idx_returns_type       ON public.returns(return_type);
CREATE INDEX idx_returns_created    ON public.returns(created_at DESC);
CREATE INDEX idx_returns_flagged    ON public.returns(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX idx_returns_assigned   ON public.returns(assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;

CREATE TRIGGER trg_returns_updated_at
    BEFORE UPDATE ON public.returns
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate return number: RET-YYYY-NNNNNN (6-digit yearly sequence, WIB)
CREATE OR REPLACE FUNCTION public.generate_return_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_year TEXT;
    v_seq_num INTEGER;
BEGIN
    v_year := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYY');
    SELECT COUNT(*) + 1 INTO v_seq_num
    FROM public.returns
    WHERE to_char(created_at AT TIME ZONE 'Asia/Jakarta', 'YYYY') = v_year;
    NEW.return_number := 'RET-' || v_year || '-' || lpad(v_seq_num::text, 6, '0');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_return_number
    BEFORE INSERT ON public.returns
    FOR EACH ROW
    WHEN (NEW.return_number IS NULL OR NEW.return_number = '')
    EXECUTE FUNCTION public.generate_return_number();

-- ============================================================
-- SECTION 3: RETURN ITEMS
-- ============================================================

CREATE TABLE public.return_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id       UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    order_item_id   UUID NOT NULL REFERENCES public.order_items(id),
    product_id      UUID REFERENCES public.products(id),
    variant_id      UUID REFERENCES public.product_variants(id),
    -- Snapshot at request time
    product_name    TEXT NOT NULL,
    variant_name    TEXT,
    sku             TEXT,
    image_url       TEXT,
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price      BIGINT NOT NULL,                -- IDR per unit
    line_refund_amount BIGINT NOT NULL DEFAULT 0,   -- unit_price * quantity (approved)
    item_reason     TEXT,                           -- per-item override reason
    -- QC outcome after item received
    inspection_result TEXT CHECK (inspection_result IN (
        'pending','passed','failed','partial'
    )) DEFAULT 'pending',
    inspection_note TEXT,
    -- Restock decision
    restock         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.return_items IS 'Line items included in a return; snapshots product details from order_items';

CREATE INDEX idx_return_items_return  ON public.return_items(return_id);
CREATE INDEX idx_return_items_orderit ON public.return_items(order_item_id);
CREATE INDEX idx_return_items_product ON public.return_items(product_id);

-- ============================================================
-- SECTION 4: RETURN EVIDENCE
-- ============================================================

CREATE TABLE public.return_evidence (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id       UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES public.profiles(id),
    media_type      TEXT NOT NULL CHECK (media_type IN ('image','video','document')),
    storage_path    TEXT NOT NULL,                  -- path within 'return-evidence' bucket
    url             TEXT,                           -- public/signed URL (resolved on read)
    caption         TEXT,
    file_size_bytes BIGINT,
    -- Allergic-reaction special handling fields
    usage_history   TEXT,                           -- "used 2x daily for 3 days"
    is_validated    BOOLEAN NOT NULL DEFAULT FALSE, -- admin validated this evidence
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.return_evidence IS 'Photos/videos/docs supporting a return; stored in private return-evidence bucket (signed URLs)';

CREATE INDEX idx_return_evidence_return ON public.return_evidence(return_id);

-- ============================================================
-- SECTION 5: RETURN NOTES (internal + customer messages)
-- ============================================================

CREATE TABLE public.return_notes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id       UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    author_id       UUID REFERENCES public.profiles(id),
    author_type     TEXT NOT NULL CHECK (author_type IN ('customer','admin','system')),
    visibility      TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal','customer')),
    body            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.return_notes IS 'Threaded notes on a return. internal = admin-only; customer = visible to customer.';

CREATE INDEX idx_return_notes_return ON public.return_notes(return_id, created_at);

-- ============================================================
-- SECTION 6: RETURN STATUS LOGS (audit timeline)
-- ============================================================

CREATE TABLE public.return_status_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id       UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
    from_status     TEXT,
    to_status       TEXT NOT NULL,
    changed_by      UUID REFERENCES public.profiles(id),
    actor_type      TEXT NOT NULL DEFAULT 'system' CHECK (actor_type IN ('customer','admin','system')),
    reason          TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.return_status_logs IS 'Immutable audit trail of every return status transition (serves as audit_logs for the returns domain)';

CREATE INDEX idx_return_status_logs_return ON public.return_status_logs(return_id, created_at);

-- ============================================================
-- SECTION 7: REFUNDS
-- ============================================================

CREATE TABLE public.refunds (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id           UUID NOT NULL REFERENCES public.returns(id),
    order_id            UUID NOT NULL REFERENCES public.orders(id),
    payment_id          UUID REFERENCES public.payments(id),   -- original payment for reversal
    profile_id          UUID NOT NULL REFERENCES public.profiles(id),
    method              TEXT NOT NULL CHECK (method IN ('original_payment','store_credit','voucher')),
    amount              BIGINT NOT NULL CHECK (amount >= 0),    -- IDR
    -- Original payment refund (Midtrans)
    midtrans_refund_id  TEXT,
    -- Store credit refund
    wallet_transaction_id UUID,
    -- Voucher refund
    coupon_id           UUID REFERENCES public.coupons(id),
    voucher_code        TEXT,
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending','processing','completed','failed','cancelled'
    )),
    failure_reason      TEXT,
    processed_by        UUID REFERENCES public.admin_users(id),
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.refunds IS 'Refund records. method = original_payment | store_credit | voucher';

CREATE INDEX idx_refunds_return  ON public.refunds(return_id);
CREATE INDEX idx_refunds_order   ON public.refunds(order_id);
CREATE INDEX idx_refunds_profile ON public.refunds(profile_id);
CREATE INDEX idx_refunds_status  ON public.refunds(status);

CREATE TRIGGER trg_refunds_updated_at
    BEFORE UPDATE ON public.refunds
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 8: EXCHANGES
-- ============================================================

CREATE TABLE public.exchanges (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id           UUID NOT NULL REFERENCES public.returns(id),
    order_id            UUID NOT NULL REFERENCES public.orders(id),
    profile_id          UUID NOT NULL REFERENCES public.profiles(id),
    exchange_type       TEXT NOT NULL CHECK (exchange_type IN (
        'same_product','different_variant','different_product'
    )),
    -- Outgoing (returned) item
    original_product_id UUID REFERENCES public.products(id),
    original_variant_id UUID REFERENCES public.product_variants(id),
    -- Incoming (replacement) item
    new_product_id      UUID REFERENCES public.products(id),
    new_variant_id      UUID REFERENCES public.product_variants(id),
    new_product_name    TEXT,
    quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    -- Price reconciliation (IDR)
    original_value      BIGINT NOT NULL DEFAULT 0,
    new_value           BIGINT NOT NULL DEFAULT 0,
    price_difference    BIGINT NOT NULL DEFAULT 0,   -- new_value - original_value (>0 = customer pays)
    -- If customer must pay difference, link a payment
    additional_payment_id UUID REFERENCES public.payments(id),
    -- Fulfilment of the replacement
    new_order_id        UUID REFERENCES public.orders(id),
    shipping_courier    TEXT,
    tracking_number     TEXT,
    shipped_at          TIMESTAMPTZ,
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending','awaiting_payment','approved','shipped','completed','cancelled'
    )),
    processed_by        UUID REFERENCES public.admin_users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.exchanges IS 'Exchange records; price_difference reconciles additional payment or refund difference';

CREATE INDEX idx_exchanges_return  ON public.exchanges(return_id);
CREATE INDEX idx_exchanges_profile ON public.exchanges(profile_id);
CREATE INDEX idx_exchanges_status  ON public.exchanges(status);

CREATE TRIGGER trg_exchanges_updated_at
    BEFORE UPDATE ON public.exchanges
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 9: CUSTOMER WALLET (store credit)
-- ============================================================

CREATE TABLE public.customer_wallets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id      UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance         BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),  -- IDR
    currency        TEXT NOT NULL DEFAULT 'IDR',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.customer_wallets IS 'Store-credit balance per customer; credited from refunds, debited at checkout';

CREATE INDEX idx_customer_wallets_profile ON public.customer_wallets(profile_id);

CREATE TRIGGER trg_customer_wallets_updated_at
    BEFORE UPDATE ON public.customer_wallets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.wallet_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id       UUID NOT NULL REFERENCES public.customer_wallets(id) ON DELETE CASCADE,
    profile_id      UUID NOT NULL REFERENCES public.profiles(id),
    direction       TEXT NOT NULL CHECK (direction IN ('credit','debit')),
    amount          BIGINT NOT NULL CHECK (amount > 0),   -- IDR
    balance_after   BIGINT NOT NULL,
    source_type     TEXT NOT NULL CHECK (source_type IN ('refund','order','adjustment','expiry')),
    source_id       UUID,                                  -- e.g. refund.id or order.id
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.wallet_transactions IS 'Immutable ledger of store-credit movements';

CREATE INDEX idx_wallet_tx_wallet  ON public.wallet_transactions(wallet_id, created_at);
CREATE INDEX idx_wallet_tx_profile ON public.wallet_transactions(profile_id);

-- Credit store credit atomically (used by refund processing)
CREATE OR REPLACE FUNCTION public.wallet_credit(
    p_profile_id UUID,
    p_amount     BIGINT,
    p_source_type TEXT,
    p_source_id  UUID,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_wallet_id UUID;
    v_new_balance BIGINT;
    v_tx_id UUID;
BEGIN
    INSERT INTO public.customer_wallets (profile_id, balance)
    VALUES (p_profile_id, 0)
    ON CONFLICT (profile_id) DO NOTHING;

    UPDATE public.customer_wallets
       SET balance = balance + p_amount
     WHERE profile_id = p_profile_id
    RETURNING id, balance INTO v_wallet_id, v_new_balance;

    INSERT INTO public.wallet_transactions
        (wallet_id, profile_id, direction, amount, balance_after, source_type, source_id, description)
    VALUES
        (v_wallet_id, p_profile_id, 'credit', p_amount, v_new_balance, p_source_type, p_source_id, p_description)
    RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$$;

-- ============================================================
-- SECTION 10: FRAUD — BLACKLIST + RISK SCORING
-- ============================================================

CREATE TABLE public.return_blacklist (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id      UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    blocked_by      UUID REFERENCES public.admin_users(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.return_blacklist IS 'Customers blocked from submitting returns (fraud/abuse)';

CREATE INDEX idx_return_blacklist_profile ON public.return_blacklist(profile_id) WHERE is_active = TRUE;

-- Compute a 0..100 risk score for a prospective/just-created return.
-- Heuristics: return frequency, lifetime return rate, duplicate same-order,
-- high-value, blacklist. Pure read — does not write.
CREATE OR REPLACE FUNCTION public.compute_return_risk(
    p_profile_id UUID,
    p_order_id   UUID,
    p_amount     BIGINT DEFAULT 0
)
RETURNS TABLE(score INTEGER, flags JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_score INTEGER := 0;
    v_flags JSONB := '[]'::jsonb;
    v_returns_30d INTEGER;
    v_total_orders INTEGER;
    v_total_returns INTEGER;
    v_dup INTEGER;
    v_blacklisted BOOLEAN;
    v_policy public.return_policies%ROWTYPE;
BEGIN
    SELECT * INTO v_policy FROM public.return_policies WHERE is_active = TRUE LIMIT 1;

    -- Blacklist = instant max
    SELECT EXISTS(SELECT 1 FROM public.return_blacklist
                  WHERE profile_id = p_profile_id AND is_active = TRUE) INTO v_blacklisted;
    IF v_blacklisted THEN
        RETURN QUERY SELECT 100, '["blacklisted"]'::jsonb;
        RETURN;
    END IF;

    -- Frequency: returns in last 30 days
    SELECT COUNT(*) INTO v_returns_30d FROM public.returns
     WHERE profile_id = p_profile_id AND created_at > now() - INTERVAL '30 days';
    IF v_returns_30d >= COALESCE(v_policy.max_returns_per_month, 5) THEN
        v_score := v_score + 35;
        v_flags := v_flags || '["excessive_frequency"]'::jsonb;
    ELSIF v_returns_30d >= 3 THEN
        v_score := v_score + 20;
        v_flags := v_flags || '["elevated_frequency"]'::jsonb;
    END IF;

    -- Lifetime return rate
    SELECT COUNT(*) INTO v_total_orders FROM public.orders WHERE profile_id = p_profile_id;
    SELECT COUNT(*) INTO v_total_returns FROM public.returns WHERE profile_id = p_profile_id;
    IF v_total_orders > 0 AND v_total_returns::numeric / v_total_orders > 0.5 THEN
        v_score := v_score + 20;
        v_flags := v_flags || '["high_return_rate"]'::jsonb;
    END IF;

    -- Duplicate return for same order
    SELECT COUNT(*) INTO v_dup FROM public.returns
     WHERE order_id = p_order_id AND status NOT IN ('rejected','cancelled');
    IF v_dup > 0 THEN
        v_score := v_score + 25;
        v_flags := v_flags || '["duplicate_order_return"]'::jsonb;
    END IF;

    -- High value
    IF p_amount >= 1000000 THEN
        v_score := v_score + 15;
        v_flags := v_flags || '["high_value"]'::jsonb;
    END IF;

    IF v_score > 100 THEN v_score := 100; END IF;
    RETURN QUERY SELECT v_score, v_flags;
END;
$$;

-- ============================================================
-- SECTION 11: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.return_policies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_evidence     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_notes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_status_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchanges           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wallets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_blacklist    ENABLE ROW LEVEL SECURITY;

-- ---- return_policies: public read (active), admin manage ----
CREATE POLICY "return_policies: anyone can read active"
    ON public.return_policies FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY "return_policies: admins manage"
    ON public.return_policies FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "return_policies: service role"
    ON public.return_policies FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- returns ----
CREATE POLICY "returns: users view own"
    ON public.returns FOR SELECT TO authenticated
    USING (profile_id = auth.uid());
CREATE POLICY "returns: users create own"
    ON public.returns FOR INSERT TO authenticated
    WITH CHECK (profile_id = auth.uid());
-- Customers may edit/cancel only while in draft/submitted
CREATE POLICY "returns: users update own draft"
    ON public.returns FOR UPDATE TO authenticated
    USING (profile_id = auth.uid() AND status IN ('draft','submitted'))
    WITH CHECK (profile_id = auth.uid());
CREATE POLICY "returns: admins view all"
    ON public.returns FOR SELECT TO authenticated
    USING (public.is_admin());
CREATE POLICY "returns: admins update"
    ON public.returns FOR UPDATE TO authenticated
    USING (public.is_admin());
CREATE POLICY "returns: service role"
    ON public.returns FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- return_items ----
CREATE POLICY "return_items: users view own"
    ON public.return_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.returns r
                   WHERE r.id = return_items.return_id AND r.profile_id = auth.uid()));
CREATE POLICY "return_items: users insert own draft"
    ON public.return_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.returns r
                        WHERE r.id = return_items.return_id
                          AND r.profile_id = auth.uid()
                          AND r.status IN ('draft','submitted')));
CREATE POLICY "return_items: admins view all"
    ON public.return_items FOR SELECT TO authenticated
    USING (public.is_admin());
CREATE POLICY "return_items: admins manage"
    ON public.return_items FOR UPDATE TO authenticated
    USING (public.is_admin());
CREATE POLICY "return_items: service role"
    ON public.return_items FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- return_evidence ----
CREATE POLICY "return_evidence: users view own"
    ON public.return_evidence FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.returns r
                   WHERE r.id = return_evidence.return_id AND r.profile_id = auth.uid()));
CREATE POLICY "return_evidence: users upload own"
    ON public.return_evidence FOR INSERT TO authenticated
    WITH CHECK (uploaded_by = auth.uid()
                AND EXISTS (SELECT 1 FROM public.returns r
                            WHERE r.id = return_evidence.return_id AND r.profile_id = auth.uid()));
CREATE POLICY "return_evidence: admins view all"
    ON public.return_evidence FOR SELECT TO authenticated
    USING (public.is_admin());
CREATE POLICY "return_evidence: admins manage"
    ON public.return_evidence FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "return_evidence: service role"
    ON public.return_evidence FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- return_notes (customer sees only visibility='customer') ----
CREATE POLICY "return_notes: users view customer-visible"
    ON public.return_notes FOR SELECT TO authenticated
    USING (visibility = 'customer'
           AND EXISTS (SELECT 1 FROM public.returns r
                       WHERE r.id = return_notes.return_id AND r.profile_id = auth.uid()));
CREATE POLICY "return_notes: users add own"
    ON public.return_notes FOR INSERT TO authenticated
    WITH CHECK (author_id = auth.uid() AND author_type = 'customer'
                AND EXISTS (SELECT 1 FROM public.returns r
                            WHERE r.id = return_notes.return_id AND r.profile_id = auth.uid()));
CREATE POLICY "return_notes: admins all"
    ON public.return_notes FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "return_notes: service role"
    ON public.return_notes FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- return_status_logs ----
CREATE POLICY "return_status_logs: users view own"
    ON public.return_status_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.returns r
                   WHERE r.id = return_status_logs.return_id AND r.profile_id = auth.uid()));
CREATE POLICY "return_status_logs: admins view all"
    ON public.return_status_logs FOR SELECT TO authenticated
    USING (public.is_admin());
CREATE POLICY "return_status_logs: service role"
    ON public.return_status_logs FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- refunds ----
CREATE POLICY "refunds: users view own"
    ON public.refunds FOR SELECT TO authenticated
    USING (profile_id = auth.uid());
CREATE POLICY "refunds: admins view all"
    ON public.refunds FOR SELECT TO authenticated
    USING (public.is_admin());
CREATE POLICY "refunds: admins manage"
    ON public.refunds FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "refunds: service role"
    ON public.refunds FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- exchanges ----
CREATE POLICY "exchanges: users view own"
    ON public.exchanges FOR SELECT TO authenticated
    USING (profile_id = auth.uid());
CREATE POLICY "exchanges: admins manage"
    ON public.exchanges FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "exchanges: service role"
    ON public.exchanges FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- customer_wallets ----
CREATE POLICY "wallets: users view own"
    ON public.customer_wallets FOR SELECT TO authenticated
    USING (profile_id = auth.uid());
CREATE POLICY "wallets: admins view all"
    ON public.customer_wallets FOR SELECT TO authenticated
    USING (public.is_admin());
CREATE POLICY "wallets: service role"
    ON public.customer_wallets FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- wallet_transactions ----
CREATE POLICY "wallet_tx: users view own"
    ON public.wallet_transactions FOR SELECT TO authenticated
    USING (profile_id = auth.uid());
CREATE POLICY "wallet_tx: admins view all"
    ON public.wallet_transactions FOR SELECT TO authenticated
    USING (public.is_admin());
CREATE POLICY "wallet_tx: service role"
    ON public.wallet_transactions FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ---- return_blacklist (admin only) ----
CREATE POLICY "blacklist: admins manage"
    ON public.return_blacklist FOR ALL TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "blacklist: service role"
    ON public.return_blacklist FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- SECTION 12: STORAGE BUCKET — return-evidence (PRIVATE)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'return-evidence',
    'return-evidence',
    FALSE,                  -- PRIVATE — signed URLs only (may contain medical/skin photos)
    52428800,               -- 50 MB (allows short videos)
    ARRAY['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Customers upload to their own folder: return-evidence/<auth.uid>/<return_number>/<file>
CREATE POLICY "return-evidence: users upload own"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'return-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
CREATE POLICY "return-evidence: users view own"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'return-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
CREATE POLICY "return-evidence: users delete own"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'return-evidence'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
CREATE POLICY "return-evidence: admins view all"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'return-evidence' AND public.is_admin());
CREATE POLICY "return-evidence: service role"
    ON storage.objects FOR ALL TO service_role
    USING (bucket_id = 'return-evidence') WITH CHECK (bucket_id = 'return-evidence');

-- ============================================================
-- SECTION 13: SEED DEFAULT POLICY
-- ============================================================

INSERT INTO public.return_policies (name, is_active, return_window_days, exchange_window_days, refund_window_days)
SELECT 'Ginabo Default Return Policy', TRUE, 7, 7, 14
WHERE NOT EXISTS (SELECT 1 FROM public.return_policies WHERE is_active = TRUE);

COMMIT;

-- ============================================================
-- END OF MIGRATION 004
-- ============================================================
