"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { store, type GProduct } from "@/lib/adminStore";
import { useCart } from "@/components/cart/CartProvider";

// ── Static product data ───────────────────────────────────────────────────────
const STATIC_PRODUCTS = [
  {
    slug: "hydra-moist-gel-ultimate", name: "Hydra Moist Gel Ultimate",
    category: "skincare", tag: "Multifungsi", rating: "4.9", reviews: "178",
    price: "Rp 118.999", priceMinor: 118999, img: "/salmonfix.png",
  },
  {
    slug: "bright-care-moisture-cream", name: "Bright & Care Moisture Cream",
    category: "skincare", tag: "Barrier Care", rating: "4.9", reviews: "257",
    price: "Rp 79.999", priceMinor: 79999, img: "/moistfix.png",
  },
  {
    slug: "glowage-multi-active-serum", name: "GlowAge Multi-Active Serum",
    category: "skincare", tag: "Best Seller", rating: "4.9", reviews: "387",
    price: "Rp 89.999", priceMinor: 89999, img: "/serumfix.png",
  },
];

const STATIC_BUNDLES = [
  {
    slug: "ginabo-complete-skin", name: "Ginabo Complete Skin Nutrition Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "127",
    price: "Rp 287.999", priceMinor: 287999, originalPrice: "Rp 575.999", img: "/ginabo_bundling_3.png",
  },
  {
    slug: "repair-glow-set", name: "Repair & Glow Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "89",
    price: "Rp 207.999", priceMinor: 207999, originalPrice: "Rp 415.999", img: "/bundling_repair_and_glow.png",
  },
  {
    slug: "daily-barrier-routine-set", name: "Daily Skin Barrier Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "76",
    price: "Rp 197.999", priceMinor: 197999, originalPrice: "Rp 395.999", img: "/bundling_daily_skin_barrier.png",
  },
  {
    slug: "bright-renewal-set", name: "Bright Renewal Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "63",
    price: "Rp 169.999", priceMinor: 169999, originalPrice: "Rp 339.999", img: "/bundling_bright_renewal.png",
  },
];

type ShopProduct = typeof STATIC_PRODUCTS[0] & { originalPrice?: string };

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

function StarRating({ rating }: { rating: string }) {
  return (
    <div className="flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-[12px] text-[#808080]">{rating}</span>
    </div>
  );
}

function ProductCard({ product }: { product: ShopProduct }) {
  const { addItem } = useCart();

  function handleCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId:  product.slug,
      slug:       product.slug,
      name:       product.name,
      priceMinor: product.priceMinor,
      currency:   "IDR",
      imageUrl:   product.img,
    });
  }

  return (
    <Link href={`/shop/${product.slug}`} className="group flex flex-col bg-white rounded-[5px] border border-[#E2E2E2] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#fafafa]">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.tag && (
          <span
            className="absolute top-2 left-2 rounded-[3px] px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: product.tag.includes("OFF") ? "#e53e3e" : "#78257C" }}
          >
            {product.tag}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p className="text-[11px] text-[#808080]">Ginabo</p>
        <p className="text-[13px] font-semibold text-[#303030] leading-snug line-clamp-2">{product.name}</p>
        <StarRating rating={product.rating} />
        <div className="mt-auto pt-1">
          {product.originalPrice && (
            <p className="text-[11px] text-[#aaa] line-through">{product.originalPrice}</p>
          )}
          <p className="text-[14px] font-bold" style={{ color: "#78257C" }}>{product.price}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<ShopProduct[]>([...STATIC_PRODUCTS, ...STATIC_BUNDLES]);
  const [category, setCategory]       = useState("all");
  const [sort, setSort]               = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const storeProds = store.getProducts().map(p => ({
      slug: p.slug || p.id, name: p.name, category: "skincare",
      tag: p.tag || "", rating: p.rating, reviews: p.reviews,
      price: p.priceLabel ? `${p.priceLabel} ${p.priceVal}` : p.priceVal,
      priceMinor: p.priceMinor, img: p.img ?? "",
    }));
    const storeBundles = store.getBundles().map(p => ({
      slug: p.slug || p.id, name: p.name, category: "bundling",
      tag: "Bundling", rating: p.rating, reviews: p.reviews,
      price: p.priceVal, priceMinor: p.priceMinor, img: p.img ?? "",
      originalPrice: p.originalPrice,
    }));
    const existingSlugs = new Set([...STATIC_PRODUCTS, ...STATIC_BUNDLES].map(p => p.slug));
    const newProds = [...storeProds, ...storeBundles].filter(p => !existingSlugs.has(p.slug));
    if (newProds.length > 0) setAllProducts(prev => [...prev, ...newProds]);
  }, []);

  const filtered = allProducts
    .filter(p => category === "all" || p.category === category)
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

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map(p => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-[#808080]">
                <p className="text-[15px]">Tidak ada produk dalam kategori ini.</p>
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
