-- Product weights supplied by Ginabo (grams).
-- Safe to run after 001_initial_schema.sql; existing product rows are updated in place.

UPDATE public.products
SET weight_grams = CASE
    WHEN slug IN ('daily-barrier-routine-set')
      OR lower(name) LIKE '%bright%care%hydra%'
      OR lower(name) LIKE '%daily%barrier%set%'
      THEN 40
    WHEN slug IN ('bright-renewal-set')
      OR lower(name) LIKE '%bright%care%multi%'
      OR lower(name) LIKE '%bright%renewal%'
      THEN 30
    WHEN slug IN ('repair-glow-set')
      OR lower(name) LIKE '%multi%hydra%'
      OR lower(name) LIKE '%repair%glow%'
      THEN 50
    WHEN slug IN ('ginabo-complete-skin', 'daily-skin-nutrition-set')
      OR lower(name) LIKE '%complete%set%'
      OR lower(name) LIKE '%complete%skin%'
      OR lower(name) LIKE '%skin%nutrition%set%'
      THEN 60
    WHEN slug IN ('bright-care-cream', 'bright-care-moisture-cream', 'bright-care-cream-promo')
      OR lower(name) LIKE '%bright%care%'
      THEN 10
    WHEN slug IN ('hydra-moist-gel', 'hydra-moist-gel-ultimate')
      OR lower(name) LIKE '%hydra%moist%'
      THEN 30
    WHEN slug IN ('glowage-serum', 'glowage-multi-active-serum', 'glowage-serum-20ml')
      OR lower(name) LIKE '%multi%active%serum%'
      OR lower(name) LIKE '%glowage%serum%'
      THEN 20
    ELSE weight_grams
  END
WHERE is_active = TRUE;

COMMENT ON COLUMN public.products.weight_grams IS 'Berat produk dalam gram; digunakan untuk informasi produk dan perhitungan pengiriman';
