import Link from "next/link";
import { listActiveProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";

const discountMap: Record<string, number> = {
  "glowage-multi-active-serum": 24,
  "bright-care-moisture-cream": 24,
  "hydra-moist-gel-ultimate":   24,
  "daily-barrier-routine-set":  20,
  "glowage-serum-20ml":         15,
  "bright-care-cream-promo":    10,
  "bright-renewal-set":         9,
  "repair-glow-set":            12,
};

const ratingMap: Record<string, number> = {
  "glowage-multi-active-serum": 4.9,
  "bright-care-moisture-cream": 4.8,
  "hydra-moist-gel-ultimate":   4.9,
  "daily-barrier-routine-set":  5.0,
  "glowage-serum-20ml":         4.7,
  "bright-care-cream-promo":    4.8,
  "bright-renewal-set":         4.8,
  "repair-glow-set":            4.7,
};

export default async function ShopPage() {
  const products = await listActiveProducts();

  return (
    <div className="grid gap-6">

      {/* Breadcrumb */}
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span>›</span>
          <span className="font-semibold text-gray-700">Produk</span>
        </div>
      </div>

      <div className="flex gap-6">

        {/* ── Filter Sidebar ── */}
        <FilterSidebar />

        {/* ── Main Content ── */}
        <div className="flex-1">

          {/* Toolbar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100">
              <option>Show {products.length} Products</option>
              <option>Show 8 Products</option>
              <option>Show 16 Products</option>
              <option>Show 24 Products</option>
            </select>
            <select className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100">
              <option>Sort by Latest</option>
              <option>Sort by Price: Low to High</option>
              <option>Sort by Price: High to Low</option>
              <option>Sort by Rating</option>
            </select>
            <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm sm:ml-auto sm:w-auto">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="search product"
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:w-44"
              />
            </div>
          </div>

          {/* Product Grid — 4 columns */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map(p => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  description: p.description,
                  priceMinor: p.priceMinor,
                  currency: p.currency,
                  imageUrl: p.images[0]?.url ?? null,
                  discountPct: discountMap[p.slug] ?? 0,
                  rating: ratingMap[p.slug] ?? 0,
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex items-center justify-center gap-1">
            <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 hover:border-brand-300 hover:text-brand-700">
              ‹ PREVIOUS
            </button>
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${
                  n === 1
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
                }`}
              >
                {n}
              </button>
            ))}
            <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 hover:border-brand-300 hover:text-brand-700">
              NEXT ›
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
