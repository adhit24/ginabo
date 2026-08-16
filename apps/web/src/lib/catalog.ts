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
  // ── Single Products ──
  {
    id: "demo_prod_serum_1",
    slug: "glowage-multi-active-serum",
    name: "GlowAge Multi-Active Serum",
    description: "Serum ringan untuk membantu kulit tampak lebih cerah alami, halus, dan tetap nyaman di tengah aktivitas harian.",
    priceMinor: 90000,
    currency: "IDR",
    stockQty: 50,
    weightGrams: 20,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate&Bright_Care_Moisture_Cream.png", alt: "GlowAge Serum", sortOrder: 0 }],
  },
  {
    id: "demo_prod_cream_1",
    slug: "bright-care-moisture-cream",
    name: "Bright & Care Moisture Cream",
    description: "Moisture cream untuk membantu menjaga skin barrier dan menutrisi kulit agar terasa lebih lembap dan tenang.",
    priceMinor: 75000,
    currency: "IDR",
    stockQty: 60,
    weightGrams: 10,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Bright&Care_Moisture_Cream.png", alt: "Bright Care Cream", sortOrder: 0 }],
  },
  {
    id: "demo_prod_dna_1",
    slug: "hydra-moist-gel-ultimate",
    name: "Hydra Moist Gel Ultimate",
    description: "Gel hydration 3-in-1 untuk membantu melembapkan, menenangkan, dan mendukung recovery saat kulit terasa capek.",
    priceMinor: 120000,
    currency: "IDR",
    stockQty: 40,
    weightGrams: 30,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate.png", alt: "Hydra Moist Gel", sortOrder: 0 }],
  },

  // ── Bundling Products ──
  {
    id: "demo_prod_bundle_1",
    slug: "ginabo-complete-skin",
    name: "Ginabo Complete Skin Nutrition Set",
    description: "Bundling lengkap Bright & Care, Multi Active Serum, dan Hydra Moist untuk rutinitas skincare menyeluruh.",
    priceMinor: 287999,
    currency: "IDR",
    stockQty: 25,
    weightGrams: 60,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate_GlowAge_Multi_Active_Serum_Bright_Care_Moisture_Cream.png", alt: "Bundling Complete Set", sortOrder: 0 }],
  },
  {
    id: "demo_prod_bundle_2",
    slug: "repair-glow-set",
    name: "Repair & Glow Set",
    description: "Bundling Multi Active Serum dan Hydra Moist untuk kulit terasa lebih lembap, ternutrisi, dan bersinar alami.",
    priceMinor: 207999,
    currency: "IDR",
    stockQty: 35,
    weightGrams: 50,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate_GlowAge_Multi_Active_Serum.png", alt: "Bundling Multi Active Serum & Hydra Moist", sortOrder: 0 }],
  },
  {
    id: "demo_prod_bundle_3",
    slug: "daily-barrier-routine-set",
    name: "Daily Skin Barrier Set",
    description: "Paket Bright & Care Moisture Cream dan Hydra Moist Gel Ultimate untuk kekuatan perlindungan skin barrier ekstra sepanjang hari.",
    priceMinor: 197999,
    currency: "IDR",
    stockQty: 30,
    weightGrams: 40,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/Hydra_Moist_Gel_Ultimate&Bright_Care_Moisture_Cream.png", alt: "Bundling Bright and Care & Hydra Moist", sortOrder: 0 }],
  },
  {
    id: "demo_prod_bundle_4",
    slug: "bright-renewal-set",
    name: "Bright Renewal Set",
    description: "Bundling Bright & Care dan Multi Active Serum untuk membantu kulit tampak lebih cerah alami dan memudarkan kusam.",
    priceMinor: 169999,
    currency: "IDR",
    stockQty: 20,
    weightGrams: 30,
    isActive: true,
    averageRating: null,
    reviewCount: 0,
    images: [{ url: "/GlowAge_Multi_Active_Serum&Bright_Care_Moisture_Cream.png", alt: "Bundling Bright and Care & Multi Active Serum", sortOrder: 0 }],
  },
];

export async function listActiveProducts(): Promise<CatalogProduct[]> {
  let dbProducts: CatalogProduct[] = [];
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images(url, alt_text, sort_order)`)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      dbProducts = (data as Record<string, unknown>[]).map(mapCatalogProduct);
    }
  } catch (e) {
    console.error("Failed to fetch products from db", e);
  }

  // Always merge with demo/default products so that they are guaranteed to exist statically
  const merged = [...dbProducts];
  for (const demo of demoProducts) {
    if (!merged.some((p) => p.slug === demo.slug)) {
      merged.push(demo);
    }
  }
  return merged;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images(url, alt_text, sort_order)`)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (data) {
      return mapCatalogProduct(data as Record<string, unknown>);
    }
  } catch (e) {
    console.error("Failed to get product from db", e);
  }

  // Fallback to local demo/default products
  const demo = demoProducts.find((p) => p.slug === slug);
  return demo || null;
}
