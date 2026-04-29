"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatMoney } from "@/lib/money";

type CustomerProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  orders: Array<{
    orderNumber: string;
    status: string;
    totalMinor: number;
    currency: "IDR" | "USD";
    createdAt: string;
    items: Array<{ productName: string; quantity: number; unitPriceMinor: number }>;
  }>;
  bookings: Array<{
    bookingNumber: string;
    status: string;
    createdAt: string;
    slot: { startAt: string; endAt: string };
  }>;
};

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

export default function AdminCustomerProfilePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<CustomerProfile | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch(`/api/admin/customers/${params.id}`);
        const json = (await res.json()) as { ok: boolean; data?: CustomerProfile; error?: { message: string } };
        if (!json.ok || !json.data) throw new Error(json.error?.message ?? "Failed to load");
        if (!cancelled) {
          setData(json.data);
          setState({ status: "idle" });
        }
      } catch (e) {
        if (!cancelled) setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (state.status === "error") {
    return (
      <div className="grid gap-4">
        <Link href="/admin/customers" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back
        </Link>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{state.message}</div>
      </div>
    );
  }

  if (!data) {
    return <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Memuat...</div>;
  }

  return (
    <div className="grid gap-6">
      <Link href="/admin/customers" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
        ← Back
      </Link>
      <div className="rounded-3xl border border-gray-100 bg-white p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</div>
        <div className="mt-2 text-xl font-semibold text-gray-900">{data.name}</div>
        <div className="mt-1 text-sm text-gray-600">{data.email ?? "—"}</div>
        <div className="mt-1 text-sm text-gray-600">{data.phone ?? "—"}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Orders</div>
          <div className="mt-4 grid gap-3">
            {data.orders.length === 0 ? (
              <div className="text-sm text-gray-600">Belum ada order.</div>
            ) : (
              data.orders.map((o) => (
                <div key={o.orderNumber} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900">{o.orderNumber}</div>
                    <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{o.status}</div>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-900">{formatMoney(o.totalMinor, o.currency)}</div>
                  <div className="mt-2 grid gap-1 text-sm text-gray-600">
                    {o.items.map((i, idx) => (
                      <div key={idx}>
                        {i.quantity}× {i.productName}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Bookings</div>
          <div className="mt-4 grid gap-3">
            {data.bookings.length === 0 ? (
              <div className="text-sm text-gray-600">Belum ada booking.</div>
            ) : (
              data.bookings.map((b) => (
                <div key={b.bookingNumber} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900">{b.bookingNumber}</div>
                    <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{b.status}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    Slot:{" "}
                    <span className="font-semibold">
                      {new Date(b.slot.startAt).toLocaleString("id-ID")} – {new Date(b.slot.endAt).toLocaleTimeString("id-ID")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

