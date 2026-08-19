export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceMinor: number;
  currency: "IDR" | "USD";
  imageUrl: string | null;
  weightGrams?: number | null;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  selectedIds: string[];
};
