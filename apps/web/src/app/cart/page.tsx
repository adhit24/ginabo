"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";

export default function CartPage() {
  const { state, updateQuantity, removeItem, toggleSelected, setAllSelected, selectedItems, selectedTotals } = useCart();
  const { formatPrice } = useCurrency();

  const allSelected = state.items.length > 0 && selectedItems.length === state.items.length;
  const selectedCount = selectedItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#231F20]">
      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white py-3 px-4 md:px-8 border-b border-[#F0F0F0]">
        <div className="mx-auto max-w-[1140px]">
          <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-[#707070]">
            <Link href="/" className="hover:text-[#8E51B8] transition">Home</Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#231F20] font-semibold">Shopping Bag</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1140px] px-4 md:px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 pb-4 border-b border-[#EDEDED]">
          <div>
            <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-[#231F20]">
              Shopping Bag ({state.items.length})
            </h1>
            <p className="text-[13px] text-[#707070] mt-0.5">Review pesananmu sebelum melanjutkan ke pembayaran.</p>
          </div>
          {state.items.length > 0 && (
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] px-6 py-2.5 text-[13px] font-bold text-white transition shadow-none sm:w-auto"
            >
              Checkout Sekarang
            </Link>
          )}
        </div>

        {state.items.length === 0 ? (
          <div className="rounded-[8px] border border-[#EDEDED] bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF5FC] text-[#8E51B8] mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" />
              </svg>
            </div>
            <div className="text-[16px] font-bold text-[#231F20]">Shopping bag kamu masih kosong</div>
            <p className="text-[13px] text-[#707070] mt-1">Temukan produk favoritmu dan nikmati promo spesial hari ini.</p>
            <Link 
              href="/shop" 
              className="mt-4 inline-flex rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] px-6 py-2.5 text-[13px] font-bold text-white transition"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* List of items (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              <label className="flex items-center gap-3 rounded-[6px] border border-[#EDEDED] bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => setAllSelected(e.target.checked)}
                  className="h-4 w-4 accent-[#8E51B8]"
                />
                <span className="text-[13px] font-bold text-[#231F20]">Pilih Semua Produk</span>
              </label>

              {state.items.map((item) => {
                const checked = selectedItems.some((i) => i.productId === item.productId);
                return (
                  <div key={item.productId} className="flex gap-3 rounded-[6px] border border-[#EDEDED] bg-white p-4 items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelected(item.productId)}
                      className="h-4 w-4 shrink-0 accent-[#8E51B8]"
                    />
                    <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-[4px] bg-[#FAF8FC] border border-[#F0F0F0]">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-2" sizes="80px" />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/shop/${item.slug}`} className="text-[14px] font-bold text-[#231F20] hover:text-[#8E51B8] transition line-clamp-1">
                            {item.name}
                          </Link>
                          <div className="mt-0.5 text-[13.5px] font-bold text-[#E91E63]">{formatPrice(item.priceMinor)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label="Hapus dari keranjang"
                          className="relative -m-2 flex h-8 w-8 items-center justify-center rounded-full text-[#A0A0A0] transition hover:bg-red-50 hover:text-red-500"
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-[4px] border border-[#E0E0E0] bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-[15px] text-[#707070] hover:bg-[#F5F5F5] transition"
                          >
                            −
                          </button>
                          <div className="min-w-7 text-center text-[12.5px] font-semibold text-[#231F20]">{item.quantity}</div>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-[15px] text-[#707070] hover:bg-[#F5F5F5] transition"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-[14px] font-bold text-[#231F20]">
                          {formatPrice(item.quantity * item.priceMinor)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary (4 cols) */}
            <div className="lg:col-span-4 rounded-[6px] border border-[#EDEDED] bg-white p-5 sticky top-24">
              <h3 className="text-[15px] font-bold text-[#231F20] mb-4 pb-3 border-b border-[#EDEDED]">
                Ringkasan Pesanan
              </h3>
              <div className="flex flex-col gap-2.5 text-[13px] mb-4">
                <div className="flex items-center justify-between text-[#707070]">
                  <span>Produk Dipilih ({selectedCount})</span>
                  <span>{formatPrice(selectedTotals.subtotalMinor)}</span>
                </div>
                <div className="flex items-center justify-between text-[#707070]">
                  <span>Ongkos Kirim</span>
                  <span className="text-emerald-600 font-medium">Dihitung di Checkout</span>
                </div>
                <div className="flex items-center justify-between font-bold text-[#231F20] text-[15px] pt-3 border-t border-[#EDEDED]">
                  <span>Subtotal</span>
                  <span className="text-[#E91E63]">{formatPrice(selectedTotals.subtotalMinor)}</span>
                </div>
              </div>
              {selectedItems.length === 0 ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-[6px] bg-[#E0D5EA] px-5 py-3 text-[13.5px] font-bold text-white"
                >
                  Pilih Produk Dahulu
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="inline-flex w-full items-center justify-center rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] px-5 py-3 text-[13.5px] font-bold text-white transition shadow-none"
                >
                  Lanjut ke Checkout ({selectedCount})
                </Link>
              )}
              <Link
                href="/shop"
                className="mt-3 block text-center text-[12.5px] font-medium text-[#707070] hover:text-[#8E51B8] transition"
              >
                Lanjutkan Belanja
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
