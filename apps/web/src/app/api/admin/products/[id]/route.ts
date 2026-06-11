export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { adminProductSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { data: product, error } = await supabase
      .from("Product")
      .select("*, images:ProductImage(*)")
      .eq("id", params.id)
      .single();

    if (error) return jsonError("Not found", 404);
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
      imageUrl: (product.images as { url: string }[] | null)?.[0]?.url ?? null
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
    if (parsed.data.priceMinor !== undefined) updatePayload.priceMinor = parsed.data.priceMinor;
    if (parsed.data.currency !== undefined) updatePayload.currency = parsed.data.currency;
    if (parsed.data.stockQty !== undefined) updatePayload.stockQty = parsed.data.stockQty;
    if (parsed.data.isActive !== undefined) updatePayload.isActive = parsed.data.isActive;

    const { data: updated, error: updateError } = await supabase
      .from("Product")
      .update(updatePayload)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) return jsonError("Server error", 500, updateError.message);
    if (!updated) return jsonError("Not found", 404);

    if (imageUrlRaw !== undefined) {
      const { error: deleteImgError } = await supabase
        .from("ProductImage")
        .delete()
        .eq("productId", updated.id);

      if (deleteImgError) return jsonError("Server error", 500, deleteImgError.message);

      if (imageUrl) {
        const { error: insertImgError } = await supabase
          .from("ProductImage")
          .insert({ productId: updated.id, url: imageUrl, sortOrder: 0 });

        if (insertImgError) return jsonError("Server error", 500, insertImgError.message);
      }
    }

    return jsonOk({ id: updated.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase
      .from("Product")
      .delete()
      .eq("id", params.id);

    if (error) return jsonError("Server error", 500, error.message);

    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
