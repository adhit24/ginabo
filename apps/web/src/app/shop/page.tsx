"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { store, type GProduct } from "@/lib/adminStore";

const BEZIER = [0.25, 1, 0.5, 1] as const;

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: BEZIER, delay: i * 0.1 },
  }),
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── Product data (matches homepage "Produk Kami") ──────────────────────────
const SINGLE_PRODUCTS = [
  {
    slug:         "hydra-moist-gel-ultimate",
    name:         "Hydra Moist\nGel Ultimate",
    role:         "3-in-1 Hydration System",
    benefits:     ["Moisturizer harian", "Makeup prep", "Sleeping mask"],
    ingredients:  ["DNA Salmon", "Milk Protein"],
    tag:          "Multifungsi",
    rating:       "4.9",
    reviews:      "178",
    price:        "IDR 118.999",
    img:          "/gel.png",
  },
  {
    slug:         "bright-care-moisture-cream",
    name:         "Bright & Care\nMoisture Cream",
    role:         "Barrier Repair + Brightening",
    benefits:     ["Perkuat skin barrier", "Kulit lebih cerah alami", "Menjaga kelembapan"],
    ingredients:  ["5x Ceramides", "Glutathione", "Tranexamic Acid"],
    tag:          "Barrier Care",
    rating:       "4.9",
    reviews:      "257",
    price:        "IDR 79.999",
    img:          "/bright_care.png",
  },
  {
    slug:         "glowage-multi-active-serum",
    name:         "GlowAge Multi-\nActive Serum",
    role:         "Brightening + Anti-aging + Hydration",
    benefits:     ["Kulit lebih cerah & halus", "Merawat tanda penuaan", "Hidrasi intensif"],
    ingredients:  ["Niacinamide", "Encapsulated Cysteamine", "Multipeptide"],
    tag:          "Best Seller",
    rating:       "4.9",
    reviews:      "387",
    price:        "IDR 89.999",
    img:          "/serum.png",
  },
];

// ── Bundle data (matches homepage "Paket Bundling") ────────────────────────
const BUNDLES = [
  {
    id:            "complete-skin",
    name:          "Ginabo Complete\nSkin Nutrition Set",
    subtitle:      "Serum + Moisture Cream + Hydra Gel",
    discountPct:   50,
    price:         "Rp 287.999",
    originalPrice: "Rp 575.999",
    img:           "/ginabo_bundling_3.png",
    href:          "/shop/daily-barrier-routine-set",
    accent:        "#78257C",
  },
  {
    id:            "repair-glow",
    name:          "Repair &\nGlow Set",
    subtitle:      "Moisture Cream + Hydra Gel",
    discountPct:   50,
    price:         "Rp 207.999",
    originalPrice: "Rp 415.999",
    img:           "/bundling_repair_and_glow.png",
    href:          "/shop/repair-glow-set",
    accent:        "#c972bd",
  },
  {
    id:            "daily-barrier",
    name:          "Daily Skin\nBarrier Set",
    subtitle:      "Moisture Cream + Hydra Gel",
    discountPct:   50,
    price:         "Rp 197.999",
    originalPrice: "Rp 395.999",
    img:           "/bundling_daily_skin_barrier.png",
    href:          "/shop/daily-barrier-routine-set",
    accent:        "#9b59b6",
  },
  {
    id:            "bright-renewal",
    name:          "Bright\nRenewal Set",
    subtitle:      "Serum + Moisture Cream",
    discountPct:   50,
    price:         "Rp 169.999",
    originalPrice: "Rp 339.999",
    img:           "/bundling_bright_renewal.png",
    href:          "/shop/bright-renewal-set",
    accent:        "#e91e8c",
  },
];

// ── Icons ──────────────────────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

// ── Section label pill ─────────────────────────────────────────────────────
function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
      style={{ background: "linear-gradient(135deg,#78257C,#c972bd)" }}>
      {children}
    </span>
  );
}

// ── Helper: convert GProduct from admin store into shop card shape ────────
function storeToShopProduct(p: GProduct) {
  return {
    slug:        p.slug || p.id,
    name:        p.name,
    role:        p.role || p.tag || "",
    benefits:    p.benefits ?? [],
    ingredients: p.ingredients ?? [],
    tag:         p.tag || "",
    rating:      p.rating,
    reviews:     p.reviews,
    price:       p.priceLabel ? `${p.priceLabel} ${p.priceVal}` : p.priceVal,
    img:         p.img,
  };
}

