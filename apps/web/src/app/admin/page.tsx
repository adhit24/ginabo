"use client";

import { useEffect, useState } from "react";

import { formatMoney } from "@/lib/money";

type Overview = {
  totals: { customers: number; orders: number; bookings: number };
  last30d: { orders: number; bookings: number };
  recentOrders: Array<{
    orderNumber: string;
    status: string;
    totalMinor: number;
    currency: "IDR" | "USD";
    customerName: string;
    createdAt: string;
  }>;
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/overview");
        const json = (await res.json()) as { ok: boolean; data?: Overview; error?: { message: string } };
        if (!json.ok || !json.data) throw new Error(json.error?.message ?? "Failed to load");
        if (!cancelled) setData(json.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold tracking-tight text-gray-900">Overview</h1>
      {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}
      {!data ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Memuat data...</div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customers</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{data.totals.customers}</div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Orders</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{data.totals.orders}</div>
              <div className="mt-2 text-sm text-gray-600">30d: {data.last30d.orders}</div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bookings</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{data.totals.bookings}</div>
              <div className="mt-2 text-sm text-gray-600">30d: {data.last30d.bookings}</div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Recent Orders</div>
            <div className="mt-4 grid gap-2">
              {data.recentOrders.length === 0 ? (
                <div className="text-sm text-gray-600">Belum ada order.</div>
              ) : (
                data.recentOrders.map((o) => (
                  <div key={o.orderNumber} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 p-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{o.orderNumber}</div>
                      <div className="mt-1 text-sm text-gray-600">{o.customerName}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{formatMoney(o.totalMinor, o.currency)}</div>
                    <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{o.status}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

