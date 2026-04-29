import { jsonError, jsonOk } from "@/lib/http";
import { listActiveProducts } from "@/lib/catalog";

export async function GET() {
  try {
    const products = await listActiveProducts();
    return jsonOk(
      products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceMinor: p.priceMinor,
        currency: p.currency,
        stockQty: p.stockQty,
        imageUrl: p.images[0]?.url ?? null
      }))
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

