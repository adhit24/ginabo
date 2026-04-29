import Link from "next/link";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";

function isDatabaseUnavailableError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("Environment variable not found: DATABASE_URL") || msg.includes("Can't reach database server") || msg.includes("P1001");
}

export default async function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  type OrderWithDetails = Prisma.OrderGetPayload<{ include: { items: true; customer: true; payments: true } }>;
  let order: OrderWithDetails | null = null;
  try {
    order = (await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
      include: { items: true, customer: true, payments: { orderBy: { createdAt: "desc" } } }
    })) as OrderWithDetails | null;
  } catch (e) {
    if (!isDatabaseUnavailableError(e)) throw e;
    order = null;
  }

  if (!order) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center">
        <div className="text-sm font-semibold text-gray-900">Order belum bisa ditampilkan</div>
        <div className="mt-2 text-sm text-gray-600">Database belum terhubung/jalan. UI tetap bisa kamu cek tanpa data order.</div>
        <Link href="/shop" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">
          Kembali ke Shop →
        </Link>
      </div>
    );
  }

  const payment = order.payments[0] ?? null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">Order Confirmation</h1>
        <p className="text-sm text-gray-600">Terima kasih. Order kamu sudah tercatat.</p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order Number</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">{order.orderNumber}</div>
          </div>
          <div className="rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-800">{order.status}</div>
        </div>

        <div className="grid gap-2 text-sm text-gray-700">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</div>
          <div className="font-semibold text-gray-900">{order.customer.name}</div>
          <div className="text-gray-600">{order.customer.email ?? "—"}</div>
          <div className="text-gray-600">{order.customer.phone ?? "—"}</div>
        </div>

        <div className="grid gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Items</div>
          {order.items.map((i: OrderWithDetails["items"][number]) => (
            <div key={i.id} className="flex items-start justify-between gap-4 text-sm">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">{i.productName}</div>
                <div className="text-gray-600">
                  {i.quantity} × {formatMoney(i.unitPriceMinor, order.currency)}
                </div>
              </div>
              <div className="shrink-0 font-semibold text-gray-900">{formatMoney(i.quantity * i.unitPriceMinor, order.currency)}</div>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">Total</div>
              <div className="font-semibold text-gray-900">{formatMoney(order.totalMinor, order.currency)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-brand-50 p-5">
          <div className="text-sm font-semibold text-gray-900">Payment</div>
          <div className="mt-1 text-sm text-gray-700">
            Provider: <span className="font-semibold">{payment?.provider ?? "—"}</span>
          </div>
          <div className="mt-1 text-sm text-gray-700">
            Status: <span className="font-semibold">{payment?.status ?? "—"}</span>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Untuk payment gateway (Midtrans/Xendit/Stripe), endpoint dan struktur sudah disiapkan—tinggal masukkan API key dan webhook.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className="inline-flex rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900 hover:border-gray-300">
          Belanja lagi
        </Link>
        <Link href="/booking" className="inline-flex rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black">
          Booking Konsultasi
        </Link>
      </div>
    </div>
  );
}
