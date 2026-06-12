-- ============================================================
-- Ginabo Skincare E-Commerce — Initial Schema Migration
-- Project: lvmyjtzfohlorocrjvcx (ginabo.id)
-- Created: 2026-06-12
-- Currency: IDR | Timezone: WIB (Asia/Jakarta, UTC+7)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- SECTION 1: PROFILES & AUTH
-- ============================================================

CREATE TABLE public.profiles (
    id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email            TEXT UNIQUE NOT NULL,
    full_name        TEXT,
    phone_number     TEXT,                        -- Indonesian format: +62xxx
    whatsapp_number  TEXT,                        -- May differ from phone
    avatar_url       TEXT,                        -- Cloudflare R2 URL
    date_of_birth    DATE,
    skin_type        TEXT CHECK (skin_type IN ('normal','dry','oily','combination','sensitive')),
    skin_concerns    TEXT[],                      -- e.g. ['acne','hyperpigmentation']
    referral_code    TEXT UNIQUE DEFAULT substring(md5(random()::text) FROM 1 FOR 8),
    referred_by      UUID REFERENCES public.profiles(id),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    role             TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','reseller','admin','superadmin')),
    -- Reseller snapshot for fast queries
    reseller_tier_id UUID,                        -- FK added after reseller_tiers table
    reseller_since   TIMESTAMPTZ,
    -- 21-day challenge progress
    challenge_streak INTEGER NOT NULL DEFAULT 0,
    -- Metadata
    last_login_at    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Extended customer profile linked to Supabase auth.users';
COMMENT ON COLUMN public.profiles.whatsapp_number IS 'Used for WhatsApp Business API notifications';
COMMENT ON COLUMN public.profiles.skin_concerns IS 'Array of skin concern tags used for product recommendations';

CREATE INDEX idx_profiles_email       ON public.profiles(email);
CREATE INDEX idx_profiles_phone       ON public.profiles(phone_number);
CREATE INDEX idx_profiles_referral    ON public.profiles(referral_code);
CREATE INDEX idx_profiles_role        ON public.profiles(role);
CREATE INDEX idx_profiles_reseller    ON public.profiles(reseller_tier_id) WHERE reseller_tier_id IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECTION 2: ADMIN USERS
-- ============================================================

CREATE TABLE public.admin_users (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permissions  JSONB NOT NULL DEFAULT '{}',    -- granular permission map
    -- e.g. {"products":true,"orders":true,"customers":false,"bookings":true}
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_by   UUID REFERENCES public.admin_users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_users IS 'Admin panel access control; permissions stored as JSONB map';

CREATE INDEX idx_admin_users_profile ON public.admin_users(profile_id);

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 3: PRODUCT CATALOG
-- ============================================================

CREATE TABLE public.categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id   UUID REFERENCES public.categories(id),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Hierarchical product categories (supports parent/child nesting)';

CREATE INDEX idx_categories_slug      ON public.categories(slug);
CREATE INDEX idx_categories_parent    ON public.categories(parent_id);
CREATE INDEX idx_categories_active    ON public.categories(is_active);

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------

CREATE TABLE public.products (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id      UUID REFERENCES public.categories(id),
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    description      TEXT,
    short_description TEXT,
    ingredients      TEXT,                       -- INCI ingredient list
    usage_instructions TEXT,
    skin_type_tags   TEXT[],                     -- ['oily','combination']
    concern_tags     TEXT[],                     -- ['acne','brightening']
    -- Pricing in IDR
    base_price       BIGINT NOT NULL,            -- in IDR (no decimal)
    compare_price    BIGINT,                     -- original price for "sale" display
    cost_price       BIGINT,                     -- COGS for margin tracking
    reseller_price   BIGINT,                     -- default reseller purchase price
    -- Inventory
    sku              TEXT UNIQUE,
    barcode          TEXT,
    track_inventory  BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity   INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    -- BPOM (Indonesian FDA equivalent)
    bpom_number      TEXT,                       -- BPOM registration number
    bpom_expires_at  DATE,
    -- Display
    is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    is_new_arrival   BOOLEAN NOT NULL DEFAULT FALSE,
    is_best_seller   BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order       INTEGER NOT NULL DEFAULT 0,
    weight_grams     INTEGER,                    -- for shipping calculation
    -- SEO
    meta_title       TEXT,
    meta_description TEXT,
    -- Stats (denormalised for performance)
    total_sold       INTEGER NOT NULL DEFAULT 0,
    average_rating   NUMERIC(3,2) NOT NULL DEFAULT 0,
    review_count     INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Skincare product master catalog; prices in IDR integer';
COMMENT ON COLUMN public.products.bpom_number IS 'Indonesian BPOM (Badan Pengawas Obat dan Makanan) registration number';

CREATE INDEX idx_products_slug         ON public.products(slug);
CREATE INDEX idx_products_category     ON public.products(category_id);
CREATE INDEX idx_products_active       ON public.products(is_active);
CREATE INDEX idx_products_featured     ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_best_seller  ON public.products(is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX idx_products_new_arrival  ON public.products(is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX idx_products_sku          ON public.products(sku);
CREATE INDEX idx_products_stock        ON public.products(stock_quantity);
-- Full text search index on product name + description
CREATE INDEX idx_products_fts          ON public.products
    USING gin(to_tsvector('indonesian', coalesce(name,'') || ' ' || coalesce(description,'')));

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------

CREATE TABLE public.product_variants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,               -- e.g. "30ml", "50ml", "Travel Kit"
    sku             TEXT UNIQUE,
    barcode         TEXT,
    price_modifier  BIGINT NOT NULL DEFAULT 0,   -- added to base_price
    stock_quantity  INTEGER NOT NULL DEFAULT 0,
    weight_grams    INTEGER,
    image_url       TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_variants IS 'Size/volume variants per product; price_modifier added to base_price';

CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku     ON public.product_variants(sku);

CREATE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------

CREATE TABLE public.product_images (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id  UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    url         TEXT NOT NULL,                   -- Cloudflare R2 public URL
    alt_text    TEXT,
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_images IS 'Product images stored in Cloudflare R2; url points to CDN endpoint';

CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_images_primary ON public.product_images(product_id, is_primary) WHERE is_primary = TRUE;

-- ============================================================
-- SECTION 4: REVIEWS
-- ============================================================

CREATE TABLE public.reviews (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_item_id UUID,                          -- FK added after order_items
    rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title         TEXT,
    body          TEXT,
    image_urls    TEXT[],                        -- review photo URLs in R2
    skin_type     TEXT,                          -- snapshot at time of review
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE, -- purchased verified
    is_approved   BOOLEAN NOT NULL DEFAULT FALSE, -- admin moderation
    helpful_count INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id, product_id)               -- one review per product per customer
);

COMMENT ON TABLE public.reviews IS 'Product reviews; is_verified = purchased; is_approved = admin moderated';

CREATE INDEX idx_reviews_product   ON public.reviews(product_id);
CREATE INDEX idx_reviews_profile   ON public.reviews(profile_id);
CREATE INDEX idx_reviews_approved  ON public.reviews(is_approved);
CREATE INDEX idx_reviews_rating    ON public.reviews(product_id, rating);

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-update product rating stats
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.products
    SET
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM public.reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
              AND is_approved = TRUE
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
              AND is_approved = TRUE
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

-- ============================================================
-- SECTION 5: ADDRESSES
-- ============================================================

CREATE TABLE public.addresses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label           TEXT NOT NULL DEFAULT 'Rumah',  -- 'Rumah', 'Kantor', etc.
    recipient_name  TEXT NOT NULL,
    phone_number    TEXT NOT NULL,
    address_line1   TEXT NOT NULL,
    address_line2   TEXT,
    kelurahan       TEXT,                        -- village/urban ward
    kecamatan       TEXT,                        -- sub-district
    kota_kabupaten  TEXT NOT NULL,               -- city/regency
    provinsi        TEXT NOT NULL,               -- province
    postal_code     TEXT NOT NULL,
    -- Raja Ongkir / Shipper coordinates
    latitude        NUMERIC(10,7),
    longitude       NUMERIC(10,7),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.addresses IS 'Indonesian customer shipping addresses; includes administrative divisions for courier APIs';

CREATE INDEX idx_addresses_profile ON public.addresses(profile_id);
CREATE INDEX idx_addresses_default ON public.addresses(profile_id, is_default) WHERE is_default = TRUE;

CREATE TRIGGER trg_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 6: COUPONS
-- ============================================================

CREATE TABLE public.coupons (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code              TEXT NOT NULL UNIQUE,
    description       TEXT,
    discount_type     TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed_idr','free_shipping')),
    discount_value    BIGINT NOT NULL,           -- percentage (0-100) or IDR amount
    min_order_amount  BIGINT NOT NULL DEFAULT 0, -- minimum cart total in IDR
    max_discount_amount BIGINT,                  -- cap for percentage discounts
    usage_limit       INTEGER,                   -- NULL = unlimited
    usage_per_user    INTEGER NOT NULL DEFAULT 1,
    used_count        INTEGER NOT NULL DEFAULT 0,
    applies_to        TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all','specific_products','specific_categories')),
    product_ids       UUID[],
    category_ids      UUID[],
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at        TIMESTAMPTZ,
    created_by        UUID REFERENCES public.admin_users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.coupons IS 'Discount coupon codes; supports percentage, fixed IDR, and free shipping types';

CREATE INDEX idx_coupons_code       ON public.coupons(code);
CREATE INDEX idx_coupons_active     ON public.coupons(is_active, starts_at, expires_at);

CREATE TRIGGER trg_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------

CREATE TABLE public.coupon_usages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id   UUID NOT NULL REFERENCES public.coupons(id),
    profile_id  UUID NOT NULL REFERENCES public.profiles(id),
    order_id    UUID,                            -- FK added after orders
    used_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(coupon_id, profile_id, order_id)
);

COMMENT ON TABLE public.coupon_usages IS 'Per-user coupon redemption log; prevents over-use';

CREATE INDEX idx_coupon_usages_coupon  ON public.coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_profile ON public.coupon_usages(profile_id);

-- ============================================================
-- SECTION 7: FLASH SALES
-- ============================================================

CREATE TABLE public.flash_sales (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    banner_url  TEXT,
    starts_at   TIMESTAMPTZ NOT NULL,
    ends_at     TIMESTAMPTZ NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT FALSE,
    created_by  UUID REFERENCES public.admin_users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ends_at > starts_at)
);

COMMENT ON TABLE public.flash_sales IS 'Timed flash sale campaigns; is_active managed by admin or cron';

CREATE INDEX idx_flash_sales_active  ON public.flash_sales(is_active, starts_at, ends_at);
CREATE INDEX idx_flash_sales_slug    ON public.flash_sales(slug);

CREATE TRIGGER trg_flash_sales_updated_at
    BEFORE UPDATE ON public.flash_sales
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------

CREATE TABLE public.flash_sale_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flash_sale_id   UUID NOT NULL REFERENCES public.flash_sales(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES public.products(id),
    variant_id      UUID REFERENCES public.product_variants(id),
    sale_price      BIGINT NOT NULL,             -- discounted price in IDR
    original_price  BIGINT NOT NULL,
    stock_quota     INTEGER NOT NULL DEFAULT 0,  -- units available during flash sale
    sold_count      INTEGER NOT NULL DEFAULT 0,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(flash_sale_id, product_id, variant_id)
);

COMMENT ON TABLE public.flash_sale_items IS 'Products/variants within a flash sale with individual quota and price';

CREATE INDEX idx_flash_sale_items_sale    ON public.flash_sale_items(flash_sale_id);
CREATE INDEX idx_flash_sale_items_product ON public.flash_sale_items(product_id);

-- ============================================================
-- SECTION 8: BUNDLES
-- ============================================================

CREATE TABLE public.bundles (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         TEXT NOT NULL,
    slug         TEXT NOT NULL UNIQUE,
    description  TEXT,
    image_url    TEXT,
    bundle_price BIGINT NOT NULL,                -- total bundle price in IDR
    compare_price BIGINT,                        -- sum of individual prices
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at    TIMESTAMPTZ,
    ends_at      TIMESTAMPTZ,
    created_by   UUID REFERENCES public.admin_users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.bundles IS 'Product bundle deals with a single bundle price';

CREATE INDEX idx_bundles_slug   ON public.bundles(slug);
CREATE INDEX idx_bundles_active ON public.bundles(is_active);

CREATE TRIGGER trg_bundles_updated_at
    BEFORE UPDATE ON public.bundles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------

CREATE TABLE public.bundle_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id   UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id),
    variant_id  UUID REFERENCES public.product_variants(id),
    quantity    INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(bundle_id, product_id, variant_id)
);

COMMENT ON TABLE public.bundle_items IS 'Individual product/variant items that make up a bundle';

CREATE INDEX idx_bundle_items_bundle  ON public.bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product ON public.bundle_items(product_id);

-- ============================================================
-- SECTION 9: ORDERS & PAYMENTS
-- ============================================================

CREATE TABLE public.orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number    TEXT NOT NULL UNIQUE,        -- GNB-YYYYMMDD-XXXX
    profile_id      UUID NOT NULL REFERENCES public.profiles(id),
    -- Snapshot address (denormalised so address changes don't affect history)
    shipping_address JSONB NOT NULL,
    -- Pricing in IDR
    subtotal        BIGINT NOT NULL DEFAULT 0,
    discount_amount BIGINT NOT NULL DEFAULT 0,
    shipping_cost   BIGINT NOT NULL DEFAULT 0,
    tax_amount      BIGINT NOT NULL DEFAULT 0,   -- PPN 11%
    total_amount    BIGINT NOT NULL DEFAULT 0,
    -- Coupon
    coupon_id       UUID REFERENCES public.coupons(id),
    coupon_code     TEXT,
    -- Shipping
    shipping_courier TEXT,                       -- e.g. 'JNE','J&T','SiCepat'
    shipping_service TEXT,                       -- e.g. 'REG','YES'
    tracking_number TEXT,
    shipped_at      TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    -- Status
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',        -- awaiting payment
        'paid',           -- payment confirmed
        'processing',     -- being prepared
        'shipped',        -- in transit
        'delivered',      -- received by customer
        'completed',      -- reviewed/closed
        'cancelled',      -- cancelled before ship
        'refunded'        -- refund processed
    )),
    notes           TEXT,                        -- customer notes
    internal_notes  TEXT,                        -- admin-only notes
    -- Reseller context
    is_reseller_order BOOLEAN NOT NULL DEFAULT FALSE,
    reseller_id     UUID REFERENCES public.profiles(id),
    -- Source tracking
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.orders IS 'Customer orders; order_number format GNB-YYYYMMDD-XXXX; prices in IDR integer';
COMMENT ON COLUMN public.orders.shipping_address IS 'Snapshot of address at checkout time as JSONB';

CREATE INDEX idx_orders_profile     ON public.orders(profile_id);
CREATE INDEX idx_orders_number      ON public.orders(order_number);
CREATE INDEX idx_orders_status      ON public.orders(status);
CREATE INDEX idx_orders_created     ON public.orders(created_at DESC);
CREATE INDEX idx_orders_reseller    ON public.orders(reseller_id) WHERE reseller_id IS NOT NULL;
CREATE INDEX idx_orders_tracking    ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_date TEXT;
    v_seq  TEXT;
    v_seq_num INTEGER;
BEGIN
    v_date := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
    SELECT COUNT(*) + 1 INTO v_seq_num
    FROM public.orders
    WHERE created_at::date = (now() AT TIME ZONE 'Asia/Jakarta')::date;
    v_seq := lpad(v_seq_num::text, 4, '0');
    NEW.order_number := 'GNB-' || v_date || '-' || v_seq;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION public.generate_order_number();

-- ------------------------------------------------------------

CREATE TABLE public.order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES public.products(id),
    variant_id      UUID REFERENCES public.product_variants(id),
    bundle_id       UUID REFERENCES public.bundles(id),
    flash_sale_item_id UUID REFERENCES public.flash_sale_items(id),
    -- Snapshot at purchase time
    product_name    TEXT NOT NULL,
    variant_name    TEXT,
    sku             TEXT,
    image_url       TEXT,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      BIGINT NOT NULL,             -- price per unit in IDR
    total_price     BIGINT NOT NULL,             -- unit_price * quantity
    -- Review link
    is_reviewed     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_items IS 'Line items per order; product details snapshotted for order history integrity';

CREATE INDEX idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);
CREATE INDEX idx_order_items_bundle  ON public.order_items(bundle_id) WHERE bundle_id IS NOT NULL;

-- Add FK back to reviews
ALTER TABLE public.reviews ADD CONSTRAINT fk_reviews_order_item
    FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE SET NULL;

-- Add FK back to coupon_usages
ALTER TABLE public.coupon_usages ADD CONSTRAINT fk_coupon_usages_order
    FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- ------------------------------------------------------------

CREATE TABLE public.payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID NOT NULL REFERENCES public.orders(id),
    -- Midtrans fields
    midtrans_order_id   TEXT UNIQUE,             -- maps to orders.order_number
    midtrans_transaction_id TEXT,
    midtrans_gross_amount   BIGINT NOT NULL,     -- in IDR
    midtrans_currency       TEXT NOT NULL DEFAULT 'IDR',
    midtrans_status_code    TEXT,
    midtrans_transaction_status TEXT,            -- pending, settlement, expire, cancel, deny
    midtrans_fraud_status    TEXT,               -- accept, challenge, deny
    payment_type        TEXT,                    -- gopay, bank_transfer, credit_card, qris, etc.
    bank                TEXT,                    -- for bank_transfer: bca, bni, bri, mandiri, permata
    va_number           TEXT,                    -- virtual account number
    payment_url         TEXT,                    -- Snap/redirect URL
    pdf_url             TEXT,                    -- payment receipt URL
    finish_redirect_url TEXT,
    -- Timestamps from Midtrans (WIB)
    transaction_time    TIMESTAMPTZ,
    settlement_time     TIMESTAMPTZ,
    expiry_time         TIMESTAMPTZ,
    -- Webhook raw payload
    raw_notification    JSONB,
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending','processing','success','failed','expired','cancelled','refunded'
    )),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS 'Midtrans payment gateway records; raw_notification stores full webhook payload';
