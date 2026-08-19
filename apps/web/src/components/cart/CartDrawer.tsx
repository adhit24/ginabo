"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { FlowButton } from "@/components/ui/flow-button";
import { FREE_SHIPPING_THRESHOLD_MINOR } from "@/lib/constants";

export function CartDrawer() {
  const { state, totals, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const { formatPrice } = useCurrency();

  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - totals.subtotalMinor);
  const shippingProgress = Math.min(100, (totals.subtotalMinor / FREE_SHIPPING_THRESHOLD_MINOR) * 100);
  const freeShippingUnlocked = shippingRemaining === 0;

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
        className={`fixed right-0 top-0 z-[10000] flex h-full w-full max-w-[100vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[380px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
          <h2 className="text-base font-bold text-brand-900">Keranjang</h2>
          <button onClick={closeCart} className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 transition hover:bg-brand-100">
            <svg width="14" height="14" fill="none" stroke="#5B4B8A" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {state.items.length > 0 && (
          <div className="border-b border-brand-100 px-5 py-3">
            <p className="mb-2 text-xs font-semibold text-brand-800">
              {freeShippingUnlocked
                ? "🎉 Kamu dapat Gratis Ongkir!"
                : <>Belanja <span className="text-brand-600">{formatPrice(shippingRemaining)}</span> lagi untuk Gratis Ongkir</>}
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-gradient-brand transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <svg width="48" height="48" fill="none" stroke="#C6B7E2" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-sm text-gray-500">Keranjang belanja Anda kosong.</p>
              <FlowButton onClick={closeCart} text="Mulai Belanja" />
            </div>
          ) : (
            <div className="divide-y divide-brand-100">
              {state.items.map(item => {
                const originalMinor = Math.round(item.priceMinor * 1.24);
                return (
                  <div key={item.productId} className="flex gap-3 py-4">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-brand-100 bg-brand-50">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : (
                        <div className="h-full w-full bg-brand-100" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between gap-1">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-brand-900">{item.name}</p>
                      <div>
                        <span className="text-sm font-bold text-brand-700">{formatPrice(item.priceMinor)}</span>
                        <span className="ml-2 text-[11px] text-gray-400 line-through">{formatPrice(originalMinor)}</span>
                      </div>

                      {/* Qty + delete */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-300 transition hover:text-red-500"
                          aria-label="Hapus"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>

                        <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-brand-200">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-brand-700 transition hover:bg-brand-50"
                          >
                            <span className="text-sm leading-none">−</span>
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-brand-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-brand-700 transition hover:bg-brand-50"
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
          <div className="border-t border-brand-100 bg-brand-50/50 px-5 pb-[calc(1.5rem+var(--safe-bottom))] pt-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">Subtotal</span>
              <span className="text-base font-bold text-brand-900">{formatPrice(totals.subtotalMinor)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-lg border border-brand-300 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Lihat Keranjang
              </Link>
              <FlowButton href="/checkout" onClick={closeCart} text="Checkout Sekarang" className="w-full" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
