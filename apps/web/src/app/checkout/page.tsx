"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { AddressPicker } from "@/components/checkout/AddressPicker";
import { PaymentMethodSelector, type PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import JneShippingQuote from "@/components/shipping/JneShippingQuote";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { authFetch } from "@/lib/supabase/client";
import type { ShippingOption } from "@/lib/rajaongkir";
import type { AddressRow } from "@/types/database";

const DEMO_PAYMENT_MODE = true;

type CheckoutState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cart, totals, clear } = useCart();
  const { formatPrice } = useCurrency();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressRow | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [status, setStatus] = useState<CheckoutState>({ status: "idle" });
  const packageWeight = useMemo(
    () => Math.max(1000, cart.items.reduce((sum, item) => sum + (item.weightGrams ?? 100) * item.quantity, 0)),
    [cart.items],
  );
  const handleAddressSelect = useCallback((id: string | null, address?: AddressRow) => {
    setAddressId(id);
    setSelectedAddress(address ?? null);
    setShippingOption(null);
  }, []);

  async function submit() {
    if (cart.items.length === 0) return;
    if (!addressId) {
      setStatus({ status: "error", message: "Pilih atau tambahkan alamat pengiriman terlebih dahulu." });
      return;
    }
    setStatus({ status: "submitting" });
    try {
      if (DEMO_PAYMENT_MODE) {
        const orderNumber = `GNB-DEMO-${Date.now().toString().slice(-8)}`;
        sessionStorage.setItem("ginabo_demo_payment", JSON.stringify({
          orderNumber,
          items: cart.items,
          subtotal: totals.subtotalMinor,
          shippingOption,
          paymentMethod,
          address: selectedAddress,
          total: totals.subtotalMinor + (shippingOption?.cost ?? 0) + (paymentMethod?.fee ?? 0),
        }));
        clear();
        router.push(`/checkout/payment?order=${orderNumber}`);
        return;
      }
      const res = await authFetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((i) => ({
            product_id: i.productId,
            qty: i.quantity,
            price: i.priceMinor,
            name: i.name
          })),
          address_id: addressId,
          shipping_cost: shippingOption?.cost ?? 0,
          shipping_courier: shippingOption?.courier_code ?? null,
          shipping_service: shippingOption?.service ?? null,
          payment_method: paymentMethod?.provider ?? null,
          payment_fee: paymentMethod?.fee ?? 0,
        })
      });
      const json = (await res.json()) as {
        ok: boolean;
        data?: { order_number: string; snap_token: string; redirect_url: string };
        error?: { message: string };
      };
      if (!json.ok || !json.data) {
        setStatus({ status: "error", message: json.error?.message ?? "Checkout gagal" });
        return;
      }
      clear();
      router.push(`/order/${json.data.order_number}`);
    } catch (e) {
      setStatus({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span>›</span>
          <Link href="/cart" className="hover:text-brand-700">Keranjang</Link>
          <span>›</span>
          <span className="font-semibold text-gray-700">Checkout</span>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">Lengkapi data pengiriman dan pembayaran untuk menyelesaikan pesanan.</p>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-sm text-gray-400">Keranjang kamu kosong.</p>
            <Link href="/shop" className="rounded-xl bg-brand-700 px-8 py-3 text-sm font-bold text-white hover:bg-brand-800">
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

            {/* ── Left: Form ── */}
            <div className="flex-1">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-5 text-sm font-bold text-gray-900">Alamat Pengiriman</h2>
                <AddressPicker
                  selectedId={addressId}
                  onSelect={handleAddressSelect}
                />

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h2 className="mb-3 text-sm font-bold text-gray-900">Jasa Pengiriman</h2>
                  {selectedAddress ? (
                    <JneShippingQuote
                      city={selectedAddress.city}
                      province={selectedAddress.province}
                      weightGrams={packageWeight}
                      onSelect={setShippingOption}
                    />
                  ) : (
                    <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                      Pilih alamat pengiriman untuk menghitung ongkir otomatis.
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                </div>

                {status.status === "error" && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {status.message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={status.status === "submitting" || !addressId || !shippingOption || !paymentMethod}
                  className="mt-6 w-full rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:opacity-50"
                >
                  {status.status === "submitting" ? "Memproses..." : "Buat Pesanan"}
                </button>

                <div className="mt-3 text-center">
                  <Link href="/cart" className="text-xs text-gray-400 hover:text-brand-600">Kembali ke Keranjang</Link>
                </div>
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="w-full lg:w-80 lg:shrink-0">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-bold text-gray-900">Ringkasan Pesanan</h2>

                <div className="flex flex-col divide-y divide-gray-50">
                  {cart.items.map(i => (
                    <div key={i.productId} className="flex items-center gap-3 py-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {i.imageUrl && (
                          <img src={i.imageUrl} alt={i.name} className="h-full w-full object-contain p-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-gray-900">{i.name}</p>
                        <p className="text-[11px] text-gray-400">{i.quantity} × {formatPrice(i.priceMinor)}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-gray-900">{formatPrice(i.quantity * i.priceMinor)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Subtotal</span>
                    <span className="text-xs font-semibold text-gray-700">{formatPrice(totals.subtotalMinor)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Ongkir</span>
                    <span className="text-xs font-semibold text-gray-700">{shippingOption ? formatPrice(shippingOption.cost) : "Pilih kurir"}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Biaya pembayaran</span>
                    <span className="text-xs font-semibold text-gray-700">{paymentMethod ? formatPrice(paymentMethod.fee) : "Pilih metode"}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-base font-extrabold text-brand-700">{formatPrice(totals.subtotalMinor + (shippingOption?.cost ?? 0) + (paymentMethod?.fee ?? 0))}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                  <p className="text-xs leading-relaxed text-brand-600">
                    Setelah pesanan dibuat, kamu akan diarahkan ke halaman pesanan untuk menyelesaikan pembayaran via Midtrans.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
