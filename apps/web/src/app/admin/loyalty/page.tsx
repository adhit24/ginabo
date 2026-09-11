"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminLoyaltyOverview, LoyaltyReconciliationReport } from "@/lib/loyalty/types";

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

export default function AdminLoyaltyPage() {
  const [overview, setOverview] = useState<AdminLoyaltyOverview | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });

  const [reconReport, setReconReport] = useState<LoyaltyReconciliationReport | null>(null);
  const [reconLoading, setReconLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/loyalty/overview");
        const json = await res.json();
        if (!json.ok) {
          throw new Error(json.error?.message ?? "Gagal memuat loyalty overview");
        }
        if (!cancelled) {
          setOverview(json.data);
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
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRunReconciliation() {
    setReconLoading(true);
    try {
      const res = await fetch("/api/admin/loyalty/reconciliation");
      const json = await res.json();
      if (json.ok && json.data) {
        setReconReport(json.data);
      } else {
        alert(json.error?.message ?? "Gagal menjalankan rekonsiliasi data.");
      }
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setReconLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty & Membership Rewards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoring saldo poin pelanggan, distribusi membership tier, audit ledger, dan integritas data loyalty.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunReconciliation}
            disabled={reconLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <span>{reconLoading ? "Memeriksa..." : "🔍 Audit Rekonsiliasi Data"}</span>
          </button>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
          >
            <span>Daftar Pelanggan &rarr;</span>
          </Link>
        </div>
      </div>

      {state.status === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {state.message}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">Total Terdaftar Member</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {overview ? overview.totalMembers.toLocaleString("id-ID") : "..."}
          </div>
          <div className="mt-1 text-xs text-gray-500">Customer dengan akun profil</div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
          <div className="text-xs font-semibold text-amber-800">Outstanding Points (Liabilitas)</div>
          <div className="mt-2 text-2xl font-bold text-amber-900">
            {overview ? overview.totalPointsOutstanding.toLocaleString("id-ID") : "..."}
          </div>
          <div className="mt-1 text-xs text-amber-700">Saldo poin aktif di pelanggan</div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
          <div className="text-xs font-semibold text-emerald-800">Total Poin Diperoleh (Earned)</div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">
            {overview ? overview.totalPointsEarnedAllTime.toLocaleString("id-ID") : "..."}
          </div>
          <div className="mt-1 text-xs text-emerald-700">Akumulasi reward transaksi valid</div>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 shadow-sm">
          <div className="text-xs font-semibold text-purple-800">Total Poin Ditebus (Redeemed)</div>
          <div className="mt-2 text-2xl font-bold text-purple-900">
            {overview ? overview.totalPointsRedeemedAllTime.toLocaleString("id-ID") : "..."}
          </div>
          <div className="mt-1 text-xs text-purple-700">Poin yang telah ditukar reward</div>
        </div>
      </div>

      {/* Tier Breakdown & Policy Box */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tier Distribution Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Distribusi Membership Tier</h2>
            <span className="text-xs text-gray-500">Berdasarkan Lifetime Net Spend</span>
          </div>

          <div className="mt-5 space-y-4">
            {(
              [
                { tier: "Regular", color: "bg-gray-100 text-gray-800", bar: "bg-gray-400", threshold: "Rp 0" },
                { tier: "Silver", color: "bg-slate-100 text-slate-800", bar: "bg-slate-500", threshold: "Rp 500.000+" },
                { tier: "Gold", color: "bg-amber-100 text-amber-800", bar: "bg-amber-500", threshold: "Rp 1.500.000+" },
                { tier: "Platinum", color: "bg-purple-100 text-purple-800", bar: "bg-purple-600", threshold: "Rp 3.000.000+" },
              ] as const
            ).map((item) => {
              const count = overview?.tierDistribution[item.tier] ?? 0;
              const total = overview?.totalMembers || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={item.tier}>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="font-semibold text-gray-900">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${item.color} mr-2`}>
                        {item.tier}
                      </span>
                      {item.threshold}
                    </span>
                    <span className="text-gray-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full ${item.bar} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Business Logic & Governance Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">Konfigurasi Aturan Loyalty V1</h2>
          <div className="mt-4 divide-y divide-gray-100 text-xs text-gray-600">
            <div className="flex items-center justify-between py-2.5">
              <span className="font-semibold text-gray-800">Rasio Earning Poin:</span>
              <span className="font-mono text-gray-900">1 Poin per Rp 1.000 belanja</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-semibold text-gray-800">Titik Earning (Trigger):</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Saat Pesanan Berstatus Completed
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-semibold text-gray-800">Kebijakan Retur / Refund:</span>
              <span className="text-gray-900">Reversal poin proporsional sesuai nominal refund</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-semibold text-gray-800">Kedaluwarsa Poin:</span>
              <span className="text-gray-900">Tidak kedaluwarsa (Permanent V1)</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-semibold text-gray-800">Integritas Saldo:</span>
              <span className="text-gray-900">Poin non-negatif (&ge; 0) dengan Double-entry Ledger</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-semibold text-gray-800">Hak Akses Mutasi Manual:</span>
              <span className="text-gray-900">Khusus Admin terautentikasi dengan alasan audit wajib</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reconciliation Health Report (if executed) */}
      {reconReport && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-white ${
                reconReport.discrepanciesCount === 0 ? "bg-emerald-600" : "bg-amber-600"
              }`}>
                {reconReport.discrepanciesCount === 0 ? "✓" : "!"}
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">Hasil Audit Rekonsiliasi Integritas Data</h3>
                <p className="text-xs text-gray-500">
                  Waktu audit: {new Date(reconReport.auditedAt).toLocaleString("id-ID")} • Total akun diperiksa: {reconReport.totalAccountsChecked}
                </p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              reconReport.discrepanciesCount === 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}>
              {reconReport.discrepanciesCount === 0 ? "SISTEM SEHAT (NO DISCREPANCY)" : `${reconReport.discrepanciesCount} DISKREPANSI DITEMUKAN`}
            </span>
          </div>

          <div className="mt-4">
            {reconReport.discrepancies.length === 0 ? (
              <p className="text-xs text-emerald-800 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                Semua saldo akun konsisten dengan buku besar (ledger), tidak ada transaksi orphan, dan seluruh saldo non-negatif.
              </p>
            ) : (
              <div className="space-y-2">
                {reconReport.discrepancies.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between rounded-xl bg-amber-50 p-3 text-xs border border-amber-200">
                    <div>
                      <span className="font-bold text-amber-900 uppercase">[SELISIH BUKU BESAR]</span>
                      <span className="ml-2 font-medium text-amber-800">
                        Profil: {item.balanceInProfile} pts vs Ledger: {item.sumFromLedger} pts (Selisih: {item.difference})
                      </span>
                      <div className="mt-0.5 font-mono text-[11px] text-gray-500">Profile ID: {item.profileId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
