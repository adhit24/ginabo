"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Customer = { id: string; name: string; email: string | null; phone: string | null; createdAt: string };
type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

export default function AdminCustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [state, setState] = useState<State>({ status: "loading" });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((c) => [c.name, c.email ?? "", c.phone ?? ""].some((x) => x.toLowerCase().includes(qq)));
  }, [items, q]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/admin/customers");
        const json = (await res.json()) as { ok: boolean; data?: Customer[]; error?: { message: string } };
        if (!json.ok || !json.data) throw new Error(json.error?.message ?? "Failed to load");
        if (!cancelled) {
          setItems(json.data);
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
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600">CRM light: profil customer + riwayat order & booking.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-xs rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
          placeholder="Search..."
        />
      </div>

      {state.status === "error" ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{state.message}</div>
      ) : null}

      <div className="grid gap-3">
        {state.status === "loading" ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Tidak ada customer.</div>
        ) : (
          filtered.map((c) => (
            <Link key={c.id} href={`/admin/customers/${c.id}`} className="rounded-3xl border border-gray-100 bg-white p-5 hover:border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                  <div className="mt-1 text-sm text-gray-600">{c.email ?? c.phone ?? "—"}</div>
                </div>
                <div className="text-xs font-semibold text-gray-500">{new Date(c.createdAt).toLocaleDateString("id-ID")}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

