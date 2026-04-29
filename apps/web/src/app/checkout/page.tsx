"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";

type CheckoutState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success"; orderNumber: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cart, totals, clear } = useCart();

  const currency = useMemo(() => cart.items[0]?.currency ?? "IDR", [cart.items]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<"MANUAL" | "STRIPE" | "MIDTRANS" | "XENDIT">("MANUAL");
  const [status, setStatus] = useState<CheckoutState>({ status: "idle" });

  async function submit() {
    if (cart.items.length === 0) return;
    setStatus({ status: "submitting" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, phone },
          items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentProvider
        })
      });
      const json = (await res.json()) as { ok: boolean; data?: { orderNumber: string }; error?: { message: string } };
      if (!json.ok || !json.data) {
        setStatus({ status: "error", message: json.error?.message ?? "Checkout gagal" });
        return;
      }
      clear();
      setStatus({ status: "success", orderNumber: json.data.orderNumber });
      router.push(`/order/${json.data.orderNumber}`);
    } catch (e) {
      setStatus({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-200";
  const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span>›</span>
          <Link href="/cart" className="hover:text-brand-700">Keranjang</Link>
          <span>›</span>
          <span className="font-semibold text-gray-700">Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-6">
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
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-bold text-gray-900">Informasi Pengiriman</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Nama Lengkap</label>
                    <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Nama lengkap kamu" />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="email@kamu.com" />
                  </div>
                  <div>
                    <label className={labelCls}>No. WhatsApp / Telepon</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+62xxx-xxxx-xxxx" />
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h2 className="mb-4 text-sm font-bold text-gray-900">Metode Pembayaran</h2>
                  <div className="flex flex-col gap-2">
                    {([
                      { val: "MANUAL",   label: "Transfer Bank Manual",   sub: "BCA / BNI / Mandiri" },
                      { val: "MIDTRANS", label: "Midtrans",               sub: "QRIS, VA, Kartu Kredit" },
                      { val: "XENDIT",   label: "Xendit",                 sub: "QRIS, OVO, Dana, LinkAja" },
                    ] as const).map(opt => (
                      <label key={opt.val} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${paymentProvider === opt.val ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <input
                          type="radio"
                          name="payment"
                          value={opt.val}
                          checked={paymentProvider === opt.val}
                          onChange={() => setPaymentProvider(opt.val)}
                          className="accent-brand-700"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                          <div className="text-xs text-gray-400">{opt.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {status.status === "error" && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {status.message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={status.status === "submitting" || !name || !email}
                  className="mt-6 w-full rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:opacity-50"
                >
                  {status.status === "submitting" ? "Memproses..." : "Buat Pesanan"}
                </button>

                <div className="mt-3 text-center">
                  <Link href="/cart" className="text-xs text-gray-400 hover:text-brand-600">← Kembali ke Keranjang</Link>
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
                        <p className="line-clamp-1 text-xs font-semibold text-gray-800">{i.name}</p>
                        <p className="text-[11px] text-gray-400">{i.quantity} × {formatMoney(i.priceMinor, i.currency)}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-gray-900">{formatMoney(i.quantity * i.priceMinor, i.currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Subtotal</span>
                    <span className="text-xs font-semibold text-gray-700">{formatMoney(totals.subtotalMinor, currency)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Ongkir</span>
                    <span className="text-xs font-semibold text-green-600">Gratis</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-base font-extrabold text-brand-700">{formatMoney(totals.subtotalMinor, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-400">✦</span>
                  <p className="text-xs leading-relaxed text-brand-600">
                    Setelah pesanan dikonfirmasi, tim kami akan menghubungi kamu melalui WhatsApp untuk konfirmasi pembayaran dan pengiriman.
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

