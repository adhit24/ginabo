"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// ── Animation presets ─────────────────────────────────────────────────────────
const EASE = [0.25, 1, 0.5, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } } }}
    >
      {children}
    </motion.div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Margin Lebar",
    desc: "Harga khusus partner yang memungkinkan keuntungan lebih optimal dari setiap produk yang kamu jual.",
    highlight: "Profit per produk mulai Rp 15.000",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Reward Penjualan",
    desc: "Program challenge dan insentif bulanan, quartal, dan tahunan untuk mendorong performa terbaik kamu.",
    highlight: "Bonus, voucher & hadiah eksklusif",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: "Bimbingan & Training",
    desc: "Product knowledge dan basic selling untuk bantu kamu closing lebih mudah. Tidak perlu pengalaman sebelumnya.",
    highlight: "Dibimbing sampai bisa jualan",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Free Sample & Support",
    desc: "Mendukung trial dan aktivitas penjualan harian. Materi promosi siap pakai agar kamu tidak mulai dari nol.",
    highlight: "Tools promosi & support rutin",
  },
];

const problems = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    text: "Bingung mau mulai bisnis dari mana",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    text: "Takut produknya tidak laku",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /><line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    ),
    text: "Tidak punya sistem atau pengalaman jualan",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" />
      </svg>
    ),
    text: "Jualan sendirian tanpa support",
  },
];

const profitRows = [
  { product: "GlowAge Multi-Active Serum",    marketplace: "285.000", reseller: "220.000", profit: "65.000" },
  { product: "Bright & Care Moisture Cream",  marketplace: "195.000", reseller: "155.000", profit: "40.000" },
  { product: "Hydra Moist Gel Ultimate",      marketplace: "215.000", reseller: "165.000", profit: "50.000" },
];

const steps = [
  { step: "01", title: "Daftar jadi partner", desc: "Isi form singkat. Tim Ginabo akan verifikasi dan follow up dalam 1×24 jam." },
  { step: "02", title: "Dapat harga khusus",  desc: "Akses harga partner dan katalog lengkap setelah onboarding selesai." },
  { step: "03", title: "Mulai jualan",        desc: "Gunakan materi promosi siap pakai dan panduan yang kami sediakan." },
  { step: "04", title: "Profit & reward",     desc: "Terima margin dari setiap penjualan plus reward performa dari sistem kami." },
];

const marketingSupport = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: "Sport & Healthy Campaign",
    desc: "Aktivasi di event sepeda dan komunitas aktif. Trial produk langsung ke market.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Campus Activation",
    desc: "Ekspansi ke market mahasiswa. Rekrut KOL & affiliate untuk jangkauan lebih luas.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Website & Landing Page",
    desc: "Pusat informasi resmi dan konten edukasi yang membantu proses closing.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "WhatsApp Closing System",
    desc: "Sistem komunikasi langsung dengan customer untuk closing yang lebih efektif.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "SEO & Marketplace",
    desc: "Kehadiran di platform digital untuk memperkuat brand dan mendorong penjualan organik.",
  },
];

const rewards = [
  {
    period: "Bulanan",
    items: ["Top Sales Partner", "Top Growth Partner", "Top Recruit Partner"],
    note: "Bonus produk, voucher, saldo, materi promosi eksklusif, support konten & ads",
  },
  {
    period: "Quartal",
    items: ["Bonus Omzet Quartal", "Gift Eksklusif", "Business Coaching"],
    note: "Akselerasi kenaikan level dan akses program spesial",
  },
  {
    period: "Tahunan",
    items: ["Hadiah Performa Nasional"],
    note: "Berdasarkan pencapaian dan target perusahaan selama setahun",
  },
];

const testimonials = [
  {
    name: "Siti R.", role: "Reseller, Surabaya",
    text: "Awalnya takut karena belum pernah jualan online. Ternyata ada panduan dan tim yang bantu. Sekarang sudah bisa tutup 20+ pesanan per bulan.",
    since: "Partner sejak 4 bulan",
  },
  {
    name: "Dian M.", role: "Stockist, Jakarta",
    text: "Produknya mudah dijual karena kualitasnya memang bagus. Customer sering repeat order sendiri. Margin-nya juga cukup untuk jadi income sampingan yang jalan.",
    since: "Partner sejak 7 bulan",
  },
  {
    name: "Nanda P.", role: "Reseller, Bandung",
    text: "Yang paling aku suka itu support materialnya. Nggak perlu buat konten dari nol. Tinggal pakai yang sudah disediakan dan sesuaikan.",
    since: "Partner sejak 3 bulan",
  },
];

