"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FlashSaleSection } from "@/components/FlashSaleSection";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useCart } from "@/components/cart/CartProvider";
import { store, type GProduct } from "@/lib/adminStore";

// ── Figma Assets ──────────────────────────────────────────────────────────────
const IMG_TEXTURE   = "https://www.figma.com/api/mcp/asset/28c8f53f-937f-4a2b-930b-d14c3e2fd172"; // purple texture (badge bg)
const IMG_STORE     = "/store_ginabo.png";
const IMG_PERSON    = "https://www.figma.com/api/mcp/asset/3b32a890-5932-43ff-a576-41fc59926f60"; // model photo
const IMG_SPRITE    = "https://www.figma.com/api/mcp/asset/71dedf14-7a07-4680-8fde-41aadfebedf7"; // 3-product sprite
const IMG_CREAM     = "https://www.figma.com/api/mcp/asset/4db5c30d-969e-4093-aa64-026dd52a7f47"; // bright & care
const IMG_HYDRA     = "https://www.figma.com/api/mcp/asset/691267df-2c74-42aa-9b09-e48cddcf41de"; // hydra moist gel
const IMG_SERUM     = "https://www.figma.com/api/mcp/asset/42847e4c-7e8e-4690-a5d1-19adaf062ceb"; // glowage serum
const IMG_G0        = "https://www.figma.com/api/mcp/asset/2dee09d9-e461-4704-a34f-f5cb85651358"; // pillar icon 0
const IMG_G1        = "https://www.figma.com/api/mcp/asset/8824f9cf-5804-4ec0-9df4-5eab487a0c30"; // pillar icon 1
const IMG_G2        = "https://www.figma.com/api/mcp/asset/f628e868-9c20-47c2-be27-9a5a2693c0e2"; // pillar icon 2
const IMG_G3        = "https://www.figma.com/api/mcp/asset/129c7c57-ba52-4194-ab8e-b83458818851"; // pillar icon 3
const IMG_CART1     = "https://www.figma.com/api/mcp/asset/4fa1de69-1da2-4be4-ae0d-59309b68e713"; // shopping cart (product card)
const IMG_STAR      = "https://www.figma.com/api/mcp/asset/dd951a0c-532e-4daf-bd8f-5c5956a5da93"; // star
const IMG_PROFILE   = "https://www.figma.com/api/mcp/asset/0df780a8-167c-4ae1-aca9-410075054133"; // profile/user icon
const IMG_BOTTLE    = "https://www.figma.com/api/mcp/asset/be1d4cf7-e0dc-4442-b74b-959148b85f0f"; // squeeze bottle icon
const IMG_ELLIPSE1  = "https://www.figma.com/api/mcp/asset/e909b8de-84fb-41af-aac4-3b99dada1ce6"; // decorative ellipse 1
const IMG_ELLIPSE2  = "https://www.figma.com/api/mcp/asset/d999a210-ed98-4e40-8aef-f0297bdb4c26"; // decorative ellipse 2

// ── Static Data ───────────────────────────────────────────────────────────────
const marqueeItems = [
  "BPOM ✓", "Halal ✓", "Dermatologist Tested", "No Parabens",
  "Barrier-First", "Gentle Formula", "AM & PM Routine", "2 Years Research",
];

const singleProducts = [
  { name: "Hydra Moist\nGel Ultimate",       rating: "5.0", reviews: "127", priceLabel: "IDR", priceVal: " 120K", img: "/gel.png"         },
  { name: "Bright & Care\nMoisture Cream",   rating: "5.0", reviews: "127", priceLabel: "IDR", priceVal: " 75K",  img: "/bright_care.png" },
  { name: "GlowAge Multi-\nActive Serum",    rating: "5.0", reviews: "127", priceLabel: "IDR", priceVal: " 90K",  img: "/serum.png"       },
];

const bundleProducts = [
  { name: "Ginabo Complete\nSkin Nutrition Set", rating: "5.0", reviews: "127", originalPrice: "Rp 575.999", priceVal: "Rp 287.999", img: "/ginabo_bundling_3.png"          },
  { name: "Repair &\nGlow Set",                 rating: "5.0", reviews: "127", originalPrice: "Rp 415.999", priceVal: "Rp 207.999", img: "/bundling_repair_and_glow.png"   },
  { name: "Daily Skin\nBarrier Set",            rating: "5.0", reviews: "127", originalPrice: "Rp 395.999", priceVal: "Rp 197.999", img: "/bundling_daily_skin_barrier.png" },
  { name: "Bright\nRenewal Set",               rating: "5.0", reviews: "127", originalPrice: "Rp 339.999", priceVal: "Rp 169.999", img: "/bundling_bright_renewal.png"    },
];

