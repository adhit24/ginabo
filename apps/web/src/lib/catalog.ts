import { supabase } from "@/lib/supabase";

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
  images: Array<{ url: string; alt: string | null; sortOrder: number }>;
};

const demoProducts: CatalogProduct[] = [
  { id: "demo_prod_serum_1", slug: "glowage-multi-active-serum", name: "GlowAge Multi-Active Serum", description: "Serum ringan untuk membantu kulit tampak lebih cerah alami, halus, dan tetap nyaman di tengah aktivitas harian.", priceMinor: 285000, currency: "IDR", stockQty: 50, weightGrams: 20, isActive: true, images: [{ url: "/product-serum-bg.png", alt: "GlowAge Serum", sortOrder: 0 }] },
  { id: "demo_prod_cream_1", slug: "bright-care-moisture-cream", name: "Bright & Care Moisture Cream", description: "Moisture cream untuk membantu menjaga skin barrier dan menutrisi kulit agar terasa lebih lembap dan tenang.", priceMinor: 195000, currency: "IDR", stockQty: 60, weightGrams: 10, isActive: true, images: [{ url: "/product-cream-bg.png", alt: "Bright Care Cream", sortOrder: 0 }] },
  { id: "demo_prod_dna_1", slug: "hydra-moist-gel-ultimate", name: "Hydra Moist Gel Ultimate", description: "Gel hydration 3-in-1 untuk membantu melembapkan, menenangkan, dan mendukung recovery saat kulit terasa capek.", priceMinor: 215000, currency: "IDR", stockQty: 40, weightGrams: 30, isActive: true, images: [{ url: "/product-dna-bg.png", alt: "Hydra Moist Gel", sortOrder: 0 }] },
  { id: "demo_prod_bundle_1", slug: "daily-barrier-routine-set", name: "Daily Skin Nutrition Set", description: "Paket Bright & Care dan Hydra Moist untuk rutinitas AM/PM yang praktis.", priceMinor: 620000, currency: "IDR", stockQty: 30, weightGrams: 40, isActive: true, images: [{ url: "/product-bundle.png", alt: "Bundling Bright and Care & Hydra Moist", sortOrder: 0 }] },
  { id: "demo_prod_serum_2", slug: "glowage-serum-20ml", name: "GlowAge Serum 20ml", description: "Ukuran travel untuk mulai coba rutinitas GlowAge.", priceMinor: 165000, currency: "IDR", stockQty: 45, weightGrams: 20, isActive: true, images: [{ url: "/product-serum-1.png", alt: "GlowAge Serum 20ml", sortOrder: 0 }] },
  { id: "demo_prod_cream_2", slug: "bright-care-cream-promo", name: "Bright & Care Cream — Promo", description: "Edisi promo untuk member.", priceMinor: 175000, currency: "IDR", stockQty: 25, weightGrams: 10, isActive: true, images: [{ url: "/product-cream-1.png", alt: "Bright Care Cream Promo", sortOrder: 0 }] },
  { id: "demo_prod_bundle_2", slug: "bright-renewal-set", name: "Bright + Comfort Duo", description: "Bundling Bright & Care dan Multi Active Serum untuk membantu kulit tampak lebih cerah alami.", priceMinor: 435000, currency: "IDR", stockQty: 20, weightGrams: 30, isActive: true, images: [{ url: "/product-serum-2.png", alt: "Bundling Bright and Care & Multi Active Serum", sortOrder: 0 }] },
  { id: "demo_prod_dna_2", slug: "repair-glow-set", name: "Hydration + Glow Duo", description: "Bundling Multi Active Serum dan Hydra Moist untuk kulit terasa lebih lembap.", priceMinor: 360000, currency: "IDR", stockQty: 35, weightGrams: 50, isActive: true, images: [{ url: "/product-dna-1.png", alt: "Bundling Multi Active Serum & Hydra Moist", sortOrder: 0 }] },
  { id: "demo_prod_bundle_3", slug: "ginabo-complete-skin", name: "Ginabo Complete Skin Nutrition Set", description: "Bundling lengkap Bright & Care, Multi Active Serum, dan Hydra Moist untuk rutinitas skincare menyeluruh.", priceMinor: 575000, currency: "IDR", stockQty: 25, weightGrams: 60, isActive: true, images: [{ url: "/essential.png", alt: "Bundling Complete Set", sortOrder: 0 }] },
];

function toProduct(row: Record<string, unknown>): CatalogProduct {
  const rawImages = (row.product_images ?? []) as Array<{ url: string; alt: string | null; sort_order: number }>;
  const images = rawImages
    .map((img) => ({ url: img.url, alt: img.alt, sortOrder: img.sort_order }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string | null) ?? "",
    priceMinor: row.price as number,
    currency: "IDR",
    stockQty: (row.stock_quantity as number) ?? 0,
    weightGrams: (row.weight_grams as number | null) ?? null,
    isActive: (row.is_active as boolean) ?? true,
    images,
  };
}

export async function listActiveProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images(url, alt, sort_order)`)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return demoProducts.filter((p) => p.isActive);
  }

  return (data as Record<string, unknown>[]).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images(url, alt, sort_order)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return demoProducts.find((p) => p.slug === slug) ?? null;
  }

  return toProduct(data as Record<string, unknown>);
}