COMMENT ON COLUMN public.payments.payment_type IS 'Midtrans payment_type: gopay, bank_transfer, qris, credit_card, etc.';

CREATE INDEX idx_payments_order            ON public.payments(order_id);
CREATE INDEX idx_payments_midtrans_order   ON public.payments(midtrans_order_id);
CREATE INDEX idx_payments_midtrans_txn     ON public.payments(midtrans_transaction_id);
CREATE INDEX idx_payments_status           ON public.payments(status);
CREATE INDEX idx_payments_type             ON public.payments(payment_type);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 10: BOOKINGS (KONSULTASI KULIT)
-- ============================================================

CREATE TABLE public.booking_slots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_date       DATE NOT NULL,
    start_time      TIME NOT NULL,               -- WIB (UTC+7)
    end_time        TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    capacity        INTEGER NOT NULL DEFAULT 1,  -- concurrent bookings allowed
    booked_count    INTEGER NOT NULL DEFAULT 0,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    slot_type       TEXT NOT NULL DEFAULT 'online' CHECK (slot_type IN ('online','offline')),
    location        TEXT,                        -- for offline slots
    meeting_url     TEXT,                        -- Zoom/Google Meet base URL
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

COMMENT ON TABLE public.booking_slots IS 'Available consultation slots; times in WIB (Asia/Jakarta UTC+7)';

