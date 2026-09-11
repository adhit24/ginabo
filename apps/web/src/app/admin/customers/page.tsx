"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  CustomerListItem,
  CustomerSegment,
  CustomerSegmentOverview,
  CustomerSortField,
  SortDirection,
} from "@/lib/customers/types";
import { formatMoney } from "@/lib/money";

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

const SEGMENT_BADGES: Record<CustomerSegment, { label: string; bg: string; text: string }> = {
  vip: { label: "VIP", bg: "bg-purple-100", text: "text-purple-800" },
  loyal: { label: "Loyal", bg: "bg-emerald-100", text: "text-emerald-800" },
  repeat_customer: { label: "Repeat", bg: "bg-blue-100", text: "text-blue-800" },
  new_customer: { label: "Baru", bg: "bg-teal-100", text: "text-teal-800" },
  one_time_buyer: { label: "1x Order", bg: "bg-gray-100", text: "text-gray-800" },
  at_risk: { label: "At Risk", bg: "bg-amber-100", text: "text-amber-800" },
  dormant: { label: "Dormant", bg: "bg-slate-100", text: "text-slate-700" },
  high_return_risk: { label: "Risiko Retur", bg: "bg-rose-100", text: "text-rose-800" },
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [overview, setOverview] = useState<CustomerSegmentOverview | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });

  const [q, setQ] = useState("");
  const [segment, setSegment] = useState<CustomerSegment | "all">("all");
  const [sortBy, setSortBy] = useState<CustomerSortField>("ltv");
  const [sortOrder, setSortOrder] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          sortBy,
          sortOrder,
        });
        if (q.trim()) params.set("q", q.trim());
        if (segment !== "all") params.set("segment", segment);

        const res = await fetch(`/api/admin/customers?${params.toString()}`);
        const json = await res.json();
        if (!json.ok || !json.data) {
          throw new Error(json.error?.message ?? "Gagal memuat data customer");
        }

        if (!cancelled) {
          setCustomers(json.data.customers ?? []);
          setOverview(json.data.overview ?? null);
          setTotalPages(json.data.totalPages ?? 1);
          setTotalCount(json.data.total ?? 0);
          setState({ status: "idle" });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [q, segment, sortBy, sortOrder, page]);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customer 360 & Retensi</h1>
          <p className="text-sm text-gray-600">
            Pusat analitik pelanggan, siklus repeat order, segmentasi nilai (LTV/AOV), dan deteksi risiko retur.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Total Pelanggan</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{overview.totalCustomers.toLocaleString("id-ID")}</div>
            <div className="mt-1 text-xs text-gray-500">Terdaftar</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Repeat Rate</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600">{overview.repeatPurchaseRatePercent}%</div>
            <div className="mt-1 text-xs text-gray-500">{overview.repeatCustomers} customer repeat</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Pelanggan VIP</div>
            <div className="mt-1 text-2xl font-bold text-purple-600">{overview.vipCount}</div>
            <div className="mt-1 text-xs text-gray-500">LTV &ge; Rp 1.5M</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Butuh Perhatian</div>
            <div className="mt-1 text-2xl font-bold text-amber-600">{overview.atRiskCount}</div>
            <div className="mt-1 text-xs text-gray-500">Lewat siklus reorder</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Rata-Rata LTV</div>
            <div className="mt-1 text-xl font-bold text-gray-900">{formatMoney(overview.averageCustomerLtvMinor, "IDR")}</div>
            <div className="mt-1 text-xs text-gray-500">Per valid buyer</div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold text-gray-500">Siklus Reorder</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{overview.medianRepurchaseDays} hari</div>
            <div className="mt-1 text-xs text-gray-500">Median skincare cycle</div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, email, no handphone..."
            className="w-full max-w-sm rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />

          <select
            value={segment}
            onChange={(e) => {
              setSegment(e.target.value as CustomerSegment | "all");
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500"
          >
            <option value="all">Semua Segmen</option>
            <option value="vip">VIP</option>
            <option value="loyal">Loyal</option>
            <option value="repeat_customer">Repeat Customer</option>
            <option value="new_customer">Customer Baru</option>
            <option value="one_time_buyer">1x Pembelian</option>
            <option value="at_risk">At Risk (Perlu Follow-Up)</option>
            <option value="dormant">Dormant (Tidak Aktif)</option>
            <option value="high_return_risk">Risiko Retur Tinggi</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("-") as [CustomerSortField, SortDirection];
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500"
          >
            <option value="ltv-desc">LTV Tertinggi</option>
            <option value="orders-desc">Order Terbanyak</option>
            <option value="last_purchase-desc">Order Terakhir (Terbaru)</option>
            <option value="created_at-desc">Registrasi Terbaru</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Menampilkan {customers.length} dari {totalCount} pelanggan
        </div>
      </div>

      {/* State Messages */}
      {state.status === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {state.message}
        </div>
      )}

      {/* Customer List Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Segmen</th>
                <th className="px-6 py-4 text-center">Valid Orders</th>
                <th className="px-6 py-4 text-right">LTV (Net)</th>
                <th className="px-6 py-4 text-right">AOV</th>
                <th className="px-6 py-4">Order Terakhir</th>
                <th className="px-6 py-4 text-center">Retur</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.status === "loading" && customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Memuat data Customer 360...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada customer yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const badge = SEGMENT_BADGES[c.segment] ?? {
                    label: c.segment,
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                  };
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {c.email ?? "—"} {c.normalizedPhone ? `• ${c.normalizedPhone}` : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-medium text-gray-900">
                        {c.validOrderCount}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatMoney(c.netRevenueMinor, "IDR")}
                      </td>

                      <td className="px-6 py-4 text-right text-gray-700">
                        {formatMoney(c.averageOrderValueMinor, "IDR")}
                      </td>

                      <td className="px-6 py-4">
                        {c.lastOrderDate ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(c.lastOrderDate).toLocaleDateString("id-ID")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.daysSinceLastPurchase !== null
                                ? `${c.daysSinceLastPurchase} hari lalu`
                                : "—"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Belum order</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {c.returnCount > 0 ? (
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${c.riskSignal ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700"}`}>
                            {c.returnCount} ({c.returnRatePercent}%)
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition"
                        >
                          Lihat 360
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
