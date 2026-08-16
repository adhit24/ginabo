"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";

export function CartMini() {
  const { totals, openCart } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <button
      onClick={openCart}
      className="relative inline-flex h-9 items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3.5 backdrop-blur-sm transition-all duration-300 hover:border-[#D8B4FE] hover:shadow-[0_2px_12px_rgba(120,37,124,0.1)] hover:-translate-y-0.5"
      aria-label="Keranjang belanja"
      suppressHydrationWarning
    >
      {/* Cart icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78257C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>

      {/* Count badge */}
      <span
        className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-brand px-1.5 text-[11px] font-bold text-white"
        suppressHydrationWarning
      >
        {totals.itemCount}
      </span>

      {/* Price */}
      <span className="hidden text-xs font-semibold text-[#4A1A5E] sm:inline" suppressHydrationWarning>
        {formatPrice(totals.subtotalMinor)}
      </span>
    </button>
  );
}
