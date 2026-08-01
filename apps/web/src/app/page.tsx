"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";

import { useCart } from "@/components/cart/CartProvider";
import { store, type GProduct } from "@/lib/adminStore";

// ── Figma Assets ──────────────────────────────────────────────────────────────
const IMG_SPRITE    = "https://www.figma.com/api/mcp/asset/71dedf14-7a07-4680-8fde-41aadfebedf7"; // 3-product sprite

// ── Static Data ───────────────────────────────────────────────────────────────
const marqueeItems = [
  "BPOM", "Halal", "Dermatologist Tested", "No Parabens",
  "Barrier-First", "Gentle Formula", "AM & PM Routine", "2 Years Research",
];

const productDescriptions: Record<string, string> = {
  "Hydra Moist Gel Ultimate": "Gel 3-in-1: moisturizer, makeup prep & sleeping mask.",
  "Bright & Care Moisture Cream": "Cream harian untuk kelembapan dan skin barrier.",
  "GlowAge Multi- Active Serum": "Serum pencerah, pelembap & anti-aging harian.",
  "Ginabo Complete Skin Nutrition Set": "Gel + Cream + Serum dalam satu paket lengkap.",
  "Repair & Glow Set": "Paket Gel + Serum untuk hidrasi & pencerahan.",
  "Daily Skin Barrier Set": "Paket Cream + Gel untuk barrier & kelembapan.",
  "Bright Renewal Set": "Paket Cream + Serum untuk cerah & perawatan kulit.",
};

const productFullDescriptions: Record<string, string> = {
  "Hydra Moist Gel Ultimate": "Moisturizer gel 30ml dengan fungsi 3-in-1 yang dapat digunakan sebagai moisturizer harian, makeup preparation, dan sleeping mask.",
  "Bright & Care Moisture Cream": "Moisture cream untuk perawatan harian yang membantu melembapkan kulit, menjaga skin barrier, dan merawat tampilan kulit kusam.",
  "GlowAge Multi- Active Serum": "Serum wajah 20ml untuk perawatan harian yang membantu mencerahkan kulit, meratakan warna kulit, menjaga kelembapan, dan membantu merawat tampilan tanda penuaan.",
  "Ginabo Complete Skin Nutrition Set": "Dapatkan Hydra Moist Gel Ultimate, Bright & Care Moisture Cream, dan GlowAge Multi-Active Serum dalam satu paket lengkap untuk rutinitas perawatan kulit harian.",
  "Repair & Glow Set": "Paket berisi Hydra Moist Gel Ultimate dan GlowAge Multi-Active Serum untuk hidrasi optimal dan pencerahan kulit secara alami.",
  "Daily Skin Barrier Set": "Paket berisi Bright & Care Moisture Cream dan Hydra Moist Gel Ultimate untuk menjaga kelembapan dan memperkuat skin barrier setiap hari.",
  "Bright Renewal Set": "Paket berisi Bright & Care Moisture Cream dan GlowAge Multi-Active Serum untuk mencerahkan dan merawat kulit secara menyeluruh.",
};

// ── Animation Variants ────────────────────────────────────────────────────────
const EASE = [0.25, 1, 0.5, 1] as const;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
};

const cardSlideUp = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE } },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={`mb-1 text-xs font-bold uppercase tracking-[0.2em] ${center ? "text-center" : ""}`} style={{ color: "#CF99B4" }}>
      {children}
    </div>
  );
}

