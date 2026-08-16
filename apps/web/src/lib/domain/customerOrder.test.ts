import { describe, expect, it } from "vitest";

import { calculateOrderTotals, normalizeCheckoutItem } from "./customerOrder";

describe("customer order contract", () => {
  it("calculates subtotal and total from server-authoritative item prices", () => {
    expect(
      calculateOrderTotals({
        items: [
          { productId: "p-1", quantity: 2, unitPrice: 125_000 },
          { productId: "p-2", quantity: 1, unitPrice: 80_000 },
        ],
        shippingCost: 18_000,
        paymentFee: 2_500,
        discountAmount: 10_000,
      }),
    ).toEqual({ subtotal: 330_000, shippingCost: 18_000, paymentFee: 2_500, discountAmount: 10_000, total: 340_500 });
  });

  it("rejects client price and quantity values that cannot be trusted", () => {
    expect(() => normalizeCheckoutItem({ product_id: "p-1", qty: 1.5 })).toThrow("quantity");
    expect(() => normalizeCheckoutItem({ product_id: "p-1", qty: 0 })).toThrow("quantity");
    expect(() => normalizeCheckoutItem({ product_id: "p-1", qty: 1, price: 1 })).toThrow("price");
  });
});
