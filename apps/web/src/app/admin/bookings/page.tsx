"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

type Booking = {
  id: string;
  bookingNumber: string;
  status: string;
  createdAt: string;
  notes: string | null;
  slot: { id: string; startAt: string; endAt: string; capacity: number; isActive: boolean };
  customer: { id: string; name: string; email: string | null; phone: string | null };
};

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

export default function AdminBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [state, setState] = useState<State>({ status: "loading" });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((b) =>
      [b.bookingNumber, b.customer.name, b.customer.email ?? "", b.customer.phone ?? ""].some((x) => x.toLowerCase().includes(qq))
    );
  }, [items, q]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/admin/bookings");
        const json = (await res.json()) as { ok: boolean; data?: Booking[]; error?: { message: string } };
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
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-600">Calendar view tersedia di tab Slots. Ini list booking.</p>
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
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Tidak ada booking.</div>
        ) : (
          filtered.map((b) => (
            <div key={b.id} className="grid gap-2 rounded-3xl border border-gray-100 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{b.bookingNumber}</div>
                  <div className="mt-1 text-sm text-gray-600">{b.customer.name}</div>
                </div>
                <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{b.status}</div>
              </div>
              <div className="text-sm text-gray-700">
                Slot:{" "}
                <span className="font-semibold">
                  {format(new Date(b.slot.startAt), "yyyy-MM-dd HH:mm")}–{format(new Date(b.slot.endAt), "HH:mm")}
                </span>
              </div>
              {b.notes ? <div className="text-sm text-gray-600">Notes: {b.notes}</div> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

