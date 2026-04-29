"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";

export function CartMini() {
  const { totals, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 px-3 text-sm font-semibold text-gray-800 hover:border-gray-300"
    >
      <span className="font-medium">Cart</span>
      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
        {totals.itemCount}
      </span>
      <span className="hidden text-xs text-gray-500 sm:inline">{formatMoney(totals.subtotalMinor, "IDR")}</span>
    </button>
  );
}
