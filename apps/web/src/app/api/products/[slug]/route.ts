import { jsonError, jsonOk } from "@/lib/http";
import { getProductBySlug } from "@/lib/catalog";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug);
    if (!product || !product.isActive) return jsonError("Not found", 404);
    return jsonOk({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceMinor: product.priceMinor,
      currency: product.currency,
      stockQty: product.stockQty,
      images: product.images.map((img) => ({ url: img.url, alt: img.alt, sortOrder: img.sortOrder }))
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

