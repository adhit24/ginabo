"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useShopCatalog } from "@/lib/useShopCatalog";
import { ProductCard } from "@/components/ProductCard";

const SORT_OPTIONS = [
  { key: "newest",   label: "Terbaru" },
  { key: "popular",  label: "Terpopuler" },
  { key: "price-lo", label: "Harga Terendah" },
  { key: "price-hi", label: "Harga Tertinggi" },
];

export default function ShopPage() {
  const allProducts = useShopCatalog();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [category, setCategory]       = useState("all");
  const [sort, setSort]               = useState("newest");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Category tabs are derived from the real product-type categories present
  // in the catalog (from the DB `categories` table via each product's
  // category_id), not a hardcoded taxonomy — a category with zero products
  // simply doesn't appear, instead of showing a permanently-empty tab.
  // "Bundling" stays a distinct, always-shown tab since bundles have no
  // `products` row / category_id by design.
  const CATEGORIES = useMemo(() => {
    const nonBundle = allProducts.filter(p => p.category !== "bundling");
    const seen = new Map<string, string>();
    for (const p of nonBundle) {
      if (!seen.has(p.category)) seen.set(p.category, p.categoryLabel ?? p.category);
    }
    const dynamic = Array.from(seen, ([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    const hasBundling = allProducts.some(p => p.category === "bundling");
    return [
      { key: "all", label: "Semua Produk" },
      ...dynamic,
      ...(hasBundling ? [{ key: "bundling", label: "Paket Bundling" }] : []),
    ];
  }, [allProducts]);

  const filtered = allProducts
    .filter(p => category === "all" || p.category === category)
    .filter(p => !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    .sort((a, b) => {
      if (sort === "price-lo") return a.priceMinor - b.priceMinor;
      if (sort === "price-hi") return b.priceMinor - a.priceMinor;
      if (sort === "popular")  return parseInt(b.reviews) - parseInt(a.reviews);
      return 0;
    });

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#292929]">

      {/* ── Page Header ── */}
      <div className="border-b border-[#EAEAEA] bg-white py-6 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-1.5 flex items-center gap-2 text-[13px] text-[#7C7C7C] font-medium">
            <Link href="/" className="hover:text-[#78257C] transition">Home</Link>
            <span className="text-[#C0C0C0]">/</span>
            <span className="text-[#292929] font-semibold">Semua Produk</span>
          </nav>
          <h1 className="text-[24px] md:text-[28px] font-extrabold text-[#292929] tracking-tight">Semua Produk ({filtered.length})</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden md:block w-[220px] flex-shrink-0">
            <div className="sticky top-28">
              <h3 className="mb-3.5 text-[13px] font-extrabold uppercase tracking-widest text-[#292929]">Kategori</h3>
              <ul className="flex flex-col gap-1">
                {CATEGORIES.map(cat => (
                  <li key={cat.key}>
                    <button
                      onClick={() => setCategory(cat.key)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-[6px] text-[14px] font-semibold transition ${
                        category === cat.key
                          ? "bg-[#78257C] text-white shadow-xs"
                          : "text-[#666666] hover:bg-[#F9F5FB] hover:text-[#78257C]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar: count + sort + mobile filter */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-2 border border-[#D5D5D5] rounded-[6px] px-3.5 py-2 text-[13.5px] font-semibold text-[#292929]"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                  </svg>
                  Filter
                </button>
                <span className="text-[14px] text-[#7C7C7C] font-medium hidden md:inline">{filtered.length} produk</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Search within shop */}
                <div className="relative hidden sm:block">
                  <svg width="15" height="15" fill="none" stroke="#7C7C7C" strokeWidth="2" viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-48 rounded-[6px] border border-[#D5D5D5] py-2 pl-9 pr-3 text-[14px] text-[#292929] outline-none focus:border-[#78257C] transition"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="border border-[#D5D5D5] rounded-[6px] px-3.5 py-2 text-[14px] font-semibold text-[#292929] bg-white outline-none cursor-pointer hover:border-[#78257C] transition"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map(p => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#7C7C7C]">
                <p className="text-[16px] font-semibold text-[#292929]">Tidak ada produk yang cocok</p>
                <p className="mt-1 text-[14px]">Coba cari dengan kata kunci lain atau pilih kategori Semua Produk.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-xs md:hidden">
          <div className="w-full rounded-t-[16px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-[#292929]">Filter Kategori</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-[14px] font-bold text-[#78257C]"
              >
                Tutup
              </button>
            </div>
            <ul className="flex flex-col gap-1.5">
              {CATEGORIES.map(cat => (
                <li key={cat.key}>
                  <button
                    onClick={() => { setCategory(cat.key); setMobileFilterOpen(false); }}
                    className={`w-full rounded-[8px] px-4 py-3 text-left text-[14.5px] font-semibold transition ${
                      category === cat.key
                        ? "bg-[#78257C] text-white"
                        : "bg-[#F5F5F5] text-[#292929]"
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
