"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ClientsSection } from "@/components/ui/testimonial-card";
import ResellerBenefitCard from "@/components/ui/reseller-benefit-card";
import { FlowButton } from "@/components/ui/flow-button";
import { useState } from "react";
import { TIERS, TIER_ORDER, fmtRp, partnerPrice, useResellerTier } from "@/components/reseller/ResellerTierProvider";

// ─── MOTION TOKENS ────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const popIn = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } },
};

function Reveal({ children, delay = 0, className = "", style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className="mb-4 inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
      style={tone === "light" ? { background: "linear-gradient(135deg, #9333EA, #7C3AED)" } : { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}
    >
      {children}
    </span>
  );
}

function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung sebagai partner reseller. Boleh info lebih lanjut?";
  return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
}

// ─── SVG ICON COMPONENTS ─────────────────────────────────────────────────────
const icons = {
  check: (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  arrowRight: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  whatsapp: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2C6.477 2 2 6.478 2 12c0 1.88.516 3.637 1.41 5.142L2 22l4.978-1.388A9.945 9.945 0 0 0 12 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm.003 18a7.965 7.965 0 0 1-4.075-1.114l-.292-.173-3.03.845.852-3.042-.19-.305A7.965 7.965 0 0 1 4 12C4 7.582 7.582 4 12 4s8 4.582 8 8-3.582 8-8 8z" />
    </svg>
  ),
  shieldCheck: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  percent: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="5" x2="5" y2="19" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  ),
  headset: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="2" y="14" width="4" height="6" rx="1.6" /><rect x="18" y="14" width="4" height="6" rx="1.6" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  trending: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17l6-6 4 4 7-7" /><path d="M14 8h6v6" />
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  box: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16v11H4z" /><path d="M4 11h16" /><circle cx="8" cy="14.5" r="1.2" />
    </svg>
  ),
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

const heroFacts = [
  { icon: icons.shieldCheck, label: "Produk Berkualitas" },
  { icon: icons.percent, label: "Margin Menarik" },
  { icon: icons.headset, label: "Dukungan Sepenuh Hati" },
];

const heroStats = [
  { value: "500+", label: "Reseller aktif", icon: icons.users },
  { value: "40%", label: "Margin hingga", icon: icons.trending },
  { value: "1×24 Jam", label: "Approval cepat", icon: icons.clock },
  { value: "Rp0", label: "Biaya pendaftaran", icon: icons.box },
];

const stats = [
  { value: "500+", label: "Reseller aktif" },
  { value: "40%", label: "Margin hingga" },
  { value: "1×24 Jam", label: "Approval cepat" },
  { value: "Rp0", label: "Biaya pendaftaran" },
];

const benefitCards = [
  {
    imageSrc: "/images/reseller/margin.webp",
    alt: "Margin Keuntungan Reseller Ginabo",
  },
  {
    imageSrc: "/images/reseller/marketing-support.webp",
    alt: "Dukungan Marketing Reseller Ginabo",
  },
  {
    imageSrc: "/images/reseller/partner-rewards.webp",
    alt: "Reward Partner Reseller Ginabo",
  },
  {
    imageSrc: "/images/reseller/support.webp",
    alt: "Support Berkelanjutan Reseller Ginabo",
  },
];

