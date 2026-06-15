-- ============================================================
-- GINABO — Seed Data for Admin Dashboard Simulation
-- Project: lvmyjtzfohlorocrjvcx (ginabo.id)
-- Created: 2026-06-16
--
-- HOW TO RUN:
--   1. Buka: https://supabase.com/dashboard/project/lvmyjtzfohlorocrjvcx/sql/new
--   2. Paste seluruh isi file ini
--   3. Klik "Run"
--
-- Isi seed:
--   - 10 customer profiles
--   - 4 kategori + 4 produk Ginabo + 8 varian
--   - 15 orders (completed/delivered/shipped/processing/paid/cancelled)
--   - 18 order_items
--   - 14 payments
--   - 1 return_policy + 3 returns + 4 return_items
-- ============================================================

BEGIN;

-- Bypass FK constraints agar bisa insert profiles tanpa auth.users
SET LOCAL session_replication_role = replica;

-- ============================================================
-- SECTION 1: PROFILES (10 customers)
-- Harga produk (IDR, tanpa desimal):
--   Hydra Moist Gel      30ml = 89.000  | 50ml = 119.000
--   Bright & Care Cream  30ml = 129.000 | 50ml = 169.000
--   GlowAge Serum        15ml = 219.000 | 30ml = 299.000
--   Daily SPF Moisturizer 30ml = 159.000 | 50ml = 209.000
-- ============================================================

