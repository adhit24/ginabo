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
        className={`fixed inset-0 z-[9999] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-[10000] flex h-full w-full max-w-[100vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[360px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">Keranjang</h2>
          <button onClick={closeCart} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-sm text-gray-400">Keranjang belanja Anda kosong.</p>
              <button onClick={closeCart} className="rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {state.items.map(item => {
                const originalMinor = Math.round(item.priceMinor * 1.24);
                return (
                  <div key={item.productId} className="flex gap-3 py-4">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between gap-1">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">{item.name}</p>
                      <div>
                        <span className="text-sm font-bold text-gray-900">{formatMoney(item.priceMinor, item.currency)}</span>
                        <span className="ml-2 text-[11px] text-gray-400 line-through">{formatMoney(originalMinor, item.currency)}</span>
                      </div>

                      {/* Qty + delete */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-300 transition hover:text-red-400"
                          aria-label="Hapus"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>

                        <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-gray-50"
                          >
                            <span className="text-sm leading-none">−</span>
                          </button>
                          <span className="w-9 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:bg-gray-50"
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
          <div className="border-t border-gray-100 bg-white px-5 pb-[calc(1.5rem+var(--safe-bottom))] pt-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Subtotal</span>
              <span className="text-base font-bold text-gray-900">{formatMoney(totals.subtotalMinor, "IDR")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Lihat Keranjang
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-xl bg-brand-700 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
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