const tierVisuals = {
  starter: {
    bg: "linear-gradient(160deg, #ffffff 0%, #f6f1fd 55%, #efe6fb 100%)",
    border: "#e3d6f7",
    shadow: "0 10px 30px rgba(124, 58, 237, 0.12)",
    hoverShadow: "0 18px 42px rgba(124, 58, 237, 0.22)",
    glowColor: "rgba(167, 139, 250, 0.55)",
    labelColor: "#7C3AED",
    grad: "linear-gradient(135deg, #9333EA, #7C3AED)",
    perks: ["Akses harga grosir", "Materi promosi dasar", "Support komunitas"],
    cta: "Pilih Starter",
    featured: false,
  },
  growth: {
    bg: "linear-gradient(160deg, #8b5cf6 0%, #7c3aed 45%, #6d28d9 100%)",
    border: "transparent",
    shadow: "0 20px 50px rgba(124, 58, 237, 0.45)",
    hoverShadow: "0 28px 64px rgba(124, 58, 237, 0.58)",
    glowColor: "rgba(255, 255, 255, 0.35)",
    labelColor: "#fff",
    grad: "linear-gradient(135deg, #9333EA, #8b5cf6)",
    perks: ["Akses harga grosir", "Materi promosi lengkap", "Priority support", "Undangan training eksklusif"],
    cta: "Pilih Growth",
    featured: true,
  },
  premier: {
    bg: "linear-gradient(160deg, #fffdf7 0%, #fff6e0 55%, #fdecc4 100%)",
    border: "#f0d99a",
    shadow: "0 10px 30px rgba(202, 138, 4, 0.18)",
    hoverShadow: "0 18px 42px rgba(202, 138, 4, 0.30)",
    glowColor: "rgba(250, 204, 21, 0.55)",
    labelColor: "#B98A2E",
    grad: "linear-gradient(135deg, #B98A2E, #E0B75A)",
    perks: ["Akses harga grosir terbaik", "Materi & konten premium", "Account manager", "Bonus & reward eksklusif"],
    cta: "Pilih Premier",
    featured: false,
  },
} as const;

const steps = [
  { n: "1", title: "Daftar", desc: "Isi formulir pendaftaran secara online." },
  { n: "2", title: "Verifikasi", desc: "Tim kami verifikasi data kamu (1×24 jam)." },
  { n: "3", title: "Starter Order", desc: "Pilih tier dan lakukan starter order." },
  { n: "4", title: "Grow", desc: "Mulai jualan dan dapatkan support untuk bertumbuh." },
];

const products = [
  { name: "GlowAge Multi Active Serum", retail: 85000 },
  { name: "Bright & Care Moisture Cream", retail: 95000 },
  { name: "Hydra Moist Gel Ultimate", retail: 120000 },
];

const statsData = [
  { value: "1.500+", label: "Reseller Aktif" },
  { value: "Rp 15M+", label: "Omzet Partner" },
  { value: "4.9", label: "Rating Kepuasan" },
];

const testimonialsData = [
  {
    name: "Aisyah Rahmawati",
    title: "Ibu Rumah Tangga, Surabaya",
    quote: "Sebagai ibu rumah tangga, saya terbantu sekali dengan program reseller Ginabo. Tanpa perlu stok barang banyak, dalam 2 bulan sudah bisa balik modal dan sekarang punya penghasilan tambahan tetap.",
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    rating: 5.0,
  },
  {
    name: "Rizky Aditya",
    title: "Mahasiswa, Bandung",
    quote: "Awalnya iseng cari tambahan uang saku. Training dan materi promosi dari Ginabo lengkap banget, tinggal copy-paste dan sebar di sosmed, pesanan langsung mengalir deras.",
    avatarSrc: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
    rating: 4.8,
  },
  {
    name: "Dewi Lestari",
    title: "Karyawan Swasta, Yogyakarta",
    quote: "Awalnya ragu karena sibuk kerja kantor, tapi sistem dropship Ginabo memudahkan saya. Margin keuntungannya tebal dan produknya sangat mudah dijual karena kualitasnya premium.",
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    rating: 4.9,
  },
  {
    name: "Budi Santoso",
    title: "Pemilik Toko Kosmetik, Semarang",
    quote: "Menambahkan produk Ginabo ke toko fisik saya adalah keputusan terbaik. Pelanggan menyukai hasil serumnya, repeat order tinggi sekali dan mendongkrak omzet toko.",
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    rating: 5.0,
  },
  {
    name: "Siti Aminah",
    title: "Beauty Blogger Pemula, Medan",
    quote: "Produk Ginabo sangat disukai followers saya. Selain formulanya aman dan BPOM, reward performa bulanan untuk reseller membuat saya makin semangat promosi.",
    avatarSrc: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80",
    rating: 4.7,
  },
  {
    name: "Hendrata Wijaya",
    title: "Wirausaha, Jakarta",
    quote: "Saya gabung sebagai Stockist Ginabo di Jakarta. Kecepatan pengiriman dan support marketing dari pusat sangat membantu kami para partner di daerah berkembang dengan pesat.",
    avatarSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
    rating: 5.0,
  },
  {
    name: "Rina Herawati",
    title: "Mantan Karyawan, Tangerang",
    quote: "Setelah resign, saya fokus jalani kemitraan Ginabo. Sekarang omzet bulanan sudah melebihi gaji bulanan saya dulu waktu kerja kantoran. Sangat bersyukur bisa mandiri secara finansial.",
    avatarSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    rating: 5.0,
  },
  {
    name: "Adi Wijaya",
    title: "Salon Owner, Denpasar",
    quote: "Kami menyediakan produk Ginabo di jaringan salon kami. Respon pelanggan luar biasa puas karena produknya cocok untuk berbagai jenis kulit sensitif dan memberikan efek glowing alami.",
    avatarSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
    rating: 4.9,
  },
];

