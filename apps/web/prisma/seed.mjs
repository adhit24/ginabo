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

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const products = [
      {
        slug: "ginabo-barrier-cleanser",
        name: "Barrier Calm Cleanser",
        description: "Pembersih harian lembut untuk barrier yang sensitif. Tanpa rasa ketarik, tanpa drama.",
        priceMinor: 89000,
        stockQty: 50,
        images: { create: [{ url: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd", alt: "Cleanser bottle", sortOrder: 0 }] }
      },
      {
        slug: "ginabo-barrier-serum",
        name: "Barrier Repair Serum",
        description: "Serum ringan untuk memperkuat skin barrier dan membantu kulit kembali stabil.",
        priceMinor: 129000,
        stockQty: 40,
        images: { create: [{ url: "https://images.unsplash.com/photo-1612810436541-336dbe9b9fa8", alt: "Serum bottle", sortOrder: 0 }] }
      },
      {
        slug: "ginabo-daily-moisturizer",
        name: "Daily Moisture Cream",
        description: "Moisturizer harian untuk pemakaian konsisten. Fokus pada kenyamanan dan pemulihan.",
        priceMinor: 119000,
        stockQty: 60,
        images: { create: [{ url: "https://images.unsplash.com/photo-1585232351009-aa87416fca90", alt: "Moisturizer jar", sortOrder: 0 }] }
      }
    ];

    for (const p of products) {
      await prisma.product.create({ data: p });
    }
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
