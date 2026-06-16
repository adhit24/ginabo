-- ============================================================
-- GINABO — FULL SIMULATION SEED DATA
-- Project: lvmyjtzfohlorocrjvcx (ginabo.id)
-- Date: 2026-06-16
--
-- HOW TO RUN:
--   1. Buka: https://supabase.com/dashboard/project/lvmyjtzfohlorocrjvcx/sql/new
--   2. Paste seluruh isi file ini, klik RUN
--
-- DATA YANG AKAN DIBUAT:
--   15 customers (profiles)
--   4 kategori + 6 produk + 12 varian
--   25 orders + order_items + payments
--   12 bookings (konsultasi kulit)
--   3 return cases + items
--   KPI realistis: revenue ~Rp 7,2 jt / 30 hari
-- ============================================================

BEGIN;
SET LOCAL session_replication_role = replica;

-- ============================================================
-- SECTION 1: PROFILES — 15 PELANGGAN
-- ============================================================

INSERT INTO public.profiles (
    id, email, full_name, phone_number, whatsapp_number,
    skin_type, skin_concerns, is_active, role,
    challenge_streak, created_at, updated_at
) VALUES
  ('a1000000-0000-0000-0000-000000000001','siti.rahayu@gmail.com','Siti Rahayu','+6281234567801','+6281234567801','dry',ARRAY['brightening','hydration'],TRUE,'customer',14,now()-INTERVAL'45 days',now()-INTERVAL'2 days'),
  ('a1000000-0000-0000-0000-000000000002','dewi.kusuma@gmail.com','Dewi Kusuma','+6281234567802','+6281234567802','combination',ARRAY['acne','pores'],TRUE,'customer',7,now()-INTERVAL'40 days',now()-INTERVAL'1 day'),
  ('a1000000-0000-0000-0000-000000000003','rina.santoso@gmail.com','Rina Santoso','+6281234567803','+6281234567803','oily',ARRAY['acne','oiliness'],TRUE,'customer',21,now()-INTERVAL'38 days',now()),
  ('a1000000-0000-0000-0000-000000000004','maya.putri@gmail.com','Maya Putri','+6281234567804','+6281234567804','sensitive',ARRAY['redness','soothing'],TRUE,'customer',5,now()-INTERVAL'35 days',now()-INTERVAL'3 days'),
  ('a1000000-0000-0000-0000-000000000005','lestari.wijaya@gmail.com','Lestari Wijaya','+6281234567805','+6281234567805','normal',ARRAY['anti_aging','brightening'],TRUE,'customer',18,now()-INTERVAL'30 days',now()-INTERVAL'1 day'),
  ('a1000000-0000-0000-0000-000000000006','budi.setiawan@gmail.com','Budi Setiawan','+6281234567806','+6281234567806','oily',ARRAY['acne'],TRUE,'customer',3,now()-INTERVAL'28 days',now()-INTERVAL'5 days'),
  ('a1000000-0000-0000-0000-000000000007','agus.pratama@gmail.com','Agus Pratama','+6281234567807','+6281234567807','combination',ARRAY['hyperpigmentation','brightening'],TRUE,'customer',0,now()-INTERVAL'25 days',now()-INTERVAL'4 days'),
  ('a1000000-0000-0000-0000-000000000008','fajar.nugraha@gmail.com','Fajar Nugraha','+6281234567808','+6281234567808','dry',ARRAY['hydration','anti_aging'],TRUE,'customer',11,now()-INTERVAL'20 days',now()-INTERVAL'2 days'),
  ('a1000000-0000-0000-0000-000000000009','rendi.saputra@gmail.com','Rendi Saputra','+6281234567809','+6281234567809','normal',ARRAY['brightening'],TRUE,'customer',6,now()-INTERVAL'18 days',now()-INTERVAL'1 day'),
  ('a1000000-0000-0000-0000-000000000010','hendra.gunawan@gmail.com','Hendra Gunawan','+6281234567810','+6281234567810','combination',ARRAY['acne','pores'],TRUE,'customer',9,now()-INTERVAL'15 days',now()),
  ('a1000000-0000-0000-0000-000000000011','anita.susanti@gmail.com','Anita Susanti','+6281234567811','+6281234567811','sensitive',ARRAY['redness','acne'],TRUE,'customer',2,now()-INTERVAL'12 days',now()-INTERVAL'1 day'),
  ('a1000000-0000-0000-0000-000000000012','wulandari.np@gmail.com','Wulandari Nurul Putri','+6281234567812','+6281234567812','dry',ARRAY['anti_aging','brightening'],TRUE,'customer',16,now()-INTERVAL'10 days',now()),
  ('a1000000-0000-0000-0000-000000000013','yolanda.safitri@gmail.com','Yolanda Safitri','+6281234567813','+6281234567813','oily',ARRAY['acne','oiliness'],TRUE,'customer',4,now()-INTERVAL'8 days',now()-INTERVAL'1 day'),
  ('a1000000-0000-0000-0000-000000000014','dimas.ardiansyah@gmail.com','Dimas Ardiansyah','+6281234567814','+6281234567814','combination',ARRAY['brightening'],TRUE,'customer',0,now()-INTERVAL'5 days',now()-INTERVAL'1 day'),
  ('a1000000-0000-0000-0000-000000000015','nurul.hidayati@gmail.com','Nurul Hidayati','+6281234567815','+6281234567815','normal',ARRAY['hydration','soothing'],TRUE,'customer',1,now()-INTERVAL'3 days',now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: KATEGORI
-- ============================================================

INSERT INTO public.categories (id, name, slug, description, is_active, sort_order, created_at, updated_at) VALUES
  ('b1000000-0000-0000-0000-000000000001','Pelembab','pelembab','Pelembab wajah harian',TRUE,1,now(),now()),
  ('b1000000-0000-0000-0000-000000000002','Serum','serum','Serum perawatan intensif',TRUE,2,now(),now()),
  ('b1000000-0000-0000-0000-000000000003','Sunscreen','sunscreen','Perlindungan UV & SPF',TRUE,3,now(),now()),
  ('b1000000-0000-0000-0000-000000000004','Pembersih','pembersih','Cleanser & toner',TRUE,4,now(),now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 3: PRODUK (6 produk)
-- ============================================================
-- Harga dasar (IDR):
--   HMG  = 89.000   | BCC  = 129.000 | GAS  = 219.000
--   DSM  = 159.000  | GFC  = 95.000  | PGT  = 145.000

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
  ('c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001',
   'Hydra Moist Gel','hydra-moist-gel',
   'Gel pelembab ringan dengan 5% Niacinamide & Hyaluronic Acid. Cocok untuk kulit berminyak & kombinasi.',
   ARRAY['oily','combination','normal'],ARRAY['hydration','pores','brightening'],
   89000,120000,32000,'GNB-HMG-001',TRUE,148,10,
   TRUE,TRUE,TRUE,FALSE,1,80,342,4.6,87,
   now()-INTERVAL'60 days',now()),

  ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000001',
   'Bright & Care Cream','bright-care-cream',
   'Krim pencerah Alpha Arbutin 2% & Vitamin C untuk kulit cerah merata tanpa iritasi.',
   ARRAY['dry','normal','combination'],ARRAY['brightening','hyperpigmentation','anti_aging'],
   129000,159000,48000,'GNB-BCC-001',TRUE,89,10,
   TRUE,TRUE,TRUE,FALSE,2,100,218,4.7,56,
   now()-INTERVAL'55 days',now()),

  ('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000002',
   'GlowAge Serum','glowage-serum',
   'Serum anti-aging Retinol 0.3% & Peptide Complex untuk kulit tampak muda dan bercahaya.',
   ARRAY['dry','normal','combination','sensitive'],ARRAY['anti_aging','brightening','hydration'],
   219000,289000,82000,'GNB-GAS-001',TRUE,56,10,
   TRUE,TRUE,FALSE,TRUE,3,120,124,4.8,41,
   now()-INTERVAL'30 days',now()),

  ('c1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000003',
   'Daily SPF Moisturizer','daily-spf-moisturizer',
   'Pelembab harian SPF 35 PA+++ perlindungan UV ringan nyaman dipakai seharian.',
   ARRAY['normal','combination','oily'],ARRAY['sun_protection','hydration','brightening'],
   159000,199000,58000,'GNB-DSM-001',TRUE,73,10,
   FALSE,TRUE,FALSE,TRUE,4,90,98,4.5,28,
   now()-INTERVAL'20 days',now()),

  ('c1000000-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000004',
   'Gentle Foam Cleanser','gentle-foam-cleanser',
   'Sabun cuci muka berbusa lembut pH-balanced untuk membersihkan tanpa mengikis kelembaban.',
   ARRAY['oily','combination','normal','sensitive'],ARRAY['acne','pores','hydration'],
   95000,125000,35000,'GNB-GFC-001',TRUE,112,15,
   FALSE,TRUE,TRUE,FALSE,5,150,189,4.4,63,
   now()-INTERVAL'50 days',now()),

  ('c1000000-0000-0000-0000-000000000006','b1000000-0000-0000-0000-000000000002',
   'Pore & Glow Toner','pore-glow-toner',
   'Toner AHA/BHA 5% untuk mengecilkan pori, meratakan tekstur dan mencerahkan kulit kusam.',
   ARRAY['oily','combination'],ARRAY['acne','pores','brightening','oiliness'],
   145000,185000,52000,'GNB-PGT-001',TRUE,67,10,
   TRUE,TRUE,FALSE,TRUE,6,200,76,4.6,34,
   now()-INTERVAL'15 days',now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 4: VARIAN PRODUK (2 varian per produk)
-- ============================================================
-- HMG  30ml=89K    50ml=89K+30K=119K
-- BCC  30ml=129K   50ml=129K+40K=169K
-- GAS  15ml=219K   30ml=219K+80K=299K
-- DSM  30ml=159K   50ml=159K+50K=209K
-- GFC  100ml=95K   150ml=95K+25K=120K
-- PGT  100ml=145K  200ml=145K+45K=190K

INSERT INTO public.product_variants (id, product_id, name, sku, price_modifier, stock_quantity, weight_grams, is_active, sort_order, created_at, updated_at) VALUES
  ('d1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','30ml','GNB-HMG-030',0,80,85,TRUE,1,now(),now()),
  ('d1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000001','50ml','GNB-HMG-050',30000,68,130,TRUE,2,now(),now()),
  ('d1000000-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000002','30ml','GNB-BCC-030',0,45,90,TRUE,1,now(),now()),
  ('d1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000002','50ml','GNB-BCC-050',40000,44,135,TRUE,2,now(),now()),
  ('d1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000003','15ml','GNB-GAS-015',0,30,65,TRUE,1,now(),now()),
  ('d1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000003','30ml','GNB-GAS-030',80000,26,100,TRUE,2,now(),now()),
  ('d1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000004','30ml','GNB-DSM-030',0,38,95,TRUE,1,now(),now()),
  ('d1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000004','50ml','GNB-DSM-050',50000,35,140,TRUE,2,now(),now()),
  ('d1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000005','100ml','GNB-GFC-100',0,60,155,TRUE,1,now(),now()),
  ('d1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000005','150ml','GNB-GFC-150',25000,52,220,TRUE,2,now(),now()),
  ('d1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000006','100ml','GNB-PGT-100',0,35,205,TRUE,1,now(),now()),
  ('d1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000006','200ml','GNB-PGT-200',45000,32,380,TRUE,2,now(),now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 5: ORDERS (25 pesanan)
-- Status distribusi:
--   completed  8  | delivered 5 | shipped   4
--   processing 4  | paid      2 | cancelled 2
-- ============================================================

INSERT INTO public.orders (
    id, order_number, profile_id, shipping_address,
    subtotal, discount_amount, shipping_cost, tax_amount, total_amount,
    shipping_courier, shipping_service, tracking_number,
    shipped_at, delivered_at, status, created_at, updated_at
) VALUES

-- ==================== COMPLETED (8) ====================

-- C01 Siti: HMG30(89)+BCC30(129)=218, ship12 → 230
('e1000000-0000-0000-0000-000000000001','GNB-20260528-0001','a1000000-0000-0000-0000-000000000001',
 '{"recipient_name":"Siti Rahayu","phone":"081234567801","address_line1":"Jl. Melati No.5","kota_kabupaten":"Jakarta Selatan","provinsi":"DKI Jakarta","postal_code":"12930"}',
 218000,0,12000,0,230000,'JNE','REG','JNE001A20260528',
 now()-INTERVAL'32 days',now()-INTERVAL'29 days','completed',now()-INTERVAL'34 days',now()-INTERVAL'29 days'),

-- C02 Dewi: BCC50(169)×2=338, disc20, ship15 → 333
('e1000000-0000-0000-0000-000000000002','GNB-20260530-0001','a1000000-0000-0000-0000-000000000002',
 '{"recipient_name":"Dewi Kusuma","phone":"081234567802","address_line1":"Jl. Dahlia No.12","kota_kabupaten":"Bandung","provinsi":"Jawa Barat","postal_code":"40115"}',
 338000,20000,15000,0,333000,'J&T','REGULAR','JT002B20260530',
 now()-INTERVAL'30 days',now()-INTERVAL'26 days','completed',now()-INTERVAL'32 days',now()-INTERVAL'26 days'),

-- C03 Rina: GAS15(219), ship18 → 237
('e1000000-0000-0000-0000-000000000003','GNB-20260601-0001','a1000000-0000-0000-0000-000000000003',
 '{"recipient_name":"Rina Santoso","phone":"081234567803","address_line1":"Jl. Anggrek No.8","kota_kabupaten":"Surabaya","provinsi":"Jawa Timur","postal_code":"60241"}',
 219000,0,18000,0,237000,'SiCepat','BEST','SC003C20260601',
 now()-INTERVAL'28 days',now()-INTERVAL'24 days','completed',now()-INTERVAL'30 days',now()-INTERVAL'24 days'),

-- C04 Maya: HMG50(119)+GAS15(219)=338, disc30, ship14 → 322
('e1000000-0000-0000-0000-000000000004','GNB-20260602-0001','a1000000-0000-0000-0000-000000000004',
 '{"recipient_name":"Maya Putri","phone":"081234567804","address_line1":"Jl. Mawar No.3","kota_kabupaten":"Yogyakarta","provinsi":"DI Yogyakarta","postal_code":"55281"}',
 338000,30000,14000,0,322000,'JNE','YES','JNE004D20260602',
 now()-INTERVAL'26 days',now()-INTERVAL'22 days','completed',now()-INTERVAL'28 days',now()-INTERVAL'22 days'),

-- C05 Lestari: DSM30(159)+GFC100(95)=254, ship12 → 266
('e1000000-0000-0000-0000-000000000005','GNB-20260604-0001','a1000000-0000-0000-0000-000000000005',
 '{"recipient_name":"Lestari Wijaya","phone":"081234567805","address_line1":"Jl. Kenanga No.17","kota_kabupaten":"Semarang","provinsi":"Jawa Tengah","postal_code":"50132"}',
 254000,0,12000,0,266000,'J&T','REGULAR','JT005E20260604',
 now()-INTERVAL'24 days',now()-INTERVAL'21 days','completed',now()-INTERVAL'26 days',now()-INTERVAL'21 days'),

-- C06 Anita: GFC100(95)+PGT100(145)=240, ship12 → 252
('e1000000-0000-0000-0000-000000000006','GNB-20260606-0001','a1000000-0000-0000-0000-000000000011',
 '{"recipient_name":"Anita Susanti","phone":"081234567811","address_line1":"Jl. Cempaka No.2","kota_kabupaten":"Jakarta Timur","provinsi":"DKI Jakarta","postal_code":"13110"}',
 240000,0,12000,0,252000,'JNE','REG','JNE006F20260606',
 now()-INTERVAL'22 days',now()-INTERVAL'18 days','completed',now()-INTERVAL'24 days',now()-INTERVAL'18 days'),

-- C07 Wulan: GAS30(299)+BCC30(129)=428, disc40, ship14 → 402
('e1000000-0000-0000-0000-000000000007','GNB-20260608-0001','a1000000-0000-0000-0000-000000000012',
 '{"recipient_name":"Wulandari Nurul Putri","phone":"081234567812","address_line1":"Jl. Flamboyan No.7","kota_kabupaten":"Depok","provinsi":"Jawa Barat","postal_code":"16431"}',
 428000,40000,14000,0,402000,'SiCepat','BEST','SC007G20260608',
 now()-INTERVAL'20 days',now()-INTERVAL'17 days','completed',now()-INTERVAL'22 days',now()-INTERVAL'17 days'),

-- C08 Yolanda: DSM50(209)+GFC150(120)=329, ship18 → 347
('e1000000-0000-0000-0000-000000000008','GNB-20260610-0001','a1000000-0000-0000-0000-000000000013',
 '{"recipient_name":"Yolanda Safitri","phone":"081234567813","address_line1":"Jl. Nusa Indah No.15","kota_kabupaten":"Tangerang","provinsi":"Banten","postal_code":"15111"}',
 329000,0,18000,0,347000,'J&T','REGULAR','JT008H20260610',
 now()-INTERVAL'18 days',now()-INTERVAL'14 days','completed',now()-INTERVAL'20 days',now()-INTERVAL'14 days'),

-- ==================== DELIVERED (5) ====================

-- D01 Budi: GAS30(299), ship25 → 324
('e1000000-0000-0000-0000-000000000009','GNB-20260611-0001','a1000000-0000-0000-0000-000000000006',
 '{"recipient_name":"Budi Setiawan","phone":"081234567806","address_line1":"Jl. Flamboyan No.22","kota_kabupaten":"Medan","provinsi":"Sumatera Utara","postal_code":"20111"}',
 299000,0,25000,0,324000,'JNE','REG','JNE009I20260611',
 now()-INTERVAL'12 days',now()-INTERVAL'9 days','delivered',now()-INTERVAL'14 days',now()-INTERVAL'9 days'),

-- D02 Agus: BCC30(129), ship28 → 157
('e1000000-0000-0000-0000-000000000010','GNB-20260612-0001','a1000000-0000-0000-0000-000000000007',
 '{"recipient_name":"Agus Pratama","phone":"081234567807","address_line1":"Jl. Bougainvillea No.9","kota_kabupaten":"Makassar","provinsi":"Sulawesi Selatan","postal_code":"90111"}',
 129000,0,28000,0,157000,'SiCepat','BEST','SC010J20260612',
 now()-INTERVAL'10 days',now()-INTERVAL'7 days','delivered',now()-INTERVAL'12 days',now()-INTERVAL'7 days'),

-- D03 Fajar: HMG30(89)+GAS15(219)+DSM30(159)=467, ship22 → 489
('e1000000-0000-0000-0000-000000000011','GNB-20260613-0001','a1000000-0000-0000-0000-000000000008',
 '{"recipient_name":"Fajar Nugraha","phone":"081234567808","address_line1":"Jl. Tulip No.4","kota_kabupaten":"Denpasar","provinsi":"Bali","postal_code":"80226"}',
 467000,0,22000,0,489000,'J&T','REGULAR','JT011K20260613',
 now()-INTERVAL'8 days',now()-INTERVAL'5 days','delivered',now()-INTERVAL'10 days',now()-INTERVAL'5 days'),

-- D04 Dimas: PGT100(145)+GFC100(95)=240, disc15, ship12 → 237
('e1000000-0000-0000-0000-000000000012','GNB-20260613-0002','a1000000-0000-0000-0000-000000000014',
 '{"recipient_name":"Dimas Ardiansyah","phone":"081234567814","address_line1":"Jl. Cengkeh No.3","kota_kabupaten":"Bogor","provinsi":"Jawa Barat","postal_code":"16132"}',
 240000,15000,12000,0,237000,'JNE','REG','JNE012L20260613',
 now()-INTERVAL'7 days',now()-INTERVAL'4 days','delivered',now()-INTERVAL'9 days',now()-INTERVAL'4 days'),

-- D05 Nurul: BCC30(129)+DSM30(159)=288, ship15 → 303
('e1000000-0000-0000-0000-000000000013','GNB-20260614-0001','a1000000-0000-0000-0000-000000000015',
 '{"recipient_name":"Nurul Hidayati","phone":"081234567815","address_line1":"Jl. Kenari No.11","kota_kabupaten":"Bekasi","provinsi":"Jawa Barat","postal_code":"17111"}',
 288000,0,15000,0,303000,'J&T','REGULAR','JT013M20260614',
 now()-INTERVAL'5 days',now()-INTERVAL'2 days','delivered',now()-INTERVAL'7 days',now()-INTERVAL'2 days'),

-- ==================== SHIPPED (4) ====================

-- S01 Rendi: GAS15(219), ship20 → 239
('e1000000-0000-0000-0000-000000000014','GNB-20260614-0002','a1000000-0000-0000-0000-000000000009',
 '{"recipient_name":"Rendi Saputra","phone":"081234567809","address_line1":"Jl. Sakura No.11","kota_kabupaten":"Palembang","provinsi":"Sumatera Selatan","postal_code":"30111"}',
 219000,0,20000,0,239000,'JNE','REG','JNE014N20260614',
 now()-INTERVAL'3 days',NULL,'shipped',now()-INTERVAL'5 days',now()-INTERVAL'3 days'),

-- S02 Hendra: BCC50(169)+HMG50(119)=288, ship32 → 320
('e1000000-0000-0000-0000-000000000015','GNB-20260614-0003','a1000000-0000-0000-0000-000000000010',
 '{"recipient_name":"Hendra Gunawan","phone":"081234567810","address_line1":"Jl. Melati No.7","kota_kabupaten":"Balikpapan","provinsi":"Kalimantan Timur","postal_code":"76111"}',
 288000,0,32000,0,320000,'SiCepat','BEST','SC015O20260614',
 now()-INTERVAL'2 days',NULL,'shipped',now()-INTERVAL'4 days',now()-INTERVAL'2 days'),

-- S03 Siti (2nd order): GFC150(120)+PGT100(145)=265, ship12 → 277
('e1000000-0000-0000-0000-000000000016','GNB-20260615-0001','a1000000-0000-0000-0000-000000000001',
 '{"recipient_name":"Siti Rahayu","phone":"081234567801","address_line1":"Jl. Melati No.5","kota_kabupaten":"Jakarta Selatan","provinsi":"DKI Jakarta","postal_code":"12930"}',
 265000,0,12000,0,277000,'JNE','YES','JNE016P20260615',
 now()-INTERVAL'1 day',NULL,'shipped',now()-INTERVAL'3 days',now()-INTERVAL'1 day'),

-- S04 Anita (2nd order): GAS15(219)+HMG30(89)=308, ship12 → 320
('e1000000-0000-0000-0000-000000000017','GNB-20260615-0002','a1000000-0000-0000-0000-000000000011',
 '{"recipient_name":"Anita Susanti","phone":"081234567811","address_line1":"Jl. Cempaka No.2","kota_kabupaten":"Jakarta Timur","provinsi":"DKI Jakarta","postal_code":"13110"}',
 308000,0,12000,0,320000,'J&T','REGULAR','JT017Q20260615',
 now()-INTERVAL'22 hours',NULL,'shipped',now()-INTERVAL'2 days',now()-INTERVAL'22 hours'),

-- ==================== PROCESSING (4) ====================

-- P01 Lestari (2nd): GAS30(299)+DSM50(209)=508, ship12 → 520
('e1000000-0000-0000-0000-000000000018','GNB-20260615-0003','a1000000-0000-0000-0000-000000000005',
 '{"recipient_name":"Lestari Wijaya","phone":"081234567805","address_line1":"Jl. Kenanga No.17","kota_kabupaten":"Semarang","provinsi":"Jawa Tengah","postal_code":"50132"}',
 508000,0,12000,0,520000,'JNE','YES',NULL,
 NULL,NULL,'processing',now()-INTERVAL'36 hours',now()-INTERVAL'36 hours'),

-- P02 Rina (2nd): HMG30(89)+GFC100(95)=184, ship18 → 202
('e1000000-0000-0000-0000-000000000019','GNB-20260615-0004','a1000000-0000-0000-0000-000000000003',
 '{"recipient_name":"Rina Santoso","phone":"081234567803","address_line1":"Jl. Anggrek No.8","kota_kabupaten":"Surabaya","provinsi":"Jawa Timur","postal_code":"60241"}',
 184000,0,18000,0,202000,'SiCepat','REG',NULL,
 NULL,NULL,'processing',now()-INTERVAL'28 hours',now()-INTERVAL'28 hours'),

-- P03 Wulan (2nd): PGT200(190)+BCC30(129)=319, ship14 → 333
('e1000000-0000-0000-0000-000000000020','GNB-20260615-0005','a1000000-0000-0000-0000-000000000012',
 '{"recipient_name":"Wulandari Nurul Putri","phone":"081234567812","address_line1":"Jl. Flamboyan No.7","kota_kabupaten":"Depok","provinsi":"Jawa Barat","postal_code":"16431"}',
 319000,0,14000,0,333000,'J&T','REGULAR',NULL,
 NULL,NULL,'processing',now()-INTERVAL'18 hours',now()-INTERVAL'18 hours'),

-- P04 Dimas (2nd): DSM30(159), ship12 → 171
('e1000000-0000-0000-0000-000000000021','GNB-20260616-0001','a1000000-0000-0000-0000-000000000014',
 '{"recipient_name":"Dimas Ardiansyah","phone":"081234567814","address_line1":"Jl. Cengkeh No.3","kota_kabupaten":"Bogor","provinsi":"Jawa Barat","postal_code":"16132"}',
 159000,0,12000,0,171000,'JNE','REG',NULL,
 NULL,NULL,'processing',now()-INTERVAL'8 hours',now()-INTERVAL'8 hours'),

-- ==================== PAID (2) ====================

-- PD01 Fajar (2nd): GAS30(299), ship22 → 321
('e1000000-0000-0000-0000-000000000022','GNB-20260616-0002','a1000000-0000-0000-0000-000000000008',
 '{"recipient_name":"Fajar Nugraha","phone":"081234567808","address_line1":"Jl. Tulip No.4","kota_kabupaten":"Denpasar","provinsi":"Bali","postal_code":"80226"}',
 299000,0,22000,0,321000,'J&T','REGULAR',NULL,
 NULL,NULL,'paid',now()-INTERVAL'5 hours',now()-INTERVAL'5 hours'),

-- PD02 Nurul (2nd): PGT200(190)+HMG30(89)=279, ship15 → 294
('e1000000-0000-0000-0000-000000000023','GNB-20260616-0003','a1000000-0000-0000-0000-000000000015',
 '{"recipient_name":"Nurul Hidayati","phone":"081234567815","address_line1":"Jl. Kenari No.11","kota_kabupaten":"Bekasi","provinsi":"Jawa Barat","postal_code":"17111"}',
 279000,0,15000,0,294000,'SiCepat','REG',NULL,
 NULL,NULL,'paid',now()-INTERVAL'2 hours',now()-INTERVAL'2 hours'),

-- ==================== CANCELLED (2) ====================

-- X01 Agus: GAS15(219), ship28 → 247 (batal sebelum bayar)
('e1000000-0000-0000-0000-000000000024','GNB-20260607-0001','a1000000-0000-0000-0000-000000000007',
 '{"recipient_name":"Agus Pratama","phone":"081234567807","address_line1":"Jl. Bougainvillea No.9","kota_kabupaten":"Makassar","provinsi":"Sulawesi Selatan","postal_code":"90111"}',
 219000,0,28000,0,247000,NULL,NULL,NULL,
 NULL,NULL,'cancelled',now()-INTERVAL'23 days',now()-INTERVAL'22 days'),

-- X02 Hendra (batal): DSM50(209), ship32 → 241
('e1000000-0000-0000-0000-000000000025','GNB-20260609-0001','a1000000-0000-0000-0000-000000000010',
 '{"recipient_name":"Hendra Gunawan","phone":"081234567810","address_line1":"Jl. Melati No.7","kota_kabupaten":"Balikpapan","provinsi":"Kalimantan Timur","postal_code":"76111"}',
 209000,0,32000,0,241000,NULL,NULL,NULL,
 NULL,NULL,'cancelled',now()-INTERVAL'19 days',now()-INTERVAL'18 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 6: ORDER ITEMS
-- ============================================================

INSERT INTO public.order_items (
    id, order_id, product_id, variant_id,
    product_name, variant_name, sku,
    quantity, unit_price, total_price, created_at
) VALUES
-- C01
('f1000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','Hydra Moist Gel','30ml','GNB-HMG-030',1,89000,89000,now()-INTERVAL'34 days'),
('f1000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000003','Bright & Care Cream','30ml','GNB-BCC-030',1,129000,129000,now()-INTERVAL'34 days'),
-- C02
('f1000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000004','Bright & Care Cream','50ml','GNB-BCC-050',2,169000,338000,now()-INTERVAL'32 days'),
-- C03
('f1000000-0000-0000-0000-000000000004','e1000000-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000005','GlowAge Serum','15ml','GNB-GAS-015',1,219000,219000,now()-INTERVAL'30 days'),
-- C04
('f1000000-0000-0000-0000-000000000005','e1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000002','Hydra Moist Gel','50ml','GNB-HMG-050',1,119000,119000,now()-INTERVAL'28 days'),
('f1000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000005','GlowAge Serum','15ml','GNB-GAS-015',1,219000,219000,now()-INTERVAL'28 days'),
-- C05
('f1000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000007','Daily SPF Moisturizer','30ml','GNB-DSM-030',1,159000,159000,now()-INTERVAL'26 days'),
('f1000000-0000-0000-0000-000000000008','e1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000005','d1000000-0000-0000-0000-000000000009','Gentle Foam Cleanser','100ml','GNB-GFC-100',1,95000,95000,now()-INTERVAL'26 days'),
-- C06
('f1000000-0000-0000-0000-000000000009','e1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000005','d1000000-0000-0000-0000-000000000009','Gentle Foam Cleanser','100ml','GNB-GFC-100',1,95000,95000,now()-INTERVAL'24 days'),
('f1000000-0000-0000-0000-000000000010','e1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000006','d1000000-0000-0000-0000-000000000011','Pore & Glow Toner','100ml','GNB-PGT-100',1,145000,145000,now()-INTERVAL'24 days'),
-- C07
('f1000000-0000-0000-0000-000000000011','e1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000006','GlowAge Serum','30ml','GNB-GAS-030',1,299000,299000,now()-INTERVAL'22 days'),
('f1000000-0000-0000-0000-000000000012','e1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000003','Bright & Care Cream','30ml','GNB-BCC-030',1,129000,129000,now()-INTERVAL'22 days'),
-- C08
('f1000000-0000-0000-0000-000000000013','e1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000008','Daily SPF Moisturizer','50ml','GNB-DSM-050',1,209000,209000,now()-INTERVAL'20 days'),
('f1000000-0000-0000-0000-000000000014','e1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000005','d1000000-0000-0000-0000-000000000010','Gentle Foam Cleanser','150ml','GNB-GFC-150',1,120000,120000,now()-INTERVAL'20 days'),
-- D01
('f1000000-0000-0000-0000-000000000015','e1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000006','GlowAge Serum','30ml','GNB-GAS-030',1,299000,299000,now()-INTERVAL'14 days'),
-- D02
('f1000000-0000-0000-0000-000000000016','e1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000003','Bright & Care Cream','30ml','GNB-BCC-030',1,129000,129000,now()-INTERVAL'12 days'),
-- D03
('f1000000-0000-0000-0000-000000000017','e1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','Hydra Moist Gel','30ml','GNB-HMG-030',1,89000,89000,now()-INTERVAL'10 days'),
('f1000000-0000-0000-0000-000000000018','e1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000005','GlowAge Serum','15ml','GNB-GAS-015',1,219000,219000,now()-INTERVAL'10 days'),
('f1000000-0000-0000-0000-000000000019','e1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000007','Daily SPF Moisturizer','30ml','GNB-DSM-030',1,159000,159000,now()-INTERVAL'10 days'),
-- D04
('f1000000-0000-0000-0000-000000000020','e1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000006','d1000000-0000-0000-0000-000000000011','Pore & Glow Toner','100ml','GNB-PGT-100',1,145000,145000,now()-INTERVAL'9 days'),
('f1000000-0000-0000-0000-000000000021','e1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000005','d1000000-0000-0000-0000-000000000009','Gentle Foam Cleanser','100ml','GNB-GFC-100',1,95000,95000,now()-INTERVAL'9 days'),
-- D05
('f1000000-0000-0000-0000-000000000022','e1000000-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000003','Bright & Care Cream','30ml','GNB-BCC-030',1,129000,129000,now()-INTERVAL'7 days'),
('f1000000-0000-0000-0000-000000000023','e1000000-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000007','Daily SPF Moisturizer','30ml','GNB-DSM-030',1,159000,159000,now()-INTERVAL'7 days'),
-- S01
('f1000000-0000-0000-0000-000000000024','e1000000-0000-0000-0000-000000000014','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000005','GlowAge Serum','15ml','GNB-GAS-015',1,219000,219000,now()-INTERVAL'5 days'),
-- S02
('f1000000-0000-0000-0000-000000000025','e1000000-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000004','Bright & Care Cream','50ml','GNB-BCC-050',1,169000,169000,now()-INTERVAL'4 days'),
('f1000000-0000-0000-0000-000000000026','e1000000-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000002','Hydra Moist Gel','50ml','GNB-HMG-050',1,119000,119000,now()-INTERVAL'4 days'),
-- S03
('f1000000-0000-0000-0000-000000000027','e1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000005','d1000000-0000-0000-0000-000000000010','Gentle Foam Cleanser','150ml','GNB-GFC-150',1,120000,120000,now()-INTERVAL'3 days'),
('f1000000-0000-0000-0000-000000000028','e1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000006','d1000000-0000-0000-0000-000000000011','Pore & Glow Toner','100ml','GNB-PGT-100',1,145000,145000,now()-INTERVAL'3 days'),
-- S04
('f1000000-0000-0000-0000-000000000029','e1000000-0000-0000-0000-000000000017','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000005','GlowAge Serum','15ml','GNB-GAS-015',1,219000,219000,now()-INTERVAL'2 days'),
('f1000000-0000-0000-0000-000000000030','e1000000-0000-0000-0000-000000000017','c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','Hydra Moist Gel','30ml','GNB-HMG-030',1,89000,89000,now()-INTERVAL'2 days'),
-- P01
('f1000000-0000-0000-0000-000000000031','e1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000006','GlowAge Serum','30ml','GNB-GAS-030',1,299000,299000,now()-INTERVAL'36 hours'),
('f1000000-0000-0000-0000-000000000032','e1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000008','Daily SPF Moisturizer','50ml','GNB-DSM-050',1,209000,209000,now()-INTERVAL'36 hours'),
-- P02
('f1000000-0000-0000-0000-000000000033','e1000000-0000-0000-0000-000000000019','c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','Hydra Moist Gel','30ml','GNB-HMG-030',1,89000,89000,now()-INTERVAL'28 hours'),
('f1000000-0000-0000-0000-000000000034','e1000000-0000-0000-0000-000000000019','c1000000-0000-0000-0000-000000000005','d1000000-0000-0000-0000-000000000009','Gentle Foam Cleanser','100ml','GNB-GFC-100',1,95000,95000,now()-INTERVAL'28 hours'),
-- P03
('f1000000-0000-0000-0000-000000000035','e1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000006','d1000000-0000-0000-0000-000000000012','Pore & Glow Toner','200ml','GNB-PGT-200',1,190000,190000,now()-INTERVAL'18 hours'),
('f1000000-0000-0000-0000-000000000036','e1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000003','Bright & Care Cream','30ml','GNB-BCC-030',1,129000,129000,now()-INTERVAL'18 hours'),
-- P04
('f1000000-0000-0000-0000-000000000037','e1000000-0000-0000-0000-000000000021','c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000007','Daily SPF Moisturizer','30ml','GNB-DSM-030',1,159000,159000,now()-INTERVAL'8 hours'),
-- PD01
('f1000000-0000-0000-0000-000000000038','e1000000-0000-0000-0000-000000000022','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000006','GlowAge Serum','30ml','GNB-GAS-030',1,299000,299000,now()-INTERVAL'5 hours'),
-- PD02
('f1000000-0000-0000-0000-000000000039','e1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000006','d1000000-0000-0000-0000-000000000012','Pore & Glow Toner','200ml','GNB-PGT-200',1,190000,190000,now()-INTERVAL'2 hours'),
('f1000000-0000-0000-0000-000000000040','e1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','Hydra Moist Gel','30ml','GNB-HMG-030',1,89000,89000,now()-INTERVAL'2 hours'),
-- X01
('f1000000-0000-0000-0000-000000000041','e1000000-0000-0000-0000-000000000024','c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000005','GlowAge Serum','15ml','GNB-GAS-015',1,219000,219000,now()-INTERVAL'23 days'),
-- X02
('f1000000-0000-0000-0000-000000000042','e1000000-0000-0000-0000-000000000025','c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000008','Daily SPF Moisturizer','50ml','GNB-DSM-050',1,209000,209000,now()-INTERVAL'19 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 7: PAYMENTS (semua order kecuali cancelled)
-- ============================================================

INSERT INTO public.payments (
    id, order_id,
    midtrans_order_id, midtrans_transaction_id,
    midtrans_gross_amount, midtrans_currency,
    midtrans_status_code, midtrans_transaction_status, midtrans_fraud_status,
    payment_type, status,
    created_at, updated_at
) VALUES
('10000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000001','GNB-20260528-0001','TXN-28052026-001',230000,'IDR','200','settlement','accept','bank_transfer','success',now()-INTERVAL'34 days',now()-INTERVAL'34 days'),
('10000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000002','GNB-20260530-0001','TXN-30052026-002',333000,'IDR','200','settlement','accept','gopay','success',now()-INTERVAL'32 days',now()-INTERVAL'32 days'),
('10000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000003','GNB-20260601-0001','TXN-01062026-003',237000,'IDR','200','settlement','accept','qris','success',now()-INTERVAL'30 days',now()-INTERVAL'30 days'),
('10000000-0000-0000-0000-000000000004','e1000000-0000-0000-0000-000000000004','GNB-20260602-0001','TXN-02062026-004',322000,'IDR','200','settlement','accept','bank_transfer','success',now()-INTERVAL'28 days',now()-INTERVAL'28 days'),
('10000000-0000-0000-0000-000000000005','e1000000-0000-0000-0000-000000000005','GNB-20260604-0001','TXN-04062026-005',266000,'IDR','200','settlement','accept','shopeepay','success',now()-INTERVAL'26 days',now()-INTERVAL'26 days'),
('10000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000006','GNB-20260606-0001','TXN-06062026-006',252000,'IDR','200','settlement','accept','qris','success',now()-INTERVAL'24 days',now()-INTERVAL'24 days'),
('10000000-0000-0000-0000-000000000007','e1000000-0000-0000-0000-000000000007','GNB-20260608-0001','TXN-08062026-007',402000,'IDR','200','settlement','accept','gopay','success',now()-INTERVAL'22 days',now()-INTERVAL'22 days'),
('10000000-0000-0000-0000-000000000008','e1000000-0000-0000-0000-000000000008','GNB-20260610-0001','TXN-10062026-008',347000,'IDR','200','settlement','accept','bank_transfer','success',now()-INTERVAL'20 days',now()-INTERVAL'20 days'),
('10000000-0000-0000-0000-000000000009','e1000000-0000-0000-0000-000000000009','GNB-20260611-0001','TXN-11062026-009',324000,'IDR','200','settlement','accept','qris','success',now()-INTERVAL'14 days',now()-INTERVAL'14 days'),
('10000000-0000-0000-0000-000000000010','e1000000-0000-0000-0000-000000000010','GNB-20260612-0001','TXN-12062026-010',157000,'IDR','200','settlement','accept','bank_transfer','success',now()-INTERVAL'12 days',now()-INTERVAL'12 days'),
('10000000-0000-0000-0000-000000000011','e1000000-0000-0000-0000-000000000011','GNB-20260613-0001','TXN-13062026-011',489000,'IDR','200','settlement','accept','gopay','success',now()-INTERVAL'10 days',now()-INTERVAL'10 days'),
('10000000-0000-0000-0000-000000000012','e1000000-0000-0000-0000-000000000012','GNB-20260613-0002','TXN-13062026-012',237000,'IDR','200','settlement','accept','shopeepay','success',now()-INTERVAL'9 days',now()-INTERVAL'9 days'),
('10000000-0000-0000-0000-000000000013','e1000000-0000-0000-0000-000000000013','GNB-20260614-0001','TXN-14062026-013',303000,'IDR','200','settlement','accept','qris','success',now()-INTERVAL'7 days',now()-INTERVAL'7 days'),
('10000000-0000-0000-0000-000000000014','e1000000-0000-0000-0000-000000000014','GNB-20260614-0002','TXN-14062026-014',239000,'IDR','200','settlement','accept','bank_transfer','success',now()-INTERVAL'5 days',now()-INTERVAL'5 days'),
('10000000-0000-0000-0000-000000000015','e1000000-0000-0000-0000-000000000015','GNB-20260614-0003','TXN-14062026-015',320000,'IDR','200','settlement','accept','gopay','success',now()-INTERVAL'4 days',now()-INTERVAL'4 days'),
('10000000-0000-0000-0000-000000000016','e1000000-0000-0000-0000-000000000016','GNB-20260615-0001','TXN-15062026-016',277000,'IDR','200','settlement','accept','qris','success',now()-INTERVAL'3 days',now()-INTERVAL'3 days'),
('10000000-0000-0000-0000-000000000017','e1000000-0000-0000-0000-000000000017','GNB-20260615-0002','TXN-15062026-017',320000,'IDR','200','settlement','accept','bank_transfer','success',now()-INTERVAL'2 days',now()-INTERVAL'2 days'),
('10000000-0000-0000-0000-000000000018','e1000000-0000-0000-0000-000000000018','GNB-20260615-0003','TXN-15062026-018',520000,'IDR','200','settlement','accept','gopay','success',now()-INTERVAL'36 hours',now()-INTERVAL'36 hours'),
('10000000-0000-0000-0000-000000000019','e1000000-0000-0000-0000-000000000019','GNB-20260615-0004','TXN-15062026-019',202000,'IDR','200','settlement','accept','shopeepay','success',now()-INTERVAL'28 hours',now()-INTERVAL'28 hours'),
('10000000-0000-0000-0000-000000000020','e1000000-0000-0000-0000-000000000020','GNB-20260615-0005','TXN-15062026-020',333000,'IDR','200','settlement','accept','qris','success',now()-INTERVAL'18 hours',now()-INTERVAL'18 hours'),
('10000000-0000-0000-0000-000000000021','e1000000-0000-0000-0000-000000000021','GNB-20260616-0001','TXN-16062026-021',171000,'IDR','200','settlement','accept','bank_transfer','success',now()-INTERVAL'8 hours',now()-INTERVAL'8 hours'),
('10000000-0000-0000-0000-000000000022','e1000000-0000-0000-0000-000000000022','GNB-20260616-0002','TXN-16062026-022',321000,'IDR','200','settlement','accept','gopay','success',now()-INTERVAL'5 hours',now()-INTERVAL'5 hours'),
('10000000-0000-0000-0000-000000000023','e1000000-0000-0000-0000-000000000023','GNB-20260616-0003','TXN-16062026-023',294000,'IDR','200','settlement','accept','qris','success',now()-INTERVAL'2 hours',now()-INTERVAL'2 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 8: BOOKING SLOTS (jadwal konsultasi)
-- ============================================================

INSERT INTO public.booking_slots (
    id, slot_date, start_time, end_time, duration_minutes,
    capacity, booked_count, is_available, slot_type,
    meeting_url, created_at, updated_at
) VALUES
  ('50000000-0000-0000-0000-000000000001', CURRENT_DATE - 25, '09:00','09:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-001',now(),now()),
  ('50000000-0000-0000-0000-000000000002', CURRENT_DATE - 25, '10:00','10:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-002',now(),now()),
  ('50000000-0000-0000-0000-000000000003', CURRENT_DATE - 20, '14:00','14:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-003',now(),now()),
  ('50000000-0000-0000-0000-000000000004', CURRENT_DATE - 18, '09:30','10:00',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-004',now(),now()),
  ('50000000-0000-0000-0000-000000000005', CURRENT_DATE - 15, '11:00','11:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-005',now(),now()),
  ('50000000-0000-0000-0000-000000000006', CURRENT_DATE - 12, '15:00','15:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-006',now(),now()),
  ('50000000-0000-0000-0000-000000000007', CURRENT_DATE - 10, '10:00','10:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-007',now(),now()),
  ('50000000-0000-0000-0000-000000000008', CURRENT_DATE - 7,  '13:00','13:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-008',now(),now()),
  ('50000000-0000-0000-0000-000000000009', CURRENT_DATE - 5,  '09:00','09:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-009',now(),now()),
  ('50000000-0000-0000-0000-000000000010', CURRENT_DATE - 3,  '14:30','15:00',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-010',now(),now()),
  ('50000000-0000-0000-0000-000000000011', CURRENT_DATE - 1,  '10:00','10:30',30,1,1,FALSE,'online','https://meet.ginabo.id/konsul-011',now(),now()),
  ('50000000-0000-0000-0000-000000000012', CURRENT_DATE + 2,  '09:00','09:30',30,1,0,TRUE, 'online','https://meet.ginabo.id/konsul-012',now(),now()),
  ('50000000-0000-0000-0000-000000000013', CURRENT_DATE + 3,  '11:00','11:30',30,1,0,TRUE, 'online','https://meet.ginabo.id/konsul-013',now(),now()),
  ('50000000-0000-0000-0000-000000000014', CURRENT_DATE + 5,  '14:00','14:30',30,1,0,TRUE, 'online','https://meet.ginabo.id/konsul-014',now(),now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 9: BOOKINGS (12 konsultasi kulit)
-- ============================================================

INSERT INTO public.bookings (
    id, booking_number, profile_id, slot_id,
    customer_name, customer_email, customer_phone,
    skin_type, skin_concerns, current_routine, questions,
    meeting_url, status,
    notes, created_at, updated_at
) VALUES

-- BK01 Siti: completed
('60000000-0000-0000-0000-000000000001','GNB-BK-20260522-0001','a1000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001',
 'Siti Rahayu','siti.rahayu@gmail.com','+6281234567801',
 'dry',ARRAY['brightening','hydration'],
 'Cerave moisturizing cream + SPF 50 pagi, Cetaphil malam',
 'Kulit saya masih terasa kering di area pipi meski sudah pakai pelembab. Apakah Hydra Moist cocok?',
 'https://meet.ginabo.id/konsul-001','completed',
 'Disarankan lapis HMG30 sebelum krim utama. Mulai challenge 21 hari dengan rutinitas pagi-malam.',
 now()-INTERVAL'25 days',now()-INTERVAL'25 days'),

-- BK02 Dewi: completed
('60000000-0000-0000-0000-000000000002','GNB-BK-20260522-0002','a1000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002',
 'Dewi Kusuma','dewi.kusuma@gmail.com','+6281234567802',
 'combination',ARRAY['acne','pores'],
 'Wardah clarifying toner + moisturizer',
 'Pori-pori saya besar di area T-zone. Ada rekomendasi produk untuk mengecilkan pori?',
 'https://meet.ginabo.id/konsul-002','completed',
 'Rekomendasikan Pore & Glow Toner pagi hari + HMG untuk hidrasi ringan. Follow up 2 minggu.',
 now()-INTERVAL'25 days',now()-INTERVAL'25 days'),

-- BK03 Maya: completed
('60000000-0000-0000-0000-000000000003','GNB-BK-20260601-0001','a1000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000003',
 'Maya Putri','maya.putri@gmail.com','+6281234567804',
 'sensitive',ARRAY['redness','soothing'],
 'Bioderma cleanser, avene moisturizer',
 'Kulit saya mudah kemerahan dan bereaksi terhadap produk baru. Produk Ginabo aman untuk sensitif?',
 'https://meet.ginabo.id/konsul-003','completed',
 'Kulit sangat sensitif. Mulai dengan GFC (foam cleanser) lalu BCC secara bertahap. Hindari retinol dulu.',
 now()-INTERVAL'20 days',now()-INTERVAL'20 days'),

-- BK04 Lestari: completed
('60000000-0000-0000-0000-000000000004','GNB-BK-20260603-0001','a1000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004',
 'Lestari Wijaya','lestari.wijaya@gmail.com','+6281234567805',
 'normal',ARRAY['anti_aging','brightening'],
 'SK-II essence + moisturizer SPF',
 'Mulai terlihat garis halus di dahi dan sekitar mata. Produk anti-aging apa yang paling efektif?',
 'https://meet.ginabo.id/konsul-004','completed',
 'Kulit normal dengan tanda aging ringan. GlowAge Serum (mulai 2x seminggu) + DSM pagi. Review setelah 30 hari.',
 now()-INTERVAL'18 days',now()-INTERVAL'18 days'),

-- BK05 Anita: completed
('60000000-0000-0000-0000-000000000005','GNB-BK-20260606-0001','a1000000-0000-0000-0000-000000000011','50000000-0000-0000-0000-000000000005',
 'Anita Susanti','anita.susanti@gmail.com','+6281234567811',
 'sensitive',ARRAY['redness','acne'],
 'Sabun mandi Dove, moisturizer biasa',
 'Sering jerawat di area dagu dan dahi. Kulit juga mudah memerah. Kombinasi bermasalah.',
 'https://meet.ginabo.id/konsul-005','completed',
 'Acne-prone + sensitif. Mulai GFC cleanser, PGT toner (1x per hari saja), tanpa retinol 6 minggu pertama.',
 now()-INTERVAL'15 days',now()-INTERVAL'15 days'),

-- BK06 Fajar: completed
('60000000-0000-0000-0000-000000000006','GNB-BK-20260609-0001','a1000000-0000-0000-0000-000000000008','50000000-0000-0000-0000-000000000006',
 'Fajar Nugraha','fajar.nugraha@gmail.com','+6281234567808',
 'dry',ARRAY['hydration','anti_aging'],
 'Sunscreen SPF50 pagi, sleeping mask malam',
 'Kulit kering dan mulai kendur terutama di area leher. Ritual malam yang efektif?',
 'https://meet.ginabo.id/konsul-006','completed',
 'Kulit dry + aging. Ritual: GFC malam → GlowAge serum → BCC → sleeping mask. Tambah DSM pagi.',
 now()-INTERVAL'12 days',now()-INTERVAL'12 days'),

-- BK07 Rina: completed
('60000000-0000-0000-0000-000000000007','GNB-BK-20260610-0001','a1000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000007',
 'Rina Santoso','rina.santoso@gmail.com','+6281234567803',
 'oily',ARRAY['acne','oiliness'],
 'Innisfree green tea serum + oil control moisturizer',
 'Kulit berminyak sepanjang hari, jerawat hormonal tiap bulan. Skincare routine ringan tapi efektif?',
 'https://meet.ginabo.id/konsul-007','completed',
 'Oily + acne. Rekomendasikan HMG (gel ringan), PGT toner AHA/BHA, hindari produk berbahan minyak.',
 now()-INTERVAL'10 days',now()-INTERVAL'10 days'),

-- BK08 Wulan: completed
('60000000-0000-0000-0000-000000000008','GNB-BK-20260612-0001','a1000000-0000-0000-0000-000000000012','50000000-0000-0000-0000-000000000008',
 'Wulandari Nurul Putri','wulandari.np@gmail.com','+6281234567812',
 'dry',ARRAY['anti_aging','brightening'],
 'La Roche-Posay moisturizer + Vitamin C serum Korea',
 'Flek hitam bekas jerawat lama masih ada. Serum GlowAge bisa bantu meratakan warna kulit?',
 'https://meet.ginabo.id/konsul-008','completed',
 'PIH (post-inflammatory hyperpigmentation). Kombinasi GlowAge + BCC (alpha arbutin) sangat cocok. 8-12 minggu untuk hasil optimal.',
 now()-INTERVAL'7 days',now()-INTERVAL'7 days'),

-- BK09 Rendi: confirmed (mendatang)
('60000000-0000-0000-0000-000000000009','GNB-BK-20260614-0001','a1000000-0000-0000-0000-000000000009','50000000-0000-0000-0000-000000000009',
 'Rendi Saputra','rendi.saputra@gmail.com','+6281234567809',
 'normal',ARRAY['brightening'],
 'Hanya sabun muka biasa dan moisturizer',
 'Mau mulai skincare serius, kulit saya cukup normal tapi kusam. Dari mana mulainya?',
 'https://meet.ginabo.id/konsul-009','completed',
 'Kulit normal tapi kurang perawatan. Starter kit: GFC + DSM pagi + BCC malam. Simple tapi efektif.',
 now()-INTERVAL'5 days',now()-INTERVAL'5 days'),

-- BK10 Hendra: confirmed (kemarin)
('60000000-0000-0000-0000-000000000010','GNB-BK-20260615-0001','a1000000-0000-0000-0000-000000000010','50000000-0000-0000-0000-000000000011',
 'Hendra Gunawan','hendra.gunawan@gmail.com','+6281234567810',
 'combination',ARRAY['acne','pores'],
 'Men cleanser + sunscreen',
 'Sebagai pria, skincare apa yang simpel dan efektif untuk kulit kombinasi berjerawat ringan?',
 'https://meet.ginabo.id/konsul-010','completed',
 'Pria, kombinasi-acne. Rutinitas 3 produk: GFC pagi-malam, HMG moisturizer, DSM SPF pagi.',
 now()-INTERVAL'1 day',now()-INTERVAL'1 day'),

-- BK11 Yolanda: confirmed (jadwal mendatang)
('60000000-0000-0000-0000-000000000011','GNB-BK-20260618-0001','a1000000-0000-0000-0000-000000000013','50000000-0000-0000-0000-000000000012',
 'Yolanda Safitri','yolanda.safitri@gmail.com','+6281234567813',
 'oily',ARRAY['acne','oiliness'],
 'Pembersih muka gentle + essence',
 'Sering jerawat besar di pipi dan dagu. Apakah PGT Toner aman untuk acne aktif?',
 'https://meet.ginabo.id/konsul-012','confirmed',
 NULL,
 now()-INTERVAL'2 days',now()-INTERVAL'2 days'),

-- BK12 Nurul: pending
('60000000-0000-0000-0000-000000000012','GNB-BK-20260619-0001','a1000000-0000-0000-0000-000000000015','50000000-0000-0000-0000-000000000013',
 'Nurul Hidayati','nurul.hidayati@gmail.com','+6281234567815',
 'normal',ARRAY['hydration','soothing'],
 'Hanya pakai sunscreen',
 'Kulit terasa kencang dan kadang perih terutama setelah mandi. Perlu pelembab apa?',
 'https://meet.ginabo.id/konsul-013','pending',
 NULL,
 now()-INTERVAL'4 hours',now()-INTERVAL'4 hours')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 10: RETURN POLICY
-- ============================================================

INSERT INTO public.return_policies (
    id, name, is_active,
    return_window_days, exchange_window_days, refund_window_days,
    auto_approve_reasons, manual_review_reasons,
    auto_approve_max_amount, require_evidence, min_evidence_count,
    max_returns_per_month, store_credit_bonus_pct,
    notes, created_at, updated_at
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    'Kebijakan Retur Standar Ginabo', FALSE,
    7, 7, 14,
    ARRAY['missing_item','wrong_item'],
    ARRAY['allergic_reaction','defective'],
    500000, TRUE, 1, 5, 5,
    'Retur 7 hari sejak barang diterima. Refund via transfer bank atau store credit (+5% bonus).',
    now()-INTERVAL'60 days', now()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 11: RETURNS (5 kasus)
-- ============================================================

INSERT INTO public.returns (
    id, return_number, order_id, profile_id, policy_id,
    return_type, preferred_resolution, status,
    customer_note, risk_score,
    created_at, updated_at
) VALUES

-- RET1: Siti (C01) — salah kirim → approved, refund
('30000000-0000-0000-0000-000000000001','RET-2026-000001',
 'e1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',
 'wrong_item','refund','approved',
 'Produk yang diterima bukan Hydra Moist Gel melainkan Bright & Care Cream. Mohon direfund.',
 10, now()-INTERVAL'27 days',now()-INTERVAL'26 days'),

-- RET2: Rina (C03) — produk cacat (bocor) → under_review, exchange
('30000000-0000-0000-0000-000000000002','RET-2026-000002',
 'e1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001',
 'defective','exchange','under_review',
 'GlowAge Serum bocor saat diterima, kemasan rusak dan isi tumpah ~30%. Sudah upload foto bukti.',
 25, now()-INTERVAL'22 days',now()-INTERVAL'21 days'),

-- RET3: Budi (D01) — reaksi alergi → approved, store_credit
('30000000-0000-0000-0000-000000000003','RET-2026-000003',
 'e1000000-0000-0000-0000-000000000009','a1000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000001',
 'allergic_reaction','store_credit','approved',
 'Kulit kemerahan dan gatal setelah pemakaian GlowAge Serum hari ke-3. Berhenti pakai. Minta store credit.',
 20, now()-INTERVAL'7 days',now()-INTERVAL'6 days'),

-- RET4: Agus (D02) — produk tidak sesuai ekspektasi → rejected
('30000000-0000-0000-0000-000000000004','RET-2026-000004',
 'e1000000-0000-0000-0000-000000000010','a1000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000001',
 'other','refund','rejected',
 'Produk sudah dipakai tapi hasilnya kurang terasa setelah 1 minggu. Ingin refund.',
 30, now()-INTERVAL'5 days',now()-INTERVAL'4 days'),

-- RET5: Fajar (D03) — item kurang/missing → submitted
('30000000-0000-0000-0000-000000000005','RET-2026-000005',
 'e1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000001',
 'missing_item','refund','submitted',
 'Paket berisi 2 produk tapi yang datang hanya 1. DSM30 tidak ada di dalam kotak.',
 5, now()-INTERVAL'3 days',now()-INTERVAL'3 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 12: RETURN ITEMS
-- ============================================================

INSERT INTO public.return_items (
    id, return_id, order_item_id,
    product_id, variant_id,
    product_name, variant_name, sku,
    quantity, unit_price, line_refund_amount,
    item_reason, created_at
) VALUES

-- RET1: HMG30 salah kirim
('40000000-0000-0000-0000-000000000001',
 '30000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001',
 'c1000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001',
 'Hydra Moist Gel','30ml','GNB-HMG-030',
 1,89000,89000,
 'Salah kirim produk — diterima BCC30 bukan HMG30',
 now()-INTERVAL'27 days'),

-- RET2: GAS15 bocor
('40000000-0000-0000-0000-000000000002',
 '30000000-0000-0000-0000-000000000002','f1000000-0000-0000-0000-000000000004',
 'c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000005',
 'GlowAge Serum','15ml','GNB-GAS-015',
 1,219000,219000,
 'Kemasan bocor, isi tumpah ~30%. Foto diupload.',
 now()-INTERVAL'22 days'),

-- RET3: GAS30 alergi
('40000000-0000-0000-0000-000000000003',
 '30000000-0000-0000-0000-000000000003','f1000000-0000-0000-0000-000000000015',
 'c1000000-0000-0000-0000-000000000003','d1000000-0000-0000-0000-000000000006',
 'GlowAge Serum','30ml','GNB-GAS-030',
 1,299000,299000,
 'Reaksi alergi: kemerahan dan gatal hari ke-3 pemakaian.',
 now()-INTERVAL'7 days'),

-- RET4: BCC30 tidak sesuai ekspektasi
('40000000-0000-0000-0000-000000000004',
 '30000000-0000-0000-0000-000000000004','f1000000-0000-0000-0000-000000000016',
 'c1000000-0000-0000-0000-000000000002','d1000000-0000-0000-0000-000000000003',
 'Bright & Care Cream','30ml','GNB-BCC-030',
 1,129000,0,
 'Sudah dipakai 1 minggu, hasilnya tidak terasa. Produk sudah terbuka — tidak memenuhi syarat refund.',
 now()-INTERVAL'5 days'),

-- RET5: DSM30 missing
('40000000-0000-0000-0000-000000000005',
 '30000000-0000-0000-0000-000000000005','f1000000-0000-0000-0000-000000000019',
 'c1000000-0000-0000-0000-000000000004','d1000000-0000-0000-0000-000000000007',
 'Daily SPF Moisturizer','30ml','GNB-DSM-030',
 1,159000,159000,
 'Tidak ditemukan di dalam paket pengiriman.',
 now()-INTERVAL'3 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
SET LOCAL session_replication_role = DEFAULT;
COMMIT;

-- ============================================================
-- VERIFIKASI — jalankan setelah seed berhasil
-- ============================================================
SELECT 'profiles'     AS tabel, COUNT(*) AS jumlah FROM public.profiles      WHERE id::text LIKE 'a1%'
UNION ALL SELECT 'products',    COUNT(*) FROM public.products      WHERE id::text LIKE 'c1%'
UNION ALL SELECT 'variants',    COUNT(*) FROM public.product_variants WHERE id::text LIKE 'd1%'
UNION ALL SELECT 'orders',      COUNT(*) FROM public.orders        WHERE id::text LIKE 'e1%'
UNION ALL SELECT 'order_items', COUNT(*) FROM public.order_items   WHERE id::text LIKE 'f1%'
UNION ALL SELECT 'payments',    COUNT(*) FROM public.payments      WHERE id::text LIKE '10%'
UNION ALL SELECT 'slots',       COUNT(*) FROM public.booking_slots WHERE id::text LIKE '50%'
UNION ALL SELECT 'bookings',    COUNT(*) FROM public.bookings      WHERE id::text LIKE '60%'
UNION ALL SELECT 'returns',     COUNT(*) FROM public.returns       WHERE id::text LIKE '30%'
UNION ALL SELECT 'return_items',COUNT(*) FROM public.return_items  WHERE id::text LIKE '40%';


