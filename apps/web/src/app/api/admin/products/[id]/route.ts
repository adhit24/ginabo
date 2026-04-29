import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { adminProductSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { sortOrder: "asc" } } }
    });
    if (!product) return jsonError("Not found", 404);
    return jsonOk({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceMinor: product.priceMinor,
      currency: product.currency,
      stockQty: product.stockQty,
      isActive: product.isActive,
      imageUrl: product.images[0]?.url ?? null
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = adminProductSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const imageUrlRaw = parsed.data.imageUrl;
    const imageUrl = typeof imageUrlRaw === "string" && imageUrlRaw.trim().length ? imageUrlRaw.trim() : null;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        priceMinor: parsed.data.priceMinor,
        currency: parsed.data.currency,
        stockQty: parsed.data.stockQty,
        isActive: parsed.data.isActive
      }
    });

    if (imageUrlRaw !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: updated.id } });
      if (imageUrl) {
        await prisma.productImage.create({ data: { productId: updated.id, url: imageUrl, sortOrder: 0 } });
      }
    }

    return jsonOk({ id: updated.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
