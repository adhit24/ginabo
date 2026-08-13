export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { adminProductSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, slug, name, description, short_description, ingredients, weight_grams, base_price, stock_quantity, is_active, average_rating, review_count, created_at, product_images(url, sort_order)")
      .order("sort_order", { ascending: true });

    if (error) return jsonError("Server error", 500, error.message);

    return jsonOk(
      (products ?? []).map((p) => {
        const images = (
          (p.product_images as Array<{ url: string; sort_order: number }>) ?? []
        ).sort((a, b) => a.sort_order - b.sort_order);
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          description: p.description,
          shortDescription: p.short_description,
          ingredients: p.ingredients,
          weightGrams: p.weight_grams,
          priceMinor: p.base_price,
          currency: "IDR",
          stockQty: p.stock_quantity,
          isActive: p.is_active,
          averageRating: p.average_rating,
          reviewCount: p.review_count,
          imageUrl: images[0]?.url ?? null,
          createdAt: p.created_at,
        };
      })
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

    const imageUrl =
      typeof parsed.data.imageUrl === "string" && parsed.data.imageUrl.trim().length
        ? parsed.data.imageUrl.trim()
        : null;

    const { data: created, error: insertError } = await supabase
      .from("products")
      .insert({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        short_description: parsed.data.shortDescription || null,
        ingredients: parsed.data.ingredients || null,
        weight_grams: parsed.data.weightGrams ?? null,
        base_price: parsed.data.priceMinor,
        stock_quantity: parsed.data.stockQty,
        is_active: parsed.data.isActive,
      })
      .select()
      .single();

    if (insertError) return jsonError("Server error", 500, insertError.message);

    if (imageUrl) {
      const { error: imgError } = await supabase
        .from("product_images")
        .insert({ product_id: created.id, url: imageUrl, sort_order: 0 });

      if (imgError) return jsonError("Server error", 500, imgError.message);
    }

    return jsonOk({ id: created.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
