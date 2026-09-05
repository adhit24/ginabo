import type { CatalogProduct } from "./catalog";

export function mapCatalogProduct(row: Record<string, unknown>): CatalogProduct {
  const price = row.base_price;
  if (typeof price !== "number" || !Number.isSafeInteger(price) || price < 0) {
    throw new Error("base_price must be a non-negative integer");
  }

  const comparePrice = row.compare_price;
  const comparePriceMinor =
    typeof comparePrice === "number" && Number.isSafeInteger(comparePrice) && comparePrice > price
      ? comparePrice
      : null;

  const category = row.category as { name?: unknown; slug?: unknown } | null | undefined;

  const rawImages = (row.product_images ?? []) as Array<{
    url?: unknown;
    alt_text?: unknown;
    sort_order?: unknown;
  }>;
  const images = rawImages
    .filter((image) => typeof image.url === "string")
    .map((image) => ({
      url: image.url as string,
      alt: typeof image.alt_text === "string" ? image.alt_text : null,
      sortOrder: typeof image.sort_order === "number" ? image.sort_order : 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    description: typeof row.description === "string" ? row.description : "",
    priceMinor: price,
    comparePriceMinor,
    currency: "IDR",
    stockQty: typeof row.stock_quantity === "number" ? row.stock_quantity : 0,
    weightGrams: typeof row.weight_grams === "number" ? row.weight_grams : null,
    isActive: row.is_active !== false,
    averageRating: typeof row.average_rating === "number" ? row.average_rating : null,
    reviewCount: typeof row.review_count === "number" ? row.review_count : 0,
    categorySlug: typeof category?.slug === "string" ? category.slug : null,
    categoryName: typeof category?.name === "string" ? category.name : null,
    images,
  };
}
