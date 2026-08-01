"use client";

import { useCallback, useEffect, useState } from "react";

import type { AddressRow } from "@/types/database";
import { useAuth } from "@/components/auth/AuthProvider";
import { authFetch } from "@/lib/supabase/client";

type Props = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

type FormState = {
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
};

const EMPTY_FORM: FormState = {
  label: "",
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  province: "",
  postal_code: "",
};

const inputCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[16px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 md:text-sm";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500";

export function AddressPicker({ selectedId, onSelect }: Props) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      recipient_name: current.recipient_name || user?.name || "",
      phone: current.phone || user?.phone || "",
    }));
  }, [user]);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/addresses");
      const json = (await res.json()) as { ok: boolean; data?: AddressRow[] };
      const list = json.ok && json.data ? json.data : [];
      setAddresses(list);
      if (list.length === 0) {
        setShowForm(true);
      } else {
        // Only choose the default address on the initial load. Once the user
        // picks another address, a refresh must not silently switch back.
        if (!selectedId) {
          const preselected = list.find((a) => a.is_default) ?? list[0];
          onSelect(preselected.id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [onSelect, selectedId]);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  async function submitNewAddress() {
    setError(null);
    if (
      !form.recipient_name ||
      !form.phone ||
      !form.address_line1 ||
      !form.city ||
      !form.province ||
      !form.postal_code
    ) {
      setError("Lengkapi semua field yang wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch("/api/addresses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, is_default: addresses.length === 0 }),
      });
      const json = (await res.json()) as { ok: boolean; data?: AddressRow; error?: { message: string } };
      if (!json.ok || !json.data) {
        setError(json.error?.message ?? "Gagal menyimpan alamat");
        return;
      }
      setAddresses((prev) => [json.data as AddressRow, ...prev]);
      onSelect(json.data.id);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-400">Memuat alamat…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.length > 0 && (
        <div className="flex flex-col gap-2">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                selectedId === addr.id ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="address"
                checked={selectedId === addr.id}
                onChange={() => onSelect(addr.id)}
                className="mt-1 accent-brand-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{addr.recipient_name}</span>
                  {addr.is_default && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
                      Utama
                    </span>
                  )}
                  {addr.label && <span className="text-[11px] text-gray-400">{addr.label}</span>}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{addr.phone}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {addr.address_line1}
                  {addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city}, {addr.province}{" "}
                  {addr.postal_code}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="self-start text-xs font-bold text-brand-700 hover:text-brand-800"
        >
          + Tambah Alamat Baru
        </button>
      )}

      {showForm && (
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Label Alamat (opsional)</label>
              <input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className={inputCls}
                placeholder="Rumah / Kantor"
              />
            </div>
            <div>
              <label className={labelCls}>Nama Penerima</label>
              <input
                value={form.recipient_name}
                onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))}
                className={inputCls}
                placeholder="Nama penerima paket"
              />
            </div>
            <div>
              <label className={labelCls}>No. WhatsApp / Telepon</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputCls}
                placeholder="+62xxx-xxxx-xxxx"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Alamat Lengkap</label>
              <input
                value={form.address_line1}
                onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))}
                className={inputCls}
                placeholder="Nama jalan, nomor rumah, RT/RW"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Detail Tambahan (opsional)</label>
              <input
                value={form.address_line2}
                onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))}
                className={inputCls}
                placeholder="Patokan, unit, lantai"
              />
            </div>
            <div>
              <label className={labelCls}>Kota / Kabupaten</label>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={inputCls}
                placeholder="Kota"
              />
            </div>
            <div>
              <label className={labelCls}>Provinsi</label>
              <input
                value={form.province}
                onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                className={inputCls}
                placeholder="Provinsi"
              />
            </div>
            <div>
              <label className={labelCls}>Kode Pos</label>
              <input
                value={form.postal_code}
                onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                className={inputCls}
                placeholder="Kode pos"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={submitNewAddress}
              disabled={saving}
              className="rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-800 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Simpan Alamat"}
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                Batal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
