"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

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

function fmtRp(n: number) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

// ─── SVG ICON COMPONENTS ─────────────────────────────────────────────────────
const icons = {
  money: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  megaphone: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11l18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 0 1-5.8-1.6" />
    </svg>
  ),
  star: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  heart: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ),
  shieldCheck: (
    <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  percent: (
    <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="19" y1="5" x2="5" y2="19" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  ),
  headset: (
    <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="2" y="14" width="4" height="6" rx="1.6" /><rect x="18" y="14" width="4" height="6" rx="1.6" />
    </svg>
  ),
  sports: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  gift: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  plane: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.8 19.2 16 11l3.5-3.5a1.5 1.5 0 0 0-2.1-2.1L14 9 5.8 7.2a.5.5 0 0 0-.4.9l6 4-2.5 2.5H5l-1.6 1.6 3 1 1 3L8 21v-4.9l2.5-2.5 4 6a.5.5 0 0 0 .9-.4z" />
    </svg>
  ),
  award: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="6" /><path d="M8.2 13.5 7 22l5-3 5 3-1.2-8.5" />
    </svg>
  ),
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
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

const heroFacts = [
  { icon: icons.shieldCheck, label: "Produk Berkualitas" },
  { icon: icons.percent, label: "Margin Menarik" },
  { icon: icons.headset, label: "Dukungan Sepenuh Hati" },
];

const stats = [
  { value: "500+", label: "Reseller aktif" },
  { value: "40%", label: "Margin hingga" },
  { value: "1×24 Jam", label: "Approval cepat" },
  { value: "Rp0", label: "Biaya pendaftaran" },
];

const benefits = [
  { icon: icons.money, title: "Margin yang sehat", desc: "Dapatkan margin hingga 40% di setiap penjualan dengan harga grosir terbaik." },
  { icon: icons.megaphone, title: "Marketing support", desc: "Kami sediakan materi promosi, konten digital, dan tips jualan siap pakai." },
  { icon: icons.star, title: "Partner rewards", desc: "Raih poin dan benefit eksklusif seiring pertumbuhan performa bisnismu." },
  { icon: icons.heart, title: "Support berkelanjutan", desc: "Tim kami siap mendampingi kamu di setiap langkah perjalanan bisnismu." },
];

type TierKey = "starter" | "growth" | "premier";

const tiers: { key: TierKey; level: string; bg: string; border: string; laba: string; rate: number; grad: string; perks: string[]; cta: string; featured: boolean }[] = [
  {
    key: "starter",
    level: "STARTER",
    bg: "#ffffff",
    border: "#ECE5F7",
    laba: "Rp3,5 jt",
    rate: 0.3,
    grad: "linear-gradient(135deg, #9333EA, #7C3AED)",
    perks: ["Akses harga grosir", "Materi promosi dasar", "Support komunitas"],
    cta: "Pilih Starter",
    featured: false,
  },
  {
    key: "growth",
    level: "GROWTH",
    bg: "linear-gradient(160deg, #7C3AED 0%, #6D28D9 100%)",
    border: "transparent",
    laba: "Rp10 jt",
    rate: 0.35,
    grad: "linear-gradient(135deg, #9333EA, #8b5cf6)",
    perks: ["Akses harga grosir", "Materi promosi lengkap", "Priority support", "Undangan training eksklusif"],
    cta: "Pilih Growth",
    featured: true,
  },
  {
    key: "premier",
    level: "PREMIER",
    bg: "#FFFDF8",
    border: "#F0E3C8",
    laba: "Rp25 jt",
    rate: 0.4,
    grad: "linear-gradient(135deg, #B98A2E, #E0B75A)",
    perks: ["Akses harga grosir terbaik", "Materi & konten premium", "Account manager", "Bonus & reward eksklusif"],
    cta: "Pilih Premier",
    featured: false,
  },
];

const steps = [
  { n: "1", title: "Daftar", desc: "Isi formulir pendaftaran secara online." },
  { n: "2", title: "Verifikasi", desc: "Tim kami verifikasi data kamu (1×24 jam)." },
  { n: "3", title: "Starter Order", desc: "Pilih tier dan lakukan starter order." },
  { n: "4", title: "Grow", desc: "Mulai jualan dan dapatkan support untuk bertumbuh." },
];