const pillars: { title: string; desc: string; icon: ReactNode }[] = [
  {
    title: "Brightening while respecting the skin barrier",
    desc: "Mencerahkan kulit tanpa mengorbankan lapisan pelindungnya. Hasil bertahap, aman dipakai rutin.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    title: "Hydration as the foundation",
    desc: "Hidrasi bukan sekedar step rutinitas, ini merupakan standar dari semua langkah skincare kamu.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z"/>
      </svg>
    ),
  },
  {
    title: "Soothing for daily comfort",
    desc: "Kulit yang tenang adalah kulit yang sehat. Setiap produk Ginabo diformulasikan untuk memberikan rasa nyaman sejak pemakaian pertama.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
  },
  {
    title: "Anti-aging support",
    desc: "Menjaga kualitas kulit jangka panjang. Bukan anti-aging yang agresif, tapi yang bekerja bersama kulitmu setiap hari.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
      </svg>
    ),
  },
];

const characters = [
  { title: "Warm",        desc: "Terasa hangat dan mudah didekati, bukan brand yang menghakimi kondisi kulitmu." },
  { title: "Reliable",    desc: "Riset bertahun-tahun untuk formula yang seimbang antara performa dan kenyamanan." },
  { title: "Trustworthy", desc: "Kami serius di kualitas, karena kulit kamu bukan tempat coba-coba." },
  { title: "Clear",       desc: "Komunikasi jujur & realistis. Tidak ada klaim berlebihan seperti \"putih instan\" atau \"1 malam langsung\"." },
];

const blogPosts = [
  { title: "Kenali Tanda-tanda Skin Barrier Kamu Rusak",     date: "12 Apr 2024", tag: "Skin Barrier", read: "4 min", img: "/product-serum-3.png" },
  { title: "Urutan Skincare yang Benar untuk Pemula",        date: "5 Apr 2024",  tag: "Beginner",     read: "6 min", img: "/product-cream-2.png" },
  { title: "Serum vs Essence: Mana yang Kamu Butuhkan?",    date: "28 Mar 2024", tag: "Tips",         read: "5 min", img: "/product-serum-4.png" },
  { title: "Cara Pakai Sunscreen yang Efektif Setiap Hari", date: "20 Mar 2024", tag: "Sunscreen",    read: "3 min", img: "/product-dna-3.png" },
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

const fadeInLeft = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={`badge-bg ${center ? "self-center" : "self-start"} rounded-[10px] px-4 sm:px-8 py-2 mb-6`}>
      <span className="font-bold text-white text-[13px] tracking-wider whitespace-nowrap">{children}</span>
    </div>
  );
}

function SectionLabel({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div className={`mb-1 text-xs font-bold uppercase tracking-[0.2em] ${center ? "text-center" : ""}`} style={{ color: "#CF99B4" }}>
      {children}
    </div>
  );
}

