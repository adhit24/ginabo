"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useShopCatalog } from "@/lib/useShopCatalog";
import { ProductCard } from "@/components/ProductCard";

const CATEGORIES = [
  { key: "all",      label: "Semua Produk" },
  { key: "skincare", label: "Skincare" },
  { key: "bodycare", label: "Bodycare" },
  { key: "bundling", label: "Paket Bundling" },
];

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
    <div className="min-h-screen bg-white">

      {/* ── Page Header ── */}
      <div className="border-b border-[#f0f0f0] bg-white py-5 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-1 flex items-center gap-1.5 text-[12px] text-[#808080]">
            <Link href="/" className="hover:text-[#78257C]">Home</Link>
            <span>/</span>
            <span className="text-[#303030]">Semua Produk</span>
          </nav>
          <h1 className="text-[20px] font-bold text-[#303030]">Semua Produk ({filtered.length})</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden md:block w-[200px] flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="mb-3 text-[12px] font-bold uppercase tracking-widest text-[#303030]">Kategori</h3>
              <ul className="flex flex-col gap-0.5">
                {CATEGORIES.map(cat => (
                  <li key={cat.key}>
                    <button
                      onClick={() => setCategory(cat.key)}
                      className={`w-full text-left px-3 py-2 rounded-[3px] text-[13px] transition ${
                        category === cat.key
                          ? "bg-[#78257C] text-white font-semibold"
                          : "text-[#808080] hover:bg-[#fdf5ff] hover:text-[#78257C]"
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
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-1.5 border border-[#E2E2E2] rounded-[5px] px-3 py-1.5 text-[13px] text-[#303030]"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                  </svg>
                  Filter
                </button>
                <span className="text-[13px] text-[#808080] hidden md:inline">{filtered.length} produk</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search within shop */}
                <div className="relative hidden sm:block">
                  <svg width="14" height="14" fill="none" stroke="#808080" strokeWidth="2" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-40 rounded-[5px] border border-[#E2E2E2] py-1.5 pl-8 pr-3 text-[13px] text-[#303030] outline-none focus:border-[#78257C]"
                  />
                </div>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="border border-[#E2E2E2] rounded-[5px] px-3 py-1.5 text-[13px] text-[#303030] bg-white outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map(p => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#808080]">
                <p className="text-[15px]">
                  {searchQuery.trim()
                    ? <>Tidak ada produk untuk &ldquo;{searchQuery}&rdquo;.</>
                    : "Tidak ada produk dalam kategori ini."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-2xl p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#303030]">Filter Kategori</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <svg width="20" height="20" fill="none" stroke="#808080" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setCategory(cat.key); setMobileFilterOpen(false); }}
                  className={`rounded-[5px] py-2.5 text-[13px] font-semibold transition ${
                    category === cat.key
                      ? "text-white"
                      : "border border-[#E2E2E2] text-[#808080]"
                  }`}
                  style={category === cat.key ? { background: "#78257C" } : {}}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