CREATE INDEX idx_booking_slots_date       ON public.booking_slots(slot_date);
CREATE INDEX idx_booking_slots_available  ON public.booking_slots(is_available, slot_date);
CREATE INDEX idx_booking_slots_type       ON public.booking_slots(slot_type);

CREATE TRIGGER trg_booking_slots_updated_at
    BEFORE UPDATE ON public.booking_slots
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------

CREATE TABLE public.bookings (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number   TEXT NOT NULL UNIQUE,       -- GNB-BK-YYYYMMDD-XXXX
    profile_id       UUID NOT NULL REFERENCES public.profiles(id),
    slot_id          UUID NOT NULL REFERENCES public.booking_slots(id),
    -- Customer snapshot
    customer_name    TEXT NOT NULL,
    customer_email   TEXT NOT NULL,
    customer_phone   TEXT NOT NULL,
    -- Skin consultation specifics
    skin_type        TEXT,
    skin_concerns    TEXT[],
    current_routine  TEXT,
    questions        TEXT,
    -- Meeting details
    meeting_url      TEXT,                       -- personalised meeting link
    meeting_password TEXT,
    -- Status
    status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',     -- awaiting confirmation
        'confirmed',   -- admin confirmed
        'in_progress', -- session active
        'completed',   -- session done
        'cancelled',   -- customer cancelled
        'no_show'      -- customer no-show
    )),
    confirmation_sent_at TIMESTAMPTZ,
    reminder_sent_at     TIMESTAMPTZ,
    notes            TEXT,                       -- post-session notes by consultant
    internal_notes   TEXT,
    cancelled_at     TIMESTAMPTZ,
    cancel_reason    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.bookings IS 'Skin consultation bookings (konsultasi kulit); booking_number format GNB-BK-YYYYMMDD-XXXX';

