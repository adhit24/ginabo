export const runtime = 'edge';

import { jsonError, jsonOk } from "@/lib/http";
import { supabase } from "@/lib/supabase";
import { adminProductSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("Product")
      .select("*, images:ProductImage(*)")
      .order("createdAt", { ascending: false });

    if (error) return jsonError("Server error", 500, error.message);

    return jsonOk(
      (products ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceMinor: p.priceMinor,
        currency: p.currency,
        stockQty: p.stockQty,
        isActive: p.isActive,
        imageUrl: (p.images as { url: string }[] | null)?.[0]?.url ?? null,
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

    const imageUrl =
      typeof parsed.data.imageUrl === "string" && parsed.data.imageUrl.trim().length
        ? parsed.data.imageUrl.trim()
        : null;

    const { data: created, error: insertError } = await supabase
      .from("Product")
      .insert({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        priceMinor: parsed.data.priceMinor,
        currency: parsed.data.currency,
        stockQty: parsed.data.stockQty,
        isActive: parsed.data.isActive
      })
      .select()
      .single();

    if (insertError) return jsonError("Server error", 500, insertError.message);

    if (imageUrl) {
      const { error: imgError } = await supabase
        .from("ProductImage")
        .insert({ productId: created.id, url: imageUrl, sortOrder: 0 });

      if (imgError) return jsonError("Server error", 500, imgError.message);
    }

    return jsonOk({ id: created.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
