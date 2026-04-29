export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceMinor: number;
  currency: "IDR" | "USD";
  imageUrl: string | null;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};
