"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";

export function CartMini() {
  const { totals, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative inline-flex h-9 items-center gap-2 rounded-full px-3.5 transition hover:opacity-90 hover:-translate-y-0.5"
      style={{
        background: "rgba(139,92,246,0.08)",
        border: "1.5px solid rgba(139,92,246,0.25)",
      }}
      aria-label="Keranjang belanja"
    >
      {/* Bag icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
        <path d="M3 6h18"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>

      {/* Count badge */}
      <span
        className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
        style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
      >
        {totals.itemCount}
      </span>

      {/* Price */}
      <span className="hidden text-xs font-semibold text-[#6b21a8] sm:inline">
        {formatMoney(totals.subtotalMinor, "IDR")}
      </span>
    </button>
  );
}
