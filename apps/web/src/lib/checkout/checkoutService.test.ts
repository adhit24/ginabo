import { describe, expect, it } from "vitest";

import { calculateServerCheckoutTotal, normalizeCheckoutRequestItems, priceCheckoutItems } from "./checkoutService";

const product = { id: "p1", name: "Serum", base_price: 100_000, stock_quantity: 3, weight_grams: 20, is_active: true };

describe("server checkout pricing", () => {
  it("ignores client display price and calculates from canonical product", () => {
    const items = normalizeCheckoutRequestItems([{ product_id: "p1", qty: 2 }]);
    const priced = priceCheckoutItems(items, [product], []);
    expect(priced[0].unitPrice).toBe(100_000);
    expect(calculateServerCheckoutTotal({ items: priced, shippingCost: 18_000 }).total).toBe(218_000);
  });

  it("rejects tampered price, invalid stock, and duplicate item", () => {
    expect(() => normalizeCheckoutRequestItems([{ product_id: "p1", qty: 1, price: 1 }])).toThrow("hanya menerima");
    expect(() => priceCheckoutItems([{ product_id: "p1", variant_id: null, qty: 4 }], [product], [])).toThrow("stok");
    expect(() => priceCheckoutItems([{ product_id: "p1", variant_id: null, qty: 1 }, { product_id: "p1", variant_id: null, qty: 1 }], [product], [])).toThrow("duplikat");
  });
});