function ProductCard({
  name, rating, reviews, priceLabel, priceVal, originalPrice,
  imgLeft, imgTop, img, priceMinor, productId, onInfoClick,
}: {
  name: string; rating: string; reviews: string; priceLabel?: string; priceVal: string;
  originalPrice?: string; imgLeft?: string; imgTop?: string; img?: string;
  priceMinor?: number; productId?: string; onInfoClick?: (name: string) => void;
}) {
  const { addItem } = useCart();
  const discountPct = originalPrice && priceMinor
    ? Math.round((1 - priceMinor / parseInt(originalPrice.replace(/\D/g, ""))) * 100)
    : 0;
  function handleAddToCart() {
    addItem({
      productId: productId ?? name,
      slug:      productId ?? name,
      name:      name.replace(/\n/g, " "),
      priceMinor: priceMinor ?? 0,
      currency:  "IDR",
      imageUrl:  img ?? null,
    });
  }

  return (
    <motion.div
      variants={cardSlideUp}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative w-full flex flex-col cursor-pointer rounded-xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(147,51,234,0.08)",
        boxShadow: "0 4px 20px rgba(82,69,178,0.06)",
      }}
    >

      {/* Product image */}
      <div className="relative overflow-hidden rounded-lg mx-2.5 mt-2.5" style={{ aspectRatio: "4/3", background: "#faf5ff" }}>
        {/* Info button */}
        <button
          onClick={(e) => { e.stopPropagation(); onInfoClick?.(name.replace(/\n/g, " ")); }}
          className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-sm px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm transition-all hover:opacity-90"
          style={{ background: "#4A1A5E" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Info
        </button>
        {img ? (
          <img
            src={img}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img
            src={IMG_SPRITE}
            alt={name}
            className="absolute max-w-none pointer-events-none"
            style={{ width: "303.75%", height: "113.33%", top: imgTop, left: imgLeft }}
          />
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-col gap-2 px-3 pt-3 pb-3 flex-1">
        {/* Name + Discount badge */}
        <div className="flex items-start justify-between gap-1.5">
          <p className="font-bold text-[#4A1A5E] text-[13px] md:text-[14px] leading-snug whitespace-pre-line line-clamp-2">
            {name}
          </p>
          {discountPct > 0 && (
            <span className="flex-shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#ef4444" }}>
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] md:text-[12px] leading-relaxed text-[#5a4a6a] line-clamp-2">
          {productDescriptions[name.replace(/\n/g, " ")] ?? "Skincare ringan untuk rutinitas harian."}
        </p>

        {/* Rating badge + sold count */}
        <div className="flex items-center gap-1.5 mt-auto">
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-white font-bold text-[10px]">{rating}</span>
          </div>
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm"
            style={{ background: "#4A1A5E" }}
          >
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="white">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
            </svg>
            <span className="text-white font-bold text-[10px]">{reviews} terjual</span>
          </div>
        </div>

        {/* Add to Cart button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-bold text-white transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #9333EA, #7C3AED)",
            boxShadow: "0 4px 14px rgba(147,51,234,0.25)",
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {originalPrice && <span className="line-through text-white/50 text-[10px]">{originalPrice}</span>}
          {priceLabel && <span>{priceLabel} </span>}{priceVal}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── CTA Card — simple hover scale ───────────────────────────────────────────
function CTACard({ href, src, alt }: { href: string; src: string; alt: string }) {
  return (
    <Link
      href={href}
      className="relative overflow-hidden rounded-xl md:rounded-2xl block cursor-pointer transition-transform duration-300 hover:scale-[1.03] shadow-[0_2px_12px_rgba(120,37,124,0.10)] hover:shadow-[0_12px_36px_rgba(120,37,124,0.25)]"
    >
      <div className="relative aspect-[3/2]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width:640px) 33vw, (max-width:1280px) calc((100vw - 64px) / 3), 420px"
        />
      </div>
    </Link>
  );
}

// ── Catalog filter data ──────────────────────────────────────────────────────
const HOME_CATEGORIES = [
  { key: "all",    label: "Semua" },
  { key: "single", label: "Single" },
  { key: "bundle", label: "Bundle" },
];

const HOME_SORT_OPTIONS = [
  { key: "newest",   label: "Terbaru" },
  { key: "popular",  label: "Terpopuler" },
  { key: "price-lo", label: "Harga Terendah" },
  { key: "price-hi", label: "Harga Tertinggi" },
];

type CatalogItem = {
  id: string; name: string; priceVal: string; priceMinor: number;
  priceLabel?: string; originalPrice?: string; img: string;
  rating: string; reviews: string; type: "single" | "bundle";
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState<GProduct[]>([]);
  const [bundles,  setBundles]  = useState<GProduct[]>([]);
  const [catFilter, setCatFilter] = useState("all");
  const [catSort, setCatSort]     = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailProduct, setDetailProduct] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(store.getProducts());
    setBundles(store.getBundles());
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const catalogItems = useMemo<CatalogItem[]>(() => {
    const singles: CatalogItem[] = products.map(p => ({
      id: p.id, name: p.name, priceVal: p.priceVal, priceMinor: p.priceMinor,
      priceLabel: p.priceLabel, img: p.img, rating: p.rating, reviews: p.reviews,
      type: "single",
    }));
    const bundleItems: CatalogItem[] = bundles.map(p => ({
      id: p.id, name: p.name, priceVal: p.priceVal, priceMinor: p.priceMinor,
      originalPrice: p.originalPrice, img: p.img, rating: p.rating, reviews: p.reviews,
      type: "bundle",
    }));
    return [...singles, ...bundleItems];
  }, [products, bundles]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = catalogItems.filter(p =>
      (catFilter === "all" || p.type === catFilter) &&
      (!q || p.name.toLowerCase().includes(q))
    );
    return filtered.sort((a, b) => {
      if (catSort === "price-lo") return a.priceMinor - b.priceMinor;
      if (catSort === "price-hi") return b.priceMinor - a.priceMinor;
      if (catSort === "popular")  return parseInt(b.reviews) - parseInt(a.reviews);
      return 0;
    });
  }, [catalogItems, catFilter, catSort, searchQuery]);

  return (
    <div className="bg-[#fffafa] overflow-x-hidden">

      {/* ════════════════════════════════════════════
          1. HERO BANNER
      ════════════════════════════════════════════ */}
      <HeroBanner />

      {/* ════════════════════════════════════════════
          1b. FEATURE CARDS — 3 standalone CTA cards
          Somethinc-style: equal columns, gaps between cards,
          each card is a promotional image with rounded corners
      ════════════════════════════════════════════ */}
      <div className="w-full px-2 md:px-5 lg:px-8 xl:px-10 pt-2 md:pt-3 pb-3 md:pb-5">
        <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">

          <CTACard href="/skincheck" src="/coba_facescan.png"   alt="Cek Kulitmu Analisis AI"  />
          <CTACard href="/reseller"  src="/jadi_reseller.png" alt="Jadi Reseller Ginabo"       />
          <CTACard href="/about"     src="/belanja_tenang.png"    alt="Halal & BPOM Terdaftar"     />

        </div>
      </div>

      {/* ════════════════════════════════════════════
          2. MARQUEE (KEEP)
      ════════════════════════════════════════════ */}
      <div className="border-y border-[#f0d8eb] bg-white py-3.5">
        <Marquee
          items={marqueeItems}
          speed={28}
          itemClassName="font-bold text-[13px] tracking-wide text-[#78257C]"
          separator="·"
        />
      </div>

      {/* ════════════════════════════════════════════
          5. KATALOG PRODUK (unified with filtering)
      ════════════════════════════════════════════ */}
      <section className="relative pt-14 pb-14 md:pt-20 md:pb-20 overflow-hidden" style={{ background: "linear-gradient(180deg, #fffafa 0%, #f8f4ff 40%, #fdf4ff 70%, #FDFAFF 100%)" }}>
        {/* Decorative blurred orbs for glassmorphism context */}
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute top-40 right-[5%] w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,121,249,0.05) 0%, transparent 70%)" }} />
        <div className="absolute bottom-20 right-[10%] w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)" }} />

        <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
          <Reveal>
            <div className="flex flex-col items-center mb-12">
              <span
                className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] px-4 py-1.5 rounded-lg mb-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #9333EA, #7C3AED)",
                  boxShadow: "0 2px 8px rgba(120,37,124,0.25)",
                }}
              >
                Katalog
              </span>
              <h2
                className="text-center font-poppins font-extrabold leading-[1.1] text-[clamp(2rem,5vw,3.2rem)]"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 40%, #A855F7 70%, #C084FC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Produk Kami
              </h2>
            </div>
          </Reveal>

          <div className="flex gap-6 md:gap-10">
            {/* ── Sidebar (desktop) ── */}
            <aside className="hidden md:block w-[200px] flex-shrink-0">
              <div className="sticky top-24">
                <div
                  className="rounded-[20px] p-5"
                  style={{
                    background: "linear-gradient(135deg, #1e1b3a 0%, #2d2556 100%)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    boxShadow: "0 8px 32px rgba(20,15,50,0.25)",
                  }}
                >
                  <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "#c4b5fd" }}>
                    Kategori
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {HOME_CATEGORIES.map(cat => (
                      <li key={cat.key}>
                        <button
                          onClick={() => setCatFilter(cat.key)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                            catFilter === cat.key
                              ? "text-white font-semibold shadow-md"
                              : "text-[#a5a0c8] hover:text-white hover:bg-white/10"
                          }`}
                          style={catFilter === cat.key ? {
                            background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                            boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
                          } : {}}
                        >
                          {cat.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">
              {/* Top bar: sort (left) + search (right) */}
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="md:hidden flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #1e1b3a, #2d2556)",
                      boxShadow: "0 4px 12px rgba(20,15,50,0.25)",
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/>
                    </svg>
                    Filter
                  </button>

                  {/* Sort dropdown */}
                  <div className="relative" ref={sortRef}>
                    <button
                      onClick={() => setSortOpen(v => !v)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #1e1b3a, #2d2556)",
                        boxShadow: "0 4px 12px rgba(20,15,50,0.25)",
                      }}
                    >
                      {HOME_SORT_OPTIONS.find(o => o.key === catSort)?.label ?? "Terbaru"}
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${sortOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <div className={`absolute left-0 top-full z-50 pt-2 transition-all duration-300 ease-out ${
                      sortOpen
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 -translate-y-2 scale-[0.95] pointer-events-none"
                    }`}>
                      <div
                        className="w-44 rounded-2xl overflow-hidden py-1.5"
                        style={{
                          background: "linear-gradient(135deg, #1e1b3a 0%, #2d2556 100%)",
                          border: "1px solid rgba(139,92,246,0.15)",
                          boxShadow: "0 12px 40px rgba(20,15,50,0.4)",
                        }}
                      >
                        {HOME_SORT_OPTIONS.map((o) => (
                          <button
                            key={o.key}
                            onClick={() => { setCatSort(o.key); setSortOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                              catSort === o.key
                                ? "text-white bg-gradient-to-r from-[#9333EA]/30 to-transparent"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search bar */}
                <div className="relative max-w-[240px] flex-1">
                  <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a5a0c8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium text-white placeholder-[#a5a0c8]/60 outline-none transition-all duration-300 focus:ring-2 focus:ring-[#8b5cf6]/40"
                    style={{
                      background: "linear-gradient(135deg, #1e1b3a, #2d2556)",
                      boxShadow: "0 4px 12px rgba(20,15,50,0.25)",
                      border: "1px solid rgba(139,92,246,0.1)",
                    }}
                  />
                </div>
              </div>

              {/* Product Grid */}
              <motion.div
                key={`${catFilter}-${catSort}-${searchQuery}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
              >
                {filteredCatalog.map((p) => (
                  <ProductCard
                    key={p.id}
                    productId={p.id}
                    name={p.name}
                    rating={p.rating}
                    reviews={p.reviews}
                    priceLabel={p.priceLabel}
                    originalPrice={p.originalPrice}
                    priceVal={p.priceVal}
                    priceMinor={p.priceMinor}
                    img={p.img}
                    onInfoClick={setDetailProduct}
                  />
                ))}
              </motion.div>

              {filteredCatalog.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-[15px] text-[#9ca3af]">Tidak ada produk dalam kategori ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-[28px] p-6 shadow-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(253,250,255,0.98) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[16px] font-bold" style={{ color: "#5245b2" }}>Filter Kategori</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition"
              >
                <svg width="18" height="18" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {HOME_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setCatFilter(cat.key); setMobileFilterOpen(false); }}
                  className={`rounded-2xl py-3 text-[13px] font-semibold transition-all duration-200 ${
                    catFilter === cat.key
                      ? "text-white shadow-md"
                      : "text-[#6b7280] hover:bg-white/80"
                  }`}
                  style={catFilter === cat.key
                    ? { background: "linear-gradient(135deg, #8b5cf6, #a855f7)", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" }
                    : { background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Urutkan</h4>
              <div className="grid grid-cols-2 gap-2">
                {HOME_SORT_OPTIONS.map(o => (
                  <button
                    key={o.key}
                    onClick={() => { setCatSort(o.key); setMobileFilterOpen(false); }}
                    className={`rounded-2xl py-2.5 text-[12px] font-medium transition-all duration-200 ${
                      catSort === o.key
                        ? "text-white shadow-md"
                        : "text-[#6b7280]"
                    }`}
                    style={catSort === o.key
                      ? { background: "linear-gradient(135deg, #8b5cf6, #a855f7)", boxShadow: "0 4px 14px rgba(139,92,246,0.3)" }
                      : { background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* ════════════════════════════════════════════
          7. INFO STRIP (3 blok)
      ════════════════════════════════════════════ */}
      <section className="border-y border-[#f0f0f0] bg-white py-0">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#f0f0f0]">
            {[
              {
                icon: <Image src="/storeloc.png" alt="Store Locator" width={44} height={44} className="object-contain" />,
                title: "Store Locator",
                desc: "Temukan toko Ginabo terdekat, fisik di mall atau official store di marketplace.",
                href: "/stores",
              },
              {
                icon: <Image src="/reseller.png" alt="Jadi Reseller" width={44} height={44} className="object-contain" />,
                title: "Jadi Reseller",
                desc: "Bergabung dan dapatkan keuntungan eksklusif bersama ribuan reseller Ginabo.",
                href: "/reseller",
              },
              {
                icon: <Image src="/faq.png"      alt="FAQ"           width={44} height={44} className="object-contain" />,
                title: "FAQ",
                desc: "Temukan jawaban atas pertanyaan seputar produk, pengiriman, dan pembayaran.",
                href: "/contact",
              },
            ].map(item => (
              <a
                key={item.title}
                href={item.href}
                className="flex items-start gap-4 px-8 py-7 transition hover:bg-[#fdf5ff] group"
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="text-[14px] font-bold text-[#303030] group-hover:text-[#78257C] transition">{item.title}</p>
                  <p className="mt-1 text-[12px] text-[#808080] leading-relaxed">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Detail Popup ── */}
      {detailProduct && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setDetailProduct(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 m-auto h-fit w-[85vw] max-w-sm rounded-2xl p-5 sm:p-6"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(147,51,234,0.12)",
              boxShadow: "0 24px 64px rgba(20,15,50,0.15)",
            }}
          >
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-[#4A1A5E]/50 transition hover:bg-[#faf5ff] hover:text-[#4A1A5E]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-bold" style={{ color: "#1e1b3a" }}>{detailProduct}</h3>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "#2d2556" }}>
              {productFullDescriptions[detailProduct] ?? "Informasi produk belum tersedia."}
            </p>
          </motion.div>
        </>
      )}

    </div>
  );
}
