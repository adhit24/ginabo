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
import { trackCustomerEvent } from "@/lib/analytics/events";

const DEMO_PAYMENT_MODE = process.env.NEXT_PUBLIC_GINABO_DEMO_PAYMENT_MODE === "true";

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
  const [checkoutIdempotencyKey] = useState(() => `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
    trackCustomerEvent({ event_name: "checkout_started", metadata: { item_count: cart.items.length } });
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
            variant_id: null,
          })),
          address_id: addressId,
          shipping_courier: shippingOption?.courier_code ?? null,
          shipping_service: shippingOption?.service ?? null,
          payment_method: paymentMethod?.provider ?? null,
          checkout_idempotency_key: checkoutIdempotencyKey,
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
      trackCustomerEvent({ event_name: "checkout_completed", metadata: { order_number: json.data.order_number } });
      router.push(`/order/${json.data.order_number}`);
    } catch (e) {
      trackCustomerEvent({ event_name: "payment_failed", metadata: { stage: "checkout" } });
      setStatus({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#231F20]">
      {/* Breadcrumb */}
      <div className="bg-white py-3 px-4 md:px-8 border-b border-[#F0F0F0]">
        <div className="mx-auto max-w-[1140px]">
          <nav className="flex items-center gap-2 text-[12px] md:text-[13px] text-[#707070]">
            <Link href="/" className="hover:text-[#8E51B8] transition">Home</Link>
            <span className="text-[#A0A0A0]">/</span>
            <Link href="/cart" className="hover:text-[#8E51B8] transition">Shopping Bag</Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#231F20] font-semibold">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1140px] px-4 md:px-6 py-8">
        <div className="mb-6 pb-4 border-b border-[#EDEDED]">
          <h1 className="text-[22px] md:text-[26px] font-bold text-[#231F20]">Checkout</h1>
          <p className="mt-1 text-[13px] text-[#707070]">Lengkapi data pengiriman dan pembayaran untuk menyelesaikan pesanan.</p>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[8px] border border-[#EDEDED] bg-white py-16 text-center">
            <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-[14px] text-gray-500">Keranjang kamu kosong.</p>
            <Link href="/shop" className="rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] px-6 py-2.5 text-[13px] font-bold text-white transition">
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── Left: Form (8 cols) ── */}
            <div className="lg:col-span-8">
              <div className="rounded-[8px] border border-[#EDEDED] bg-white p-5 sm:p-6">
                <h2 className="mb-4 text-[14px] font-bold text-[#231F20] uppercase tracking-wider">1. Alamat Pengiriman</h2>
                <AddressPicker
                  selectedId={addressId}
                  onSelect={handleAddressSelect}
                />

                <div className="mt-6 border-t border-[#EDEDED] pt-5">
                  <h2 className="mb-3 text-[14px] font-bold text-[#231F20] uppercase tracking-wider">2. Jasa Pengiriman</h2>
                  {selectedAddress ? (
                    <JneShippingQuote
                      city={selectedAddress.city}
                      province={selectedAddress.province}
                      weightGrams={packageWeight}
                      onSelect={setShippingOption}
                    />
                  ) : (
                    <p className="rounded-[6px] border border-[#E0E0E0] bg-[#FAF8FC] px-4 py-3 text-[12.5px] text-[#707070]">
                      Pilih alamat pengiriman untuk menghitung ongkir otomatis.
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-[#EDEDED] pt-5">
                  <h2 className="mb-3 text-[14px] font-bold text-[#231F20] uppercase tracking-wider">3. Metode Pembayaran</h2>
                  <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                </div>

                {status.status === "error" && (
                  <div className="mt-4 rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                    {status.message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={status.status === "submitting" || !addressId || !shippingOption || !paymentMethod}
                  className="mt-6 w-full rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] py-3.5 text-[14px] font-bold text-white transition disabled:opacity-50 shadow-none"
                >
                  {status.status === "submitting" ? "Memproses..." : "Buat Pesanan Sekarang"}
                </button>

                <div className="mt-3 text-center">
                  <Link href="/cart" className="text-[12.5px] text-[#707070] hover:text-[#8E51B8] transition">Kembali ke Shopping Bag</Link>
                </div>
              </div>
            </div>

            {/* ── Right: Order Summary (4 cols) ── */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="rounded-[8px] border border-[#EDEDED] bg-white p-5">
                <h2 className="mb-4 text-[14px] font-bold text-[#231F20] uppercase tracking-wider border-b border-[#EDEDED] pb-3">
                  Ringkasan Pesanan
                </h2>

                <div className="flex flex-col divide-y divide-[#F5F5F5]">
                  {cart.items.map(i => (
                    <div key={i.productId} className="flex items-center gap-3 py-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[4px] bg-[#FAF8FC] border border-[#EDEDED]">
                        {i.imageUrl && (
                          <img src={i.imageUrl} alt={i.name} className="h-full w-full object-contain p-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-[13px] font-bold text-[#231F20]">{i.name}</p>
                        <p className="text-[11.5px] text-[#707070]">{i.quantity} × {formatPrice(i.priceMinor)}</p>
                      </div>
                      <span className="shrink-0 text-[13px] font-bold text-[#231F20]">{formatPrice(i.quantity * i.priceMinor)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t border-[#EDEDED] pt-4 flex flex-col gap-2 text-[12.5px]">
                  <div className="flex items-center justify-between text-[#707070]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#231F20]">{formatPrice(totals.subtotalMinor)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#707070]">
                    <span>Ongkir</span>
                    <span className="font-semibold text-[#231F20]">{shippingOption ? formatPrice(shippingOption.cost) : "Pilih kurir"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#707070]">
                    <span>Biaya Pembayaran</span>
                    <span className="font-semibold text-[#231F20]">{paymentMethod ? formatPrice(paymentMethod.fee) : "Pilih metode"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#EDEDED] pt-3 text-[14px] font-bold text-[#231F20]">
                    <span>Total</span>
                    <span className="text-[16px] font-extrabold text-[#E91E63]">
                      {formatPrice(totals.subtotalMinor + (shippingOption?.cost ?? 0) + (paymentMethod?.fee ?? 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