CREATE INDEX idx_bookings_profile ON public.bookings(profile_id);
CREATE INDEX idx_bookings_slot    ON public.bookings(slot_id);
CREATE INDEX idx_bookings_status  ON public.bookings(status);
CREATE INDEX idx_bookings_number  ON public.bookings(booking_number);
CREATE INDEX idx_bookings_date    ON public.bookings(created_at DESC);

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate booking number
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_date TEXT;
    v_seq  TEXT;
    v_seq_num INTEGER;
BEGIN
    v_date := to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
    SELECT COUNT(*) + 1 INTO v_seq_num
    FROM public.bookings
    WHERE created_at::date = (now() AT TIME ZONE 'Asia/Jakarta')::date;
    v_seq := lpad(v_seq_num::text, 4, '0');
    NEW.booking_number := 'GNB-BK-' || v_date || '-' || v_seq;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_booking_number
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    WHEN (NEW.booking_number IS NULL OR NEW.booking_number = '')
    EXECUTE FUNCTION public.generate_booking_number();

-- Auto-update slot booked_count
CREATE OR REPLACE FUNCTION public.update_slot_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status NOT IN ('cancelled','no_show') THEN
        UPDATE public.booking_slots
        SET booked_count = booked_count + 1,
            is_available = (booked_count + 1 < capacity)
        WHERE id = NEW.slot_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status NOT IN ('cancelled','no_show') AND NEW.status IN ('cancelled','no_show') THEN
            UPDATE public.booking_slots
            SET booked_count = GREATEST(booked_count - 1, 0),
                is_available = TRUE
            WHERE id = NEW.slot_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_slot_count
    AFTER INSERT OR UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_slot_count();

