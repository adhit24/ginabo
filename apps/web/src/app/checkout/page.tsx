"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { useCart } from "@/components/cart/CartProvider";
import { AddressModal } from "@/components/checkout/AddressModal";
import { ShippingMethodModal } from "@/components/checkout/ShippingMethodModal";
import { PaymentMethodModal } from "@/components/checkout/PaymentMethodModal";
import type { PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#8E51B8]" : "bg-[#E0E0E0]"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[20px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedItems: cartItems, selectedTotals: totals, removeItems } = useCart();
  const { formatPrice } = useCurrency();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressRow | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [checkoutIdempotencyKey] = useState(() => `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [status, setStatus] = useState<CheckoutState>({ status: "idle" });

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [dropshipper, setDropshipper] = useState(false);
  const [orderNotesOpen, setOrderNotesOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [sendAsGift, setSendAsGift] = useState(false);

  const packageWeight = useMemo(
    () => Math.max(1000, cartItems.reduce((sum, item) => sum + (item.weightGrams ?? 100) * item.quantity, 0)),
    [cartItems],
  );
  const handleAddressSelect = useCallback((id: string | null, address?: AddressRow) => {
    setAddressId(id);
    setSelectedAddress(address ?? null);
    setShippingOption(null);
  }, []);

  const grandTotal = totals.subtotalMinor + (shippingOption?.cost ?? 0) + (paymentMethod?.fee ?? 0);

  async function submit() {
    if (cartItems.length === 0) return;
    if (!addressId) {
      setStatus({ status: "error", message: "Pilih atau tambahkan alamat pengiriman terlebih dahulu." });
      return;
    }
    if (!shippingOption) {
      setStatus({ status: "error", message: "Pilih jasa pengiriman terlebih dahulu." });
      return;
    }
    if (!paymentMethod) {
      setStatus({ status: "error", message: "Pilih metode pembayaran terlebih dahulu." });
      return;
    }
    setStatus({ status: "submitting" });
    trackCustomerEvent({ event_name: "checkout_started", metadata: { item_count: cartItems.length } });
    try {
      if (DEMO_PAYMENT_MODE) {
        const orderNumber = `GNB-DEMO-${Date.now().toString().slice(-8)}`;
        sessionStorage.setItem("ginabo_demo_payment", JSON.stringify({
          orderNumber,
          items: cartItems,
          subtotal: totals.subtotalMinor,
          shippingOption,
          paymentMethod,
          address: selectedAddress,
          total: grandTotal,
        }));
        removeItems(cartItems.map((i) => i.productId));
        router.push(`/checkout/payment?order=${orderNumber}`);
        return;
      }
      const res = await authFetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
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
      removeItems(cartItems.map((i) => i.productId));
      trackCustomerEvent({ event_name: "checkout_completed", metadata: { order_number: json.data.order_number } });
      router.push(`/order/${json.data.order_number}`);
    } catch (e) {
      trackCustomerEvent({ event_name: "payment_failed", metadata: { stage: "checkout" } });
      setStatus({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  const visibleItems = showAllItems ? cartItems : cartItems.slice(0, 1);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-[#231F20]">
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
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[8px] border border-[#EDEDED] bg-white py-16 text-center">
            <svg width="48" height="48" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="text-[14px] text-gray-500">Tidak ada produk yang dipilih untuk checkout.</p>
            <Link href="/cart" className="rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] px-6 py-2.5 text-[13px] font-bold text-white transition">
              Kembali ke Shopping Bag
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── Left column ── */}
            <div className="lg:col-span-8 flex flex-col gap-4">

              {/* List Order */}
              <section className="rounded-[8px] border border-[#EDEDED] bg-white p-5">
                <h2 className="mb-4 text-[13px] font-bold text-[#231F20] uppercase tracking-wide">
                  List Order ({cartItems.length})
                </h2>
                <div className="flex flex-col divide-y divide-[#F5F5F5]">
                  {visibleItems.map((i) => (
                    <div key={i.productId} className="flex items-center gap-3 py-3 first:pt-0">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[6px] bg-[#FAF8FC] border border-[#EDEDED]">
                        {i.imageUrl && <Image src={i.imageUrl} alt={i.name} fill className="object-contain p-1.5" sizes="56px" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[13px] font-bold text-[#231F20]">{i.name}</p>
                        <p className="mt-0.5 text-[11.5px] text-[#707070]">{i.quantity} item</p>
                      </div>
                      <span className="shrink-0 text-[13px] font-bold text-[#231F20]">{formatPrice(i.quantity * i.priceMinor)}</span>
                    </div>
                  ))}
                </div>
                {cartItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowAllItems((v) => !v)}
                    className="mt-2 text-[12.5px] font-bold text-[#8E51B8] hover:text-[#78257C] transition"
                  >
                    {showAllItems ? "Sembunyikan" : "Lihat Semua"}
                  </button>
                )}
              </section>

              {/* Shipping */}
              <section className="rounded-[8px] border border-[#EDEDED] bg-white p-5">
                <h2 className="mb-4 text-[13px] font-bold text-[#231F20] uppercase tracking-wide">Shipping</h2>

                <div className="flex items-start justify-between gap-3 border-b border-[#F0F0F0] pb-4">
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold uppercase tracking-wide text-[#A0A0A0]">Alamat</p>
                    {selectedAddress ? (
                      <div className="mt-1.5">
                        <div className="flex items-center gap-2 text-[13.5px] font-bold text-[#231F20]">
                          <span>{selectedAddress.recipient_name}</span>
                          <span className="text-[#707070] font-normal">{selectedAddress.phone}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[12.5px] text-[#707070]">
                          {selectedAddress.address_line1}
                          {selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ""}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postal_code}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[13px] text-[#707070]">
                        Belum ada alamat dipilih.
                        <br />
                        <span className="text-[11.5px]">Tambahkan alamat untuk melanjutkan pesanan.</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(true)}
                    className="shrink-0 text-[12.5px] font-bold text-[#8E51B8] hover:text-[#78257C] transition"
                  >
                    {selectedAddress ? "Ubah" : "Tambah"}
                  </button>
                </div>

                <div className="flex items-start justify-between gap-3 pt-4">
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold uppercase tracking-wide text-[#A0A0A0]">Jasa Pengiriman</p>
                    {shippingOption ? (
                      <p className="mt-1.5 text-[13.5px] font-bold text-[#231F20]">
                        JNE {shippingOption.service} <span className="font-normal text-[#707070]">· Estimasi {shippingOption.etd} · {formatPrice(shippingOption.cost)}</span>
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[13px] text-[#707070]">Belum dipilih.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => selectedAddress && setShippingModalOpen(true)}
                    disabled={!selectedAddress}
                    className="shrink-0 text-[12.5px] font-bold text-[#8E51B8] transition hover:text-[#78257C] disabled:cursor-not-allowed disabled:text-[#C6C6C6]"
                  >
                    Ubah
                  </button>
                </div>

                <label className="mt-4 flex items-center justify-between gap-3 rounded-[6px] border border-[#F0F0F0] bg-[#FAFAFA] px-4 py-3">
                  <span>
                    <span className="block text-[13px] font-bold text-[#231F20]">Dropshipper</span>
                    <span className="block text-[11.5px] text-[#707070]">Kirim paket menggunakan nama/toko kamu</span>
                  </span>
                  <Toggle checked={dropshipper} onChange={setDropshipper} />
                </label>
              </section>

              {/* Additional Information */}
              <section className="rounded-[8px] border border-[#EDEDED] bg-white p-5">
                <h2 className="mb-4 text-[13px] font-bold text-[#231F20] uppercase tracking-wide">Informasi Tambahan</h2>
                <div className="flex flex-col gap-3">
                  <div className="rounded-[6px] border border-[#F0F0F0] bg-[#FAFAFA] px-4 py-3">
                    <label className="flex items-center justify-between gap-3">
                      <span>
                        <span className="block text-[13px] font-bold text-[#231F20]">Catatan Pesanan</span>
                        <span className="block text-[11.5px] text-[#707070]">Tinggalkan catatan untuk kurir (opsional)</span>
                      </span>
                      <Toggle checked={orderNotesOpen} onChange={setOrderNotesOpen} />
                    </label>
                    {orderNotesOpen && (
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Contoh: titip di satpam, jangan dibanting…"
                        rows={2}
                        className="mt-3 w-full rounded-[6px] border border-[#E0E0E0] bg-white px-3 py-2 text-[13px] text-[#231F20] outline-none focus:border-[#8E51B8] transition"
                      />
                    )}
                  </div>
                  <label className="flex items-center justify-between gap-3 rounded-[6px] border border-[#F0F0F0] bg-[#FAFAFA] px-4 py-3">
                    <span>
                      <span className="block text-[13px] font-bold text-[#231F20]">Kirim sebagai Hadiah</span>
                      <span className="block text-[11.5px] text-[#707070]">Sembunyikan struk harga dari penerima</span>
                    </span>
                    <Toggle checked={sendAsGift} onChange={setSendAsGift} />
                  </label>
                </div>
              </section>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="rounded-[8px] border border-[#EDEDED] bg-white p-5">
                <h2 className="mb-4 text-[13px] font-bold text-[#231F20] uppercase tracking-wide border-b border-[#EDEDED] pb-3">
                  Order Summary
                </h2>

                <div className="flex items-start justify-between gap-3 border-b border-[#F0F0F0] pb-4">
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold uppercase tracking-wide text-[#A0A0A0]">Metode Pembayaran</p>
                    {paymentMethod ? (
                      <p className="mt-1.5 text-[13.5px] font-bold text-[#231F20]">{paymentMethod.label}</p>
                    ) : (
                      <p className="mt-1.5 text-[13px] text-[#707070]">Belum dipilih</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(true)}
                    className="shrink-0 text-[12.5px] font-bold text-[#8E51B8] hover:text-[#78257C] transition"
                  >
                    Ubah
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-[12.5px]">
                  <div className="flex items-center justify-between text-[#707070]">
                    <span>Subtotal ({totals.itemCount} item)</span>
                    <span className="font-semibold text-[#231F20]">{formatPrice(totals.subtotalMinor)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#707070]">
                    <span>Ongkir</span>
                    <span className="font-semibold text-[#231F20]">{shippingOption ? formatPrice(shippingOption.cost) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#707070]">
                    <span>Biaya Pembayaran</span>
                    <span className="font-semibold text-[#231F20]">{paymentMethod ? formatPrice(paymentMethod.fee) : "—"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#EDEDED] pt-3 text-[14px] font-bold text-[#231F20]">
                    <span>Total</span>
                    <span className="text-[17px] font-extrabold text-[#E91E63]">{formatPrice(grandTotal)}</span>
                  </div>
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
                  className="mt-5 w-full rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] py-3.5 text-[14px] font-bold text-white transition disabled:opacity-50 shadow-none"
                >
                  {status.status === "submitting" ? "Memproses..." : "Pay Now"}
                </button>

                <p className="mt-3 text-center text-[11px] leading-relaxed text-[#A0A0A0]">
                  Dengan checkout, kamu menyetujui <Link href="/terms" className="text-[#8E51B8] hover:underline">Syarat & Ketentuan</Link> dan <Link href="/privacy" className="text-[#8E51B8] hover:underline">Kebijakan Privasi</Link>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        selectedId={addressId}
        onSelect={handleAddressSelect}
      />
      {selectedAddress && (
        <ShippingMethodModal
          open={shippingModalOpen}
          onClose={() => setShippingModalOpen(false)}
          city={selectedAddress.city}
          province={selectedAddress.province}
          weightGrams={packageWeight}
          value={shippingOption}
          onConfirm={setShippingOption}
          formatPrice={formatPrice}
        />
      )}
      <PaymentMethodModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        value={paymentMethod}
        onConfirm={setPaymentMethod}
      />
    </div>
  );
}
