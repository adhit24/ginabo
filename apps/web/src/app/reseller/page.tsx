"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const EASE = [0.25, 1, 0.5, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE, delay } } }}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "#be3ab4" }}>
      {children}
    </div>
  );
}

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="#78257C" strokeWidth={2.5} viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung sebagai partner reseller. Boleh info lebih lanjut?";
  return `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const problems = [
  { icon: "💸", text: "Modal besar tapi tidak tahu produknya laku atau tidak" },
  { icon: "😰", text: "Bingung mulai bisnis dari mana" },
  { icon: "📵", text: "Tidak punya sistem atau pengalaman jualan online" },
  { icon: "🙋", text: "Jualan sendirian tanpa support tim" },
];

const benefits = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Margin Lebar",
    desc: "Harga khusus partner yang memungkinkan keuntungan optimal dari setiap produk yang kamu jual.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Reward Penjualan",
    desc: "Program challenge dan insentif bulanan, quartal, dan tahunan untuk performa terbaikmu.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: "Bimbingan & Training",
    desc: "Product knowledge dan basic selling untuk bantu kamu closing lebih mudah. Tanpa pengalaman sekalipun.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Free Sample & Support",
    desc: "Materi promosi siap pakai dan support rutin agar kamu tidak mulai dari nol.",
  },
];

const tiers = [
  {
    level: "BRONZE PARTNER",
    color: "#CD7F32",
    grad: "linear-gradient(135deg, #CD7F32, #e8a853)",
    laba: "Rp 3.500.000+",
    label: "Kamu Benefit",
    perks: [
      "Bright 3 wam lootanam",
      "1tama manqsiraltan",
    ],
    cta: "Mulai Sekarang",
  },
  {
    level: "SILVER PARTNER",
    color: "#78257C",
    grad: "linear-gradient(135deg, #78257C, #be3ab4)",
    laba: "Rp 10.000.000+",
    label: "Sonny Benefit",
    perks: [
      "Dorurabur mdogram training",
      "Kamu aost meneung profiling",
    ],
    cta: "Kama proclaki",
    featured: true,
  },
  {
    level: "GOLD PARTNER",
    color: "#B8860B",
    grad: "linear-gradient(135deg, #B8860B, #f5c518)",
    laba: "Rp 25.000.000+",
    label: "Sonny Benefit",
    perks: [
      "Doransprom rampambatan",
      "Gola Business Coaching",
      "Hane base peng memboiam",
    ],
    cta: "Kamu proclaki",
  },
];

const steps = [
  { n: "1", title: "Daftar",   desc: "Isi form singkat. Tim Ginabo verifikasi dalam 1×24 jam." },
  { n: "2", title: "Approval", desc: "Dapat akses harga partner dan katalog lengkap setelah onboarding." },
  { n: "3", title: "Jual",     desc: "Pakai materi promosi siap pakai dan panduan yang kami sediakan." },
  { n: "4", title: "Profit",   desc: "Margin dari setiap penjualan plus reward performa dari sistem kami." },
];

const products = [
  { name: "GlowAge Multi-Active Serum",   img: "/serumfix.png",  tag: "BESTSELLER", badge: "#78257C" },
  { name: "Bright & Care Moisture Cream", img: "/moistfix.png",  tag: "FAVORITES",  badge: "#be3ab4" },
  { name: "Hydra Moist Gel Ultimate",     img: "/salmonfix.png", tag: "NEW",         badge: "#2d0a5e" },
];

const rewardCards = [
  {
    badge: "TOP PARTNER",
    title: "Top Partner Rewards",
    desc: "Semakin aktif kerjasama yang semakin banyak reward.",
    items: ["Top Nama Partner", "Top Partner Partner", "Top Partner Partner"],
    note: "Kemeriaan dampak digital support bisection-nanper",
    featured: true,
  },
  {
    badge: "TOP PARTNER",
    items: ["Bromi Grown Commit", "Benatr Fronell", "Business Coaching"],
    note: "Persuntan taxersitsit oruan dali support catation nageon",
  },
];

const ecosystem = [
  {
    icon: "⚽",
    title: "Sports Sportly Marketing",
    desc: "Dalam diparis namibia den disoleimael mel tujin masidangan tilami.",
  },
  {
    icon: "⚡",
    title: "Energy Activation",
    desc: "6 2 1 immobisulan posalnae utle slaping, Bikan, lift, & turnarami balagesam ultle sing.",
  },
  {
    icon: "🔗",
    title: "Website & Landing Plug",
    desc: "Kemeriaan dampak digital support catation dali some dali persunpanya.",
  },
  {
    icon: "💬",
    title: "Webally Chaping Content",
    desc: "Lang immobisulan dagam balong masidangan tilami some dali persunpanya agami.",
  },
];

const testimonials = [
  {
    name: "Aisah",
    role: "Penjual, Doublebar",
    stars: 5,
    text: "\"Atonally ktigis Partner dagam pembeli gutoir makinas, mangon akit probama dani dali pemasarkan masspa digital dan pahupan penangas.\"",
  },
  {
    name: "Bizous K",
    role: "Konzitari Pemaseksan Gibassit",
    stars: 0,
    text: "Thoco musio membok sitgar tarrivek dani Bkullc Immonsulan Getan semmarsinboir dali organizaman tangimng kirwan yang kanik gaini.",
  },
];

// ─── PAGE ───────────────────────────────────────────────────────────────────

export default function ResellerProgramPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ══ 1. HERO ══ */}
      <section className="relative overflow-hidden" style={{ background: "#f8f4f0" }}>
        <div className="mx-auto grid max-w-6xl min-h-[480px] items-center gap-8 px-6 py-16 md:grid-cols-2 md:py-24">
          {/* Left */}
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeUp}
              className="mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ background: "#78257C", color: "#fff" }}
            >
              Ginabo Partner Program
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-4xl font-extrabold leading-tight text-[#1a1a1a] md:text-5xl"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Glowing Bareng.{" "}
              <br />
              <span style={{ color: "#78257C" }}>Growing Bareng.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 max-w-md text-[15px] leading-relaxed text-[#555]">
              Bangun bisnis skincare terkinsab dan pelangkaman kamu nalao gain.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/reseller/register"
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-7 py-3 text-[14px] font-extrabold text-white shadow-md transition hover:opacity-90"
                style={{ background: "#78257C" }}
              >
                Bangga Bareng Predikt
              </Link>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-7 py-3 text-[14px] font-bold transition hover:bg-[#f5eeff]"
                style={{ borderColor: "#e0d0f0", color: "#78257C" }}
              >
                Tanya via WA
              </a>
            </motion.div>
          </motion.div>

          {/* Right — product image */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-md">
              <Image
                src="/resellerprogram.png"
                alt="Ginabo Partner Program"
                width={520}
                height={420}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ 2. PROBLEM ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* Left text */}
            <Reveal>
              <Label>Kamu Pernah Merasa Ini?</Label>
              <h2 className="mt-2 text-2xl font-extrabold leading-snug text-[#1a1a1a] md:text-3xl">
                Bukan salahmu. Sistemmu, sistemnya yang belum ada.
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#666]">
                Bangun bisnis skinmu, mandukam, dan metrytum cauter yang manya, loge ngilian skai alam salin support gani.
              </p>
            </Reveal>

            {/* Right — problem cards stacked */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={stagger}
              className="flex flex-col gap-3"
            >
              {problems.map((p) => (
                <motion.div
                  key={p.text}
                  variants={fadeUp}
                  className="flex items-center gap-4 rounded-2xl bg-[#FDFAFF] px-5 py-4"
                  style={{ border: "1.5px solid #f0e8f8" }}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[14px] font-semibold text-[#3d3550]">{p.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 3. BENEFITS ══ */}
      <section className="py-16 md:py-20" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <Label>Kenapa GPP?</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Benefit yang nyata untuk kamu
              </h2>
            </div>
          </Reveal>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(120,37,124,0.12)" }}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6"
                style={{ border: "1.5px solid #f0e8f8", boxShadow: "0 2px 10px rgba(120,37,124,0.05)" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}>
                  {b.icon}
                </div>
                <div className="text-[14px] font-extrabold text-[#1a1a1a]">{b.title}</div>
                <div className="text-[12px] leading-relaxed text-[#666]">{b.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 4. TIERS ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Kalkulasi Profit</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Berapa yang bisa kamu hasilkan?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-[#666]">
                Berapa yang bisa namima suda belamu me anpai bisa kun son hot dan yang kamu, just lud xlan kamu profit yang dehigelt.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            {tiers.map((t) => (
              <motion.div
                key={t.level}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}
                className={`relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 transition-shadow ${t.featured ? "ring-2 ring-[#78257C]" : ""}`}
                style={{
                  background: t.featured ? "linear-gradient(160deg, #2d0a5e 0%, #78257C 100%)" : "#FDFAFF",
                  border: t.featured ? "none" : "1.5px solid #f0e8f8",
                  boxShadow: t.featured ? "0 12px 40px rgba(120,37,124,0.30)" : "0 2px 10px rgba(120,37,124,0.05)",
                }}
              >
                {t.featured && (
                  <div className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    POPULAR
                  </div>
                )}
                {/* Level badge */}
                <div
                  className="self-start rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white"
                  style={{ background: t.grad }}
                >
                  {t.level}
                </div>

                {/* Laba */}
                <div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wide ${t.featured ? "text-white/60" : "text-[#999]"}`}>
                    Potensi Laba:
                  </div>
                  <div className={`mt-0.5 text-2xl font-extrabold ${t.featured ? "text-white" : "text-[#1a1a1a]"}`}>
                    {t.laba}
                  </div>
                </div>

                {/* Perks */}
                <div>
                  <div className={`mb-2 text-[11px] font-bold ${t.featured ? "text-white/70" : "text-[#999]"}`}>{t.label}</div>
                  <ul className="flex flex-col gap-2">
                    {t.perks.map((p) => (
                      <li key={p} className={`flex items-start gap-2 text-[13px] font-medium ${t.featured ? "text-white/90" : "text-[#444]"}`}>
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke={t.featured ? "#fff" : "#78257C"} strokeWidth={2.5} viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                  href="/reseller/register"
                  className="mt-auto block rounded-xl py-2.5 text-center text-[13px] font-bold transition hover:opacity-90"
                  style={
                    t.featured
                      ? { background: "#fff", color: "#78257C" }
                      : { background: t.grad, color: "#fff" }
                  }
                >
                  {t.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 5. HOW IT WORKS ══ */}
      <section className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Cara Gabung</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                4 langkah yang jelas dan mudah
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-8 sm:grid-cols-2 md:grid-cols-4"
          >
            {steps.map((s, i) => (
              <motion.div key={s.n} variants={fadeUp} className="relative flex flex-col items-center text-center gap-4">
                {/* connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-7 hidden h-px md:block"
                    style={{ right: "-50%", background: "linear-gradient(90deg, #be3ab4 0%, transparent 100%)", opacity: 0.25 }}
                  />
                )}
                <div
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-white text-lg font-extrabold shadow-lg"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {i > 0 && (
                    <svg className="absolute -left-1 -top-1 h-5 w-5" fill="#be3ab4" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {s.n}
                </div>
                <div className="text-[15px] font-extrabold text-[#1a1a1a]">{s.title}</div>
                <div className="text-[13px] leading-relaxed text-[#666]">{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 6. PRODUCTS ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Produk yang Kamu Jual</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Skincare berkualitas, mudah dijual
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[#666]">
                yang yaun 1 napeet atiler yang yang samati.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            {products.map((p) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(120,37,124,0.14)" }}
                className="overflow-hidden rounded-2xl bg-white"
                style={{ border: "1.5px solid #f0e8f8", boxShadow: "0 2px 10px rgba(120,37,124,0.06)" }}
              >
                <div className="relative aspect-square bg-[#fdf5ff]">
                  <Image src={p.img} alt={p.name} fill className="object-contain p-6" sizes="300px" />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white"
                    style={{ background: p.badge }}
                  >
                    {p.tag}
                  </span>
                </div>
                <div className="p-4">
                  <div className="text-[13px] font-extrabold text-[#1a1a1a]">{p.name}</div>
                  <div className="mt-2 flex gap-1.5">
                    {["BPOM RI", "Halal", "Cruelty Free"].map((b) => (
                      <span key={b} className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "#fdf5ff", color: "#78257C", border: "1px solid #e9d5f0" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 7. REWARDS ══ */}
      <section className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Program Reward</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Semakin aktif, semakin banyak reward
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Featured reward card */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col justify-between rounded-2xl p-7 text-white"
              style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 100%)", boxShadow: "0 12px 40px rgba(120,37,124,0.30)" }}
            >
              <div>
                <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  TOP PARTNER
                </span>
                <h3 className="mt-4 text-[22px] font-extrabold leading-snug">Top Partner Rewards</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                  Semakin aktif kerjasama yang semakin banyak reward.
                </p>
              </div>
              <ul className="mt-6 flex flex-col gap-2">
                {["Top Nama Partner", "Top Partner Partner", "Top Partner Partner"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] font-medium text-white/90">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-white/10 p-3 text-[12px] text-white/60">
                Kemeriaan dampak digital support bisection-nanper
              </div>
            </motion.div>

            {/* Right column — 2 stacked reward cards */}
            <div className="flex flex-col gap-5">
              {[
                {
                  items: ["Bromi Grown Commit", "Benatr Fronell", "Business Coaching"],
                  note: "Persuntan taxersitsit oruan dali support catation nageon",
                },
                {
                  items: ["Long immobisulan dagam balong bisasim", "Lang parkasisam talangu inkep agami"],
                  note: "Lang immobisulan dagam balong masidangan tilami some dali persunpanya agami",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-6"
                  style={{ border: "1.5px solid #f0e8f8", boxShadow: "0 2px 10px rgba(120,37,124,0.05)" }}
                >
                  <span className="self-start rounded-full border border-[#e0c8f0] bg-[#fdf5ff] px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#78257C" }}>
                    TOP PARTNER
                  </span>
                  <ul className="flex flex-col gap-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] font-medium text-[#444]">
                        <Check />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl bg-[#fdf5ff] p-3 text-[12px] leading-relaxed text-[#5a2560]">
                    {card.note}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ 8. ECOSYSTEM ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">
            {/* Left */}
            <Reveal>
              <Label>Ekosistem Dukungan</Label>
              <h2 className="mt-2 text-2xl font-extrabold leading-snug text-[#1a1a1a] md:text-3xl">
                Ekosistem kamu mutul mal nol
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-[#666]">
                Karvu ipsum dolor sit amet, consecuttur adipiscing audim dalingunyaneswetan nel.
              </p>
            </Reveal>

            {/* Right — 2-column bullet grid */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
              className="grid gap-5 sm:grid-cols-2"
            >
              {ecosystem.map((e) => (
                <motion.div key={e.title} variants={fadeUp} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{e.icon}</span>
                    <div className="text-[13px] font-extrabold text-[#1a1a1a]">{e.title}</div>
                  </div>
                  <div className="text-[12px] leading-relaxed text-[#888]">{e.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 9. TESTIMONIALS ══ */}
      <section className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12">
              <Label>Cerita Partner</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Cerita Partner mereka sudah,{" "}
                <span style={{ color: "#78257C" }}>mumu kapan?</span>
              </h2>
              <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#666]">
                Karvu toca ipsum dolor sit amet, adipiscing audim dalingunyam yang god biern morer.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-2"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6"
                style={{
                  border: "1.5px solid #f0e8f8",
                  boxShadow: "0 2px 10px rgba(120,37,124,0.06)",
                  opacity: i === 1 ? 0.55 : 1,
                }}
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} className="h-4 w-4" fill={t.stars > 0 ? "#be3ab4" : "#e0e0e0"} viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-[13px] italic leading-relaxed text-[#555]">{t.text}</p>
                <div className="flex items-center gap-3 border-t pt-4" style={{ borderColor: "#f0e8f8" }}>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-extrabold text-[#1a1a1a]">{t.name}</div>
                    <div className="text-[11px] text-[#888]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 10. FINAL CTA ══ */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 55%, #be3ab4 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="relative mx-auto max-w-xl px-5 text-center">
          <Reveal>
            <span className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              Slot Partner Terbuka
            </span>
            <h2 className="mb-4 text-2xl font-extrabold text-white md:text-4xl">
              Ini peluang yang masuk akal untuk dimulai hari ini
            </h2>
            <p className="mb-8 text-[14px] leading-relaxed text-white/80">
              Gampang dimulai. Sudah ada sistemnya. Dan ada tim yang bantu dari awal sampai kamu bisa jalan sendiri.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/reseller/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-8 py-3.5 text-[14px] font-extrabold shadow-lg transition"
                  style={{ color: "#78257C" }}
                >
                  Daftar Sekarang — Gratis
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Chat WhatsApp
                </a>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FLOATING JOIN NOW ══ */}
      <motion.a
        href="/reseller/register"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-extrabold text-white shadow-2xl"
        style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)", boxShadow: "0 8px 32px rgba(120,37,124,0.45)" }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        Join Now
      </motion.a>

    </div>
  );
}
