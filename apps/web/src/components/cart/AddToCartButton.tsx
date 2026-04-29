"use client";

import { useMemo, useState, useCallback } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { CartToast } from "@/components/cart/CartToast";

export function AddToCartButton({
  product
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
  const [showToast, setShowToast] = useState(false);

  const existingQty = useMemo(
    () => state.items.find((i) => i.productId === product.productId)?.quantity ?? 0,
    [product.productId, state.items]
  );

  function handleClick() {
    addItem(product, 1);
    setShowToast(true);
  }

  const handleDone = useCallback(() => setShowToast(false), []);

  return (
    <>
      <CartToast show={showToast} onDone={handleDone} />
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 py-2 text-xs font-semibold text-white transition hover:bg-brand-800"
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {existingQty > 0 ? `+ Keranjang (${existingQty})` : "+ Keranjang"}
      </button>
    </>
  );
}