function storeToShopBundle(p: GProduct) {
  return {
    id:            p.id,
    name:          p.name,
    subtitle:      p.role || p.tag || "",
    discountPct:   p.originalPrice ? 50 : 0,
    price:         p.priceVal,
    originalPrice: p.originalPrice || "",
    img:           p.img,
    href:          `/shop/${p.slug || p.id}`,
    accent:        "#78257C",
  };
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [extraProducts, setExtraProducts] = useState<typeof SINGLE_PRODUCTS>([]);
  const [extraBundles, setExtraBundles]   = useState<typeof BUNDLES>([]);

  useEffect(() => {
    // Hardcoded IDs that already exist in the static arrays
    const defaultProductIds = new Set(["p1", "p2", "p3"]);
    const defaultBundleIds  = new Set(["b1", "b2", "b3", "b4"]);

    const storeProducts = store.getProducts().filter(p => !defaultProductIds.has(p.id));
    const storeBundles  = store.getBundles().filter(b => !defaultBundleIds.has(b.id));

    setExtraProducts(storeProducts.map(storeToShopProduct));
    setExtraBundles(storeBundles.map(storeToShopBundle));
  }, []);

  const allProducts = [...SINGLE_PRODUCTS, ...extraProducts];
  const allBundles  = [...BUNDLES, ...extraBundles];

  return (
    <div className="w-full bg-[#fffafa]">

      {/* ══════════════════════════════════════════════
          HERO — Shop Banner (Compact)
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#2a1a3e 0%,#4a1a6b 50%,#78257C 100%)" }}
      >
        <div className="pointer-events-none absolute -top-16 right-0 h-[300px] w-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#c972bd,transparent 70%)" }} />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-10 md:flex-row md:items-center md:gap-10 md:px-10 md:py-12">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: BEZIER }}
            className="flex-1 text-center md:text-left"
          >
            <SectionBadge>Produk Ginabo</SectionBadge>
            <h1 className="mt-3 font-staatliches text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.05] text-white">
              Kulit Sehat, <span style={{ color: "#e8b4e8" }}>Dirawat dengan Nutrisi</span>
            </h1>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/60">
              Skincare daily nutrition untuk wanita aktif — ringan, nyaman, dan tidak ribet.
            </p>
          </motion.div>
        </div>

        {/* Trust badges strip */}
        <div className="flex items-center justify-center gap-4 md:gap-6 border-t border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
          {["✓ BPOM Terdaftar", "✓ Dermatologist Tested", "✓ Non-Comedogenic", "✓ Fragrance Free"].map(t => (
            <span key={t} className="text-[11px] font-semibold text-white/80">{t}</span>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRODUK KAMI
      ══════════════════════════════════════════════ */}
      <section id="produk" className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">

        {/* Header */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 flex flex-col items-start gap-2"
        >
          <motion.div variants={fadeUp}><SectionBadge>Produk Kami</SectionBadge></motion.div>
          <motion.h2 variants={fadeUp}
            className="font-staatliches text-[clamp(2.2rem,5vw,3.8rem)] leading-none text-[#2a2356]"
          >
            Temukan Skincare <span style={{ color: "#78257C" }}>Yang Tepat</span><br />untuk Kulitmu
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-xl text-sm text-[#666] leading-relaxed">
            Setiap produk Ginabo diformulasikan dengan bahan aktif modern — membantu menutrisi, menjaga, dan merawat kulit dari dalam.
          </motion.p>
        </motion.div>

        {/* Product cards */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3"
        >
          {allProducts.map((p, i) => (
            <motion.div
              key={p.slug}
              variants={fadeUp} custom={i}
              whileHover={{ y: -10, boxShadow: "0 28px 56px rgba(120,37,124,0.18)" }}
              className="overflow-hidden rounded-[24px] bg-white flex flex-col cursor-pointer"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.09)" }}
            >
              {/* Tag badge */}
              <div className="relative aspect-square overflow-hidden sm:aspect-auto" style={{ minHeight: 160 }}>
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#78257C,#c972bd)" }}>
                  {p.tag}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 sm:gap-2 px-3 py-3 sm:px-5 sm:py-4 flex-1">
                <p className="text-[9px] sm:text-[11px] font-semibold text-[#aaa] uppercase tracking-wide">Ginabo</p>
                <h3 className="font-bold text-[#2a2356] text-[13px] sm:text-[16px] leading-snug whitespace-pre-line">{p.name}</h3>
                <p className="text-[10px] sm:text-[12px] text-[#888] hidden sm:block">{p.role}</p>

                {/* Benefits */}
                <ul className="mt-1 flex-col gap-1 hidden sm:flex">
                  {p.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-[12px] text-[#555]">
                      <span className="text-[#78257C]">✦</span> {b}
                    </li>
                  ))}
                </ul>

                {/* Ingredients */}
                <div className="mt-2 flex-wrap gap-1 hidden sm:flex">
                  {p.ingredients.map(ing => (
                    <span key={ing} className="rounded-full border border-[#e8d5f0] px-2.5 py-0.5 text-[10px] font-medium text-[#78257C]">
                      {ing}
                    </span>
                  ))}
                </div>

                {/* Rating + Price + Cart */}
                <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between border-t border-[#f5eafc]">
                  <div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <StarIcon />
                      <span className="text-[11px] sm:text-[12px] font-semibold text-[#555]">{p.rating}</span>
                      <span className="text-[#ccc] hidden sm:inline">|</span>
                      <span className="hidden sm:inline"><UserIcon /></span>
                      <span className="text-[12px] font-semibold text-[#555] hidden sm:inline">{p.reviews}</span>
                    </div>
                    <p className="mt-0.5 font-bold text-[13px] sm:text-[15px]" style={{ color: "#be3ab4" }}>{p.price}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                    className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-[12px] sm:rounded-[14px] flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#78257C,#c972bd)" }}
                  >
                    <CartIcon />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Soft divider */}
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,#e8d5f0,transparent)" }} />
      </div>

      {/* ══════════════════════════════════════════════
          BUNDLING
      ══════════════════════════════════════════════ */}
      <section id="bundling" className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">

        {/* Header */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10 flex flex-col items-start gap-2"
        >
          <motion.div variants={fadeUp}><SectionBadge>Paket Bundling</SectionBadge></motion.div>
          <motion.h2 variants={fadeUp}
            className="font-staatliches text-[clamp(2.2rem,5vw,3.8rem)] leading-none text-[#2a2356]"
          >
            Hemat Lebih Banyak <span style={{ color: "#78257C" }}>dengan Paket</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-xl text-sm text-[#666] leading-relaxed">
            Paket bundling Ginabo dirancang sebagai sistem perawatan kulit — pilih sesuai concern kulitmu dan hemat hingga 50%.
          </motion.p>
        </motion.div>

        {/* Bundle cards */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
        >
          {allBundles.map((b, i) => (
            <motion.div
              key={b.id}
              variants={fadeUp} custom={i}
              whileHover={{ y: -10, boxShadow: "0 28px 56px rgba(120,37,124,0.18)" }}
              className="overflow-hidden rounded-[24px] bg-white flex flex-col cursor-pointer"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.09)" }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: 260 }}>
                <img src={b.img} alt={b.name} className="w-full h-full object-cover transition duration-300 hover:scale-105" />
                {/* Discount badge */}
                <div className="absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-bold text-white"
                  style={{ background: "#ff4a4a" }}>
                  {b.discountPct}% OFF
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 px-5 py-4 flex-1">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wide">{b.subtitle}</p>
                <h3 className="font-bold text-[#2a2356] text-[15px] leading-snug whitespace-pre-line">{b.name}</h3>

                {/* Price */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#f5eafc]">
                  <div>
                    <p className="text-[11px] line-through text-[#bbb]">{b.originalPrice}</p>
                    <p className="font-bold text-[15px]" style={{ color: "#be3ab4" }}>{b.price}</p>
                  </div>
                  <Link href={b.href}>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                      className="flex h-10 w-10 items-center justify-center rounded-[12px] flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${b.accent},#c972bd)` }}
                    >
                      <CartIcon />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} className="mt-10 text-center"
        >
          <p className="mb-4 text-sm text-[#888]">
            Tidak yakin paket mana yang cocok? Konsultasikan dengan skin expert kami.
          </p>
          <Link href="/booking"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,#78257C,#c972bd)" }}
          >
            Konsultasi Gratis 
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