const rewardCategories = [
  { icon: icons.star, title: "Poin Penjualan", desc: "Kumpulkan poin dari setiap transaksi." },
  { icon: icons.money, title: "Cashback", desc: "Dapatkan cashback sesuai pencapaian target." },
  { icon: icons.gift, title: "Bonus Exclusive", desc: "Bonus tambahan di event spesial & launching." },
  { icon: icons.plane, title: "Trip & Gathering", desc: "Kesempatan ikut trip & gathering eksklusif." },
  { icon: icons.award, title: "Hadiah Eksklusif", desc: "Raih hadiah menarik dari Ginabo." },
];

const products = [
  { name: "GlowAge Multi-Active Serum", img: "/serumfix.png", tag: "BESTSELLER", badge: "#7C3AED", retail: 85000 },
  { name: "Bright & Care Moisture Cream", img: "/moistfix.png", tag: "FAVORIT", badge: "#9333EA", retail: 95000 },
  { name: "Hydra Moist Gel Ultimate", img: "/salmonfix.png", tag: "BARU", badge: "#8b5cf6", retail: 120000 },
];

const testimonials = [
  {
    name: "Aisyah R.",
    role: "Partner Ginabo, Surabaya",
    stars: 5,
    text: "Dalam 2 bulan sudah balik modal dan mulai untung konsisten. Sistem partner-nya benar-benar membantu, support tim responsif banget.",
  },
  {
    name: "Rizky A.",
    role: "Partner Ginabo, Bandung",
    stars: 5,
    text: "Training dan materi promonya lengkap. Tidak perlu bingung cara jual, tinggal ikuti sistemnya, hasilnya langsung terasa.",
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

  const picked = useMemo(() => tiers.find((t) => t.key === "growth")!, []);

  return (
    <div className="bg-white text-[#2a2a2a]">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section aria-labelledby="hero-heading" className="pt-8 md:pt-12" style={{ background: "linear-gradient(180deg, #FBFAFE, #F6F2FD)" }}>
        <div className="mx-auto max-w-6xl px-5">
          <h1 id="hero-heading" className="sr-only">Program Reseller Ginabo</h1>
          <Reveal className="overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(120,37,124,0.18)]">
            <Image
              src="/hero/reseller.png"
              alt="Gabung jadi Reseller Ginabo — jualan jadi lebih mudah, bukan sendirian"
              width={2172}
              height={724}
              className="h-auto w-full"
              priority
            />
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="flex flex-wrap items-center justify-center gap-3 py-8"
          >
            <motion.div variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/reseller/register"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl px-7 py-3.5 text-[14px] font-extrabold text-white shadow-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6D28D9, #9333EA)", boxShadow: "0 12px 30px rgba(109,40,217,.34)" }}
              >
                Gabung Jadi Reseller
                {icons.arrowRight}
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#program"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[14px] font-bold shadow-md transition hover:shadow-lg"
                style={{ color: "#6D28D9" }}
              >
                Pelajari Program
                {icons.arrowRight}
              </a>
            </motion.div>
          </motion.div>

          <motion.ul
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pb-10 text-[13px] font-bold text-[#4a3b60]"
          >
            {heroFacts.map((f) => (
              <motion.li key={f.label} variants={fadeUp} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#6D28D9]/25 text-[#6D28D9]">
                  {f.icon}
                </span>
                {f.label}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

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
      <section id="benefit" aria-labelledby="benefits-heading" className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading id="benefits-heading" label="Benefit Partner" title="Lebih dari sekadar menjual skincare" />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
            role="list"
          >
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}
                role="listitem"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}
                >
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-[14px] font-extrabold" style={{ color: "#4A1A5E" }}>{b.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#5a4a6a]">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 4. PROFIT SIMULATOR ══════════════════════════════════════════════ */}
      <section aria-labelledby="simulator-heading" className="pb-16 md:pb-24" style={{ background: "#ffffff" }}>
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
      <section id="tier" aria-labelledby="tiers-heading" className="py-16 md:py-24" style={{ background: "#ffffff" }}>
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
            {tiers.map((t) => (
              <motion.article
                key={t.level}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`relative flex flex-col gap-4 overflow-hidden rounded-2xl p-5 transition-shadow md:p-6 ${t.featured ? "md:-my-2 md:py-8" : ""}`}
                style={{
                  background: t.bg,
                  border: t.featured ? "none" : `1.5px solid ${t.border}`,
                  boxShadow: t.featured ? "0 16px 44px rgba(147,51,234,0.32)" : "0 4px 20px rgba(120,37,124,0.06)",
                }}
              >
                {t.featured && (
                  <div className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                    MOST POPULAR
                  </div>
                )}

                <div className="self-start rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ background: t.grad }}>
                  {t.level} PARTNER
                </div>

                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${t.featured ? "text-white/65" : "text-[#5a4a6a]"}`}>
                    Modal mulai dari
                  </p>
                  <p className={`mt-0.5 text-[28px] font-extrabold leading-none ${t.featured ? "text-white" : ""}`} style={!t.featured ? { color: "#4A1A5E" } : undefined}>
                    {t.laba}
                  </p>
                  <p className={`mt-1.5 text-[13px] font-semibold ${t.featured ? "text-white/85" : "text-[#4a3b60]"}`}>
                    Margin hingga {Math.round(t.rate * 100)}%
                  </p>
                </div>

                <ul className="flex flex-col gap-2">
                  {t.perks.map((p) => (
                    <li key={p} className={`flex items-start gap-2 text-[13px] font-medium ${t.featured ? "text-white/90" : "text-[#5a4a6a]"}`}>
                      <span className={t.featured ? "text-white" : "text-[#7C3AED]"}>{icons.check}</span>
                      {p}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/reseller/register"
                  className="mt-auto block min-h-[44px] rounded-xl py-3 text-center text-[13px] font-bold transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]"
                  style={t.featured ? { background: "#fff", color: "#6D28D9" } : { background: t.grad, color: "#fff" }}
                >
                  {t.cta}
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 6. HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section id="program" aria-labelledby="steps-heading" className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading id="steps-heading" label="Cara Gabung" title="4 langkah mudah jadi partner" />

          <motion.ol
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((s) => (
              <motion.li
                key={s.n}
                variants={fadeUp}
                className="flex items-start gap-3.5 rounded-2xl p-5"
                style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                  style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)", boxShadow: "0 0 16px rgba(147,51,234,0.4)" }}
                >
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold" style={{ color: "#4A1A5E" }}>{s.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#5a4a6a]">{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ══ 7. REWARD & BENEFIT PROGRESSION ══════════════════════════════════ */}
      <section aria-labelledby="rewards-heading" className="py-16 md:py-20" style={{ background: "linear-gradient(160deg,#2A1244,#1E0D33)" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            tone="dark"
            id="rewards-heading"
            label="Reward & Benefit"
            title="Bisnismu tumbuh. Benefit-mu ikut bertumbuh."
          />

          <Reveal className="mx-auto mb-10 flex max-w-2xl flex-wrap items-center gap-2">
            <span className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#A855F7)" }}>Starter</span>
            <span className="h-0.5 flex-1" style={{ background: "linear-gradient(90deg,#8B5CF6,#A855F7)" }} />
            <span className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#A855F7)" }}>Growth</span>
            <span className="h-0.5 flex-1" style={{ background: "linear-gradient(90deg,#A855F7,#C79A3A)" }} />
            <span className="rounded-full px-4 py-1.5 text-[12px] font-bold text-[#2A1244]" style={{ background: "linear-gradient(135deg,#C79A3A,#E0B75A)" }}>Premier</span>
            <span className="h-0.5 flex-1" style={{ background: "linear-gradient(90deg,#C79A3A,rgba(255,255,255,.25))" }} />
            <span className="rounded-full border border-white/25 px-4 py-1.5 text-[12px] font-bold text-white/75">Elite</span>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid grid-cols-2 gap-3.5 lg:grid-cols-5"
          >
            {rewardCategories.map((r) => (
              <motion.div key={r.title} variants={fadeUp} className="rounded-[15px] p-5" style={{ background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.11)" }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
                  {r.icon}
                </span>
                <b className="mt-3.5 block text-[13.5px] font-bold text-white">{r.title}</b>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/60">{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 8. PRODUCTS ══════════════════════════════════════════════════════ */}
      <section aria-labelledby="products-heading" className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading id="products-heading" label="Yang Kamu Jual" title="Skincare berkualitas, mudah dijual" />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-4 sm:grid-cols-3"
          >
            {products.map((p) => (
              <motion.article
                key={p.name}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}
              >
                <div className="relative aspect-square" style={{ background: "#faf5ff" }}>
                  <Image src={p.img} alt={p.name} fill className="object-cover" sizes="(min-width: 640px) 33vw, 100vw" />
                  <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white" style={{ background: p.badge }}>
                    {p.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[13px] font-extrabold" style={{ color: "#4A1A5E" }}>{p.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["BPOM RI", "Halal", "Cruelty Free"].map((b) => (
                      <span key={b} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#F3E8FF", color: "#7C3AED", border: "1px solid rgba(147,51,234,0.15)" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 9. PRICE COMPARISON ══════════════════════════════════════════════ */}
      <section aria-labelledby="price-heading" className="pb-16 md:pb-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading id="price-heading" label="Harga Partner" title="Selisih harga yang jadi keuntunganmu" desc={`Contoh perhitungan untuk tier ${picked.level.charAt(0)}${picked.level.slice(1).toLowerCase()} (margin ${Math.round(picked.rate * 100)}%).`} />

          <Reveal className="overflow-hidden rounded-2xl" style={{ border: "1px solid #F1ECF9" }}>
            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] bg-[#F9F6FE] text-[11px] font-bold uppercase tracking-wider text-[#8b7aa8]">
                  <span className="px-5 py-3.5">Produk</span>
                  <span className="px-4 py-3.5">Marketplace</span>
                  <span className="px-4 py-3.5">Harga partner</span>
                  <span className="px-4 py-3.5">Profit / pcs</span>
                </div>
                {products.map((p, i) => {
                  const partner = Math.round((p.retail * (1 - picked.rate)) / 500) * 500;
                  return (
                    <div key={p.name} className={`grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-t border-[#F4F0FA] ${i % 2 === 1 ? "bg-[#FDFCFF]" : ""}`}>
                      <span className="px-5 py-4 text-[13px] font-semibold text-[#241338]">{p.name}</span>
                      <span className="px-4 py-4 text-[13px] font-medium text-[#8b7aa8] line-through">{fmtRp(p.retail)}</span>
                      <span className="px-4 py-4 text-[13px] font-bold text-[#241338]">{fmtRp(partner)}</span>
                      <span className="px-4 py-4 text-[13px] font-bold text-[#7C3AED]">+ {fmtRp(p.retail - partner)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 10. TESTIMONIALS ═════════════════════════════════════════════════ */}
      <section aria-labelledby="testimonials-heading" className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            center={false}
            id="testimonials-heading"
            label="Cerita Partner"
            title={<>Mereka sudah mulai, <span className="text-[#9333EA]">kamu kapan?</span></>}
          />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-4 md:grid-cols-2"
          >
            {testimonials.map((t) => (
              <motion.article
                key={t.name}
                variants={fadeUp}
                className="flex flex-col gap-3.5 rounded-2xl p-6"
                style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}
              >
                <div className="flex gap-1" aria-label={`Rating ${t.stars} dari 5 bintang`}>
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} className="h-4 w-4" fill={si < t.stars ? "#9333EA" : "#E9D5FF"} viewBox="0 0 24 24" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-[13.5px] leading-relaxed text-[#5a4a6a]">&ldquo;{t.text}&rdquo;</blockquote>
                <footer className="flex items-center gap-3 border-t pt-3.5" style={{ borderColor: "rgba(147,51,234,0.1)" }}>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}
                    aria-hidden="true"
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <cite className="not-italic text-[13px] font-extrabold" style={{ color: "#4A1A5E" }}>{t.name}</cite>
                    <p className="text-[11px] text-[#5a4a6a]">{t.role}</p>
                  </div>
                </footer>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 11. FAQ ══════════════════════════════════════════════════════════ */}
      <section id="faq" aria-labelledby="faq-heading" className="pb-16 md:pb-24" style={{ background: "#ffffff" }}>
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

      {/* ══ 12. FINAL CTA ════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="cta-heading"
        className="relative overflow-hidden py-16 md:py-20"
        style={{ background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 55%, #8b5cf6 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-xl px-5 text-center">
          <Reveal>
            <span className="mb-4 inline-block rounded-lg border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
              Slot Partner Terbuka
            </span>
            <h2 id="cta-heading" className="mb-3 text-[26px] font-extrabold leading-tight text-white md:text-[34px]">
              Mulai bisnismu hari ini, bukan nanti
            </h2>
            <p className="mb-7 text-[14px] leading-relaxed text-white/80">
              Gratis daftar, sistemnya sudah ada, dan tim kami bantu dari awal sampai kamu bisa jalan sendiri.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/reseller/register"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-7 py-3.5 text-[14px] font-extrabold shadow-lg transition hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{ color: "#7C3AED" }}
                >
                  Daftar Sekarang
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {icons.whatsapp}
                  Tanya via WhatsApp
                </a>
              </motion.div>
            </div>
          </Reveal>
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