const faqs = [
  { q: "Apakah ada biaya pendaftaran menjadi partner?", a: "Tidak ada. Pendaftaran partner Ginabo gratis. Kamu hanya perlu melakukan starter order sesuai tier yang dipilih." },
  { q: "Apakah bisa upgrade tier?", a: "Bisa kapan saja. Upgrade otomatis ditawarkan saat akumulasi pembelianmu mencapai ambang tier berikutnya." },
  { q: "Berapa minimal starter order?", a: "Starter Partner mulai dari Rp3,5 juta, Growth Rp10 juta, dan Premier Rp25 juta." },
  { q: "Bagaimana cara mendapatkan reward?", a: "Setiap transaksi menghasilkan poin. Poin dan pencapaian target menentukan cashback, bonus, serta undangan trip dan gathering." },
  { q: "Berapa lama proses verifikasi?", a: "Maksimal 1×24 jam pada hari kerja. Tim kami menghubungi kamu lewat WhatsApp setelah data diverifikasi." },
  { q: "Apakah ada wilayah penjualan tertentu?", a: "Tidak ada pembatasan wilayah untuk Starter dan Growth. Premier Partner bisa mengajukan hak wilayah tertentu." },
];

// ─── REUSABLE ─────────────────────────────────────────────────────────────────

