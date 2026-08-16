"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";

import { store, type GProduct } from "@/lib/adminStore";
import { listActiveProducts, type CatalogProduct } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

// ── Static Data ───────────────────────────────────────────────────────────────
const marqueeItems = [
  "BPOM", "Halal", "Dermatologist Tested", "No Parabens",
  "Barrier-First", "Gentle Formula", "AM & PM Routine", "2 Years Research",
];

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

// ── CTA Card — simple hover scale ───────────────────────────────────────────
// `tint` recolors a lighter/off-palette source image (via mix-blend-color) so
// it reads as the same purple depth as the other cards in the row.
function CTACard({ href, src, alt, tint }: { href: string; src: string; alt: string; tint?: string }) {
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
        {tint && (
          <div
            className="absolute inset-0 mix-blend-color pointer-events-none"
            style={{ backgroundColor: tint, opacity: 0.65 }}
          />
        )}
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
  id: string; slug: string; name: string; priceVal: string; priceMinor: number;
  priceLabel?: string; originalPrice?: string; img: string;
  rating: string; reviews: string; type: "single" | "bundle";
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [bundles,  setBundles]  = useState<GProduct[]>([]);
  const [catFilter, setCatFilter] = useState("all");
  const [catSort, setCatSort]     = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listActiveProducts().then(setProducts).catch(() => setProducts([]));
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
      id: p.id, slug: p.slug, name: p.name,
      priceVal: `Rp ${p.priceMinor.toLocaleString("id-ID")}`, priceMinor: p.priceMinor,
      img: p.images[0]?.url ?? "",
      rating: p.averageRating != null ? p.averageRating.toFixed(1) : "5.0",
      reviews: String(p.reviewCount),
      type: "single",
    }));
    const bundleItems: CatalogItem[] = bundles.map(p => ({
      id: p.id, slug: p.slug || p.id, name: p.name, priceVal: p.priceVal, priceMinor: p.priceMinor,
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

          <CTACard href="/skincheck" src="/analisawajah_edit.png" alt="Coba Analisa Wajah AI"  />
          <CTACard href="/reseller"  src="/reseller_edit.png"     alt="Jadi Reseller Ginabo"   />
          <CTACard href="/about"     src="/blanjatenang_edit.png" alt="Belanja Tenang - Halal & BPOM Terdaftar" tint="#6B4A8F" />

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
                    product={{
                      slug: p.slug,
                      name: p.name.replace(/\n/g, " "),
                      price: p.priceLabel ? `${p.priceLabel} ${p.priceVal}` : p.priceVal,
                      originalPrice: p.originalPrice,
                      img: p.img,
                      rating: p.rating,
                    }}
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

    </div>
  );
}
