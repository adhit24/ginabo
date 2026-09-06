"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: "IDR" | "USD";
  shippingCourier: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  customer: { id: string; name: string; email: string | null; phone: string | null };
  payment: { provider: string; status: string; paymentType: string | null } | null;
};

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

const STATUS_TABS = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu Bayar" },
  { id: "paid", label: "Dibayar" },
  { id: "processing", label: "Diproses" },
  { id: "shipped", label: "Dikirim" },
  { id: "delivered", label: "Diterima" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

export default function AdminOrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [state, setState] = useState<State>({ status: "loading" });
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Tracking modal state
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [courierInput, setCourierInput] = useState("JNE");
  const [serviceInput, setServiceInput] = useState("REG");
  const [modalError, setModalError] = useState("");

  const filtered = useMemo(() => {
    let list = items;
    if (activeTab !== "all") {
      list = list.filter((o) => o.status === activeTab);
    }
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter((o) =>
      [o.orderNumber, o.customer.name, o.customer.email ?? "", o.trackingNumber ?? ""].some((x) =>
        x.toLowerCase().includes(qq)
      )
    );
  }, [items, q, activeTab]);

  async function loadOrders() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/admin/orders");
      const json = (await res.json()) as { ok: boolean; data?: Order[]; error?: { message: string } };
      if (!json.ok || !json.data) throw new Error(json.error?.message ?? "Gagal memuat pesanan");
      setItems(json.data);
      setState({ status: "idle" });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function handleUpdateStatus(orderId: string, nextStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Gagal memperbarui status");
      await loadOrders();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSubmitTracking(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingModalOrder) return;
    setModalError("");
    setUpdatingId(trackingModalOrder.id);
    try {
      const res = await fetch(`/api/admin/orders/${trackingModalOrder.id}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_number: trackingNumberInput,
          shipping_courier: courierInput,
          shipping_service: serviceInput,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Gagal menyimpan nomor resi");
      setTrackingModalOrder(null);
      await loadOrders();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : String(e));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Kelola Pesanan</h1>
          <p className="text-sm text-gray-600">Pantau dan jalankan fulfillment pesanan toko.</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-xs rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
          placeholder="Cari no. order, customer, resi..."
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {state.status === "error" ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {state.message}
        </div>
      ) : null}

      {/* Orders List */}
      <div className="grid gap-4">
        {state.status === "loading" ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Memuat pesanan...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-sm text-gray-600">Tidak ada pesanan ditemukan.</div>
        ) : (
          filtered.map((o) => (
            <div key={o.id} className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <div className="font-mono text-base font-semibold text-gray-900">{o.orderNumber}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{formatMoney(o.totalMinor, o.currency)}</div>
                  <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    o.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'processing' ? 'bg-indigo-100 text-indigo-800' :
                    o.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    o.status === 'delivered' || o.status === 'completed' ? 'bg-green-100 text-green-800' :
                    o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {o.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Pelanggan</div>
                  <div className="font-medium text-gray-900">{o.customer.name}</div>
                  {o.customer.email && <div className="text-xs text-gray-600">{o.customer.email}</div>}
                  {o.customer.phone && <div className="text-xs text-gray-600">{o.customer.phone}</div>}
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase">Pengiriman & Resi</div>
                  <div className="text-gray-800">
                    Kurir: <span className="font-semibold">{o.shippingCourier?.toUpperCase() || "—"}</span>
                  </div>
                  <div className="text-gray-800 font-mono">
                    Resi: <span className="font-semibold">{o.trackingNumber || "Belum ada"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons based on state machine */}
              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                {o.status === "paid" && (
                  <>
                    <button
                      disabled={updatingId === o.id}
                      onClick={() => handleUpdateStatus(o.id, "processing")}
                      className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Proses Pesanan
                    </button>
                    <button
                      disabled={updatingId === o.id}
                      onClick={() => handleUpdateStatus(o.id, "cancelled")}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Batalkan
                    </button>
                  </>
                )}

                {o.status === "processing" && (
                  <>
                    <button
                      disabled={updatingId === o.id}
                      onClick={() => {
                        setTrackingModalOrder(o);
                        setTrackingNumberInput(o.trackingNumber || "");
                        setCourierInput(o.shippingCourier || "JNE");
                        setModalError("");
                      }}
                      className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      Input Resi & Kirim
                    </button>
                    <button
                      disabled={updatingId === o.id}
                      onClick={() => handleUpdateStatus(o.id, "cancelled")}
                      className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Batalkan
                    </button>
                  </>
                )}

                {o.status === "shipped" && (
                  <button
                    disabled={updatingId === o.id}
                    onClick={() => handleUpdateStatus(o.id, "delivered")}
                    className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Tandai Diterima Customer
                  </button>
                )}

                {o.status === "delivered" && (
                  <button
                    disabled={updatingId === o.id}
                    onClick={() => handleUpdateStatus(o.id, "completed")}
                    className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Selesaikan Pesanan
                  </button>
                )}

                {o.status === "pending" && (
                  <button
                    disabled={updatingId === o.id}
                    onClick={() => handleUpdateStatus(o.id, "cancelled")}
                    className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Batalkan Pesanan
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tracking Resi Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmitTracking}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl grid gap-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Input Resi Pengiriman: {trackingModalOrder.orderNumber}
              </h2>
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {modalError}
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-xs font-semibold text-gray-700 uppercase">Kurir Ekspedisi</label>
              <select
                value={courierInput}
                onChange={(e) => setCourierInput(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
              >
                <option value="JNE">JNE</option>
                <option value="J&T">J&T</option>
                <option value="SiCepat">SiCepat</option>
                <option value="Anteraja">Anteraja</option>
                <option value="POS">POS Indonesia</option>
                <option value="TIKI">TIKI</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold text-gray-700 uppercase">Nomor Resi (Airwaybill)</label>
              <input
                type="text"
                required
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                placeholder="Contoh: JNE123456789ID"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-300 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updatingId === trackingModalOrder.id}
                className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Simpan & Kirim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