function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung sebagai partner reseller. Boleh info lebih lanjut tentang Ginabo Partner Program?";
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// ── Section label ─────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "#be3ab4" }}>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResellerProgramPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ══ 1. HERO ══ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 55%, #be3ab4 100%)", minHeight: 440 }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: "#be3ab4" }} />
        <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full opacity-15 blur-3xl" style={{ background: "#78257C" }} />

        <div className="relative mx-auto grid min-h-[440px] max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center md:text-left"
          >
            <motion.span
              variants={fadeUp}
              className="mb-5 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur"
            >
              Ginabo Partner Program
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-3xl font-extrabold leading-tight text-white md:text-[2.8rem]"
            >
              Glowing Bareng.{" "}
              <span className="italic font-light opacity-90">Growing Bareng.</span>{" "}✨
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-3 text-base font-semibold tracking-wide text-white/75">
              Ginabo → Stockist → Customer
            </motion.p>
            <motion.p variants={fadeUp} className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
              Bangun bisnis skincare bersama Ginabo dan raih pelanggan pertamamu lebih cepat.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                href="/reseller/register"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-extrabold shadow-lg transition hover:scale-105 hover:shadow-xl"
                style={{ color: "#78257C" }}
              >
                Gabung Menjadi Stockist
              </Link>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.557 4.118 1.529 5.845L.057 23.486l5.784-1.517A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.673-.502-5.21-1.382l-.374-.22-3.434.9.916-3.346-.243-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Tanya via WhatsApp
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap justify-center gap-5 md:justify-start">
              {["Modal ringan", "Margin jelas", "Dibimbing dari awal"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeRight}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/resellerprogram.png"
                  alt="Ginabo Partner Program"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width:768px) 90vw, 380px"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(45,10,94,0.75) 0%, transparent 55%)" }} />
                <div
                  className="absolute bottom-5 left-5 right-5 rounded-2xl p-4 text-white backdrop-blur-sm"
                  style={{ background: "rgba(120,37,124,0.75)", border: "1.5px solid rgba(255,255,255,0.2)" }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">Contoh profit sederhana</div>
                  <div className="mt-1 text-lg font-extrabold">10 produk / bulan</div>
                  <div className="mt-0.5 text-sm text-white/85">≈ Rp 500.000 profit bersih</div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="absolute -right-4 top-6 rounded-2xl px-4 py-2.5 text-center shadow-xl"
              style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)", border: "2px solid rgba(255,255,255,0.3)" }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-white/80">Join sekarang</div>
              <div className="text-base font-extrabold text-white">GRATIS</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ 2. PROBLEM ══ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <div className="mb-10 text-center">
              <Label>Kamu Pernah Merasa Ini?</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                Bukan salahmu. Sistemnya yang belum ada.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#666]">
                Banyak orang mau mulai bisnis tapi berhenti di langkah awal. Bukan karena tidak mampu, tapi karena tidak ada support yang tepat.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-4"
          >
            {problems.map((p) => (
              <motion.div
                key={p.text}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(120,37,124,0.12)" }}
                className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center transition-shadow"
                style={{ border: "1.5px solid #f3e8ff", boxShadow: "0 2px 12px rgba(120,37,124,0.06)" }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#fdf5ff", color: "#78257C" }}>
                  {p.icon}
                </div>
                <span className="text-sm font-semibold leading-snug text-[#3d3550]">{p.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.2}>
            <div
              className="mt-10 rounded-3xl p-6 text-center md:p-8"
              style={{ background: "linear-gradient(135deg, #fdf5ff, #f9f0ff)", border: "1.5px solid #e9d5f0" }}
            >
              <div className="text-base font-extrabold md:text-lg" style={{ color: "#78257C" }}>
                Ginabo Partner Program hadir untuk menyelesaikan semua itu.
              </div>
              <p className="mt-2 text-sm text-[#5a2560]">
                Sistem sudah ada. Produk sudah ada. Yang kami butuhkan hanya semangat kamu untuk mulai.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 3. BENEFITS ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Kenapa GPP?</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                Benefit yang nyata untuk kamu
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(120,37,124,0.14)" }}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 transition-shadow"
                style={{ border: "1.5px solid #f3e8ff", boxShadow: "0 2px 12px rgba(120,37,124,0.06)" }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {b.icon}
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#2a2a2a]">{b.title}</div>
                  <div className="mt-2 text-xs leading-relaxed text-[#666]">{b.desc}</div>
                </div>
                <div
                  className="mt-auto rounded-xl px-3 py-2 text-xs font-bold"
                  style={{ background: "#fdf5ff", color: "#78257C" }}
                >
                  {b.highlight}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 4. PROFIT SIMULATION ══ */}
      <section className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <div className="mb-10 text-center">
              <Label>Kalkulasi Profit</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                Berapa yang bisa kamu hasilkan?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#666]">
                Contoh sederhana berdasarkan struktur harga partner. Semakin banyak yang kamu jual, semakin besar profit yang didapat.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
              style={{ border: "1.5px solid #f3e8ff" }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-left text-sm text-[#3d3550]">
                  <thead style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}>
                    <tr className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                      <th className="px-5 py-4">Produk</th>
                      <th className="px-5 py-4">Harga Marketplace</th>
                      <th className="px-5 py-4">Harga Partner</th>
                      <th className="px-5 py-4" style={{ color: "#fdd5f8" }}>Profit Kamu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitRows.map((row, i) => (
                      <tr key={row.product} className={i % 2 === 0 ? "bg-white" : "bg-[#fdf5ff]/60"}>
                        <td className="px-5 py-4 font-semibold text-[#2a2a2a]">{row.product}</td>
                        <td className="px-5 py-4 text-[#666]">Rp {row.marketplace}</td>
                        <td className="px-5 py-4 text-[#666]">Rp {row.reseller}</td>
                        <td className="px-5 py-4 font-extrabold" style={{ color: "#78257C" }}>Rp {row.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t p-5" style={{ borderColor: "#f3e8ff", background: "#fdf5ff" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#5a2560]">
                    * Harga final mengikuti katalog resmi terbaru.
                  </div>
                  <div className="text-sm font-extrabold" style={{ color: "#78257C" }}>
                    Jual 20 produk/bulan = ±Rp 1.000.000 profit bersih
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-6 grid gap-4 sm:grid-cols-3"
          >
            {[
              { qty: "10 produk / bulan", est: "±Rp 500.000",   label: "Income sampingan" },
              { qty: "30 produk / bulan", est: "±Rp 1.500.000", label: "Income yang konsisten" },
              { qty: "50+ produk / bulan", est: "±Rp 2.500.000+", label: "Bisnis yang berkembang" },
            ].map((c) => (
              <motion.div
                key={c.qty}
                variants={fadeUp}
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl p-5 text-center transition"
                style={{ background: "linear-gradient(135deg, #fdf5ff, #f9f0ff)", border: "1.5px solid #e9d5f0" }}
              >
                <div className="text-xs font-semibold text-[#5a2560]">{c.qty}</div>
                <div className="mt-1 text-xl font-extrabold" style={{ color: "#78257C" }}>{c.est}</div>
                <div className="mt-0.5 text-[11px] text-[#5a2560]">{c.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 5. HOW IT WORKS ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Cara Gabung</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                4 langkah yang jelas dan mudah
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid gap-8 sm:grid-cols-2 md:grid-cols-4"
          >
            {steps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} className="relative flex flex-col gap-3">
                {i < steps.length - 1 && (
                  <div
                    className="absolute left-8 top-8 hidden h-px md:block"
                    style={{ right: "-50%", background: "linear-gradient(90deg, #be3ab4 0%, transparent 100%)", opacity: 0.3 }}
                  />
                )}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -3 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  <span className="text-xl font-extrabold">{s.step}</span>
                </motion.div>
                <div className="text-base font-extrabold text-[#2a2a2a]">{s.title}</div>
                <div className="text-sm leading-relaxed text-[#666]">{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 6. PRODUCT PREVIEW ══ */}
      <section className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Produk yang Kamu Jual</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                Skincare berkualitas, mudah dijual
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#666]">
                Produk Ginabo sudah BPOM, Halal, dan terbukti disukai pelanggan. Customer yang puas = repeat order yang jalan sendiri.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            {[
              { name: "GlowAge Multi-Active Serum",   desc: "Brightening + Anti-aging + Hidrasi. Serum unggulan dengan formula riset 2 tahun.",              img: "/product-serum-bg.png",  tags: ["BESTSELLER", "Rating 4.9"] },
              { name: "Bright & Care Moisture Cream", desc: "Barrier repair + hidrasi + brightening support. Cream harian yang mudah direkomendasikan.",       img: "/product-cream-bg.png",  tags: ["FAVORITE",   "Rating 4.8"] },
              { name: "Hydra Moist Gel Ultimate",     desc: "3-in-1: moisturizer, makeup prep, sleeping mask. Nilai lebih untuk customer, closing lebih mudah.", img: "/product-dna-bg.png",   tags: ["MULTIFUNGSI", "Rating 4.9"] },
            ].map((p) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(120,37,124,0.14)" }}
                className="overflow-hidden rounded-3xl bg-white transition-shadow"
                style={{ border: "1.5px solid #f3e8ff", boxShadow: "0 2px 12px rgba(120,37,124,0.06)" }}
              >
                <div className="relative aspect-[4/3]">
                  <Image src={p.img} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 340px" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(45,10,94,0.35), transparent 60%)" }} />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                        style={{ background: "rgba(120,37,124,0.85)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-sm font-extrabold text-[#2a2a2a]">{p.name}</div>
                  <div className="mt-2 text-xs leading-relaxed text-[#666]">{p.desc}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["BPOM RI", "Halal", "Cruelty Free"].map((b) => (
                      <span
                        key={b}
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                        style={{ background: "#fdf5ff", color: "#78257C", border: "1px solid #e9d5f0" }}
                      >
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

      {/* ══ 7. REWARD SYSTEM ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Program Reward</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                Semakin aktif, semakin banyak reward
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            {rewards.map((r) => (
              <motion.div
                key={r.period}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="flex flex-col gap-4 rounded-3xl p-6"
                style={{ background: "#FDFAFF", border: "1.5px solid #f3e8ff", boxShadow: "0 2px 12px rgba(120,37,124,0.05)" }}
              >
                <div
                  className="inline-flex self-start rounded-xl px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-white"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {r.period}
                </div>
                <ul className="flex flex-col gap-2">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-semibold text-[#2a2a2a]">
                      <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="#be3ab4" strokeWidth={2.5} viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div
                  className="mt-auto rounded-2xl p-3 text-xs leading-relaxed"
                  style={{ background: "#fdf5ff", color: "#5a2560" }}
                >
                  {r.note}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 8. MARKETING SUPPORT ══ */}
      <section className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Ekosistem Dukungan</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                Kamu tidak mulai dari nol
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#666]">
                Ginabo membangun ekosistem pemasaran yang membantu partner mendapatkan lebih banyak exposure dan kepercayaan dari customer.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2"
          >
            {marketingSupport.map((m, i) => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className={`flex gap-4 rounded-3xl bg-white p-6 transition ${i === 4 ? "sm:col-span-2 md:col-span-1" : ""}`}
                style={{ border: "1.5px solid #f3e8ff", boxShadow: "0 2px 12px rgba(120,37,124,0.05)" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {m.icon}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#2a2a2a]">{m.title}</div>
                  <div className="mt-1 text-xs leading-relaxed text-[#666]">{m.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 9. TESTIMONIALS ══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <Label>Cerita Partner</Label>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">
                Mereka sudah memulai, kamu kapan?
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(120,37,124,0.12)" }}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 transition-shadow"
                style={{ border: "1.5px solid #f3e8ff", boxShadow: "0 2px 12px rgba(120,37,124,0.06)" }}
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4" fill="#be3ab4" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-[#555]">"{t.text}"</p>
                <div className="mt-auto flex items-center gap-3 border-t pt-4" style={{ borderColor: "#f3e8ff" }}>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#2a2a2a]">{t.name}</div>
                    <div className="text-[11px] text-[#5a2560]">{t.role}</div>
                  </div>
                  <div className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "#be3ab4" }}>
                    {t.since}
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
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "#be3ab4" }} />

        <div className="relative mx-auto max-w-xl px-5 text-center">
          <Reveal>
            <span className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              Slot Partner Terbuka
            </span>
            <h2 className="mb-4 text-2xl font-extrabold text-white md:text-4xl">
              Ini peluang yang masuk akal untuk dimulai hari ini
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-white/80">
              Gampang dimulai. Sudah ada sistemnya. Dan ada tim yang bantu dari awal sampai kamu bisa jalan sendiri.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/reseller/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold shadow-lg transition"
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.557 4.118 1.529 5.845L.057 23.486l5.784-1.517A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.673-.502-5.21-1.382l-.374-.22-3.434.9.916-3.346-.243-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Chat WhatsApp
                </a>
              </motion.div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-white/70">
              {["Tidak ada biaya daftar", "Support dari awal", "Produk BPOM & Halal"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
