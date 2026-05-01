import { prisma } from "@/lib/prisma";

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
  {
    id: "demo_prod_serum_1",
    slug: "glowage-multi-active-serum",
    name: "GlowAge Multi-Active Serum",
    description: "Serum ringan untuk membantu kulit tampak lebih cerah alami, halus, dan tetap nyaman di tengah aktivitas harian. Cepat meresap dan enak dipakai sebelum makeup.",
    priceMinor: 285000,
    currency: "IDR",
    stockQty: 50,
    isActive: true,
    images: [{ url: "/product-serum-bg.png", alt: "GlowAge Serum", sortOrder: 0 }]
  },
  {
    id: "demo_prod_cream_1",
    slug: "bright-care-moisture-cream",
    name: "Bright & Care Moisture Cream",
    description: "Moisture cream untuk membantu menjaga skin barrier dan menutrisi kulit agar terasa lebih lembap dan tenang. Nyaman dipakai pagi dan malam, tanpa rasa berat.",
    priceMinor: 195000,
    currency: "IDR",
    stockQty: 60,
    isActive: true,
    images: [{ url: "/product-cream-bg.png", alt: "Bright Care Cream", sortOrder: 0 }]
  },
  {
    id: "demo_prod_dna_1",
    slug: "hydra-moist-gel-ultimate",
    name: "Hydra Moist Gel Ultimate",
    description: "Gel hydration 3-in-1 untuk membantu melembapkan, menenangkan, dan mendukung recovery saat kulit terasa capek. Tekstur ringan, cepat meresap, dan nyaman dipakai harian.",
    priceMinor: 215000,
    currency: "IDR",
    stockQty: 40,
    isActive: true,
    images: [{ url: "/product-dna-bg.png", alt: "Hydra Moist Gel", sortOrder: 0 }]
  },
  {
    id: "demo_prod_bundle_1",
    slug: "daily-barrier-routine-set",
    name: "Daily Skin Nutrition Set",
    description: "Paket rutinitas AM/PM untuk perempuan aktif: GlowAge Serum + Bright & Care Cream + Hydra Moist Gel. Lebih praktis untuk dipakai konsisten, lebih hemat 20% dari harga normal.",
    priceMinor: 620000,
    currency: "IDR",
    stockQty: 30,
    isActive: true,
    images: [{ url: "/product-bundle.png", alt: "Bundling Set", sortOrder: 0 }]
  },
  {
    id: "demo_prod_serum_2",
    slug: "glowage-serum-20ml",
    name: "GlowAge Serum 20ml",
    description: "Ukuran travel untuk mulai coba rutinitas GlowAge. Nyaman dipakai rutin sebelum upgrade ke full size.",
    priceMinor: 165000,
    currency: "IDR",
    stockQty: 45,
    isActive: true,
    images: [{ url: "/product-serum-1.png", alt: "GlowAge Serum 20ml", sortOrder: 0 }]
  },
  {
    id: "demo_prod_cream_2",
    slug: "bright-care-cream-promo",
    name: "Bright & Care Cream — Promo",
    description: "Edisi promo untuk member. Moisture cream yang nyaman dipakai harian, fokus pada hidrasi dan kenyamanan kulit.",
    priceMinor: 175000,
    currency: "IDR",
    stockQty: 25,
    isActive: true,
    images: [{ url: "/product-cream-1.png", alt: "Bright Care Cream Promo", sortOrder: 0 }]
  },
  {
    id: "demo_prod_bundle_2",
    slug: "bright-renewal-set",
    name: "Bright + Comfort Duo",
    description: "Duo serum + cream untuk membantu kulit tampak lebih cerah alami, tetap lembap, dan terasa nyaman dipakai rutin. Cocok untuk kamu yang aktif dan ingin skincare yang tidak ribet.",
    priceMinor: 435000,
    currency: "IDR",
    stockQty: 20,
    isActive: true,
    images: [{ url: "/product-serum-2.png", alt: "Bright Renewal Set", sortOrder: 0 }]
  },
  {
    id: "demo_prod_dna_2",
    slug: "repair-glow-set",
    name: "Hydration + Glow Duo",
    description: "Kombinasi serum + gel hydration untuk bantu kulit terasa lebih lembap, tenang, dan tampak lebih segar. Ringan dan nyaman untuk pemakaian harian.",
    priceMinor: 360000,
    currency: "IDR",
    stockQty: 35,
    isActive: true,
    images: [{ url: "/product-dna-1.png", alt: "Repair Glow Set", sortOrder: 0 }]
  },
];

function isDatabaseUnavailableError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("Environment variable not found: DATABASE_URL") ||
    msg.includes("Can't reach database server") ||
    msg.includes("P1001") ||
    msg.includes("PrismaClientInitializationError")
  );
}

export async function listActiveProducts() {
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" }
    });
  } catch (e) {
    if (isDatabaseUnavailableError(e)) {
      return demoProducts.filter((p) => p.isActive);
    }
    throw e;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" } } }
    });
  } catch (e) {
    if (isDatabaseUnavailableError(e)) {
      return demoProducts.find((p) => p.slug === slug) ?? null;
    }
    throw e;
  }
}
