"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

// ── Page ───────────────────────────────────────────────────────────────────
export default function ShopPage() {
  return (
    <div className="w-full bg-[#fffafa]">

      {/* ══════════════════════════════════════════════
          HERO — Shop Banner
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#2a1a3e 0%,#4a1a6b 50%,#78257C 100%)",
          minHeight: "clamp(280px,40vw,440px)",
        }}
      >
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle,#c972bd,transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#9b59b6,transparent 70%)" }} />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start justify-center px-6 py-16 md:px-10 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: BEZIER }}>
            <SectionBadge>Produk Ginabo</SectionBadge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: BEZIER, delay: 0.1 }}
            className="mt-4 max-w-2xl font-staatliches text-[clamp(2.6rem,6vw,5rem)] font-normal leading-none text-white"
          >
            Kulit Sehat,<br />
            <span style={{ color: "#e8b4e8" }}>Dirawat dengan Nutrisi</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: BEZIER, delay: 0.2 }}
            className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70"
          >
            Skincare daily nutrition untuk wanita aktif — ringan, nyaman, dan tidak ribet.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: BEZIER, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href="#produk"
              className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#78257C,#c972bd)" }}
            >
              Lihat Produk
            </a>
            <a href="#bundling"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Lihat Bundling
            </a>
          </motion.div>
        </div>

        {/* Trust badges strip */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-6 border-t border-white/10 bg-black/20 px-4 py-2.5 backdrop-blur-sm"
        >
          {["✓ BPOM Terdaftar", "✓ Dermatologist Tested", "✓ Non-Comedogenic", "✓ Fragrance Free"].map(t => (
            <span key={t} className="text-[11px] font-semibold text-white/80">{t}</span>
          ))}
        </motion.div>
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
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SINGLE_PRODUCTS.map((p, i) => (
            <motion.div
              key={p.slug}
              variants={fadeUp} custom={i}
              whileHover={{ y: -10, boxShadow: "0 28px 56px rgba(120,37,124,0.18)" }}
              className="overflow-hidden rounded-[24px] bg-white flex flex-col cursor-pointer"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.09)" }}
            >
              {/* Tag badge */}
              <div className="relative overflow-hidden" style={{ height: 300 }}>
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#78257C,#c972bd)" }}>
                  {p.tag}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-2 px-5 py-4 flex-1">
                <p className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wide">Ginabo</p>
                <h3 className="font-bold text-[#2a2356] text-[16px] leading-snug whitespace-pre-line">{p.name}</h3>
                <p className="text-[12px] text-[#888]">{p.role}</p>

                {/* Benefits */}
                <ul className="mt-1 flex flex-col gap-1">
                  {p.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-[12px] text-[#555]">
                      <span className="text-[#78257C]">✦</span> {b}
                    </li>
                  ))}
                </ul>

                {/* Ingredients */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.ingredients.map(ing => (
                    <span key={ing} className="rounded-full border border-[#e8d5f0] px-2.5 py-0.5 text-[10px] font-medium text-[#78257C]">
                      {ing}
                    </span>
                  ))}
                </div>

                {/* Rating + Price + Cart */}
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#f5eafc]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <StarIcon />
                      <span className="text-[12px] font-semibold text-[#555]">{p.rating}</span>
                      <span className="text-[#ccc]">|</span>
                      <UserIcon />
                      <span className="text-[12px] font-semibold text-[#555]">{p.reviews}</span>
                    </div>
                    <p className="mt-0.5 font-bold text-[15px]" style={{ color: "#be3ab4" }}>{p.price}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                    className="flex h-11 w-11 items-center justify-center rounded-[14px] flex-shrink-0"
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
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {BUNDLES.map((b, i) => (
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
            Konsultasi Gratis →
          </Link>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          BRAND VALUE STRIP
      ══════════════════════════════════════════════ */}
      <section className="py-10" style={{ background: "linear-gradient(135deg,#78257C,#c972bd)" }}>
        <motion.div
          variants={stagger} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 md:gap-16"
        >
          {[
            { icon: "🌿", label: "Nutrition First" },
            { icon: "✦",  label: "Barrier-Focused" },
            { icon: "💧", label: "Hydration Based" },
            { icon: "🛡️", label: "Daily Comfort" },
          ].map((v, i) => (
            <motion.div key={v.label} variants={fadeUp} custom={i} className="flex items-center gap-2 text-white">
              <span className="text-xl">{v.icon}</span>
              <span className="text-sm font-bold">{v.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
