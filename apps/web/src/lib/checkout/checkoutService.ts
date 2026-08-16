import { calculateOrderTotals, type ServerPricedOrderItem } from "@/lib/domain/customerOrder";

export type CheckoutRequestItem = {
  product_id: string;
  variant_id?: string | null;
  qty: number;
};

export type ServerProduct = {
  id: string;
  name: string;
  base_price: number;
  stock_quantity: number;
  weight_grams: number | null;
  is_active: boolean;
};

export type ServerVariant = {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  stock_quantity: number;
  weight_grams: number | null;
  is_active: boolean;
};

export function normalizeCheckoutRequestItems(input: unknown): CheckoutRequestItem[] {
  if (!Array.isArray(input) || input.length === 0) throw new Error("items must not be empty");
  return input.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("invalid checkout item");
    const item = raw as Record<string, unknown>;
    if ("price" in item || "priceMinor" in item || "name" in item) {
      throw new Error("checkout hanya menerima product_id, variant_id, dan qty");
    }
    if (typeof item.product_id !== "string" || item.product_id.trim() === "") throw new Error("product_id wajib diisi");
    if (!Number.isSafeInteger(item.qty) || (item.qty as number) < 1 || (item.qty as number) > 99) throw new Error("qty harus bilangan bulat 1-99");
    const variantId = item.variant_id == null ? null : item.variant_id;
    if (variantId !== null && (typeof variantId !== "string" || variantId.trim() === "")) throw new Error("variant_id tidak valid");
    return { product_id: item.product_id, variant_id: variantId as string | null, qty: item.qty as number };
  });
}

export function priceCheckoutItems(
  items: CheckoutRequestItem[],
  products: ServerProduct[],
  variants: ServerVariant[],
): ServerPricedOrderItem[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const seen = new Set<string>();

  return items.map((item) => {
    const key = `${item.product_id}:${item.variant_id ?? "base"}`;
    if (seen.has(key)) throw new Error("item checkout duplikat");
    seen.add(key);
    const product = productMap.get(item.product_id);
    if (!product || !product.is_active) throw new Error("produk tidak tersedia");
    const variant = item.variant_id ? variantMap.get(item.variant_id) : null;
    if (item.variant_id && (!variant || variant.product_id !== product.id || !variant.is_active)) throw new Error("varian tidak tersedia");
    const stock = variant ? variant.stock_quantity : product.stock_quantity;
    if (stock < item.qty) throw new Error(`stok tidak cukup untuk ${product.name}`);
    const unitPrice = product.base_price + (variant?.price_modifier ?? 0);
    const weightGrams = variant?.weight_grams ?? product.weight_grams;
    if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) throw new Error("harga katalog tidak valid");
    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      quantity: item.qty,
      unitPrice,
      productName: product.name,
      variantName: variant?.name ?? null,
      weightGrams,
    };
  });
}

export function calculateServerCheckoutTotal(input: {
  items: ServerPricedOrderItem[];
  shippingCost?: number;
  paymentFee?: number;
  discountAmount?: number;
}) {
  return calculateOrderTotals(input);
}