function SectionHeading({
  label,
  title,
  desc,
  center = true,
  id,
  tone = "light",
}: {
  label: string;
  title: React.ReactNode;
  desc?: string;
  center?: boolean;
  id?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Reveal className={`mb-8 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <SectionLabel tone={tone}>{label}</SectionLabel>
      <h2 id={id} className="text-2xl font-extrabold leading-tight md:text-[2rem]" style={{ color: tone === "dark" ? "#fff" : "#4A1A5E" }}>
        {title}
      </h2>
      {desc && (
        <p className={`mt-3 text-[15px] leading-relaxed ${tone === "dark" ? "text-white/70" : "text-[#5a4a6a]"}`}>
          {desc}
        </p>
      )}
    </Reveal>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ResellerProgramPage() {
  const [sales, setSales] = useState(10);
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({});
  const salesRp = sales * 1_000_000;
  const profitRp = salesRp * 0.35;

  const { tier, setTier, picked } = useResellerTier();

  return (
    <div className="bg-white text-[#2a2a2a]">

      {/* ══ 1. HERO — banner-hero.png background with copy overlay ══════════ */}
      <div className="w-full md:px-5 lg:px-8 xl:px-10 md:pt-3">
        <section
          aria-labelledby="hero-heading"
          className="relative min-h-[560px] w-full overflow-hidden sm:min-h-[520px] md:aspect-[3/1] md:min-h-0 md:rounded-2xl"
          style={{ backgroundColor: "#c3a7d8" }}
        >
          <Image
            src="/hero/banner-hero.png"
            alt=""
            fill
            priority
            className="object-cover object-[72%_top] md:object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 md:hidden"
            style={{ background: "linear-gradient(180deg, rgba(195,167,216,0) 40%, rgba(195,167,216,.94) 62%, #c3a7d8 78%)" }}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-end px-6 pb-7 sm:px-9 md:items-center md:pb-0 md:px-12">
            <div className="w-full max-w-[420px]">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-bold sm:px-[18px] sm:py-[9px] sm:text-[13px]"
                style={{ background: "rgba(255,255,255,.78)", color: "#6D28D9" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                </svg>
                Program Reseller Ginabo
              </span>
              <h1
                id="hero-heading"
                className="mt-2.5 text-[22px] font-extrabold leading-[1.12] tracking-[-.02em] sm:mt-3 sm:text-[32px] lg:text-[44px]"
                style={{ color: "#241338" }}
              >
                Bangun bisnis<br /><span style={{ color: "#7C3AED" }}>beauty-mu</span><br />bersama Ginabo.
              </h1>
              <p className="mt-2 max-w-[360px] text-[11px] font-medium leading-[1.6] sm:mt-3 sm:text-[13.5px]" style={{ color: "#5b4b72" }}>
                Dapatkan produk berkualitas, margin menarik, dan dukungan penuh untuk tumbuh bersama Ginabo di seluruh Indonesia.
              </p>
              <div className="mt-3.5 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap sm:gap-3">
                <FlowButton href="/reseller/register" text="Gabung Jadi Reseller" className="w-full md:w-auto" />
                <a
                  href="#program"
                  className="inline-flex min-h-[48px] w-full items-center justify-between gap-1.5 rounded-xl bg-white px-6 text-[15px] font-semibold sm:rounded-2xl md:w-[260px] md:min-h-[50px] md:text-[17.5px]"
                  style={{ color: "#6D28D9", boxShadow: "0 8px 22px rgba(60,29,105,.12)" }}
                >
                  Pelajari Program
                  <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full sm:h-6 sm:w-6" style={{ background: "#F1E9FD" }}>
                    {icons.arrowRight}
                  </span>
                </a>
              </div>
              <ul className="mt-3.5 hidden flex-wrap items-center gap-x-4 gap-y-2 sm:flex sm:gap-x-[22px] sm:gap-y-3 sm:mt-5">
                {heroFacts.map((f) => (
                  <li key={f.label} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full sm:h-[34px] sm:w-[34px]" style={{ border: "1px solid rgba(109,40,217,.28)", color: "#6D28D9" }}>
                      {f.icon}
                    </span>
                    <span className="text-[10.5px] font-medium leading-[1.3] sm:text-[13px]" style={{ color: "#4a3b60" }}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="absolute inset-y-0 right-3 hidden flex-col justify-center gap-2 sm:right-6 sm:flex sm:gap-2.5 lg:right-10">
            {heroStats.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 sm:gap-3.5 sm:rounded-2xl sm:px-4 sm:py-3" style={{ boxShadow: "0 12px 30px rgba(60,29,105,.14)" }}>
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg sm:h-[38px] sm:w-[38px] sm:rounded-xl" style={{ background: "#F4EEFD" }}>
                  {s.icon}
                </span>
                <span>
                  <b className="block text-[14px] font-extrabold leading-[1.1] sm:text-[19px]" style={{ color: "#241338" }}>{s.value}</b>
                  <span className="block whitespace-nowrap text-[9.5px] font-medium sm:text-[12px]" style={{ color: "#7b6b90" }}>{s.label}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ══ 2. STATS BAR ═════════════════════════════════════════════════════ */}
      <section aria-label="Statistik program" style={{ background: "linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)" }}>
        <div className="mx-auto max-w-6xl px-5">
          <motion.dl
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 divide-x divide-y divide-white/10 md:grid-cols-4 md:divide-y-0"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center gap-0.5 px-3 py-5 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-[22px] font-extrabold leading-none text-white md:text-[28px]">{s.value}</dd>
                <p className="text-[11px] font-medium text-white/65 md:text-[12px]">{s.label}</p>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </section>

      {/* ══ 3. BENEFITS ══════════════════════════════════════════════════════ */}
      <section id="benefit" aria-labelledby="benefits-heading" className="py-12 md:py-16 bg-white overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          .benefit-card-0 { --shift-x: 7.5px; }
          .benefit-card-1 { --shift-x: -7.5px; }
          .benefit-card-2 { --shift-x: 7.5px; }
          .benefit-card-3 { --shift-x: -7.5px; }

          @media (min-width: 1024px) {
            .benefit-card-0 { --shift-x: 22.5px; }
            .benefit-card-1 { --shift-x: 7.5px; }
            .benefit-card-2 { --shift-x: -7.5px; }
            .benefit-card-3 { --shift-x: -22.5px; }
          }
        `}} />
        <div className="mx-auto max-w-5xl px-5">
          <SectionHeading id="benefits-heading" label="Benefit Partner" title="Lebih dari sekadar menjual skincare" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 justify-items-center">
            {benefitCards.map((card, index) => (
              <ResellerBenefitCard
                key={card.imageSrc}
                imageSrc={card.imageSrc}
                alt={card.alt}
                className={`benefit-card-${index}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. PROFIT SIMULATOR ══════════════════════════════════════════════ */}
      <section aria-labelledby="simulator-heading" className="pb-10 md:pb-14" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <Reveal
            className="grid items-center gap-6 rounded-3xl p-6 md:grid-cols-[1fr_1fr_1fr] md:p-9"
            style={{ background: "linear-gradient(120deg,#F7F3FE,#F1E9FD)" }}
          >
            <div>
              <SectionLabel>Simulator profit</SectionLabel>
              <h2 id="simulator-heading" className="text-2xl font-extrabold leading-tight md:text-[1.7rem]" style={{ color: "#4A1A5E" }}>
                Seberapa besar potensi bisnis kamu?
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-[#5a4a6a]">Atur estimasi penjualanmu dan lihat potensi keuntungan.</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-[0_10px_26px_rgba(60,29,105,0.07)]">
              <p className="text-[12px] font-medium text-[#8b7aa8]">Estimasi penjualan per bulan</p>
              <p className="mt-1.5 mb-4 text-[27px] font-extrabold" style={{ color: "#7C3AED" }}>{fmtRp(salesRp)}</p>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={sales}
                onChange={(e) => setSales(Number(e.target.value))}
                className="w-full accent-[#7C3AED]"
                aria-label="Estimasi penjualan per bulan (juta rupiah)"
              />
              <div className="mt-2 flex justify-between text-[11px] font-medium text-[#a294b5]">
                <span>Rp1 jt</span>
                <span>Rp50 jt+</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-[0_10px_26px_rgba(60,29,105,0.07)]">
              <p className="text-[12px] font-medium text-[#8b7aa8]">Estimasi profit bersih</p>
              <p className="mt-1.5 text-[34px] font-extrabold leading-none" style={{ color: "#6D28D9" }}>{fmtRp(profitRp)}</p>
              <p className="mb-3.5 mt-1 text-[14px] font-semibold text-[#9d8ab8]">/ bulan</p>
              <span className="inline-block rounded-lg px-3 py-1.5 text-[11.5px] font-semibold" style={{ background: "#F1E9FD", color: "#7C3AED" }}>
                Margin rata-rata 35%
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 5. TIERS ═════════════════════════════════════════════════════════ */}
      <section id="tier" aria-labelledby="tiers-heading" className="py-10 md:py-14" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            id="tiers-heading"
            label="Pilih Tier Partner"
            title="Pilih cara kamu memulai"
            desc="Semua tier bebas upgrade kapan saja sesuai pertumbuhan bisnismu."
          />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid items-stretch gap-4 md:grid-cols-3"
          >
            {TIER_ORDER.map((key) => {
              const t = TIERS[key];
              const v = tierVisuals[key];
              return (
                <motion.article
                  key={key}
                  variants={fadeUp}
                  whileHover={{ y: -8, boxShadow: v.hoverShadow }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl p-5 md:p-6 ${v.featured ? "md:-my-2 md:py-8" : ""}`}
                  style={{
                    background: v.bg,
                    border: v.featured ? "none" : `1.5px solid ${v.border}`,
                    boxShadow: v.shadow,
                  }}
                >
                  {/* Ambient Glow Blob */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-[40px] opacity-55 z-0"
                    style={{
                      background: `radial-gradient(circle, ${v.glowColor} 0%, transparent 70%)`,
                    }}
                  />

                  {/* Wrapper content to ensure z-index is higher than absolute glow blob */}
                  <div className="relative z-10 flex flex-col gap-4 h-full flex-grow">
                    {v.featured && (
                      <div
                        className="absolute right-0 top-0 z-20 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2l2.9 6.6L22 9.6l-5 4.9 1.2 7L12 18l-6.2 3.5 1.2-7-5-4.9 7.1-1L12 2z" />
                        </svg>
                        MOST POPULAR
                      </div>
                    )}

                    <div className="self-start rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ background: v.grad }}>
                      {t.short.toUpperCase()} PARTNER
                    </div>

                    <div>
                      <p className={`text-[11px] font-semibold uppercase tracking-wide ${v.featured ? "text-white/65" : "text-[#5a4a6a]"}`}>
                        Modal mulai dari
                      </p>
                      <motion.p
                        variants={popIn}
                        className={`mt-0.5 text-[28px] font-extrabold leading-none ${v.featured ? "text-white" : ""}`}
                        style={!v.featured ? { color: "#4A1A5E" } : undefined}
                      >
                        {t.modal}
                      </motion.p>
                      <p className={`mt-1.5 text-[13px] font-semibold ${v.featured ? "text-white/85" : "text-[#4a3b60]"}`}>
                        {t.margin}
                      </p>
                    </div>

                    <ul className="flex flex-col gap-2.5">
                      {v.perks.map((p) => (
                        <li key={p} className={`flex items-center gap-2.5 text-[13px] font-medium ${v.featured ? "text-white/90" : "text-[#5a4a6a]"}`}>
                          <span
                            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                            style={{ background: v.featured ? "rgba(255,255,255,0.18)" : "#F1E9FD" }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={v.featured ? "#fff" : "#7C3AED"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/reseller/register"
                      onClick={() => setTier(key)}
                      className="mt-auto flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl py-3 text-center text-[13px] font-bold transition duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]"
                      style={v.featured ? { background: "#fff", color: "#6D28D9" } : { background: v.grad, color: "#fff" }}
                    >
                      {v.cta}
                      <span className="transition-transform duration-200 group-hover:translate-x-1">{icons.arrowRight}</span>
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ 6. HOW IT WORKS — TIMELINE RAIL ═════════════════════════════════ */}
      <section id="program" aria-labelledby="steps-heading" className="py-10 md:py-14" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading id="steps-heading" label="Cara Gabung" title="4 langkah mudah jadi partner" />

          <div className="relative mt-2 md:mt-10">
            {/* Connecting rail — desktop horizontal, drawn on scroll */}
            <motion.div
              aria-hidden="true"
              className="absolute top-5 left-[12.5%] right-[12.5%] hidden h-[2px] origin-left md:block"
              style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.05), rgba(124,58,237,0.4) 50%, rgba(124,58,237,0.05))" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
            />
            {/* Connecting rail — mobile vertical, drawn on scroll */}
            <motion.div
              aria-hidden="true"
              className="absolute left-5 top-2 bottom-2 w-[2px] origin-top md:hidden"
              style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.4), rgba(124,58,237,0.05))" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
            />

            <motion.ol
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
              className="relative grid gap-5 md:grid-cols-4 md:gap-5"
            >
              {steps.map((s) => (
                <motion.li
                  key={s.n}
                  variants={fadeUp}
                  className="relative flex items-start gap-4 md:flex-col md:items-center md:gap-0 md:text-center"
                >
                  <motion.span
                    variants={popIn}
                    className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white ring-4 ring-white"
                    style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)", boxShadow: "0 0 0 4px rgba(124,58,237,0.1), 0 4px 16px rgba(147,51,234,0.4)" }}
                  >
                    {s.n}
                  </motion.span>

                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="min-w-0 flex-1 rounded-2xl p-5 md:mt-5 md:w-full"
                    style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}
                  >
                    <span
                      className="mb-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: "#F1E9FD", color: "#7C3AED" }}
                    >
                      Langkah {s.n}
                    </span>
                    <h3 className="text-[14px] font-extrabold" style={{ color: "#4A1A5E" }}>{s.title}</h3>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[#5a4a6a]">{s.desc}</p>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </section>

      {/* ══ 9. PRICE COMPARISON ══════════════════════════════════════════════ */}
      <section aria-labelledby="price-heading" className="py-10 md:py-14" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading id="price-heading" label="Harga Partner" title="Selisih harga yang jadi keuntunganmu" desc={`Contoh perhitungan untuk tier ${picked.short} (margin ${Math.round(picked.rate * 100)}%).`} />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((p) => {
              const partner = partnerPrice(p.retail, tier);
              const profit = p.retail - partner;
              return (
                <motion.div
                  key={p.name}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="relative flex flex-col gap-3.5 overflow-hidden rounded-2xl p-5"
                  style={{ background: "#ffffff", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}
                >
                  {/* Ambient glow blob for brand consistency with tier cards */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-40 blur-[36px]"
                    style={{ background: "radial-gradient(circle, #C084FC 0%, transparent 70%)" }}
                  />

                  <h3 className="relative text-[13.5px] font-bold leading-snug text-[#241338]">{p.name}</h3>

                  <div className="relative flex items-center gap-2">
                    <div className="min-w-0 flex-1 rounded-xl bg-[#F9F6FE] px-3 py-2.5">
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#a294b5]">Marketplace</p>
                      <p className="mt-0.5 truncate text-[13px] font-semibold text-[#8b7aa8] line-through">{fmtRp(p.retail)}</p>
                    </div>
                    <span className="flex-shrink-0 text-[#c4b5e0]">{icons.arrowRight}</span>
                    <div className="min-w-0 flex-1 rounded-xl px-3 py-2.5" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider text-white/70">Harga partner</p>
                      <p className="mt-0.5 truncate text-[13px] font-extrabold text-white">{fmtRp(partner)}</p>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: "#F1E9FD" }}>
                    <span className="text-[11px] font-semibold text-[#5a4a6a]">Profit per pcs</span>
                    <span className="text-[14px] font-extrabold" style={{ color: "#7C3AED" }}>+ {fmtRp(profit)}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ 9. TESTIMONIALS ──────────────────────────────────────────────────── */}
      <ClientsSection
        tagLabel="Cerita Partner"
        title="Mereka sudah mulai, kamu kapan?"
        description="Lebih dari 1.500 partner telah bergabung dan mengembangkan bisnis kecantikan mereka bersama Ginabo. Dapatkan kemudahan sistem dan margin keuntungan maksimal."
        stats={statsData}
        testimonials={testimonialsData}
        primaryActionLabel="Daftar Sekarang"
        secondaryActionLabel="Tanya WhatsApp"
        primaryActionHref="/reseller/register"
        secondaryActionHref={waLink()}
      />

      {/* ══ 11. FAQ ══════════════════════════════════════════════════════════ */}
      <section id="faq" aria-labelledby="faq-heading" className="pb-10 md:pb-14" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            center={false}
            id="faq-heading"
            label="FAQ"
            title="Pertanyaan yang sering ditanyakan"
          />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-3 md:grid-cols-2"
          >
            {faqs.map((f, i) => (
              <motion.div
                key={f.q}
                variants={fadeUp}
                className="rounded-xl p-4"
                style={{ background: "#FCFBFE", border: "1px solid #F1ECF9" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq((prev) => ({ ...prev, [i]: !prev[i] }))}
                  aria-expanded={!!openFaq[i]}
                  className="flex w-full items-center justify-between gap-3.5 text-left"
                >
                  <span className="text-[13px] font-bold text-[#3b2b52]">{f.q}</span>
                  <span
                    className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full text-[15px] font-bold leading-none"
                    style={{ background: "#fff", border: "1px solid #EDE4FA", color: "#7C3AED" }}
                  >
                    {openFaq[i] ? "−" : "+"}
                  </span>
                </button>
                {openFaq[i] && (
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#7b6b90]">{f.a}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ STICKY MOBILE CTA BAR ════════════════════════════════════════════ */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 22 }}
        className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t bg-white/95 px-4 py-2.5 backdrop-blur md:hidden"
        style={{ borderColor: "rgba(147,51,234,0.1)", boxShadow: "0 -4px 20px rgba(147,51,234,0.1)" }}
      >
        <a
          href={waLink()}
          target="_blank"
          rel="noreferrer"
          aria-label="Tanya via WhatsApp"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[#25D366]"
          style={{ borderColor: "rgba(147,51,234,0.1)" }}
        >
          {icons.whatsapp}
        </a>
        <Link
          href="/reseller/register"
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-[14px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}
        >
          Daftar Gratis Sekarang
          {icons.arrowRight}
        </Link>
      </motion.div>

      {/* ══ FLOATING JOIN ─ desktop saja ═════════════════════════════════════ */}
      <motion.a
        href="/reseller/register"
        initial={{ opacity: 0, scale: 0.75, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 180, damping: 18 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 hidden min-h-[44px] items-center gap-2 rounded-full px-5 py-3 text-[13px] font-extrabold text-white shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA] md:inline-flex"
        style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)", boxShadow: "0 8px 32px rgba(147,51,234,0.45)" }}
        aria-label="Daftar sebagai partner Ginabo"
      >
        {icons.arrowRight}
        Gabung Sekarang
      </motion.a>

    </div>
  );
}