-- ============================================================
-- SECTION 11: RESELLER PROGRAM
-- ============================================================

CREATE TABLE public.reseller_tiers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL UNIQUE,    -- Bronze, Silver, Gold, Diamond
    slug                TEXT NOT NULL UNIQUE,    -- bronze, silver, gold, diamond
    level               INTEGER NOT NULL UNIQUE, -- 1=Bronze, 2=Silver, 3=Gold, 4=Diamond
    min_monthly_revenue BIGINT NOT NULL DEFAULT 0,  -- minimum IDR sales for tier
    discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0, -- % off base_price
    commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    benefits            JSONB NOT NULL DEFAULT '[]',    -- array of benefit descriptions
    badge_url           TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reseller_tiers IS 'Reseller tier definitions: Bronze(1)→Silver(2)→Gold(3)→Diamond(4)';

-- Insert default tiers
INSERT INTO public.reseller_tiers (name, slug, level, min_monthly_revenue, discount_percentage, commission_percentage, benefits)
VALUES
    ('Bronze',  'bronze',  1, 0,          10.00, 5.00,  '["Diskon 10% pembelian produk","Akses materi marketing","Support WhatsApp"]'),
    ('Silver',  'silver',  2, 5000000,    15.00, 8.00,  '["Diskon 15% pembelian produk","Priority support","Training online"]'),
    ('Gold',    'gold',    3, 15000000,   20.00, 12.00, '["Diskon 20% pembelian produk","Dedicated account manager","Event eksklusif"]'),
    ('Diamond', 'diamond', 4, 50000000,   25.00, 15.00, '["Diskon 25% pembelian produk","Co-branding opportunity","Revenue sharing premium"]');

CREATE TRIGGER trg_reseller_tiers_updated_at
    BEFORE UPDATE ON public.reseller_tiers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add FK from profiles to reseller_tiers (now that the table exists)
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_reseller_tier
    FOREIGN KEY (reseller_tier_id) REFERENCES public.reseller_tiers(id) ON DELETE SET NULL;

