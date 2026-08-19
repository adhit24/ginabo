"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { AddedToCartModal, type AddedCartItem } from "@/components/cart/AddedToCartModal";
import { useCurrency } from "@/components/currency/CurrencyProvider";

export function AddToCartIconButton({
  product,
}: {
  product: {
    productId: string;
    slug: string;
    name: string;
    priceMinor: number;
    currency: "IDR" | "USD";
    imageUrl: string | null;
  };
}) {
  const { state, addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [addedItem, setAddedItem] = useState<AddedCartItem | null>(null);

  const existingQty = useMemo(
    () => state.items.find((i) => i.productId === product.productId)?.quantity ?? 0,
    [product.productId, state.items]
  );

  function handleClick() {
    addItem(product, 1);
    setAddedItem({ ...product, quantity: 1 });
  }

  return (
    <>
      <AddedToCartModal open={!!addedItem} item={addedItem} onClose={() => setAddedItem(null)} formatPrice={formatPrice} />
      <button
        type="button"
        onClick={handleClick}
        title={existingQty > 0 ? `${existingQty} di keranjang` : "Tambah ke keranjang"}
        className="flex flex-col items-center justify-center gap-0.5 rounded-[20px] bg-brand-700 px-3 py-2.5 text-white transition hover:bg-brand-800 active:scale-95"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <span className="text-[11px] font-bold leading-none">
          {existingQty > 0 ? `(${existingQty})` : "Beli"}
        </span>
      </button>
    </>
  );
}
