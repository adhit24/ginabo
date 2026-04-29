"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";

export default function CartPage() {
  const { state, updateQuantity, removeItem, totals } = useCart();

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">Cart</h1>
          <p className="text-sm text-gray-600">Review item sebelum checkout.</p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Checkout
        </Link>
      </div>

      {state.items.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center">
          <div className="text-sm font-semibold text-gray-900">Cart kamu kosong</div>
          <Link href="/shop" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">
            Mulai belanja →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {state.items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-3xl border border-gray-100 bg-white p-4">
              <div className="relative size-20 overflow-hidden rounded-2xl bg-brand-50">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-gray-500">No image</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/shop/${item.slug}`} className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </Link>
                    <div className="mt-1 text-sm text-gray-600">{formatMoney(item.priceMinor, item.currency)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="text-sm font-semibold text-gray-700"
                    >
                      −
                    </button>
                    <div className="min-w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="text-sm font-semibold text-gray-700"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatMoney(item.quantity * item.priceMinor, item.currency)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-3xl border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">Subtotal</div>
              <div className="font-semibold text-gray-900">{formatMoney(totals.subtotalMinor, "IDR")}</div>
            </div>
            <Link
              href="/checkout"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black"
            >
              Lanjut ke Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

