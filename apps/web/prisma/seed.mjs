import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getEnv(name) {
  const v = process.env[name];
  if (!v) return null;
  return String(v);
}

async function main() {
  const adminEmail = getEnv("SEED_ADMIN_EMAIL");
  const adminPassword = getEnv("SEED_ADMIN_PASSWORD");

  if (adminEmail && adminPassword) {
    const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.adminUser.create({ data: { email: adminEmail, passwordHash } });
    }
  }

  const products = [
    {
      slug: "glowage-multi-active-serum",
      name: "GlowAge Multi-Active Serum",
      description:
        "Serum ringan untuk membantu kulit tampak lebih cerah alami, halus, dan tetap nyaman di tengah aktivitas harian. Cepat meresap dan enak dipakai sebelum makeup.",
      priceMinor: 285000,
      stockQty: 50,
      images: [{ url: "/product-serum-bg.png", alt: "GlowAge Serum", sortOrder: 0 }]
    },
    {
      slug: "bright-care-moisture-cream",
      name: "Bright & Care Moisture Cream",
      description:
        "Moisture cream untuk membantu menjaga skin barrier dan menutrisi kulit agar terasa lebih lembap dan tenang. Nyaman dipakai pagi dan malam, tanpa rasa berat.",
      priceMinor: 195000,
      stockQty: 60,
      images: [{ url: "/product-cream-bg.png", alt: "Bright & Care Moisture Cream", sortOrder: 0 }]
    },
    {
      slug: "hydra-moist-gel-ultimate",
      name: "Hydra Moist Gel Ultimate",
      description:
        "Gel hydration 3-in-1 untuk membantu melembapkan, menenangkan, dan mendukung recovery saat kulit terasa capek. Tekstur ringan, cepat meresap, dan nyaman dipakai harian.",
      priceMinor: 215000,
      stockQty: 40,
      images: [{ url: "/product-dna-bg.png", alt: "Hydra Moist Gel Ultimate", sortOrder: 0 }]
    },
    {
      slug: "daily-barrier-routine-set",
      name: "Daily Skin Nutrition Set",
      description:
        "Paket rutinitas AM/PM untuk perempuan aktif: GlowAge Serum + Bright & Care Cream + Hydra Moist Gel. Lebih praktis untuk dipakai konsisten, lebih hemat 20% dari harga normal.",
      priceMinor: 620000,
      stockQty: 30,
      images: [{ url: "/product-bundle.png", alt: "Daily Skin Nutrition Set", sortOrder: 0 }]
    },
    {
      slug: "glowage-serum-20ml",
      name: "GlowAge Serum 20ml",
      description: "Ukuran travel untuk mulai coba rutinitas GlowAge. Nyaman dipakai rutin sebelum upgrade ke full size.",
      priceMinor: 165000,
      stockQty: 45,
      images: [{ url: "/product-serum-1.png", alt: "GlowAge Serum 20ml", sortOrder: 0 }]
    },
    {
      slug: "bright-care-cream-promo",
      name: "Bright & Care Cream — Promo",
      description: "Edisi promo untuk member. Moisture cream yang nyaman dipakai harian, fokus pada hidrasi dan kenyamanan kulit.",
      priceMinor: 175000,
      stockQty: 25,
      images: [{ url: "/product-cream-1.png", alt: "Bright & Care Cream Promo", sortOrder: 0 }]
    },
    {
      slug: "bright-renewal-set",
      name: "Bright + Comfort Duo",
      description:
        "Duo serum + cream untuk membantu kulit tampak lebih cerah alami, tetap lembap, dan terasa nyaman dipakai rutin. Cocok untuk kamu yang aktif dan ingin skincare yang tidak ribet.",
      priceMinor: 435000,
      stockQty: 20,
      images: [{ url: "/product-serum-2.png", alt: "Bright + Comfort Duo", sortOrder: 0 }]
    },
    {
      slug: "repair-glow-set",
      name: "Hydration + Glow Duo",
      description:
        "Kombinasi serum + gel hydration untuk bantu kulit terasa lebih lembap, tenang, dan tampak lebih segar. Ringan dan nyaman untuk pemakaian harian.",
      priceMinor: 360000,
      stockQty: 35,
      images: [{ url: "/product-dna-1.png", alt: "Hydration + Glow Duo", sortOrder: 0 }]
    },
    {
      slug: "ginabo-barrier-cleanser",
      name: "Barrier Calm Cleanser",
      description:
        "Pembersih harian yang lembut untuk kulit yang sering terpapar AC dan aktivitas. Membersihkan tanpa rasa ketarik, nyaman untuk dipakai rutin.",
      priceMinor: 89000,
      stockQty: 50,
      images: [{ url: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd", alt: "Cleanser bottle", sortOrder: 0 }]
    },
    {
      slug: "ginabo-barrier-serum",
      name: "Barrier Repair Serum",
      description: "Serum ringan untuk membantu menjaga skin barrier tetap stabil dan terasa lebih tenang. Cocok untuk rutinitas yang sederhana.",
      priceMinor: 129000,
      stockQty: 40,
      images: [{ url: "https://images.unsplash.com/photo-1612810436541-336dbe9b9fa8", alt: "Serum bottle", sortOrder: 0 }]
    },
    {
      slug: "ginabo-daily-moisturizer",
      name: "Daily Moisture Cream",
      description: "Moisturizer harian yang menutrisi dan membantu menjaga kelembapan, nyaman dipakai pagi dan malam.",
      priceMinor: 119000,
      stockQty: 60,
      images: [{ url: "https://images.unsplash.com/photo-1585232351009-aa87416fca90", alt: "Moisturizer jar", sortOrder: 0 }]
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceMinor: p.priceMinor,
        stockQty: p.stockQty,
        isActive: true,
        images: { create: p.images }
      },
      update: {
        name: p.name,
        description: p.description,
        priceMinor: p.priceMinor,
        stockQty: p.stockQty,
        isActive: true,
        images: { deleteMany: {}, create: p.images }
      }
    });
  }
}

await main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
