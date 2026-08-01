-- Create the four Ginabo bundle catalog records and derive their shipping weight
-- from the component product weights.

ALTER TABLE public.bundles
  ADD COLUMN IF NOT EXISTS weight_grams INTEGER;

INSERT INTO public.bundles (name, slug, description, image_url, bundle_price, compare_price, is_active)
VALUES
  ('Daily Skin Barrier Set', 'daily-barrier-routine-set',
   'Bundling Bright & Care dan Hydra Moist.', '/skin_barrier.png', 197999, 395999, TRUE),
  ('Bright Renewal Set', 'bright-renewal-set',
   'Bundling Bright & Care dan Multi Active Serum.', '/bright_renewal.png', 169999, 339999, TRUE),
  ('Repair & Glow Set', 'repair-glow-set',
   'Bundling Multi Active Serum dan Hydra Moist.', '/repair_glow.png', 207999, 415999, TRUE),
  ('Ginabo Complete Skin Nutrition Set', 'ginabo-complete-skin',
   'Bundling lengkap Bright & Care, Multi Active Serum, dan Hydra Moist.', '/essential.png', 287999, 575999, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  bundle_price = EXCLUDED.bundle_price,
  compare_price = EXCLUDED.compare_price,
  is_active = EXCLUDED.is_active;

INSERT INTO public.bundle_items (bundle_id, product_id, quantity, sort_order)
SELECT b.id, p.id, 1, x.sort_order
FROM (VALUES
  ('daily-barrier-routine-set', 'bright-care-cream', 1),
  ('daily-barrier-routine-set', 'hydra-moist-gel', 2),
  ('bright-renewal-set', 'bright-care-cream', 1),
  ('bright-renewal-set', 'glowage-serum', 2),
  ('repair-glow-set', 'glowage-serum', 1),
  ('repair-glow-set', 'hydra-moist-gel', 2),
  ('ginabo-complete-skin', 'bright-care-cream', 1),
  ('ginabo-complete-skin', 'glowage-serum', 2),
  ('ginabo-complete-skin', 'hydra-moist-gel', 3)
) AS x(bundle_slug, product_slug, sort_order)
JOIN public.bundles b ON b.slug = x.bundle_slug
JOIN public.products p ON p.slug = x.product_slug
ON CONFLICT (bundle_id, product_id, variant_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  sort_order = EXCLUDED.sort_order;

UPDATE public.bundles b
SET weight_grams = totals.total_weight
FROM (
  SELECT bi.bundle_id, SUM(p.weight_grams * bi.quantity)::INTEGER AS total_weight
  FROM public.bundle_items bi
  JOIN public.products p ON p.id = bi.product_id
  GROUP BY bi.bundle_id
) totals
WHERE b.id = totals.bundle_id;
