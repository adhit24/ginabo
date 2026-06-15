"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { RETURN_STATUS_LABELS, RETURN_TYPE_LABELS, type ReturnStatus, type ReturnType } from "@/types/returns";

interface Analytics {
  window_days: number;
  total_returns: number;
  total_orders: number;
  return_rate_pct: number;
  completed: number;
  rejected: number;
  exchange_count: number;
  refund_amount: number;
  avg_processing_hours: number;
  by_reason: Record<string, number>;
  by_status: Record<string, number>;
  top_products: { product_name: string; quantity: number }[];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs uppercase text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function ReturnsAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/returns/analytics?days=${days}`);
      const json = await res.json();
      if (!cancelled && json.ok) setData(json.data as Analytics);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Link href="/admin/returns" className="text-sm text-gray-500 hover:text-gray-900">
            ← Antrean Retur
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">Analitik Retur</h1>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value={7}>7 hari</option>
          <option value={30}>30 hari</option>
          <option value={90}>90 hari</option>
          <option value={365}>1 tahun</option>
        </select>
      </div>

      {loading || !data ? (
        <div className="py-16 text-center text-sm text-gray-400">Memuat…</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Total Retur" value={String(data.total_returns)} />
            <Stat label="Return Rate" value={`${data.return_rate_pct}%`} />
            <Stat label="Total Refund" value={formatMoney(data.refund_amount)} />
            <Stat label="Rata² Proses" value={`${data.avg_processing_hours} jam`} />
            <Stat label="Selesai" value={String(data.completed)} />
            <Stat label="Ditolak" value={String(data.rejected)} />
            <Stat label="Penukaran" value={String(data.exchange_count)} />
            <Stat label="Total Order" value={String(data.total_orders)} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Alasan Retur Teratas</h2>
              <ul className="space-y-2">
                {Object.entries(data.by_reason)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                    <li key={reason} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{RETURN_TYPE_LABELS[reason as ReturnType] ?? reason}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </li>
                  ))}
                {Object.keys(data.by_reason).length === 0 && <li className="text-sm text-gray-400">Tidak ada data.</li>}
              </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Distribusi Status</h2>
              <ul className="space-y-2">
                {Object.entries(data.by_status)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <li key={status} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{RETURN_STATUS_LABELS[status as ReturnStatus] ?? status}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </li>
                  ))}
              </ul>
            </section>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Produk Paling Sering Diretur</h2>
            <ul className="space-y-2">
              {data.top_products.map((p) => (
                <li key={p.product_name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{p.product_name}</span>
                  <span className="font-medium text-gray-900">{p.quantity} unit</span>
                </li>
              ))}
              {data.top_products.length === 0 && <li className="text-sm text-gray-400">Tidak ada data.</li>}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
