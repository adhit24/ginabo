"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/returns/StatusBadge";
import {
  ACTIVE_RETURN_STATUSES,
  RETURN_TYPE_LABELS,
  type ReturnStatus,
  type ReturnType,
} from "@/types/returns";

interface ReturnListItem {
  id: string;
  return_number: string;
  status: ReturnStatus;
  return_type: ReturnType;
  preferred_resolution: string;
  refund_amount: number;
  created_at: string;
  order: { order_number: string } | null;
  items: { product_name: string; image_url: string | null; quantity: number }[];
}

type Tab = "active" | "closed";

export default function ReturnCenterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ReturnListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login?next=/returns");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/returns");
        const json = await res.json();
        if (!cancelled && json.ok) setItems(json.data as ReturnListItem[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = items.filter((r) =>
    tab === "active"
      ? ACTIVE_RETURN_STATUSES.includes(r.status) || r.status === "refund_approved" || r.status === "exchange_approved"
      : ["completed", "rejected", "cancelled"].includes(r.status),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pusat Retur</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola permintaan retur, refund, dan penukaran kamu.</p>
        </div>
        <Link
          href="/member"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Akun
        </Link>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {(["active", "closed"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "active" ? "Aktif" : "Selesai / Ditolak"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Memuat…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">
            {tab === "active" ? "Belum ada retur aktif." : "Belum ada retur yang selesai."}
          </p>
          <Link href="/member" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline">
            Lihat pesanan saya →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/returns/${r.return_number}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-gray-900">{r.return_number}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {RETURN_TYPE_LABELS[r.return_type]} · Order {r.order?.order_number ?? "-"}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-400">
                      {r.items.map((it) => `${it.product_name} ×${it.quantity}`).join(", ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatMoney(r.refund_amount)}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
