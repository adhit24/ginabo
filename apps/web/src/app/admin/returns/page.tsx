"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/returns/StatusBadge";
import { RETURN_STATUS_LABELS, RETURN_TYPE_LABELS, type ReturnStatus, type ReturnType } from "@/types/returns";

interface QueueRow {
  id: string;
  return_number: string;
  status: ReturnStatus;
  return_type: ReturnType;
  refund_amount: number;
  risk_score: number;
  is_flagged: boolean;
  created_at: string;
  order: { order_number: string } | null;
  profile: { full_name: string | null; email: string | null } | null;
  items: { quantity: number }[];
}

const STATUS_FILTERS: (ReturnStatus | "all")[] = [
  "all",
  "submitted",
  "under_review",
  "more_evidence_required",
  "approved",
  "awaiting_shipment",
  "item_received",
  "quality_inspection",
  "escalated",
  "completed",
  "rejected",
];

export default function AdminReturnsPage() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ReturnStatus | "all">("all");
  const [flagged, setFlagged] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const sp = new URLSearchParams();
      if (status !== "all") sp.set("status", status);
      if (flagged) sp.set("flagged", "true");
      try {
        const res = await fetch(`/api/admin/returns?${sp.toString()}`);
        const json = await res.json();
        if (!cancelled && json.ok) setRows(json.data as QueueRow[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, flagged]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) =>
      [r.return_number, r.order?.order_number ?? "", r.profile?.full_name ?? "", r.profile?.email ?? ""].some((x) =>
        x.toLowerCase().includes(qq),
      ),
    );
  }, [rows, q]);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manajemen Retur</h1>
          <p className="text-sm text-gray-500">{filtered.length} permintaan</p>
        </div>
        <Link href="/admin/returns/analytics" className="text-sm font-medium text-emerald-600 hover:underline">
          Analitik →
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nomor retur / order / pelanggan…"
          className="w-72 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReturnStatus | "all")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "Semua status" : RETURN_STATUS_LABELS[s as ReturnStatus]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} className="accent-rose-500" />
          Hanya berisiko
        </label>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Memuat…</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Retur</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/returns/${r.id}`} className="font-mono font-medium text-gray-900 hover:text-emerald-600">
                      {r.return_number}
                    </Link>
                    <p className="text-xs text-gray-400">{r.order?.order_number}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{r.profile?.full_name ?? "-"}</p>
                    <p className="text-xs text-gray-400">{r.profile?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{RETURN_TYPE_LABELS[r.return_type]}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatMoney(r.refund_amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.risk_score >= 70 ? "bg-rose-100 text-rose-700" : r.risk_score >= 40 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.risk_score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    Tidak ada retur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
