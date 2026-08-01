"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AddressRow } from "@/types/database";
import type { GeocodeResult } from "@/lib/geocode";
import { authFetch } from "@/lib/supabase/client";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (address: AddressRow) => void;
}

const inputCls = "w-full rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40";
const inputStyle = { background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" };
const labelCls = "mb-1.5 block text-xs font-semibold text-white/70";
const EMPTY_DETAILS = { label: "", recipient_name: "", phone: "", address_line1: "", address_line2: "", city: "", province: "", postal_code: "" };

export function AddressModal({ open, onClose, onSaved }: AddressModalProps) {
  const [step, setStep] = useState<"search" | "details">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("search"); setQuery(""); setResults([]); setLocateError("");
      setDetails(EMPTY_DETAILS); setSaveError("");
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);
        const json = await res.json() as { ok: boolean; data?: GeocodeResult[] };
        setResults(json.ok && json.data ? json.data : []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function selectGeo(geo: GeocodeResult) {
    setDetails(d => ({ ...d, address_line1: geo.address_line1, city: geo.city, province: geo.province, postal_code: geo.postal_code }));
    setStep("details");
  }

  function useCurrentLocation() {
    setLocateError("");
    if (!navigator.geolocation) { setLocateError("Perangkat ini tidak mendukung deteksi lokasi."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const res = await fetch(`/api/geocode/reverse?lat=${coords.latitude}&lon=${coords.longitude}`);
        const json = await res.json() as { ok: boolean; data?: GeocodeResult | null };
        if (json.ok && json.data) selectGeo(json.data);
        else setLocateError("Lokasi tidak dapat diidentifikasi. Coba cari manual.");
      } catch { setLocateError("Gagal mengambil lokasi. Coba cari manual."); }
      finally { setLocating(false); }
    }, () => { setLocating(false); setLocateError("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan, atau cari manual."); }, { enableHighAccuracy: true, timeout: 10000 });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault(); setSaveError("");
    if (!details.recipient_name || !details.phone || !details.address_line1 || !details.city || !details.province || !details.postal_code) {
      setSaveError("Lengkapi semua field yang wajib diisi."); return;
    }
    setSaving(true);
    try {
      const res = await authFetch("/api/addresses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...details, is_default: false }) });
      const json = await res.json() as { ok: boolean; data?: AddressRow; error?: { message: string } };
      if (!json.ok || !json.data) { setSaveError(json.error?.message ?? "Gagal menyimpan alamat."); return; }
      onSaved(json.data); onClose();
    } catch { setSaveError("Gagal menyimpan alamat."); }
    finally { setSaving(false); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:px-4" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-2xl p-5 sm:max-w-md sm:rounded-2xl sm:p-6" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 8px 32px rgba(20,15,50,0.4)" }} onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-bold text-white">Tambah Alamat</h3><button type="button" onClick={onClose} className="text-xl text-white/50" aria-label="Tutup">×</button></div>
        {step === "search" ? (
          <div className="flex flex-col gap-3">
            <input autoFocus className={inputCls} style={inputStyle} placeholder="Cari nama jalan / kelurahan / kota" value={query} onChange={e => setQuery(e.target.value)} />
            <button type="button" onClick={useCurrentLocation} disabled={locating} className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#c084fc] disabled:opacity-50" style={{ border: "1px solid rgba(139,92,246,0.25)" }}>{locating ? "Mengambil lokasi..." : "⌖ Gunakan Lokasi Saat Ini"}</button>
            {locateError && <p className="text-xs text-red-400/80">{locateError}</p>}
            <div className="flex flex-col gap-1">{searching && <p className="text-xs text-white/40">Mencari...</p>}{!searching && query.trim().length >= 3 && results.length === 0 && <p className="text-xs text-white/40">Tidak ditemukan, coba kata kunci lain.</p>}{results.map((result, i) => <button key={`${result.lat}-${result.lon}-${i}`} type="button" onClick={() => selectGeo(result)} className="rounded-lg px-3 py-2.5 text-left text-xs text-white/70 hover:bg-white/5" style={{ border: "1px solid rgba(139,92,246,0.12)" }}>{result.label}</button>)}</div>
            <p className="text-center text-[10px] text-white/30">© OpenStreetMap contributors</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <button type="button" onClick={() => setStep("search")} className="self-start text-xs text-[#c084fc]">‹ Cari ulang</button>
            {saveError && <div className="rounded-lg px-4 py-3 text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{saveError}</div>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 sm:col-span-2"><span className={labelCls}>Label (opsional)</span><input className={inputCls} style={inputStyle} value={details.label} onChange={e => setDetails(d => ({ ...d, label: e.target.value }))} placeholder="Rumah / Kantor" /></label>
              <label className="grid gap-1.5"><span className={labelCls}>Nama Penerima</span><input required className={inputCls} style={inputStyle} value={details.recipient_name} onChange={e => setDetails(d => ({ ...d, recipient_name: e.target.value }))} /></label>
              <label className="grid gap-1.5"><span className={labelCls}>No. Telepon</span><input required className={inputCls} style={inputStyle} value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} /></label>
              <label className="grid gap-1.5 sm:col-span-2"><span className={labelCls}>Alamat Lengkap</span><input required className={inputCls} style={inputStyle} value={details.address_line1} onChange={e => setDetails(d => ({ ...d, address_line1: e.target.value }))} /></label>
              <label className="grid gap-1.5 sm:col-span-2"><span className={labelCls}>Detail Tambahan (opsional)</span><input className={inputCls} style={inputStyle} value={details.address_line2} onChange={e => setDetails(d => ({ ...d, address_line2: e.target.value }))} /></label>
              <label className="grid gap-1.5"><span className={labelCls}>Kota / Kabupaten</span><input required className={inputCls} style={inputStyle} value={details.city} onChange={e => setDetails(d => ({ ...d, city: e.target.value }))} /></label>
              <label className="grid gap-1.5"><span className={labelCls}>Provinsi</span><input required className={inputCls} style={inputStyle} value={details.province} onChange={e => setDetails(d => ({ ...d, province: e.target.value }))} /></label>
              <label className="grid gap-1.5"><span className={labelCls}>Kode Pos</span><input required className={inputCls} style={inputStyle} value={details.postal_code} onChange={e => setDetails(d => ({ ...d, postal_code: e.target.value }))} /></label>
            </div>
            <div className="mt-2 flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/70" style={{ border: "1px solid rgba(139,92,246,0.3)" }}>Batal</button><button type="submit" disabled={saving} className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>{saving ? "Menyimpan..." : "Simpan Alamat"}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}

