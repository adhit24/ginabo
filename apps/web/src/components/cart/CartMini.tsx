"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";

export function CartMini() {
  const { totals, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative inline-flex h-9 items-center gap-2 rounded-lg px-3.5 transition hover:opacity-90 hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(135deg, #1e1b3a, #2d2556)",
        boxShadow: "0 4px 12px rgba(20,15,50,0.25)",
      }}
      aria-label="Keranjang belanja"
      suppressHydrationWarning
    >
      {/* Cart icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>

      {/* Count badge */}
      <span
        className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
        style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
        suppressHydrationWarning
      >
        {totals.itemCount}
      </span>

      {/* Price */}
      <span className="hidden text-xs font-semibold text-white sm:inline" suppressHydrationWarning>
        {formatMoney(totals.subtotalMinor, "IDR")}
      </span>
    </button>
  );
}
