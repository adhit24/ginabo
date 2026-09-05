"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrency } from "@/components/currency/CurrencyProvider";

type DemoPayment = {
  orderNumber: string;
  subtotal: number;
  total: number;
  items: Array<{ name: string; quantity: number; priceMinor: number; imageUrl: string | null }>;
  shippingOption: { courier_name: string; service: string; cost: number; etd: string } | null;
  paymentMethod: { label: string; fee: number } | null;
  address: { recipient_name: string; address_line1: string; city: string; province: string; postal_code: string } | null;
};

export default function DemoPaymentPage() {
  const { formatPrice } = useCurrency();
  const [payment, setPayment] = useState<DemoPayment | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ginabo_demo_payment");
    if (raw) setPayment(JSON.parse(raw) as DemoPayment);
  }, []);

  if (!payment) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-gray-900">Sesi pembayaran tidak ditemukan</p>
          <Link href="/checkout" className="mt-4 inline-flex rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white">Kembali ke Checkout</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Ginabo Pay</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">Selesaikan pembayaran</h1>
          <p className="mt-1 text-sm text-gray-500">Simulasi halaman pembayaran DOKU Checkout untuk trial alur checkout.</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {paid ? "BERHASIL" : "MENUNGGU PEMBAYARAN"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between border-b border-gray-100 pb-5">
            <div>
              <p className="text-xs text-gray-500">Nomor pesanan</p>
              <p className="mt-1 font-bold text-gray-900">{payment.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total pembayaran</p>
              <p className="mt-1 text-xl font-extrabold text-brand-700">{formatPrice(payment.total)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Metode pembayaran</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="font-bold text-gray-900">{payment.paymentMethod?.label ?? "Belum dipilih"}</p>
              <span className="text-xs font-semibold text-brand-700">Jasa {formatPrice(payment.paymentMethod?.fee ?? 0)}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">Pada integrasi nyata, halaman ini akan digantikan oleh DOKU Checkout.</p>
          </div>

          {!paid ? (
            <button type="button" onClick={() => setPaid(true)} className="mt-5 w-full rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800">
              Simulasikan Pembayaran Berhasil
            </button>
          ) : (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Pembayaran simulasi berhasil. Status ini hanya untuk preview alur.
            </div>
          )}
          <Link href="/checkout" className="mt-3 block text-center text-xs font-semibold text-gray-400 hover:text-brand-700">Kembali ke checkout</Link>
        </section>

        <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-gray-900">Ringkasan pesanan</h2>
          <div className="mt-3 divide-y divide-gray-100">
            {payment.items.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 py-3 text-xs">
                <span className="min-w-0 truncate text-gray-600">{item.name} × {item.quantity}</span>
                <span className="shrink-0 font-semibold text-gray-900">{formatPrice(item.priceMinor * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-2 border-t border-gray-100 pt-4 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(payment.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Ongkir {payment.shippingOption?.service ?? ""}</span><span>{formatPrice(payment.shippingOption?.cost ?? 0)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Biaya pembayaran</span><span>{formatPrice(payment.paymentMethod?.fee ?? 0)}</span></div>
            <div className="flex justify-between border-t border-gray-100 pt-3 text-sm font-extrabold text-gray-900"><span>Total</span><span className="text-brand-700">{formatPrice(payment.total)}</span></div>
          </div>
          {payment.address && <p className="mt-5 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">Dikirim ke {payment.address.recipient_name}, {payment.address.address_line1}, {payment.address.city}, {payment.address.province} {payment.address.postal_code}</p>}
        </aside>
      </div>
    </main>
  );
}
