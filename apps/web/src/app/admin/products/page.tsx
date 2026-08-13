"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  ingredients: string | null;
  weightGrams: number | null;
  priceMinor: number;
  currency: string;
  stockQty: number;
  isActive: boolean;
  averageRating: number | null;
  reviewCount: number | null;
  imageUrl: string | null;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  ingredients: string;
  weightGrams: string;
  priceMinor: string;
  stockQty: string;
  isActive: boolean;
  imageUrl: string;
};

const EMPTY_FORM: FormState = {
  name: "", slug: "", description: "", shortDescription: "", ingredients: "",
  weightGrams: "", priceMinor: "", stockQty: "", isActive: true, imageUrl: "",
};

function slugify(name: string) {
  return name.replace(/\n/g, "-").replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function formatIDR(minor: number) {
  return `Rp ${minor.toLocaleString("id-ID")}`;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
      {children}
    </div>
  );
}

async function parseApiResponse<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    return { ok: false, message: body?.error?.message ?? `Request gagal (HTTP ${res.status})` };
  }
  return { ok: true, data: body.data as T };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal]       = useState<{ mode: "add" | "edit"; id: string | null } | null>(null);
  const [form, setForm]         = useState<FormState>(EMPTY_FORM);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setLoadError(null);
    const res = await fetch("/api/admin/products");
    const result = await parseApiResponse<ApiProduct[]>(res);
    if (!result.ok) { setLoadError(result.message); setLoading(false); return; }
    setProducts(result.data);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  function openAdd() {
    setForm(EMPTY_FORM);
    setSaveError(null);
    setModal({ mode: "add", id: null });
  }
  function openEdit(p: ApiProduct) {
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      shortDescription: p.shortDescription ?? "", ingredients: p.ingredients ?? "",
      weightGrams: p.weightGrams != null ? String(p.weightGrams) : "",
      priceMinor: String(p.priceMinor), stockQty: String(p.stockQty),
      isActive: p.isActive, imageUrl: p.imageUrl ?? "",
    });
    setSaveError(null);
    setModal({ mode: "edit", id: p.id });
  }

  async function saveModal() {
    if (!modal) return;
    const priceMinor = Number(form.priceMinor);
    const stockQty = Number(form.stockQty);
    if (!form.name.trim()) { setSaveError("Nama produk wajib diisi"); return; }
    if (form.description.trim().length < 10) { setSaveError("Deskripsi minimal 10 karakter"); return; }
    if (!Number.isFinite(priceMinor) || priceMinor < 0) { setSaveError("Harga tidak valid"); return; }
    if (!Number.isFinite(stockQty) || stockQty < 0) { setSaveError("Stok tidak valid"); return; }

    setSaving(true);
    setSaveError(null);

    const payload = {
      name: form.name,
      slug: form.slug.trim() || slugify(form.name),
      description: form.description,
      shortDescription: form.shortDescription,
      ingredients: form.ingredients,
      weightGrams: form.weightGrams.trim() ? Number(form.weightGrams) : undefined,
      priceMinor,
      stockQty,
      isActive: form.isActive,
      imageUrl: form.imageUrl,
    };

    const res = modal.mode === "add"
      ? await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch(`/api/admin/products/${modal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    const result = await parseApiResponse<{ id: string }>(res);
    setSaving(false);
    if (!result.ok) { setSaveError(result.message); return; }

    setModal(null);
    await loadProducts();
  }

  async function confirmDelete() {
    if (!delId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${delId}`, { method: "DELETE" });
    const result = await parseApiResponse<{ deleted: boolean }>(res);
    setDeleting(false);
    setDelId(null);
    if (!result.ok) { setLoadError(result.message); return; }
    await loadProducts();
  }

  const inputCls = "rounded-xl px-3 py-2.5 text-sm text-white outline-none";
  const inputStyle = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Produk Kami</h1>
          <p className="text-sm text-white/40">Kelola katalog produk single &mdash; tersimpan langsung ke database, tampil di homepage &amp; /shop</p>
        </div>
        <button onClick={openAdd} className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>
          + Tambah Produk
        </button>
      </div>

      {loadError && (
        <Card><p className="text-sm text-red-400">{loadError}</p></Card>
      )}

      <div className="grid gap-3">
        {loading && (
          <Card><p className="text-sm text-white/40">Memuat produk&hellip;</p></Card>
        )}
        {!loading && products.length === 0 && !loadError && (
          <Card><p className="text-sm text-white/40">Belum ada produk.</p></Card>
        )}
        {products.map(p => (
          <Card key={p.id}>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-1" sizes="56px" unoptimized />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm leading-snug">{p.name}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {p.slug} &middot; stok {p.stockQty}
                  {!p.isActive && <span className="ml-2 text-red-400">nonaktif</span>}
                </p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-bold text-white">{formatIDR(p.priceMinor)}</p>
                <p className="text-xs text-white/40">
                  {p.averageRating != null ? `⭐ ${p.averageRating.toFixed(1)} · ${p.reviewCount ?? 0} ulasan` : "Belum ada ulasan"}
                </p>
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
          <div className="w-full max-w-md rounded-2xl p-6 my-auto" style={{ background: "#1a0a38", border: "1px solid rgba(255,255,255,0.12)" }}>
            <h2 className="mb-5 text-base font-bold text-white">{modal.mode === "add" ? "Tambah Produk" : "Edit Produk"}</h2>
            <div className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto pr-1">

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Nama Produk</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Slug (auto jika kosong)</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Minimal 10 karakter, ini yang tampil di halaman detail produk"
                  className={inputCls} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Deskripsi Singkat</label>
                <input type="text" value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                  placeholder="Ringkasan 1 baris untuk kartu produk" className={inputCls} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Kandungan/Ingredients</label>
                <input type="text" value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                  placeholder="Niacinamide, Hyaluronic Acid, ..." className={inputCls} style={inputStyle} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Harga (IDR)</label>
                  <input type="number" value={form.priceMinor} onChange={e => setForm(f => ({ ...f, priceMinor: e.target.value }))} className={inputCls} style={inputStyle} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Stok</label>
                  <input type="number" value={form.stockQty} onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))} className={inputCls} style={inputStyle} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Berat (gram, untuk ongkir)</label>
                <input type="number" value={form.weightGrams} onChange={e => setForm(f => ({ ...f, weightGrams: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">URL Gambar</label>
                <input type="text" value={form.imageUrl} placeholder="/nama-file.png atau https://..."
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className={inputCls} style={inputStyle} />
                {form.imageUrl && (
                  <div className="relative mt-1 h-12 w-12 overflow-hidden rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <Image src={form.imageUrl} alt="preview" fill className="object-contain p-1" sizes="48px" unoptimized />
                  </div>
                )}
              </div>

              <label className="mt-1 flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                Aktif (tampil di toko)
              </label>

              {saveError && <p className="text-xs text-red-400">{saveError}</p>}
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setModal(null)} disabled={saving} className="rounded-xl px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition disabled:opacity-40">Batal</button>
              <button onClick={saveModal} disabled={saving} className="rounded-xl px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>{saving ? "Menyimpan…" : "Simpan"}</button>
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
              <button onClick={() => setDelId(null)} disabled={deleting} className="rounded-xl px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition disabled:opacity-40">Batal</button>
              <button onClick={confirmDelete} disabled={deleting} className="rounded-xl px-5 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-60">{deleting ? "Menghapus…" : "Hapus"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
