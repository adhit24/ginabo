import { supabase } from "@/lib/supabase";
import { mapCatalogProduct } from "@/lib/catalogMapping";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: "IDR" | "USD";
  stockQty: number;
  weightGrams: number | null;
  isActive: boolean;
  averageRating: number | null;
  reviewCount: number;
  images: Array<{ url: string; alt: string | null; sortOrder: number }>;
};

const demoProducts: CatalogProduct[] = [
  // ── 3 Single Products (Tunggal) ──
  {
    id: "p3",
    slug: "glowage-multi-active-serum",
    name: "GlowAge Multi-Active Serum",
    description: "Serum pencerah, pelembap & anti-aging harian.",
    priceMinor: 90000,
    currency: "IDR",
    stockQty: 50,
    weightGrams: 20,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/GlowAge Multi Active Serum.png", alt: "GlowAge Multi-Active Serum", sortOrder: 0 }],
  },
  {
    id: "p2",
    slug: "bright-care-moisture-cream",
    name: "Bright & Care Moisture Cream",
    description: "Cream harian untuk kelembapan dan skin barrier.",
    priceMinor: 75000,
    currency: "IDR",
    stockQty: 60,
    weightGrams: 10,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Bright & Care Moisture Cream.png", alt: "Bright & Care Moisture Cream", sortOrder: 0 }],
  },
  {
    id: "p1",
    slug: "hydra-moist-gel",
    name: "Hydra Moist Gel Ultimate",
    description: "Gel 3-in-1: moisturizer, makeup prep & sleeping mask.",
    priceMinor: 120000,
    currency: "IDR",
    stockQty: 40,
    weightGrams: 30,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra Moist Gel Ultimate.png", alt: "Hydra Moist Gel Ultimate", sortOrder: 0 }],
  },

  // ── 4 Bundling Products (Paket) ──
  {
    id: "b1",
    slug: "ginabo-complete-skin",
    name: "Ginabo Complete Skin Nutrition Set",
    description: "Gel + Cream + Serum dalam satu paket lengkap.",
    priceMinor: 287999,
    currency: "IDR",
    stockQty: 25,
    weightGrams: 60,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate_GlowAge_Multi_Active_Serum_Bright_Care_Moisture_Cream.png", alt: "Ginabo Complete Skin Nutrition Set", sortOrder: 0 }],
  },
  {
    id: "b2",
    slug: "repair-glow-set",
    name: "Repair & Glow Set",
    description: "Kombinasi serum dan cream untuk regenerasi kulit.",
    priceMinor: 207999,
    currency: "IDR",
    stockQty: 35,
    weightGrams: 50,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate_GlowAge_Multi_Active_Serum.png", alt: "Repair & Glow Set", sortOrder: 0 }],
  },
  {
    id: "b3",
    slug: "daily-barrier-routine-set",
    name: "Daily Skin Barrier Set",
    description: "Perawatan barrier intensif harian.",
    priceMinor: 197999,
    currency: "IDR",
    stockQty: 30,
    weightGrams: 40,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate&Bright_Care_Moisture_Cream.png", alt: "Daily Skin Barrier Set", sortOrder: 0 }],
  },
  {
    id: "b4",
    slug: "bright-renewal-set",
    name: "Bright Renewal Set",
    description: "Perawatan fokus mencerahkan kulit kusam.",
    priceMinor: 169999,
    currency: "IDR",
    stockQty: 20,
    weightGrams: 30,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/GlowAge_Multi_Active_Serum&Bright_Care_Moisture_Cream.png", alt: "Bright Renewal Set", sortOrder: 0 }],
  },
];

export async function listActiveProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images(url, alt_text, sort_order)`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products from db", error);
    // A real DB/network failure — return an empty list rather than silently
    // substituting hardcoded demo products, so the DB stays the sole source
    // of truth and an outage is visible instead of masked.
    return [];
  }

  const dbProducts = ((data ?? []) as Record<string, unknown>[]).map((item) => mapCatalogProduct(item));

  // Bundle "products" (Ginabo Complete Skin Nutrition Set, etc.) have no row
  // in `products` — they only exist as this hardcoded catalog entry so their
  // detail pages can still resolve via getProductBySlug's fallback below.
  // They are intentionally not part of the DB-driven product list.
  return dbProducts;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images(url, alt_text, sort_order)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (data) {
    return mapCatalogProduct(data as Record<string, unknown>);
  }

  // No matching active row in `products` — this is expected for bundle
  // slugs (which are never stored as real product rows) and for genuinely
  // nonexistent/inactive slugs. A real fetch error (not just "no rows") is
  // logged but still falls through to the same lookup, since a bundle slug
  // always needs it regardless of DB health.
  if (error && error.code !== "PGRST116") {
    console.error("Failed to get product from db", error);
  }

  const demo = demoProducts.find((p) => p.slug === slug);
  const isBundle = demo?.id.startsWith("b");
  return isBundle ? demo! : null;
}
