"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/money";

export function CartDrawer() {
  const { state, totals, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        suppressHydrationWarning
      />

      {/* Drawer */}
      <div
        suppressHydrationWarning
        className={`fixed right-0 top-0 z-[10000] flex h-full w-full max-w-[100vw] flex-col backdrop-blur-2xl shadow-2xl transition-transform duration-300 ease-in-out sm:w-[380px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "linear-gradient(160deg, rgba(15,10,30,0.94) 0%, rgba(30,11,56,0.96) 50%, rgba(42,16,64,0.94) 100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(192,132,252,0.12)" }}>
          <h2 className="text-base font-bold text-white">Keranjang</h2>
          <button onClick={closeCart} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition hover:bg-white/20">
            <svg width="14" height="14" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <svg width="48" height="48" fill="none" stroke="rgba(192,132,252,0.4)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-sm text-white/40">Keranjang belanja Anda kosong.</p>
              <button onClick={closeCart} className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {state.items.map(item => {
                const originalMinor = Math.round(item.priceMinor * 1.24);
                return (
                  <div key={item.productId} className="flex gap-3 py-4">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : (
                        <div className="h-full w-full" style={{ background: "rgba(255,255,255,0.05)" }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between gap-1">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{item.name}</p>
                      <div>
                        <span className="text-sm font-bold text-[#c084fc]">{formatMoney(item.priceMinor, item.currency)}</span>
                        <span className="ml-2 text-[11px] text-white/30 line-through">{formatMoney(originalMinor, item.currency)}</span>
                      </div>

                      {/* Qty + delete */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-white/25 transition hover:text-red-400"
                          aria-label="Hapus"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>

                        <div className="flex items-center gap-0 overflow-hidden rounded-lg" style={{ border: "1px solid rgba(192,132,252,0.2)" }}>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-white/60 transition hover:bg-white/[0.06]"
                          >
                            <span className="text-sm leading-none">−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-white/60 transition hover:bg-white/[0.06]"
                          >
                            <span className="text-sm leading-none">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="px-5 pb-[calc(1.5rem+var(--safe-bottom))] pt-4" style={{ borderTop: "1px solid rgba(192,132,252,0.12)", background: "rgba(15,10,30,0.5)" }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/50">Subtotal</span>
              <span className="text-base font-bold text-white">{formatMoney(totals.subtotalMinor, "IDR")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-lg border py-2.5 text-sm font-semibold text-[#c084fc] transition hover:bg-white/[0.06]"
                style={{ borderColor: "rgba(192,132,252,0.3)" }}
              >
                Lihat Keranjang
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}
              >
                Checkout Sekarang
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