function ProductCard({
  name, rating, reviews, priceLabel, priceVal, originalPrice,
  imgLeft, imgTop, img, priceMinor, productId,
}: {
  name: string; rating: string; reviews: string; priceLabel?: string; priceVal: string;
  originalPrice?: string; imgLeft?: string; imgTop?: string; img?: string;
  priceMinor?: number; productId?: string;
}) {
  const { addItem } = useCart();
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
      whileHover={{ y: -10, boxShadow: "0 28px 56px rgba(42,35,86,0.18)" }}
      className="w-full overflow-hidden rounded-[20px] bg-white flex flex-col cursor-pointer"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
    >
      {/* Product image */}
      <div className="relative overflow-hidden aspect-[4/5]">
        {img ? (
          <img src={img} alt={name} className="w-full h-full object-cover" />
        ) : (
          <img
            src={IMG_SPRITE}
            alt={name}
            className="absolute max-w-none pointer-events-none"
            style={{ width: "303.75%", height: "113.33%", top: imgTop, left: imgLeft }}
          />
        )}
      </div>

      {/* Info row */}
      <div className="flex flex-col gap-1 px-4 py-3 bg-white flex-1">
        <p className="text-[#aaa] font-semibold text-[12px] md:text-[14px]">Ginabo</p>
        <p className="font-semibold text-[#2a2356] text-[13px] md:text-[16px] leading-snug whitespace-pre-line">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#F59E0B">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-[#737373] font-semibold text-[12px]">{rating}</span>
          <span className="text-[#656565] text-base font-light">|</span>
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <span className="text-[#737373] font-semibold text-[12px]">{reviews}</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-col">
            {originalPrice && (
              <p className="text-[11px] md:text-[13px] font-medium line-through" style={{ color: "#bbb" }}>
                {originalPrice}
              </p>
            )}
            <p className="font-bold text-[13px] md:text-[16px]" style={{ color: "#be3ab4" }}>
              {priceLabel && <span style={{ color: "#be3ab4" }}>{priceLabel} </span>}
              {priceVal}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            className="flex items-center justify-center rounded-[14px] overflow-hidden flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", width: 44, height: 44 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts] = useState<GProduct[]>([]);
  const [bundles,  setBundles]  = useState<GProduct[]>([]);

  useEffect(() => {
    setProducts(store.getProducts());
    setBundles(store.getBundles());
  }, []);

  return (
    <div className="bg-[#fffafa] overflow-x-hidden">

      {/* ════════════════════════════════════════════
          1. HERO BANNER
      ════════════════════════════════════════════ */}
      <HeroBanner />

      {/* ════════════════════════════════════════════
          2. MARQUEE (KEEP)
      ════════════════════════════════════════════ */}
      <div className="border-y border-[#f0d8eb] bg-white py-3.5">
        <Marquee
          items={marqueeItems}
          speed={28}
          itemClassName="font-bold text-[13px] tracking-wide text-[#78257C]"
          separator="✦"
        />
      </div>

      {/* ════════════════════════════════════════════
          3. FLASH SALE (KEEP)
      ════════════════════════════════════════════ */}
      <FlashSaleSection />

      {/* ════════════════════════════════════════════
          4. BRAND ESSENCE
      ════════════════════════════════════════════ */}
      <section className="overflow-hidden" style={{ background: "#2a2356", minHeight: 580 }}>
        <div className="flex w-full flex-col md:flex-row" style={{ minHeight: 580 }}>

          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex-shrink-0 md:w-[46%] lg:w-[44%]"
            style={{ minHeight: 280 }}
          >
            <div className="relative h-full" style={{ minHeight: 280 }}>
              <img src={IMG_STORE} alt="Ginabo Store" className="h-full w-full object-cover" style={{ minHeight: 280 }} />
            </div>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-1 flex-col justify-center px-8 py-14 md:px-14 md:py-20 lg:px-20"
          >
            <Badge>Brand Essence</Badge>

            <h2 className="mb-6 font-bold leading-tight" style={{ color: "#ffa8f8", fontSize: "clamp(1.8rem,4vw,3rem)" }}>
              &quot;Cerah yang tetap nyaman.&quot;
            </h2>
            <p className="mb-10 text-[14px] leading-[22px] text-justify text-white opacity-90" style={{ maxWidth: 620 }}>
              GINABO membantu kulitmu tampak lebih cerah dan terawat melalui rutinitas yang nyaman dan konsisten.
              Bukan skincare instan, tapi perawatan yang bikin kulit terasa nyaman, terawat, dan hasilnya makin konsisten dari waktu ke waktu.
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap gap-10"
            >
              {[
                { label: "Riset Per Produk",     val: null,  counter: null,                  fallback: "~2 Tahun" },
                { label: "Usia Mulai Pemakaian", val: null,  counter: { to: 15, suffix: "+" }, fallback: null },
                { label: "Rutinitas Simpel",     val: "AM/PM", counter: null,                 fallback: null },
              ].map((s) => (
                <motion.div key={s.label} variants={cardSlideUp}>
                  <p className="font-bold leading-[30px]" style={{ color: "#ffa8f8", fontSize: "2rem" }}>
                    {s.counter
                      ? <AnimatedCounter to={s.counter.to} suffix={s.counter.suffix} />
                      : (s.val ?? s.fallback)}
                  </p>
                  <p className="font-semibold text-white text-[15px] leading-[20px]">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. PRODUK KAMI
      ════════════════════════════════════════════ */}
      <section className="bg-[#fffafa] pt-14 pb-4 md:pt-20 md:pb-4">
        <div className="mx-auto w-full max-w-5xl px-5 md:px-10">
          <Reveal>
            <SectionLabel center>Katalog</SectionLabel>
            <h2 className="text-center font-staatliches leading-[1] text-[clamp(2.5rem,6vw,64px)] mb-8" style={{ color: "#5245b2" }}>
              Produk Kami
            </h2>
          </Reveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((p) => (
              <ProductCard
                key={p.id}
                productId={p.id}
                name={p.name}
                rating={p.rating}
                reviews={p.reviews}
                priceLabel={p.priceLabel}
                priceVal={p.priceVal}
                priceMinor={p.priceMinor}
                img={p.img}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. PAKET BUNDLING
      ════════════════════════════════════════════ */}
      
      <section className="bg-[#FDFAFF] pt-4 pb-14 md:pt-6 md:pb-20">
        <div className="mx-auto w-full max-w-5xl px-5 md:px-10">
          <Reveal>
            <SectionLabel center>Katalog</SectionLabel>
            <h2 className="text-center font-staatliches leading-[1] text-[clamp(2.5rem,6vw,64px)] mb-8" style={{ color: "#5245b2" }}>
              Paket Bundling
            </h2>
          </Reveal>


          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {bundles.map((p) => (
              <ProductCard
                key={p.id}
                productId={p.id}
                name={p.name}
                rating={p.rating}
                reviews={p.reviews}
                originalPrice={p.originalPrice}
                priceVal={p.priceVal}
                priceMinor={p.priceMinor}
                img={p.img}
              />
            ))}
          </motion.div>

          <Reveal delay={0.3}>
            <div className="mt-8 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-[10px] badge-bg px-8 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                Lihat Semua Produk →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. BRAND PILLARS — 4 Pilar Fondasi Ginabo
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1e0a38 50%,#2a1040 100%)" }}>
        {/* Glow blobs */}
        <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle,#e879f9,transparent 70%)" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#c026d3,transparent 70%)" }} />

        <div className="relative mx-auto w-full max-w-5xl px-5 md:px-10">

          {/* Header */}
          <Reveal>
            <div className="mb-14 text-center">
              <span className="mb-4 inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>
                Brand Pillars
              </span>
              <h2 className="font-staatliches text-[clamp(2.4rem,5vw,4rem)] leading-none text-white mt-3">
                4 Pilar Fondasi{" "}
                <span style={{ background: "linear-gradient(135deg,#c084fc,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Ginabo
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                Setiap produk Ginabo dibangun di atas empat prinsip utama yang menjadi standar kualitas kami.
              </p>
            </div>
          </Reveal>

          {/* 4-card grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                variants={cardSlideUp}
                whileHover={{ y: -6, boxShadow: "0 24px 64px rgba(139,92,246,0.25)" }}
                className="relative overflow-hidden rounded-2xl p-7 flex flex-col gap-5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Top row: number + icon */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#c084fc" }}>
                    0{i + 1}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>
                    {p.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-staatliches text-white leading-tight text-[clamp(1.5rem,2.8vw,2rem)]">
                  {p.title}
                </h3>

                {/* Desc */}
                <p className="text-[13px] leading-relaxed flex-1" style={{ color: "rgba(255,255,255,0.60)" }}>
                  {p.desc}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg,#8b5cf6,#e879f9,transparent)" }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          8. BRAND CHARACTER — Jika Ginabo Adalah Seseorang
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "linear-gradient(160deg,#fdf4ff 0%,#f5f0ff 50%,#fdf4ff 100%)" }}>
        {/* Subtle bg blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle,#e879f9,transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }} />

        <div className="relative mx-auto w-full max-w-5xl px-5 md:px-10">

          {/* Header */}
          <Reveal>
            <div className="mb-14 text-center">
              <span className="mb-4 inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>
                Brand Character
              </span>
              <h2 className="font-staatliches mt-3 text-[clamp(2.4rem,5vw,4rem)] leading-none" style={{ color: "#2a1a4e" }}>
                Jika Ginabo Adalah{" "}
                <span style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Seseorang
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed" style={{ color: "#888" }}>
                Empat sifat yang mencerminkan kepribadian brand Ginabo dalam setiap produk dan komunikasinya.
              </p>
            </div>
          </Reveal>

          {/* Character cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {[
              { title: "Warm",        desc: "Terasa hangat dan mudah didekati, bukan brand yang menghakimi kondisi kulitmu.", color: "#f97316", icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              )},
              { title: "Reliable",    desc: "Riset bertahun-tahun untuk formula yang seimbang antara performa dan kenyamanan.", color: "#8b5cf6", icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              )},
              { title: "Trustworthy", desc: "Kami serius di kualitas, karena kulit kamu bukan tempat coba-coba.", color: "#06b6d4", icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              )},
              { title: "Clear",       desc: "Komunikasi jujur & realistis. Tidak ada klaim berlebihan seperti \"putih instan\" atau \"1 malam langsung\".", color: "#e879f9", icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              )},
            ].map((c, i) => (
              <motion.div
                key={c.title}
                variants={cardSlideUp}
                whileHover={{ y: -6, boxShadow: `0 24px 64px ${c.color}44` }}
                className="relative overflow-hidden rounded-2xl p-7 flex flex-col gap-3"
                style={{ background: c.color, boxShadow: `0 4px 20px ${c.color}33` }}
              >
                {/* Number */}
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">
                  0{i + 1}
                </span>

                {/* Title */}
                <h3 className="font-staatliches text-white text-[clamp(1.6rem,3vw,2rem)] leading-none">
                  {c.title}
                </h3>

                {/* Desc */}
                <p className="text-[13px] leading-relaxed text-white/80">
                  {c.desc}
                </p>

                {/* Decorative circle */}
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          9. POSITIONING — "Friendly Expert"
      ════════════════════════════════════════════ */}
      <section className="overflow-hidden py-16 md:py-24 text-center" style={{ background: "#1e1840" }}>
        <div className="mx-auto w-full max-w-[1340px] px-5 md:px-10">
          <Reveal>
            <div className="flex justify-center mb-8">
              <Badge>Positioning</Badge>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <h2 className="font-bold mb-6" style={{ color: "#ffa8f8", fontSize: "clamp(2rem,5vw,3rem)" }}>
              &quot;Friendly expert.&quot;
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <p className="mx-auto mb-10 font-semibold text-white text-[clamp(14px,2vw,20px)] leading-[1.7] opacity-90" style={{ maxWidth: 900 }}>
              Ginabo berbicara seperti teman yang memahami perawatan kulit, bukan seperti sales yang mengejar penjualan.
              Informatif, not judging. Jujur dan memberikan rasa aman.
            </p>
          </Reveal>

          {/* Trait pills */}
          <Reveal direction="up" delay={0.3}>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {["Calm & Mature", "Informative", "Not Judging", "Honest"].map((tag) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.06, backgroundColor: "#6958c0" }}
                  className="rounded-[10px] px-6 py-2.5 font-semibold text-white text-[15px] cursor-default select-none"
                  style={{ background: "#4a3662" }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal direction="up" delay={0.4}>
            <div className="flex justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 rounded-[10px] badge-bg px-8 py-4 font-semibold text-white text-[17px] shadow-lg"
                >
                  <img src={IMG_BOTTLE} alt="" className="w-7 h-7 flex-shrink-0" />
                  Rawat Sekarang
                </Link>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          10. INFO TERKINI (KEEP)
      ════════════════════════════════════════════ */}
      <section className="bg-[#FDFAFF] py-14 md:py-20">
        <div className="mx-auto w-full max-w-[1540px] px-5 md:px-10">
          <SectionLabel>Edukasi & Tips</SectionLabel>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Info & Tips Terkini</h2>
            <Link href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-800 hover:underline">Lihat Semua →</Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {blogPosts.map((post) => (
              <motion.div key={post.title} variants={cardSlideUp}>
                <Link href="#" className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-brand-sm transition hover:shadow-brand h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={post.img} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" />
                    <span className="absolute left-3 top-3 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: "#78257C" }}>{post.tag}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-center gap-2 text-[11px] text-brand-400">
                      <span>{post.date}</span><span>·</span><span>{post.read} read</span>
                    </div>
                    <div className="text-sm font-semibold leading-snug text-brand-900 transition group-hover:text-brand-600">{post.title}</div>
                    <div className="mt-auto pt-2 text-xs font-semibold text-brand-500 group-hover:text-brand-700">Baca selengkapnya →</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