-- ------------------------------------------------------------

CREATE TABLE public.resellers (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id       UUID NOT NULL UNIQUE REFERENCES public.profiles(id),
    tier_id          UUID NOT NULL REFERENCES public.reseller_tiers(id),
    -- Business information
    business_name    TEXT,
    business_type    TEXT CHECK (business_type IN ('individual','toko_online','toko_fisik','distributor','salon','klinik')),
    instagram_handle TEXT,
    tiktok_handle    TEXT,
    marketplace_urls JSONB DEFAULT '{}',         -- {"tokopedia":"...","shopee":"..."}
    -- Bank details for commission payout
    bank_name        TEXT,
    bank_account_number TEXT,
    bank_account_name   TEXT,
    -- KTP (Indonesian ID) for verification
    ktp_number       TEXT,
    ktp_image_url    TEXT,
    -- NPWP (tax number) optional
    npwp_number      TEXT,
    -- Status
    status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',    -- awaiting review
        'active',     -- approved and active
        'suspended',  -- temporarily suspended
        'terminated'  -- permanently terminated
    )),
    approved_at      TIMESTAMPTZ,
    approved_by      UUID REFERENCES public.admin_users(id),
    suspension_reason TEXT,
    -- Performance metrics (updated monthly)
    total_revenue    BIGINT NOT NULL DEFAULT 0,
    monthly_revenue  BIGINT NOT NULL DEFAULT 0,
    total_orders     INTEGER NOT NULL DEFAULT 0,
    commission_balance BIGINT NOT NULL DEFAULT 0, -- unpaid commission in IDR
    total_commission_paid BIGINT NOT NULL DEFAULT 0,
    referral_code    TEXT UNIQUE DEFAULT 'RSL-' || substring(md5(random()::text) FROM 1 FOR 6),
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.resellers IS 'Reseller/partner program applications and accounts; KTP required for verification';
COMMENT ON COLUMN public.resellers.ktp_number IS 'Indonesian KTP (Kartu Tanda Penduduk) national ID number — 16 digits';
COMMENT ON COLUMN public.resellers.commission_balance IS 'Accrued unpaid commission in IDR';

CREATE INDEX idx_resellers_profile  ON public.resellers(profile_id);
CREATE INDEX idx_resellers_tier     ON public.resellers(tier_id);
CREATE INDEX idx_resellers_status   ON public.resellers(status);
CREATE INDEX idx_resellers_referral ON public.resellers(referral_code);

CREATE TRIGGER trg_resellers_updated_at
    BEFORE UPDATE ON public.resellers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 12: 21-DAY CHALLENGE
-- ============================================================

CREATE TABLE public.challenge_registrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id      UUID NOT NULL REFERENCES public.profiles(id),
    -- Challenge details
    challenge_name  TEXT NOT NULL DEFAULT '21 Hari Glowing Bersama Ginabo',
    start_date      DATE NOT NULL,
    end_date        DATE GENERATED ALWAYS AS (start_date + INTERVAL '20 days') STORED,
    -- Progress tracking
    current_day     INTEGER NOT NULL DEFAULT 0 CHECK (current_day BETWEEN 0 AND 21),
    streak_count    INTEGER NOT NULL DEFAULT 0,
    completed_days  INTEGER[] NOT NULL DEFAULT '{}',   -- array of completed day numbers
    -- Check-in data (JSONB array of daily logs)
    daily_logs      JSONB NOT NULL DEFAULT '[]',
    -- e.g. [{"day":1,"photo_url":"...","note":"...","checked_in_at":"..."}]
    -- Status
    status          TEXT NOT NULL DEFAULT 'registered' CHECK (status IN (
        'registered', -- signed up, not started
        'active',     -- in progress
        'completed',  -- all 21 days done
        'abandoned'   -- dropped out
    )),
    completed_at    TIMESTAMPTZ,
    -- Reward
    reward_coupon_id UUID REFERENCES public.coupons(id),
    reward_claimed  BOOLEAN NOT NULL DEFAULT FALSE,
    -- Contact for notifications
    whatsapp_number TEXT NOT NULL,
    -- Opt-ins
    consent_share_progress BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id, start_date)
);

COMMENT ON TABLE public.challenge_registrations IS '21-day skincare challenge; daily_logs JSONB stores per-day check-in photos and notes';
COMMENT ON COLUMN public.challenge_registrations.daily_logs IS 'Array of {day, photo_url, note, mood, products_used[], checked_in_at} objects';

CREATE INDEX idx_challenge_profile  ON public.challenge_registrations(profile_id);
CREATE INDEX idx_challenge_status   ON public.challenge_registrations(status);
CREATE INDEX idx_challenge_start    ON public.challenge_registrations(start_date);

CREATE TRIGGER trg_challenge_updated_at
    BEFORE UPDATE ON public.challenge_registrations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 13: NOTIFICATIONS
-- ============================================================

