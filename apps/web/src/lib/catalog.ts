import { supabase } from "@/lib/supabase";

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: "IDR" | "USD";
  stockQty: number;
  isActive: boolean;
  images: Array<{ url: string; alt: string | null; sortOrder: number }>;
};

const demoProducts: CatalogProduct[] = [
  { id: "demo_prod_serum_1", slug: "glowage-multi-active-serum", name: "GlowAge Multi-Active Serum", description: "Serum ringan untuk membantu kulit tampak lebih cerah alami, halus, dan tetap nyaman di tengah aktivitas harian.", priceMinor: 285000, currency: "IDR", stockQty: 50, isActive: true, images: [{ url: "/product-serum-bg.png", alt: "GlowAge Serum", sortOrder: 0 }] },
  { id: "demo_prod_cream_1", slug: "bright-care-moisture-cream", name: "Bright & Care Moisture Cream", description: "Moisture cream untuk membantu menjaga skin barrier dan menutrisi kulit agar terasa lebih lembap dan tenang.", priceMinor: 195000, currency: "IDR", stockQty: 60, isActive: true, images: [{ url: "/product-cream-bg.png", alt: "Bright Care Cream", sortOrder: 0 }] },
  { id: "demo_prod_dna_1", slug: "hydra-moist-gel-ultimate", name: "Hydra Moist Gel Ultimate", description: "Gel hydration 3-in-1 untuk membantu melembapkan, menenangkan, dan mendukung recovery saat kulit terasa capek.", priceMinor: 215000, currency: "IDR", stockQty: 40, isActive: true, images: [{ url: "/product-dna-bg.png", alt: "Hydra Moist Gel", sortOrder: 0 }] },
  { id: "demo_prod_bundle_1", slug: "daily-barrier-routine-set", name: "Daily Skin Nutrition Set", description: "Paket rutinitas AM/PM: GlowAge Serum + Bright & Care Cream + Hydra Moist Gel.", priceMinor: 620000, currency: "IDR", stockQty: 30, isActive: true, images: [{ url: "/product-bundle.png", alt: "Bundling Set", sortOrder: 0 }] },
  { id: "demo_prod_serum_2", slug: "glowage-serum-20ml", name: "GlowAge Serum 20ml", description: "Ukuran travel untuk mulai coba rutinitas GlowAge.", priceMinor: 165000, currency: "IDR", stockQty: 45, isActive: true, images: [{ url: "/product-serum-1.png", alt: "GlowAge Serum 20ml", sortOrder: 0 }] },
  { id: "demo_prod_cream_2", slug: "bright-care-cream-promo", name: "Bright & Care Cream — Promo", description: "Edisi promo untuk member.", priceMinor: 175000, currency: "IDR", stockQty: 25, isActive: true, images: [{ url: "/product-cream-1.png", alt: "Bright Care Cream Promo", sortOrder: 0 }] },
  { id: "demo_prod_bundle_2", slug: "bright-renewal-set", name: "Bright + Comfort Duo", description: "Duo serum + cream untuk membantu kulit tampak lebih cerah alami.", priceMinor: 435000, currency: "IDR", stockQty: 20, isActive: true, images: [{ url: "/product-serum-2.png", alt: "Bright Renewal Set", sortOrder: 0 }] },
  { id: "demo_prod_dna_2", slug: "repair-glow-set", name: "Hydration + Glow Duo", description: "Kombinasi serum + gel hydration untuk bantu kulit terasa lebih lembap.", priceMinor: 360000, currency: "IDR", stockQty: 35, isActive: true, images: [{ url: "/product-dna-1.png", alt: "Repair Glow Set", sortOrder: 0 }] },
];

export async function listActiveProducts() {
  const { data, error } = await supabase
    .from("Product")
    .select(`*, images:ProductImage(url, alt, sortOrder)`)
    .eq("isActive", true)
    .order("createdAt", { ascending: false });

  if (error) return demoProducts.filter((p) => p.isActive);
  return data ?? demoProducts.filter((p) => p.isActive);
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("Product")
    .select(`*, images:ProductImage(url, alt, sortOrder)`)
    .eq("slug", slug)
    .single();

  if (error) return demoProducts.find((p) => p.slug === slug) ?? null;
  return data;
}
