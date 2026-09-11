"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Coupon, CouponStatus, PromotionMetrics, PromotionReconciliationReport } from "@/lib/promotions/types";
import { formatMoney } from "@/lib/money";
import { formatRuleSummary } from "@/lib/promotions/promotionEngine";

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

const STATUS_BADGES: Record<CouponStatus, { label: string; bg: string; text: string }> = {
  active: { label: "Aktif", bg: "bg-emerald-100", text: "text-emerald-800" },
  scheduled: { label: "Terjadwal", bg: "bg-blue-100", text: "text-blue-800" },
  expired: { label: "Kedaluwarsa", bg: "bg-gray-100", text: "text-gray-700" },
  disabled: { label: "Nonaktif", bg: "bg-rose-100", text: "text-rose-800" },
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Array<Coupon & { derivedStatus: CouponStatus; campaignName?: string | null }>>([]);
  const [metrics, setMetrics] = useState<PromotionMetrics | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Create
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed_idr" | "free_shipping">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<number>(100000);
  const [formMaxDiscountAmount, setFormMaxDiscountAmount] = useState<number | "">("");
  const [formUsageLimit, setFormUsageLimit] = useState<number | "">("");
  const [formUsagePerUser, setFormUsagePerUser] = useState<number>(1);
  const [formCustomerEligibility, setFormCustomerEligibility] = useState<Coupon["customerEligibility"]>("all");
  const [formStartsAt, setFormStartsAt] = useState<string>("");
  const [formExpiresAt, setFormExpiresAt] = useState<string>("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Reconciliation report
  const [reconReport, setReconReport] = useState<PromotionReconciliationReport | null>(null);
  const [reconLoading, setReconLoading] = useState(false);

  async function loadCoupons() {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        status: filterStatus,
        q: searchQuery,
      });
      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Gagal memuat daftar kupon");

      setCoupons(json.data.coupons ?? []);
      setMetrics(json.data.metrics ?? null);
      setTotalPages(json.data.totalPages ?? 1);
      setState({ status: "idle" });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  useEffect(() => {
    void loadCoupons();
  }, [page, filterStatus, searchQuery]);

  async function handleToggleStatus(id: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Gagal mengubah status");
      await loadCoupons();
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const payload: any = {
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim() || null,
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        minOrderAmount: Number(formMinOrderAmount || 0),
        maxDiscountAmount: formMaxDiscountAmount !== "" ? Number(formMaxDiscountAmount) : null,
        usageLimit: formUsageLimit !== "" ? Number(formUsageLimit) : null,
        usagePerUser: Number(formUsagePerUser || 1),
        customerEligibility: formCustomerEligibility,
        startsAt: formStartsAt ? new Date(formStartsAt).toISOString() : new Date().toISOString(),
        expiresAt: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Gagal membuat kupon");

      setCreateModalOpen(false);
      // Reset form
      setFormCode("");
      setFormDescription("");
      setFormDiscountValue(10);
      setFormMinOrderAmount(100000);
      setFormMaxDiscountAmount("");
      setFormUsageLimit("");
      setFormExpiresAt("");
      await loadCoupons();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleRunAudit() {
    setReconLoading(true);
    try {
      const res = await fetch("/api/admin/coupons/reconciliation");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Gagal menjalankan audit data");
      setReconReport(json.data);
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setReconLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kupon & Promosi Campaign</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola kode voucher diskon, aturan batas penggunaan, target eligibility pelanggan, dan audit integritas promo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={reconLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <span>{reconLoading ? "Memeriksa..." : "🔍 Audit Integritas Kupon"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <span>+ Buat Kupon Baru</span>
          </button>
        </div>
      </div>

      {state.status === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {state.message}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Total Kupon Aktif</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {metrics ? `${metrics.activeCoupons} / ${metrics.totalCoupons}` : "..."}
          </div>
          <div className="mt-1 text-xs text-gray-500">Kupon siap digunakan</div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm">
          <div className="text-xs font-semibold text-blue-800">Total Penggunaan (Redemptions)</div>
          <div className="mt-2 text-2xl font-bold text-blue-900">
            {metrics ? metrics.totalRedemptions.toLocaleString("id-ID") : "..."} kali
          </div>
          <div className="mt-1 text-xs text-blue-700">Akumulasi kupon di-checkout</div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
          <div className="text-xs font-semibold text-amber-800">Total Biaya Diskon (Cost)</div>
          <div className="mt-2 text-2xl font-bold text-amber-900">
            {metrics ? formatMoney(metrics.totalDiscountCost, "IDR") : "..."}
          </div>
          <div className="mt-1 text-xs text-amber-700">Investasi promosi pada order valid</div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
          <div className="text-xs font-semibold text-emerald-800">Gross Revenue Terkait Promo</div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">
            {metrics ? formatMoney(metrics.associatedGrossRevenue, "IDR") : "..."}
          </div>
          <div className="mt-1 text-xs text-emerald-700">Gross penjualan dengan kupon</div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Semua Status" },
              { id: "active", label: "Aktif" },
              { id: "scheduled", label: "Terjadwal" },
              { id: "expired", label: "Kedaluwarsa" },
              { id: "disabled", label: "Nonaktif" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterStatus(tab.id);
                  setPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  filterStatus === tab.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode kupon..."
              className="w-56 rounded-xl border border-gray-200 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none uppercase placeholder:normal-case"
            />
          </div>
        </div>

        {/* Coupons Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Kode Kupon</th>
                <th className="py-3 px-3">Tipe & Nilai</th>
                <th className="py-3 px-3">Min. Belanja</th>
                <th className="py-3 px-3">Target Pelanggan</th>
                <th className="py-3 px-3">Penggunaan / Kuota</th>
                <th className="py-3 px-3">Periode</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Belum ada kupon yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const badge = STATUS_BADGES[c.derivedStatus] ?? STATUS_BADGES.disabled;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-brand-700 text-sm">{c.code}</span>
                        {c.description && <p className="text-[11px] text-gray-500 mt-0.5">{c.description}</p>}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-gray-900">
                          {c.discountType === "percentage"
                            ? `${c.discountValue}%`
                            : c.discountType === "fixed_idr"
                            ? formatMoney(c.discountValue, "IDR")
                            : "Gratis Ongkir"}
                        </span>
                        {c.maxDiscountAmount && (
                          <div className="text-[10.5px] text-gray-500">
                            Maks {formatMoney(c.maxDiscountAmount, "IDR")}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-gray-800">
                        {c.minOrderAmount > 0 ? formatMoney(c.minOrderAmount, "IDR") : "Tanpa Min"}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                          {c.customerEligibility === "all"
                            ? "Semua Pelanggan"
                            : c.customerEligibility === "first_purchase"
                            ? "Pembeli Pertama"
                            : c.customerEligibility === "repeat_customer"
                            ? "Pelanggan Setia (2x+)"
                            : c.customerEligibility === "specific_tiers"
                            ? `Tier: ${c.eligibleTiers?.join("/")}`
                            : `Segmen: ${c.eligibleSegments?.join("/")}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-gray-900">{c.usedCount}</span>
                        <span className="text-gray-500"> / {c.usageLimit !== null ? c.usageLimit : "∞"}</span>
                        <div className="text-[10.5px] text-gray-400">Maks {c.usagePerUser}x / user</div>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-gray-500">
                        <div>Mulai: {new Date(c.startsAt).toLocaleDateString("id-ID")}</div>
                        <div>
                          Selesai: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("id-ID") : "Permanen"}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c.id, c.isActive)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            c.isActive
                              ? "border border-rose-200 text-rose-700 hover:bg-rose-50"
                              : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {c.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Audit Box (if triggered) */}
      {reconReport && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-white ${
                reconReport.anomaliesCount === 0 ? "bg-emerald-600" : "bg-amber-600"
              }`}>
                {reconReport.anomaliesCount === 0 ? "✓" : "!"}
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">Hasil Audit Rekonsiliasi Integritas Kupon</h3>
                <p className="text-xs text-gray-500">
                  Waktu audit: {new Date(reconReport.auditedAt).toLocaleString("id-ID")} • Total kupon diperiksa: {reconReport.totalCouponsChecked}
                </p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              reconReport.anomaliesCount === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {reconReport.anomaliesCount === 0 ? "INTEGRITAS NORMAL" : `${reconReport.anomaliesCount} ANOMALI`}
            </span>
          </div>

          <div className="mt-4">
            {reconReport.anomalies.length === 0 ? (
              <p className="text-xs text-emerald-800 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                Semua kupon memiliki konfigurasi nilai diskon valid, rentang tanggal benar, dan tidak ada kuota terlampaui.
              </p>
            ) : (
              <div className="space-y-2">
                {reconReport.anomalies.map((anom, idx) => (
                  <div key={idx} className="flex items-start justify-between rounded-xl bg-amber-50 p-3 text-xs border border-amber-200">
                    <div>
                      <span className="font-bold text-amber-900 font-mono">{anom.code}</span>
                      <span className="ml-2 font-medium text-amber-800">[{anom.type}] {anom.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Buat Kupon Promosi Baru</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Kupon dihitung 100% server-authoritative dan terproteksi dari race condition checkout.
            </p>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700">Kode Kupon (Wajib)</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: GLOW20"
                    required
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono uppercase focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700">Tipe Diskon</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed_idr">Nominal Tetap (Rp)</option>
                    <option value="free_shipping">Gratis Ongkir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700">Deskripsi Ringkas</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Promo spesial weekend skincare"
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700">
                    Nilai Diskon {formDiscountType === "percentage" ? "(%)" : "(Rp)"}
                  </label>
                  <input
                    type="number"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    min={formDiscountType === "percentage" ? 1 : 0}
                    max={formDiscountType === "percentage" ? 100 : undefined}
                    required
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700">Maks. Nominal Cap Diskon (Rp)</label>
                  <input
                    type="number"
                    value={formMaxDiscountAmount}
                    onChange={(e) => setFormMaxDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Kosongkan jika tanpa cap"
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700">Min. Belanja Produk (Rp)</label>
                  <input
                    type="number"
                    value={formMinOrderAmount}
                    onChange={(e) => setFormMinOrderAmount(Number(e.target.value))}
                    min={0}
                    required
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700">Target Pelanggan</label>
                  <select
                    value={formCustomerEligibility}
                    onChange={(e) => setFormCustomerEligibility(e.target.value as any)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  >
                    <option value="all">Semua Pelanggan</option>
                    <option value="first_purchase">Khusus Pembeli Pertama</option>
                    <option value="repeat_customer">Khusus Pelanggan Setia (2x+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700">Batas Kuota Global</label>
                  <input
                    type="number"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Kosongkan jika tanpa kuota"
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700">Maks. Penggunaan per User</label>
                  <input
                    type="number"
                    value={formUsagePerUser}
                    onChange={(e) => setFormUsagePerUser(Number(e.target.value))}
                    min={1}
                    required
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700">Tanggal Mulai (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700">Tanggal Selesai (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-2xl bg-brand-50/50 border border-brand-100 p-3">
                <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider">Preview Ringkasan Kupon:</span>
                <p className="mt-1 text-xs font-semibold text-brand-900">
                  {formatRuleSummary({
                    discountType: formDiscountType,
                    discountValue: formDiscountValue,
                    maxDiscountAmount: formMaxDiscountAmount !== "" ? Number(formMaxDiscountAmount) : null,
                    minOrderAmount: formMinOrderAmount,
                    appliesTo: "all",
                    customerEligibility: formCustomerEligibility,
                  })}
                </p>
              </div>

              {createError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={createLoading}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !formCode.trim()}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition"
                >
                  {createLoading ? "Menyimpan..." : "Simpan & Terbitkan Kupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
