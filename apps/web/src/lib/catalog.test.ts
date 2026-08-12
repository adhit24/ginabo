import { describe, expect, it } from "vitest";

import { mapCatalogProduct } from "./catalogMapping";

describe("catalog mapping", () => {
  it("maps canonical Supabase price, stock, and image columns", () => {
    expect(mapCatalogProduct({
      id: "11111111-1111-4111-8111-111111111111",
      slug: "serum",
      name: "Serum",
      description: null,
      base_price: 125_000,
      stock_quantity: 7,
      weight_grams: 20,
      is_active: true,
      product_images: [{ url: "/serum.png", alt_text: "Serum", sort_order: 2 }],
    })).toMatchObject({
      id: "11111111-1111-4111-8111-111111111111",
      priceMinor: 125_000,
      stockQty: 7,
      weightGrams: 20,
      images: [{ url: "/serum.png", alt: "Serum", sortOrder: 2 }],
    });
  });

  it("rejects catalog rows without a canonical price", () => {
    expect(() => mapCatalogProduct({ id: "p", slug: "p", name: "P", base_price: null })).toThrow("base_price");
  });
});
