"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { HeroBanner } from "@/components/HeroBanner";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";

import { useCart } from "@/components/cart/CartProvider";
import { store, type GProduct } from "@/lib/adminStore";

// ── Figma Assets ──────────────────────────────────────────────────────────────
const IMG_STORE     = "/store_ginabo.png";
const IMG_SPRITE    = "https://www.figma.com/api/mcp/asset/71dedf14-7a07-4680-8fde-41aadfebedf7"; // 3-product sprite

// ── Static Data ───────────────────────────────────────────────────────────────
const marqueeItems = [
  "BPOM ✓", "Halal ✓", "Dermatologist Tested", "No Parabens",
  "Barrier-First", "Gentle Formula", "AM & PM Routine", "2 Years Research",
];

const singleProducts = [
  { name: "Hydra Moist\nGel Ultimate",       rating: "5.0", reviews: "127", priceVal: "Rp 120.000", img: "/salmonfix.png" },
  { name: "Bright & Care\nMoisture Cream",   rating: "5.0", reviews: "127", priceVal: "Rp 75.000",  img: "/moistfix.png"  },
  { name: "GlowAge Multi-\nActive Serum",    rating: "5.0", reviews: "127", priceVal: "Rp 90.000",  img: "/serumfix.png"  },
];

const bundleProducts = [
  { name: "Ginabo Complete\nSkin Nutrition Set", rating: "5.0", reviews: "127", originalPrice: "Rp 575.999", priceVal: "Rp 287.999", img: "/essential.png"    },
  { name: "Repair &\nGlow Set",                 rating: "5.0", reviews: "127", originalPrice: "Rp 415.999", priceVal: "Rp 207.999", img: "/repair_glow.png"  },
  { name: "Daily Skin\nBarrier Set",            rating: "5.0", reviews: "127", originalPrice: "Rp 395.999", priceVal: "Rp 197.999", img: "/skin_barrier.png" },
  { name: "Bright\nRenewal Set",               rating: "5.0", reviews: "127", originalPrice: "Rp 339.999", priceVal: "Rp 169.999", img: "/bright_renewal.png" },
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

// ── CTA Card — 3D tilt + spotlight glow + spring physics ─────────────────────
function CTACard({ href, src, alt }: { href: string; src: string; alt: string }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 350, damping: 30 });
  const rotY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 350, damping: 30 });
  const glowX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
  const spotlight = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.22) 0%, transparent 55%)`;

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() { mouseX.set(0); mouseY.set(0); }

  return (
    <motion.a
      ref={cardRef}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ boxShadow: "0 2px 12px rgba(120,37,124,0.10)" }}
      whileHover={{ scale: 1.03, boxShadow: "0 16px 48px rgba(120,37,124,0.40), 0 0 0 2px rgba(190,58,180,0.50)" }}
      whileTap={{ scale: 0.97, boxShadow: "0 0 0 3px rgba(190,58,180,0.90), 0 4px 28px rgba(120,37,124,0.60)" }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
      className="relative overflow-hidden rounded-xl md:rounded-2xl block cursor-pointer"
    >
      {/* Mouse-tracked spotlight overlay */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: spotlight }}
      />
      <div className="relative aspect-[3/2]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width:640px) 33vw, (max-width:1280px) calc((100vw - 64px) / 3), 420px"
        />
      </div>
    </motion.a>
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
          1b. FEATURE CARDS — 3 standalone CTA cards
          Somethinc-style: equal columns, gaps between cards,
          each card is a promotional image with rounded corners
      ════════════════════════════════════════════ */}
      <div className="w-full px-2 md:px-5 lg:px-8 xl:px-10 pt-2 md:pt-3 pb-3 md:pb-5">
        <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">

          <CTACard href="/skincheck" src="/skin_analist.png"   alt="Cek Kulitmu — Analisis AI"  />
          <CTACard href="/reseller"  src="/reseller_card.png" alt="Jadi Reseller Ginabo"       />
          <CTACard href="/about"     src="/halal_card.png"    alt="Halal & BPOM Terdaftar"     />

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
          separator="✦"
        />
      </div>

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
            className="grid grid-cols-2 gap-3 lg:grid-cols-3"
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
            className="grid grid-cols-2 gap-3 lg:grid-cols-3"
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
                Lihat Semua Produk
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

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
                desc: "Temukan toko Ginabo terdekat — fisik di mall atau official store di marketplace.",
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