CREATE TABLE public.notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Channel
    channel         TEXT NOT NULL CHECK (channel IN ('email','whatsapp','push','sms','in_app')),
    recipient       TEXT NOT NULL,               -- email address or WA number (+62xxx)
    -- Content
    template_id     TEXT,                        -- template slug e.g. 'order_confirmed'
    subject         TEXT,
    body            TEXT NOT NULL,
    variables       JSONB NOT NULL DEFAULT '{}', -- template variable substitutions
    -- Queue status
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending','sending','sent','failed','cancelled'
    )),
    priority        SMALLINT NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    -- Related entities
    related_type    TEXT,                        -- 'order','booking','challenge'
    related_id      UUID,
    -- Tracking
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,
    failed_reason   TEXT,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    max_retries     INTEGER NOT NULL DEFAULT 3,
    scheduled_for   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'Outbound notification queue for email and WhatsApp Business API; processed by Edge Functions';
COMMENT ON COLUMN public.notifications.channel IS 'Primary channels: whatsapp (WA Business API), email (Resend/SendGrid)';

CREATE INDEX idx_notifications_profile   ON public.notifications(profile_id);
CREATE INDEX idx_notifications_status    ON public.notifications(status, scheduled_for);
CREATE INDEX idx_notifications_channel   ON public.notifications(channel, status);
CREATE INDEX idx_notifications_related   ON public.notifications(related_type, related_id);
CREATE INDEX idx_notifications_pending   ON public.notifications(scheduled_for) WHERE status = 'pending';

CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SECTION 14: ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all customer-facing tables
ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users              ENABLE ROW LEVEL SECURITY;

-- Enable RLS on product/catalog tables (public read, admin write)
ALTER TABLE public.products                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_tiers           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS HELPER: is_admin()
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users au
        JOIN public.profiles p ON p.id = au.profile_id
        WHERE p.id = auth.uid()
          AND au.is_active = TRUE
    );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'superadmin'
    );
$$;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "profiles: users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "profiles: users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "profiles: admins can update any profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "profiles: service role full access"
    ON public.profiles FOR ALL
    TO service_role
    USING (TRUE)
    WITH CHECK (TRUE);

-- ============================================================
-- ADDRESSES POLICIES
-- ============================================================

CREATE POLICY "addresses: users can manage own addresses"
    ON public.addresses FOR ALL
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "addresses: admins can view all"
    ON public.addresses FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "addresses: service role full access"
    ON public.addresses FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- ORDERS POLICIES
-- ============================================================

CREATE POLICY "orders: users can view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "orders: users can create orders"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "orders: admins can view all orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "orders: admins can update orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "orders: service role full access"
    ON public.orders FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================

CREATE POLICY "order_items: users can view own order items"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND orders.profile_id = auth.uid()
        )
    );

CREATE POLICY "order_items: service role full access"
    ON public.order_items FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "order_items: admins can view all"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================

CREATE POLICY "payments: users can view own payments"
    ON public.payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
              AND orders.profile_id = auth.uid()
        )
    );

CREATE POLICY "payments: admins can view all"
    ON public.payments FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "payments: service role full access"
    ON public.payments FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- BOOKINGS POLICIES
-- ============================================================

CREATE POLICY "bookings: users can view own bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "bookings: users can create bookings"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "bookings: users can cancel own bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid() AND NEW.status = 'cancelled');

CREATE POLICY "bookings: admins can manage all bookings"
    ON public.bookings FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "bookings: service role full access"
    ON public.bookings FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- BOOKING SLOTS POLICIES (public read)
-- ============================================================

CREATE POLICY "booking_slots: public can view available slots"
    ON public.booking_slots FOR SELECT
    TO anon, authenticated
    USING (is_available = TRUE);

CREATE POLICY "booking_slots: admins can manage slots"
    ON public.booking_slots FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "booking_slots: service role full access"
    ON public.booking_slots FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================

CREATE POLICY "reviews: anyone can view approved reviews"
    ON public.reviews FOR SELECT
    TO anon, authenticated
    USING (is_approved = TRUE);

CREATE POLICY "reviews: users can view own reviews"
    ON public.reviews FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "reviews: users can create reviews"
    ON public.reviews FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "reviews: users can update own unmoderated reviews"
    ON public.reviews FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid() AND is_approved = FALSE)
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "reviews: admins can manage all reviews"
    ON public.reviews FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "reviews: service role full access"
    ON public.reviews FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- CHALLENGE REGISTRATIONS POLICIES
-- ============================================================

CREATE POLICY "challenge: users can view own registrations"
    ON public.challenge_registrations FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "challenge: users can create registrations"
    ON public.challenge_registrations FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "challenge: users can update own registrations"
    ON public.challenge_registrations FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "challenge: admins can manage all"
    ON public.challenge_registrations FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "challenge: service role full access"
    ON public.challenge_registrations FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

CREATE POLICY "notifications: users can view own"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "notifications: admins can view all"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "notifications: service role full access"
    ON public.notifications FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- COUPON USAGES POLICIES
-- ============================================================

