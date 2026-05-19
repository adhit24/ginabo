"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { store, genId, type GProduct } from "@/lib/adminStore";

const EMPTY: Omit<GProduct, "id"> = { name: "", priceVal: "", priceMinor: 0, priceLabel: "IDR", img: "", rating: "5.0", reviews: "0", tag: "" };

function Card({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", ...style }}>
      {children}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<GProduct[]>([]);
  const [modal, setModal]       = useState<{ mode: "add" | "edit"; item: GProduct } | null>(null);
  const [delId, setDelId]       = useState<string | null>(null);
  const [form, setForm]         = useState<Omit<GProduct, "id">>(EMPTY);

  useEffect(() => { setProducts(store.getProducts()); }, []);

  function openAdd() {
    setForm(EMPTY);
    setModal({ mode: "add", item: { id: "", ...EMPTY } });
  }
  function openEdit(p: GProduct) {
    setForm({ name: p.name, priceVal: p.priceVal, priceMinor: p.priceMinor, priceLabel: p.priceLabel, img: p.img, rating: p.rating, reviews: p.reviews, tag: p.tag });
    setModal({ mode: "edit", item: p });
  }
  function saveModal() {
    const updated = modal!.mode === "add"
      ? [...products, { id: genId(), ...form }]
      : products.map(p => p.id === modal!.item.id ? { ...p, ...form } : p);
    store.setProducts(updated);
    setProducts(updated);
    setModal(null);
  }
  function confirmDelete() {
    const updated = products.filter(p => p.id !== delId);
    store.setProducts(updated);
    setProducts(updated);
    setDelId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Produk Kami</h1>
          <p className="text-sm text-white/40">Kelola katalog produk single</p>
        </div>
        <button onClick={openAdd} className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>
          + Tambah Produk
        </button>
      </div>

      <div className="grid gap-3">
        {products.length === 0 && (
          <Card><p className="text-sm text-white/40">Belum ada produk.</p></Card>
        )}
        {products.map(p => (
          <Card key={p.id}>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                {p.img && <Image src={p.img} alt={p.name} fill className="object-contain p-1" sizes="56px" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm whitespace-pre-line leading-snug">{p.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{p.tag}</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-bold text-white">{p.priceLabel} {p.priceVal}</p>
                <p className="text-xs text-white/40">⭐ {p.rating} · {p.reviews} ulasan</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white transition"
                  style={{ background: "rgba(255,255,255,0.08)" }}>Edit</button>
                <button onClick={() => setDelId(p.id)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                  style={{ background: "rgba(239,68,68,0.1)" }}>Hapus</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#1a0a38", border: "1px solid rgba(255,255,255,0.12)" }}>
            <h2 className="mb-5 text-base font-bold text-white">{modal.mode === "add" ? "Tambah Produk" : "Edit Produk"}</h2>
            <div className="flex flex-col gap-3">
              {([ ["Nama Produk", "name", "text"], ["Harga Tampil", "priceVal", "text"], ["Harga (IDR angka)", "priceMinor", "number"],
                  ["Label Harga", "priceLabel", "text"], ["URL Gambar", "img", "text"], ["Tag/Tipe", "tag", "text"],
                  ["Rating", "rating", "text"], ["Jumlah Ulasan", "reviews", "text"],
              ] as [string, keyof typeof form, string][]).map(([label, key, type]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</label>
                  <input type={type} value={String(form[key] ?? "")}
                    onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition">Batal</button>
              <button onClick={saveModal} className="rounded-xl px-5 py-2 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#1a0a38", border: "1px solid rgba(255,255,255,0.12)" }}>
            <p className="text-sm font-semibold text-white">Hapus produk ini?</p>
            <p className="mt-1 text-xs text-white/40">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setDelId(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition">Batal</button>
              <button onClick={confirmDelete} className="rounded-xl px-5 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

