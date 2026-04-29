import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { adminProductSchema } from "@/lib/validation";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" }
    });
    return jsonOk(
      products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceMinor: p.priceMinor,
        currency: p.currency,
        stockQty: p.stockQty,
        isActive: p.isActive,
        imageUrl: p.images[0]?.url ?? null,
        createdAt: p.createdAt
      }))
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminProductSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const imageUrl = typeof parsed.data.imageUrl === "string" && parsed.data.imageUrl.trim().length ? parsed.data.imageUrl.trim() : null;

    const created = await prisma.product.create({
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        priceMinor: parsed.data.priceMinor,
        currency: parsed.data.currency,
        stockQty: parsed.data.stockQty,
        isActive: parsed.data.isActive,
        images: imageUrl ? { create: [{ url: imageUrl, sortOrder: 0 }] } : undefined
      },
      include: { images: true }
    });

    return jsonOk({ id: created.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