CREATE POLICY "coupon_usages: users can view own usage"
    ON public.coupon_usages FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "coupon_usages: service role full access"
    ON public.coupon_usages FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "coupon_usages: admins can view all"
    ON public.coupon_usages FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- ============================================================
-- RESELLERS POLICIES
-- ============================================================

CREATE POLICY "resellers: users can view own application"
    ON public.resellers FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "resellers: users can apply"
    ON public.resellers FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "resellers: users can update own pending application"
    ON public.resellers FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid() AND status = 'pending')
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "resellers: admins can manage all"
    ON public.resellers FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "resellers: service role full access"
    ON public.resellers FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- PRODUCT CATALOG POLICIES (public read)
-- ============================================================

CREATE POLICY "products: anyone can view active products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "products: admins can manage all"
    ON public.products FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "products: service role full access"
    ON public.products FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- product_variants
CREATE POLICY "product_variants: anyone can view active variants"
    ON public.product_variants FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "product_variants: admins can manage all"
    ON public.product_variants FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "product_variants: service role full access"
    ON public.product_variants FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- product_images
CREATE POLICY "product_images: anyone can view"
    ON public.product_images FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "product_images: admins can manage"
    ON public.product_images FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "product_images: service role full access"
    ON public.product_images FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- categories
CREATE POLICY "categories: anyone can view active"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "categories: admins can manage"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "categories: service role full access"
    ON public.categories FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- flash_sales
CREATE POLICY "flash_sales: anyone can view active"
    ON public.flash_sales FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE AND now() BETWEEN starts_at AND ends_at);

CREATE POLICY "flash_sales: admins can manage all"
    ON public.flash_sales FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "flash_sales: service role full access"
    ON public.flash_sales FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- flash_sale_items
CREATE POLICY "flash_sale_items: anyone can view"
    ON public.flash_sale_items FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.flash_sales fs
            WHERE fs.id = flash_sale_items.flash_sale_id
              AND fs.is_active = TRUE
              AND now() BETWEEN fs.starts_at AND fs.ends_at
        )
    );

CREATE POLICY "flash_sale_items: admins can manage"
    ON public.flash_sale_items FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "flash_sale_items: service role full access"
    ON public.flash_sale_items FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- bundles
CREATE POLICY "bundles: anyone can view active"
    ON public.bundles FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "bundles: admins can manage"
    ON public.bundles FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "bundles: service role full access"
    ON public.bundles FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- bundle_items
CREATE POLICY "bundle_items: anyone can view"
    ON public.bundle_items FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bundles b
            WHERE b.id = bundle_items.bundle_id
              AND b.is_active = TRUE
        )
    );

CREATE POLICY "bundle_items: admins can manage"
    ON public.bundle_items FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "bundle_items: service role full access"
    ON public.bundle_items FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- coupons (admins only by default — clients validate via Edge Function)
CREATE POLICY "coupons: admins can manage"
    ON public.coupons FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "coupons: service role full access"
    ON public.coupons FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- reseller_tiers (public read)
CREATE POLICY "reseller_tiers: anyone can view"
    ON public.reseller_tiers FOR SELECT
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "reseller_tiers: admins can manage"
    ON public.reseller_tiers FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "reseller_tiers: service role full access"
    ON public.reseller_tiers FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- admin_users
CREATE POLICY "admin_users: only superadmin can manage"
    ON public.admin_users FOR ALL
    TO authenticated
    USING (public.is_superadmin());

CREATE POLICY "admin_users: admins can view own record"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "admin_users: service role full access"
    ON public.admin_users FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- SECTION 15: UTILITY VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.v_order_summary AS
SELECT
    o.id,
    o.order_number,
    o.profile_id,
    p.full_name AS customer_name,
    p.email AS customer_email,
    p.whatsapp_number,
    o.status,
    o.total_amount,
    o.shipping_courier,
    o.tracking_number,
    o.created_at,
    pay.payment_type,
    pay.status AS payment_status,
    pay.midtrans_transaction_status
FROM public.orders o
JOIN public.profiles p   ON p.id = o.profile_id
LEFT JOIN public.payments pay ON pay.order_id = o.id;

COMMENT ON VIEW public.v_order_summary IS 'Convenience view for admin order list — JOIN between orders, profiles, payments';

CREATE OR REPLACE VIEW public.v_product_catalog AS
SELECT
    pr.id,
    pr.name,
    pr.slug,
    pr.base_price,
    pr.compare_price,
    pr.reseller_price,
    pr.stock_quantity,
    pr.average_rating,
    pr.review_count,
    pr.total_sold,
    pr.is_featured,
    pr.is_active,
    cat.name AS category_name,
    cat.slug AS category_slug,
    pi.url AS primary_image_url
FROM public.products pr
LEFT JOIN public.categories cat ON cat.id = pr.category_id
LEFT JOIN public.product_images pi ON pi.product_id = pr.id AND pi.is_primary = TRUE;

COMMENT ON VIEW public.v_product_catalog IS 'Product listing view with category and primary image — optimised for shop page queries';

-- ============================================================
-- SECTION 16: REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flash_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flash_sale_items;

-- ============================================================
-- END OF MIGRATION 001
-- ============================================================