INSERT INTO public.profiles (
    id, email, full_name, phone_number, whatsapp_number,
    skin_type, skin_concerns, is_active, role, created_at, updated_at
) VALUES
  ('a100000000000000000000000000000001',
   'siti.rahayu@gmail.com', 'Siti Rahayu',
   '+6281234567801', '+6281234567801',
   'dry', ARRAY['brightening','hydration'],
   TRUE, 'customer', now() - INTERVAL '45 days', now() - INTERVAL '45 days'),

  ('a100000000000000000000000000000002',
   'dewi.kusuma@gmail.com', 'Dewi Kusuma',
   '+6281234567802', '+6281234567802',
   'combination', ARRAY['acne','pores'],
   TRUE, 'customer', now() - INTERVAL '40 days', now() - INTERVAL '40 days'),

  ('a100000000000000000000000000000003',
   'rina.santoso@gmail.com', 'Rina Santoso',
   '+6281234567803', '+6281234567803',
   'oily', ARRAY['acne','oiliness'],
   TRUE, 'customer', now() - INTERVAL '38 days', now() - INTERVAL '38 days'),

  ('a100000000000000000000000000000004',
   'maya.putri@gmail.com', 'Maya Putri',
   '+6281234567804', '+6281234567804',
   'sensitive', ARRAY['redness','soothing'],
   TRUE, 'customer', now() - INTERVAL '35 days', now() - INTERVAL '35 days'),

  ('a100000000000000000000000000000005',
   'lestari.wijaya@gmail.com', 'Lestari Wijaya',
   '+6281234567805', '+6281234567805',
   'normal', ARRAY['anti_aging','brightening'],
   TRUE, 'customer', now() - INTERVAL '30 days', now() - INTERVAL '30 days'),

  ('a100000000000000000000000000000006',
   'budi.setiawan@gmail.com', 'Budi Setiawan',
   '+6281234567806', '+6281234567806',
   'oily', ARRAY['acne'],
   TRUE, 'customer', now() - INTERVAL '28 days', now() - INTERVAL '28 days'),

  ('a100000000000000000000000000000007',
   'agus.pratama@gmail.com', 'Agus Pratama',
   '+6281234567807', '+6281234567807',
   'combination', ARRAY['hyperpigmentation','brightening'],
   TRUE, 'customer', now() - INTERVAL '25 days', now() - INTERVAL '25 days'),

  ('a100000000000000000000000000000008',
   'fajar.nugraha@gmail.com', 'Fajar Nugraha',
   '+6281234567808', '+6281234567808',
   'dry', ARRAY['hydration','anti_aging'],
   TRUE, 'customer', now() - INTERVAL '20 days', now() - INTERVAL '20 days'),

  ('a100000000000000000000000000000009',
   'rendi.saputra@gmail.com', 'Rendi Saputra',
   '+6281234567809', '+6281234567809',
   'normal', ARRAY['brightening'],
   TRUE, 'customer', now() - INTERVAL '15 days', now() - INTERVAL '15 days'),

  ('a100000000000000000000000000000010',
   'hendra.gunawan@gmail.com', 'Hendra Gunawan',
   '+6281234567810', '+6281234567810',
   'combination', ARRAY['acne','pores'],
   TRUE, 'customer', now() - INTERVAL '10 days', now() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: CATEGORIES
-- ============================================================

INSERT INTO public.categories (id, name, slug, description, is_active, sort_order, created_at, updated_at)
VALUES
  ('b100000000000000000000000000000001',
   'Pelembab', 'pelembab', 'Produk pelembab wajah harian', TRUE, 1, now(), now()),
  ('b100000000000000000000000000000002',
   'Serum', 'serum', 'Serum perawatan kulit intensif', TRUE, 2, now(), now()),
  ('b100000000000000000000000000000003',
   'Sunscreen', 'sunscreen', 'Perlindungan UV & SPF harian', TRUE, 3, now(), now()),
  ('b100000000000000000000000000000004',
   'Perawatan Jerawat', 'perawatan-jerawat', 'Produk anti-acne & pore care', TRUE, 4, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 3: PRODUCTS
-- ============================================================

INSERT INTO public.products (
    id, category_id, name, slug, short_description,
    skin_type_tags, concern_tags,
    base_price, compare_price, cost_price,
    sku, track_inventory, stock_quantity, low_stock_threshold,
    is_featured, is_active, is_best_seller, is_new_arrival,
    sort_order, weight_grams,
    total_sold, average_rating, review_count,
    created_at, updated_at
) VALUES
  (
    'c100000000000000000000000000000001',
    'b100000000000000000000000000000001',
    'Hydra Moist Gel', 'hydra-moist-gel',
    'Gel pelembab ringan dengan 5% Niacinamide & Hyaluronic Acid. Cocok untuk kulit berminyak & kombinasi.',
    ARRAY['oily','combination','normal'],
    ARRAY['hydration','pores','brightening'],
    89000, 120000, 32000,
    'GNB-HMG-001', TRUE, 148, 10,
    TRUE, TRUE, TRUE, FALSE, 1, 80,
    342, 4.6, 87,
    now() - INTERVAL '60 days', now()
  ),
  (
    'c100000000000000000000000000000002',
    'b100000000000000000000000000000001',
    'Bright & Care Cream', 'bright-care-cream',
    'Krim pencerah dengan Alpha Arbutin 2% & Vitamin C untuk kulit cerah merata tanpa iritasi.',
    ARRAY['dry','normal','combination'],
    ARRAY['brightening','hyperpigmentation','anti_aging'],
    129000, 159000, 48000,
    'GNB-BCC-001', TRUE, 89, 10,
    TRUE, TRUE, TRUE, FALSE, 2, 100,
    218, 4.7, 56,
    now() - INTERVAL '55 days', now()
  ),
  (
    'c100000000000000000000000000000003',
    'b100000000000000000000000000000002',
    'GlowAge Serum', 'glowage-serum',
    'Serum anti-aging dengan Retinol 0.3% & Peptide Complex untuk kulit tampak muda dan bercahaya.',
    ARRAY['dry','normal','combination','sensitive'],
    ARRAY['anti_aging','brightening','hydration'],
    219000, 289000, 82000,
    'GNB-GAS-001', TRUE, 56, 10,
    TRUE, TRUE, FALSE, TRUE, 3, 120,
    124, 4.8, 41,
    now() - INTERVAL '30 days', now()
  ),
  (
    'c100000000000000000000000000000004',
    'b100000000000000000000000000000003',
    'Daily SPF Moisturizer', 'daily-spf-moisturizer',
    'Pelembab harian dengan SPF 35 PA+++ perlindungan UV ringan nyaman dipakai seharian.',
    ARRAY['normal','combination','oily'],
    ARRAY['sun_protection','hydration','brightening'],
    159000, 199000, 58000,
    'GNB-DSM-001', TRUE, 73, 10,
    FALSE, TRUE, FALSE, TRUE, 4, 90,
    98, 4.5, 28,
    now() - INTERVAL '20 days', now()
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 4: PRODUCT VARIANTS
-- Harga = base_price + price_modifier
-- HMG 30ml=89K, 50ml=119K | BCC 30ml=129K, 50ml=169K
-- GAS 15ml=219K, 30ml=299K | DSM 30ml=159K, 50ml=209K
-- ============================================================

INSERT INTO public.product_variants (
    id, product_id, name, sku,
    price_modifier, stock_quantity, weight_grams,
    is_active, sort_order, created_at, updated_at
) VALUES
  -- Hydra Moist Gel
  ('d100000000000000000000000000000001', 'c100000000000000000000000000000001', '30ml', 'GNB-HMG-030',      0,  80, 85,  TRUE, 1, now(), now()),
  ('d100000000000000000000000000000002', 'c100000000000000000000000000000001', '50ml', 'GNB-HMG-050',  30000,  68, 130, TRUE, 2, now(), now()),
  -- Bright & Care Cream
  ('d100000000000000000000000000000003', 'c100000000000000000000000000000002', '30ml', 'GNB-BCC-030',      0,  45, 90,  TRUE, 1, now(), now()),
  ('d100000000000000000000000000000004', 'c100000000000000000000000000000002', '50ml', 'GNB-BCC-050',  40000,  44, 135, TRUE, 2, now(), now()),
  -- GlowAge Serum
  ('d100000000000000000000000000000005', 'c100000000000000000000000000000003', '15ml', 'GNB-GAS-015',      0,  30, 65,  TRUE, 1, now(), now()),
  ('d100000000000000000000000000000006', 'c100000000000000000000000000000003', '30ml', 'GNB-GAS-030',  80000,  26, 100, TRUE, 2, now(), now()),
  -- Daily SPF Moisturizer
  ('d100000000000000000000000000000007', 'c100000000000000000000000000000004', '30ml', 'GNB-DSM-030',      0,  38, 95,  TRUE, 1, now(), now()),
  ('d100000000000000000000000000000008', 'c100000000000000000000000000000004', '50ml', 'GNB-DSM-050',  50000,  35, 140, TRUE, 2, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 5: ORDERS
-- Format: GNB-YYYYMMDD-XXXX
-- subtotal = sum of item prices (sebelum discount)
-- total_amount = subtotal - discount + shipping
-- ============================================================

INSERT INTO public.orders (
    id, order_number, profile_id,
    shipping_address,
    subtotal, discount_amount, shipping_cost, tax_amount, total_amount,
    shipping_courier, shipping_service, tracking_number,
    shipped_at, delivered_at, status,
    created_at, updated_at
) VALUES

-- === COMPLETED (5 orders) ===

-- O01: Siti — HMG30 89K + BCC30 129K = 218K, ship 12K → 230K
('e100000000000000000000000000000001', 'GNB-20260601-0001', 'a100000000000000000000000000000001',
 '{"recipient_name":"Siti Rahayu","phone":"081234567801","address_line1":"Jl. Melati No.5","kota_kabupaten":"Jakarta Selatan","provinsi":"DKI Jakarta","postal_code":"12930"}',
 218000, 0, 12000, 0, 230000,
 'JNE', 'REG', 'JNE1234567801A',
 now()-INTERVAL '28 days', now()-INTERVAL '25 days', 'completed',
 now()-INTERVAL '30 days', now()-INTERVAL '25 days'),

-- O02: Dewi — BCC50 169K x2 = 338K, disc 20K, ship 15K → 333K
('e100000000000000000000000000000002', 'GNB-20260603-0001', 'a100000000000000000000000000000002',
 '{"recipient_name":"Dewi Kusuma","phone":"081234567802","address_line1":"Jl. Dahlia No.12","kota_kabupaten":"Bandung","provinsi":"Jawa Barat","postal_code":"40115"}',
 338000, 20000, 15000, 0, 333000,
 'J&T', 'REGULAR', 'JT9876543802B',
 now()-INTERVAL '26 days', now()-INTERVAL '22 days', 'completed',
 now()-INTERVAL '28 days', now()-INTERVAL '22 days'),

-- O03: Rina — GAS15 219K, ship 18K → 237K
('e100000000000000000000000000000003', 'GNB-20260605-0001', 'a100000000000000000000000000000003',
 '{"recipient_name":"Rina Santoso","phone":"081234567803","address_line1":"Jl. Anggrek No.8","kota_kabupaten":"Surabaya","provinsi":"Jawa Timur","postal_code":"60241"}',
 219000, 0, 18000, 0, 237000,
 'SiCepat', 'BEST', 'SC5551234803C',
 now()-INTERVAL '24 days', now()-INTERVAL '20 days', 'completed',
 now()-INTERVAL '26 days', now()-INTERVAL '20 days'),

-- O04: Maya — HMG50 119K + GAS15 219K = 338K, disc 30K, ship 14K → 322K
('e100000000000000000000000000000004', 'GNB-20260607-0001', 'a100000000000000000000000000000004',
 '{"recipient_name":"Maya Putri","phone":"081234567804","address_line1":"Jl. Mawar No.3","kota_kabupaten":"Yogyakarta","provinsi":"DI Yogyakarta","postal_code":"55281"}',
 338000, 30000, 14000, 0, 322000,
 'JNE', 'YES', 'JNE2223334804D',
 now()-INTERVAL '22 days', now()-INTERVAL '18 days', 'completed',
 now()-INTERVAL '24 days', now()-INTERVAL '18 days'),

-- O05: Lestari — DSM30 159K, ship 12K → 171K
('e100000000000000000000000000000005', 'GNB-20260609-0001', 'a100000000000000000000000000000005',
 '{"recipient_name":"Lestari Wijaya","phone":"081234567805","address_line1":"Jl. Kenanga No.17","kota_kabupaten":"Semarang","provinsi":"Jawa Tengah","postal_code":"50132"}',
 159000, 0, 12000, 0, 171000,
 'J&T', 'REGULAR', 'JT7778889805E',
 now()-INTERVAL '20 days', now()-INTERVAL '17 days', 'completed',
 now()-INTERVAL '22 days', now()-INTERVAL '17 days'),

-- === DELIVERED (3 orders) ===

-- O06: Budi — GAS30 299K, ship 25K → 324K
('e100000000000000000000000000000006', 'GNB-20260611-0001', 'a100000000000000000000000000000006',
 '{"recipient_name":"Budi Setiawan","phone":"081234567806","address_line1":"Jl. Flamboyan No.22","kota_kabupaten":"Medan","provinsi":"Sumatera Utara","postal_code":"20111"}',
 299000, 0, 25000, 0, 324000,
 'JNE', 'REG', 'JNE3334445806F',
 now()-INTERVAL '12 days', now()-INTERVAL '9 days', 'delivered',
 now()-INTERVAL '14 days', now()-INTERVAL '9 days'),

-- O07: Agus — BCC30 129K, ship 28K → 157K
('e100000000000000000000000000000007', 'GNB-20260612-0001', 'a100000000000000000000000000000007',
 '{"recipient_name":"Agus Pratama","phone":"081234567807","address_line1":"Jl. Bougainvillea No.9","kota_kabupaten":"Makassar","provinsi":"Sulawesi Selatan","postal_code":"90111"}',
 129000, 0, 28000, 0, 157000,
 'SiCepat', 'BEST', 'SC1112223807G',
 now()-INTERVAL '10 days', now()-INTERVAL '7 days', 'delivered',
 now()-INTERVAL '12 days', now()-INTERVAL '7 days'),

-- O08: Fajar — HMG30 89K + GAS15 219K + DSM30 159K = 467K, ship 22K → 489K
('e100000000000000000000000000000008', 'GNB-20260613-0001', 'a100000000000000000000000000000008',
 '{"recipient_name":"Fajar Nugraha","phone":"081234567808","address_line1":"Jl. Tulip No.4","kota_kabupaten":"Denpasar","provinsi":"Bali","postal_code":"80226"}',
 467000, 0, 22000, 0, 489000,
 'J&T', 'REGULAR', 'JT4445556808H',
 now()-INTERVAL '8 days', now()-INTERVAL '5 days', 'delivered',
 now()-INTERVAL '10 days', now()-INTERVAL '5 days'),

-- === SHIPPED (2 orders) ===

-- O09: Rendi — GAS15 219K, ship 20K → 239K
('e100000000000000000000000000000009', 'GNB-20260614-0001', 'a100000000000000000000000000000009',
 '{"recipient_name":"Rendi Saputra","phone":"081234567809","address_line1":"Jl. Sakura No.11","kota_kabupaten":"Palembang","provinsi":"Sumatera Selatan","postal_code":"30111"}',
 219000, 0, 20000, 0, 239000,
 'JNE', 'REG', 'JNE6667778809I',
 now()-INTERVAL '3 days', NULL, 'shipped',
 now()-INTERVAL '5 days', now()-INTERVAL '3 days'),

-- O10: Hendra — BCC50 169K + HMG50 119K = 288K, ship 32K → 320K
('e100000000000000000000000000000010', 'GNB-20260614-0002', 'a100000000000000000000000000000010',
 '{"recipient_name":"Hendra Gunawan","phone":"081234567810","address_line1":"Jl. Melati No.7","kota_kabupaten":"Balikpapan","provinsi":"Kalimantan Timur","postal_code":"76111"}',
 288000, 0, 32000, 0, 320000,
 'SiCepat', 'BEST', 'SC8889990810J',
 now()-INTERVAL '2 days', NULL, 'shipped',
 now()-INTERVAL '4 days', now()-INTERVAL '2 days'),

-- === PROCESSING (2 orders) ===

-- O11: Siti — GAS30 299K + DSM50 209K = 508K, ship 12K → 520K
('e100000000000000000000000000000011', 'GNB-20260615-0001', 'a100000000000000000000000000000001',
 '{"recipient_name":"Siti Rahayu","phone":"081234567801","address_line1":"Jl. Melati No.5","kota_kabupaten":"Jakarta Selatan","provinsi":"DKI Jakarta","postal_code":"12930"}',
 508000, 0, 12000, 0, 520000,
 'JNE', 'YES', NULL,
 NULL, NULL, 'processing',
 now()-INTERVAL '32 hours', now()-INTERVAL '32 hours'),

-- O12: Rina — HMG30 89K, ship 18K → 107K
('e100000000000000000000000000000012', 'GNB-20260615-0002', 'a100000000000000000000000000000003',
 '{"recipient_name":"Rina Santoso","phone":"081234567803","address_line1":"Jl. Anggrek No.8","kota_kabupaten":"Surabaya","provinsi":"Jawa Timur","postal_code":"60241"}',
 89000, 0, 18000, 0, 107000,
 'J&T', 'REGULAR', NULL,
 NULL, NULL, 'processing',
 now()-INTERVAL '20 hours', now()-INTERVAL '20 hours'),

-- === PAID (2 orders) ===

-- O13: Lestari — DSM50 209K, ship 15K → 224K
('e100000000000000000000000000000013', 'GNB-20260616-0001', 'a100000000000000000000000000000005',
 '{"recipient_name":"Lestari Wijaya","phone":"081234567805","address_line1":"Jl. Kenanga No.17","kota_kabupaten":"Semarang","provinsi":"Jawa Tengah","postal_code":"50132"}',
 209000, 0, 15000, 0, 224000,
 'SiCepat', 'REG', NULL,
 NULL, NULL, 'paid',
 now()-INTERVAL '6 hours', now()-INTERVAL '6 hours'),

-- O14: Agus — GAS30 299K, ship 28K → 327K
('e100000000000000000000000000000014', 'GNB-20260616-0002', 'a100000000000000000000000000000007',
 '{"recipient_name":"Agus Pratama","phone":"081234567807","address_line1":"Jl. Bougainvillea No.9","kota_kabupaten":"Makassar","provinsi":"Sulawesi Selatan","postal_code":"90111"}',
 299000, 0, 28000, 0, 327000,
 'JNE', 'REG', NULL,
 NULL, NULL, 'paid',
 now()-INTERVAL '3 hours', now()-INTERVAL '3 hours'),

-- === CANCELLED (1 order) ===

-- O15: Dewi — GAS15 219K, ship 15K → 234K (dibatalkan)
('e100000000000000000000000000000015', 'GNB-20260610-0001', 'a100000000000000000000000000000002',
 '{"recipient_name":"Dewi Kusuma","phone":"081234567802","address_line1":"Jl. Dahlia No.12","kota_kabupaten":"Bandung","provinsi":"Jawa Barat","postal_code":"40115"}',
 219000, 0, 15000, 0, 234000,
 NULL, NULL, NULL,
 NULL, NULL, 'cancelled',
 now()-INTERVAL '21 days', now()-INTERVAL '20 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 6: ORDER ITEMS
-- ============================================================

INSERT INTO public.order_items (
    id, order_id, product_id, variant_id,
    product_name, variant_name, sku,
    quantity, unit_price, total_price, created_at
) VALUES

-- O01: HMG30 + BCC30
('f100000000000000000000000000000001', 'e100000000000000000000000000000001',
 'c100000000000000000000000000000001', 'd100000000000000000000000000000001',
 'Hydra Moist Gel', '30ml', 'GNB-HMG-030', 1, 89000, 89000, now()-INTERVAL '30 days'),
('f100000000000000000000000000000002', 'e100000000000000000000000000000001',
 'c100000000000000000000000000000002', 'd100000000000000000000000000000003',
 'Bright & Care Cream', '30ml', 'GNB-BCC-030', 1, 129000, 129000, now()-INTERVAL '30 days'),

-- O02: BCC50 x2
('f100000000000000000000000000000003', 'e100000000000000000000000000000002',
 'c100000000000000000000000000000002', 'd100000000000000000000000000000004',
 'Bright & Care Cream', '50ml', 'GNB-BCC-050', 2, 169000, 338000, now()-INTERVAL '28 days'),

-- O03: GAS15
('f100000000000000000000000000000004', 'e100000000000000000000000000000003',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000005',
 'GlowAge Serum', '15ml', 'GNB-GAS-015', 1, 219000, 219000, now()-INTERVAL '26 days'),

-- O04: HMG50 + GAS15
('f100000000000000000000000000000005', 'e100000000000000000000000000000004',
 'c100000000000000000000000000000001', 'd100000000000000000000000000000002',
 'Hydra Moist Gel', '50ml', 'GNB-HMG-050', 1, 119000, 119000, now()-INTERVAL '24 days'),
('f100000000000000000000000000000006', 'e100000000000000000000000000000004',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000005',
 'GlowAge Serum', '15ml', 'GNB-GAS-015', 1, 219000, 219000, now()-INTERVAL '24 days'),

-- O05: DSM30
('f100000000000000000000000000000007', 'e100000000000000000000000000000005',
 'c100000000000000000000000000000004', 'd100000000000000000000000000000007',
 'Daily SPF Moisturizer', '30ml', 'GNB-DSM-030', 1, 159000, 159000, now()-INTERVAL '22 days'),

-- O06: GAS30
('f100000000000000000000000000000008', 'e100000000000000000000000000000006',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000006',
 'GlowAge Serum', '30ml', 'GNB-GAS-030', 1, 299000, 299000, now()-INTERVAL '14 days'),

-- O07: BCC30
('f100000000000000000000000000000009', 'e100000000000000000000000000000007',
 'c100000000000000000000000000000002', 'd100000000000000000000000000000003',
 'Bright & Care Cream', '30ml', 'GNB-BCC-030', 1, 129000, 129000, now()-INTERVAL '12 days'),

-- O08: HMG30 + GAS15 + DSM30
('f100000000000000000000000000000010', 'e100000000000000000000000000000008',
 'c100000000000000000000000000000001', 'd100000000000000000000000000000001',
 'Hydra Moist Gel', '30ml', 'GNB-HMG-030', 1, 89000, 89000, now()-INTERVAL '10 days'),
('f100000000000000000000000000000011', 'e100000000000000000000000000000008',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000005',
 'GlowAge Serum', '15ml', 'GNB-GAS-015', 1, 219000, 219000, now()-INTERVAL '10 days'),
('f100000000000000000000000000000012', 'e100000000000000000000000000000008',
 'c100000000000000000000000000000004', 'd100000000000000000000000000000007',
 'Daily SPF Moisturizer', '30ml', 'GNB-DSM-030', 1, 159000, 159000, now()-INTERVAL '10 days'),

-- O09: GAS15
('f100000000000000000000000000000013', 'e100000000000000000000000000000009',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000005',
 'GlowAge Serum', '15ml', 'GNB-GAS-015', 1, 219000, 219000, now()-INTERVAL '5 days'),

-- O10: BCC50 + HMG50
('f100000000000000000000000000000014', 'e100000000000000000000000000000010',
 'c100000000000000000000000000000002', 'd100000000000000000000000000000004',
 'Bright & Care Cream', '50ml', 'GNB-BCC-050', 1, 169000, 169000, now()-INTERVAL '4 days'),
('f100000000000000000000000000000015', 'e100000000000000000000000000000010',
 'c100000000000000000000000000000001', 'd100000000000000000000000000000002',
 'Hydra Moist Gel', '50ml', 'GNB-HMG-050', 1, 119000, 119000, now()-INTERVAL '4 days'),

-- O11: GAS30 + DSM50
('f100000000000000000000000000000016', 'e100000000000000000000000000000011',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000006',
 'GlowAge Serum', '30ml', 'GNB-GAS-030', 1, 299000, 299000, now()-INTERVAL '32 hours'),
('f100000000000000000000000000000017', 'e100000000000000000000000000000011',
 'c100000000000000000000000000000004', 'd100000000000000000000000000000008',
 'Daily SPF Moisturizer', '50ml', 'GNB-DSM-050', 1, 209000, 209000, now()-INTERVAL '32 hours'),

-- O12: HMG30
('f100000000000000000000000000000018', 'e100000000000000000000000000000012',
 'c100000000000000000000000000000001', 'd100000000000000000000000000000001',
 'Hydra Moist Gel', '30ml', 'GNB-HMG-030', 1, 89000, 89000, now()-INTERVAL '20 hours'),

-- O13: DSM50
('f100000000000000000000000000000019', 'e100000000000000000000000000000013',
 'c100000000000000000000000000000004', 'd100000000000000000000000000000008',
 'Daily SPF Moisturizer', '50ml', 'GNB-DSM-050', 1, 209000, 209000, now()-INTERVAL '6 hours'),

-- O14: GAS30
('f100000000000000000000000000000020', 'e100000000000000000000000000000014',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000006',
 'GlowAge Serum', '30ml', 'GNB-GAS-030', 1, 299000, 299000, now()-INTERVAL '3 hours'),

-- O15: GAS15 (cancelled)
('f100000000000000000000000000000021', 'e100000000000000000000000000000015',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000005',
 'GlowAge Serum', '15ml', 'GNB-GAS-015', 1, 219000, 219000, now()-INTERVAL '21 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 7: PAYMENTS
-- Semua order kecuali "pending" dan "cancelled"
-- midtrans_transaction_status: settlement = berhasil
-- ============================================================

INSERT INTO public.payments (
    id, order_id,
    midtrans_order_id, midtrans_transaction_id,
    midtrans_gross_amount, midtrans_currency,
    midtrans_status_code, midtrans_transaction_status, midtrans_fraud_status,
    payment_type,
    created_at, updated_at
) VALUES

('g100000000000000000000000000000001', 'e100000000000000000000000000000001',
 'GNB-20260601-0001', 'TXN-20260601-A001001', 230000, 'IDR',
 '200', 'settlement', 'accept', 'bank_transfer',
 now()-INTERVAL '30 days', now()-INTERVAL '30 days'),

('g100000000000000000000000000000002', 'e100000000000000000000000000000002',
 'GNB-20260603-0001', 'TXN-20260603-A001002', 333000, 'IDR',
 '200', 'settlement', 'accept', 'gopay',
 now()-INTERVAL '28 days', now()-INTERVAL '28 days'),

('g100000000000000000000000000000003', 'e100000000000000000000000000000003',
 'GNB-20260605-0001', 'TXN-20260605-A001003', 237000, 'IDR',
 '200', 'settlement', 'accept', 'qris',
 now()-INTERVAL '26 days', now()-INTERVAL '26 days'),

('g100000000000000000000000000000004', 'e100000000000000000000000000000004',
 'GNB-20260607-0001', 'TXN-20260607-A001004', 322000, 'IDR',
 '200', 'settlement', 'accept', 'bank_transfer',
 now()-INTERVAL '24 days', now()-INTERVAL '24 days'),

('g100000000000000000000000000000005', 'e100000000000000000000000000000005',
 'GNB-20260609-0001', 'TXN-20260609-A001005', 171000, 'IDR',
 '200', 'settlement', 'accept', 'shopeepay',
 now()-INTERVAL '22 days', now()-INTERVAL '22 days'),

('g100000000000000000000000000000006', 'e100000000000000000000000000000006',
 'GNB-20260611-0001', 'TXN-20260611-A001006', 324000, 'IDR',
 '200', 'settlement', 'accept', 'qris',
 now()-INTERVAL '14 days', now()-INTERVAL '14 days'),

('g100000000000000000000000000000007', 'e100000000000000000000000000000007',
 'GNB-20260612-0001', 'TXN-20260612-A001007', 157000, 'IDR',
 '200', 'settlement', 'accept', 'bank_transfer',
 now()-INTERVAL '12 days', now()-INTERVAL '12 days'),

('g100000000000000000000000000000008', 'e100000000000000000000000000000008',
 'GNB-20260613-0001', 'TXN-20260613-A001008', 489000, 'IDR',
 '200', 'settlement', 'accept', 'gopay',
 now()-INTERVAL '10 days', now()-INTERVAL '10 days'),

('g100000000000000000000000000000009', 'e100000000000000000000000000000009',
 'GNB-20260614-0001', 'TXN-20260614-A001009', 239000, 'IDR',
 '200', 'settlement', 'accept', 'bank_transfer',
 now()-INTERVAL '5 days', now()-INTERVAL '5 days'),

('g100000000000000000000000000000010', 'e100000000000000000000000000000010',
 'GNB-20260614-0002', 'TXN-20260614-A001010', 320000, 'IDR',
 '200', 'settlement', 'accept', 'qris',
 now()-INTERVAL '4 days', now()-INTERVAL '4 days'),

('g100000000000000000000000000000011', 'e100000000000000000000000000000011',
 'GNB-20260615-0001', 'TXN-20260615-A001011', 520000, 'IDR',
 '200', 'settlement', 'accept', 'gopay',
 now()-INTERVAL '32 hours', now()-INTERVAL '32 hours'),

('g100000000000000000000000000000012', 'e100000000000000000000000000000012',
 'GNB-20260615-0002', 'TXN-20260615-A001012', 107000, 'IDR',
 '200', 'settlement', 'accept', 'shopeepay',
 now()-INTERVAL '20 hours', now()-INTERVAL '20 hours'),

('g100000000000000000000000000000013', 'e100000000000000000000000000000013',
 'GNB-20260616-0001', 'TXN-20260616-A001013', 224000, 'IDR',
 '200', 'settlement', 'accept', 'qris',
 now()-INTERVAL '6 hours', now()-INTERVAL '6 hours'),

('g100000000000000000000000000000014', 'e100000000000000000000000000000014',
 'GNB-20260616-0002', 'TXN-20260616-A001014', 327000, 'IDR',
 '200', 'settlement', 'accept', 'bank_transfer',
 now()-INTERVAL '3 hours', now()-INTERVAL '3 hours')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 8: RETURN POLICY
-- ============================================================

INSERT INTO public.return_policies (
    id, name, is_active,
    return_window_days, exchange_window_days, refund_window_days,
    auto_approve_reasons, manual_review_reasons,
    auto_approve_max_amount, require_evidence, min_evidence_count,
    max_returns_per_month, store_credit_bonus_pct,
    notes, created_at, updated_at
) VALUES (
    'h100000000000000000000000000000001',
    'Kebijakan Retur Standar Ginabo', TRUE,
    7, 7, 14,
    ARRAY['missing_item','wrong_item'],
    ARRAY['allergic_reaction','defective'],
    500000, TRUE, 1, 5, 5,
    'Kebijakan retur default: 7 hari sejak barang diterima. Refund via transfer bank atau store credit (+5% bonus).',
    now() - INTERVAL '60 days', now()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 9: RETURNS (3 contoh kasus retur)
-- ============================================================

INSERT INTO public.returns (
    id, return_number,
    order_id, profile_id, policy_id,
    return_type, preferred_resolution,
    status,
    customer_note,
    risk_score,
    created_at, updated_at
) VALUES

-- RET-1: Siti — salah kirim (approved, refund)
('i100000000000000000000000000000001', 'RET-2026-000001',
 'e100000000000000000000000000000001', 'a100000000000000000000000000000001',
 'h100000000000000000000000000000001',
 'wrong_item', 'refund',
 'approved',
 'Produk yang diterima bukan Hydra Moist Gel melainkan Bright & Care Cream. Mohon ditukar atau direfund.',
 10,
 now()-INTERVAL '23 days', now()-INTERVAL '22 days'),

-- RET-2: Rina — produk cacat (under_review)
('i100000000000000000000000000000002', 'RET-2026-000002',
 'e100000000000000000000000000000003', 'a100000000000000000000000000000003',
 'h100000000000000000000000000000001',
 'defective', 'exchange',
 'under_review',
 'Serum bocor saat diterima, kemasan rusak. Sudah upload foto bukti. Minta ditukar unit baru.',
 25,
 now()-INTERVAL '18 days', now()-INTERVAL '17 days'),

-- RET-3: Budi — reaksi alergi (approved, store_credit)
('i100000000000000000000000000000003', 'RET-2026-000003',
 'e100000000000000000000000000000006', 'a100000000000000000000000000000006',
 'h100000000000000000000000000000001',
 'allergic_reaction', 'store_credit',
 'approved',
 'Kulit saya bereaksi merah-merah setelah pakai GlowAge Serum. Berhenti pakai setelah 3 hari. Minta refund store credit.',
 20,
 now()-INTERVAL '7 days', now()-INTERVAL '6 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 10: RETURN ITEMS
-- ============================================================

INSERT INTO public.return_items (
    id, return_id, order_item_id,
    product_id, variant_id,
    product_name, variant_name, sku,
    quantity_returned,
    return_reason_detail,
    condition_on_receipt,
    created_at
) VALUES

-- RET-1 items: Hydra Moist Gel 30ml yang salah kirim
('j100000000000000000000000000000001',
 'i100000000000000000000000000000001',
 'f100000000000000000000000000000001',
 'c100000000000000000000000000000001', 'd100000000000000000000000000000001',
 'Hydra Moist Gel', '30ml', 'GNB-HMG-030',
 1, 'Salah kirim produk — diterima Bright & Care Cream bukan Hydra Moist Gel',
 'unopened',
 now()-INTERVAL '23 days'),

-- RET-2 items: GlowAge Serum 15ml cacat
('j100000000000000000000000000000002',
 'i100000000000000000000000000000002',
 'f100000000000000000000000000000004',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000005',
 'GlowAge Serum', '15ml', 'GNB-GAS-015',
 1, 'Kemasan bocor, isi serum keluar sekitar 30%. Foto sudah diupload.',
 'damaged',
 now()-INTERVAL '18 days'),

-- RET-3 items: GlowAge Serum 30ml reaksi alergi
('j100000000000000000000000000000003',
 'i100000000000000000000000000000003',
 'f100000000000000000000000000000008',
 'c100000000000000000000000000000003', 'd100000000000000000000000000000006',
 'GlowAge Serum', '30ml', 'GNB-GAS-030',
 1, 'Reaksi alergi: kulit kemerahan dan gatal setelah pemakaian hari ke-3.',
 'opened',
 now()-INTERVAL '7 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Restore FK constraint enforcement
-- ============================================================
SET LOCAL session_replication_role = DEFAULT;

COMMIT;

-- ============================================================
-- VERIFIKASI (opsional — run setelah seed berhasil)
-- ============================================================
-- SELECT 'profiles'    AS tabel, COUNT(*) AS jumlah FROM public.profiles    WHERE id LIKE 'a1%'
-- UNION ALL
-- SELECT 'products',   COUNT(*) FROM public.products    WHERE id LIKE 'c1%'
-- UNION ALL
-- SELECT 'orders',     COUNT(*) FROM public.orders      WHERE id LIKE 'e1%'
-- UNION ALL
-- SELECT 'payments',   COUNT(*) FROM public.payments    WHERE id LIKE 'g1%'
-- UNION ALL
-- SELECT 'returns',    COUNT(*) FROM public.returns     WHERE id LIKE 'i1%';
