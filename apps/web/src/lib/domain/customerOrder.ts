export type ServerPricedOrderItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  productName?: string;
  variantName?: string | null;
  weightGrams?: number | null;
};

export type OrderTotals = {
  subtotal: number;
  shippingCost: number;
  paymentFee: number;
  discountAmount: number;
  total: number;
};

function requireNonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
  return value;
}

export function normalizeCheckoutItem(input: unknown): { productId: string; variantId: string | null; quantity: number } {
  if (!input || typeof input !== "object") throw new Error("item must be an object");

  const item = input as Record<string, unknown>;
  if (typeof item.product_id !== "string" || item.product_id.trim() === "") {
    throw new Error("product_id is required");
  }

  if ("price" in item) throw new Error("price must come from the server");

  const quantity = requireNonNegativeInteger(item.qty, "quantity");
  if (quantity < 1 || quantity > 99) throw new Error("quantity must be between 1 and 99");

  const variantId = item.variant_id == null ? null : item.variant_id;
  if (variantId !== null && (typeof variantId !== "string" || variantId.trim() === "")) {
    throw new Error("variant_id must be a non-empty string");
  }

  return { productId: item.product_id, variantId, quantity };
}

export function calculateOrderTotals(input: {
  items: ServerPricedOrderItem[];
  shippingCost?: number;
  paymentFee?: number;
  discountAmount?: number;
}): OrderTotals {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("at least one order item is required");
  }

  const subtotal = input.items.reduce((sum, item) => {
    if (!item.productId) throw new Error("productId is required");
    const quantity = requireNonNegativeInteger(item.quantity, "quantity");
    if (quantity < 1 || quantity > 99) throw new Error("quantity must be between 1 and 99");
    const unitPrice = requireNonNegativeInteger(item.unitPrice, "unitPrice");
    const lineTotal = unitPrice * quantity;
    if (!Number.isSafeInteger(lineTotal)) throw new Error("line total is too large");
    return sum + lineTotal;
  }, 0);

  const shippingCost = requireNonNegativeInteger(input.shippingCost ?? 0, "shippingCost");
  const paymentFee = requireNonNegativeInteger(input.paymentFee ?? 0, "paymentFee");
  const discountAmount = requireNonNegativeInteger(input.discountAmount ?? 0, "discountAmount");
  if (discountAmount > subtotal + shippingCost + paymentFee) {
    throw new Error("discountAmount exceeds order value");
  }

  const total = subtotal + shippingCost + paymentFee - discountAmount;
  if (!Number.isSafeInteger(total)) throw new Error("order total is too large");

  return { subtotal, shippingCost, paymentFee, discountAmount, total };
}
