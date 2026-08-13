export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { adminProductSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("id, slug, name, description, short_description, ingredients, weight_grams, base_price, stock_quantity, is_active, average_rating, review_count, product_images(url, sort_order)")
      .eq("id", params.id)
      .single();

    if (error || !product) return jsonError("Not found", 404);

    const images = (
      (product.product_images as Array<{ url: string; sort_order: number }>) ?? []
    ).sort((a, b) => a.sort_order - b.sort_order);

    return jsonOk({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description,
      ingredients: product.ingredients,
      weightGrams: product.weight_grams,
      priceMinor: product.base_price,
      currency: "IDR",
      stockQty: product.stock_quantity,
      isActive: product.is_active,
      averageRating: product.average_rating,
      reviewCount: product.review_count,
      imageUrl: images[0]?.url ?? null,
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
    const imageUrl =
      typeof imageUrlRaw === "string" && imageUrlRaw.trim().length ? imageUrlRaw.trim() : null;

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.slug !== undefined) updatePayload.slug = parsed.data.slug;
    if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
    if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
    if (parsed.data.shortDescription !== undefined) updatePayload.short_description = parsed.data.shortDescription || null;
    if (parsed.data.ingredients !== undefined) updatePayload.ingredients = parsed.data.ingredients || null;
    if (parsed.data.weightGrams !== undefined) updatePayload.weight_grams = parsed.data.weightGrams;
    if (parsed.data.priceMinor !== undefined) updatePayload.base_price = parsed.data.priceMinor;
    if (parsed.data.stockQty !== undefined) updatePayload.stock_quantity = parsed.data.stockQty;
    if (parsed.data.isActive !== undefined) updatePayload.is_active = parsed.data.isActive;

    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) return jsonError("Server error", 500, updateError.message);
    if (!updated) return jsonError("Not found", 404);

    if (imageUrlRaw !== undefined) {
      await supabase.from("product_images").delete().eq("product_id", updated.id);
      if (imageUrl) {
        await supabase.from("product_images").insert({ product_id: updated.id, url: imageUrl, sort_order: 0 });
      }
    }

    return jsonOk({ id: updated.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) return jsonError("Server error", 500, error.message);
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
