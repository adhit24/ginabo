INSERT OR IGNORE INTO Product (id, slug, name, description, priceMinor, currency, stockQty, isActive) VALUES
  ('demo_prod_serum_1',  'glowage-multi-active-serum',  'GlowAge Multi-Active Serum',  'Serum ringan untuk membantu kulit tampak lebih cerah alami, halus, dan tetap nyaman di tengah aktivitas harian.', 285000, 'IDR', 50, 1),
  ('demo_prod_cream_1',  'bright-care-moisture-cream',  'Bright & Care Moisture Cream', 'Moisture cream untuk membantu menjaga skin barrier dan menutrisi kulit agar terasa lebih lembap dan tenang.',      195000, 'IDR', 60, 1),
  ('demo_prod_dna_1',   'hydra-moist-gel-ultimate',    'Hydra Moist Gel Ultimate',    'Gel hydration 3-in-1 untuk membantu melembapkan, menenangkan, dan mendukung recovery saat kulit terasa capek.',     215000, 'IDR', 40, 1),
  ('demo_prod_bundle_1','daily-barrier-routine-set',   'Daily Skin Nutrition Set',    'Paket rutinitas AM/PM: GlowAge Serum + Bright & Care Cream + Hydra Moist Gel.',                                       620000, 'IDR', 30, 1),
  ('demo_prod_serum_2', 'glowage-serum-20ml',          'GlowAge Serum 20ml',          'Ukuran travel untuk mulai coba rutinitas GlowAge.',                                                                     165000, 'IDR', 45, 1),
  ('demo_prod_cream_2', 'bright-care-cream-promo',     'Bright & Care Cream — Promo', 'Edisi promo untuk member.',                                                                                              175000, 'IDR', 25, 1),
  ('demo_prod_bundle_2','bright-renewal-set',          'Bright + Comfort Duo',        'Duo serum + cream untuk membantu kulit tampak lebih cerah alami.',                                                       435000, 'IDR', 20, 1),
  ('demo_prod_dna_2',   'repair-glow-set',             'Hydration + Glow Duo',        'Kombinasi serum + gel hydration untuk bantu kulit terasa lebih lembap.',                                                360000, 'IDR', 35, 1);

INSERT OR IGNORE INTO ProductImage (id, productId, url, alt, sortOrder) VALUES
  ('img_serum_1',  'demo_prod_serum_1',  '/product-serum-bg.png',  'GlowAge Serum',         0),
  ('img_cream_1',  'demo_prod_cream_1',  '/product-cream-bg.png',  'Bright Care Cream',     0),
  ('img_dna_1',    'demo_prod_dna_1',   '/product-dna-bg.png',    'Hydra Moist Gel',       0),
  ('img_bundle_1', 'demo_prod_bundle_1','/product-bundle.png',    'Bundling Set',          0),
  ('img_serum_2',  'demo_prod_serum_2', '/product-serum-1.png',   'GlowAge Serum 20ml',   0),
  ('img_cream_2',  'demo_prod_cream_2', '/product-cream-1.png',   'Bright Care Cream Promo',0),
  ('img_bundle_2', 'demo_prod_bundle_2','/product-serum-2.png',   'Bright Renewal Set',   0),
  ('img_dna_2',    'demo_prod_dna_2',   '/product-dna-1.png',     'Repair Glow Set',      0);
