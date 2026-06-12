"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// ─── MOTION TOKENS ────────────────────────────────────────────────────────────
const EASE = [0.25, 1, 0.5, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.52, ease: EASE, delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "#be3ab4" }}>
      {children}
    </p>
  );
}

function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung sebagai partner reseller. Boleh info lebih lanjut?";
  return `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
}

// ─── SVG ICON COMPONENTS ─────────────────────────────────────────────────────
const icons = {
  money: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  confused: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M8 15s1.5-2 4-2 4 2 4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  noSignal: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.56 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  alone: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  margin: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  star: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  graduation: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  gift: (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  sports: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  zap: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  globe: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  chat: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

const problems = [
  { icon: icons.money,    text: "Modal besar tapi tidak tahu produknya laku atau tidak" },
  { icon: icons.confused, text: "Bingung mulai bisnis dari mana" },
  { icon: icons.noSignal, text: "Tidak punya sistem atau pengalaman jualan online" },
  { icon: icons.alone,    text: "Jualan sendirian tanpa support tim" },
];

const benefits = [
  { icon: icons.margin,     title: "Margin Lebar",          desc: "Harga khusus partner yang memungkinkan keuntungan optimal dari setiap produk yang kamu jual." },
  { icon: icons.star,       title: "Reward Penjualan",      desc: "Program challenge dan insentif bulanan, quartal, dan tahunan untuk performa terbaikmu." },
  { icon: icons.graduation, title: "Bimbingan & Training",  desc: "Product knowledge dan basic selling untuk bantu kamu closing lebih mudah. Tanpa pengalaman sekalipun." },
  { icon: icons.gift,       title: "Free Sample & Support", desc: "Materi promosi siap pakai dan support rutin agar kamu tidak mulai dari nol." },
];

const tiers = [
  {
    level: "BRONZE PARTNER",
    bg: "#f8f4ef",
    borderColor: "#d8b48a",
    laba: "Rp 3.500.000+",
    grad: "linear-gradient(135deg, #CD7F32, #e8a853)",
    perks: ["Akses harga partner Bronze", "Materi promosi digital", "Dukungan onboarding awal"],
    cta: "Mulai Sekarang",
    featured: false,
  },
  {
    level: "SILVER PARTNER",
    bg: "linear-gradient(160deg, #2d0a5e 0%, #78257C 100%)",
    borderColor: "transparent",
    laba: "Rp 10.000.000+",
    grad: "linear-gradient(135deg, #78257C, #be3ab4)",
    perks: ["Semua benefit Bronze", "Training penjualan lanjutan", "Priority support & coaching"],
    cta: "Gabung Sekarang",
    featured: true,
  },
  {
    level: "GOLD PARTNER",
    bg: "#fdf9ed",
    borderColor: "#d4a017",
    laba: "Rp 25.000.000+",
    grad: "linear-gradient(135deg, #B8860B, #f5c518)",
    perks: ["Semua benefit Silver", "Business coaching eksklusif", "Akses program reward terbesar", "Early access produk baru"],
    cta: "Gabung Sekarang",
    featured: false,
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

const ecosystem = [
  { icon: icons.sports, title: "Sports & Campus Marketing", desc: "Aktivasi komunitas kampus dan olahraga sebagai jalur distribusi organik yang autentik." },
  { icon: icons.zap,    title: "Energy Activation",         desc: "Event offline dan online yang mendukung penjualan kamu di berbagai kanal." },
  { icon: icons.globe,  title: "Website & Landing Page",    desc: "Infrastruktur digital yang bantu kamu closing lebih profesional." },
  { icon: icons.chat,   title: "Community & Content",       desc: "Konten siap pakai dan grup komunitas partner aktif untuk sharing strategi." },
];

const testimonials = [
  {
    name: "Aisyah R.",
    role: "Partner Ginabo, Surabaya",
    stars: 5,
    text: "\"Awalnya saya skeptis, tapi ternyata sistem partnernya sangat membantu. Dalam 2 bulan sudah balik modal dan mulai untung konsisten. Support tim-nya responsif banget!\"",
  },
  {
    name: "Rizky A.",
    role: "Partner Ginabo, Bandung",
    stars: 5,
    text: "\"Suka banget karena ada training dan materi promonya lengkap. Tidak perlu bingung cara jual — tinggal follow sistemnya dan hasilnya sudah terasa.\"",
  },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ResellerProgramPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section aria-label="Hero" className="relative overflow-hidden" style={{ background: "#f8f4f0" }}>
        <div className="mx-auto grid max-w-6xl min-h-[480px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24 lg:gap-16">
          {/* Left */}
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeUp}
              className="mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
              style={{ background: "#78257C" }}
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
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-md text-[15px] leading-relaxed"
              style={{ color: "#595959" }}
            >
              Bangun bisnis skincare yang menguntungkan bersama Ginabo. Sistem sudah ada, kamu tinggal jalan.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/reseller/register"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-7 py-3 text-[14px] font-extrabold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78257C]"
                style={{ background: "#78257C" }}
              >
                Bangga Bareng — Daftar Gratis
              </Link>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-7 py-3 text-[14px] font-bold transition hover:bg-[#f5eeff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78257C]"
                style={{ borderColor: "#e0d0f0", color: "#78257C" }}
              >
                {icons.whatsapp}
                Tanya via WA
              </a>
            </motion.div>
          </motion.div>

          {/* Right — product image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.15 }}
            className="flex justify-center"
          >
            <Image
              src="/resellerprogram.png"
              alt="Produk-produk Ginabo Partner Program"
              width={520}
              height={420}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* ══ 2. PROBLEM ═══════════════════════════════════════════════════════ */}
      <section aria-labelledby="problem-heading" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <SectionLabel>Kamu Pernah Merasa Ini?</SectionLabel>
              <h2 id="problem-heading" className="mt-2 text-2xl font-extrabold leading-snug text-[#1a1a1a] md:text-3xl">
                Bukan salahmu. Sistemnya yang belum ada.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#595959" }}>
                Kebanyakan orang gagal bisnis bukan karena tidak mau kerja keras — tapi karena tidak ada yang tunjukkan jalan dan sistemnya.
              </p>
            </Reveal>

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
                  className="flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{ background: "#FDFAFF", border: "1.5px solid #ede0f8" }}
                >
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                  >
                    {p.icon}
                  </span>
                  <span className="text-[14px] font-semibold" style={{ color: "#3d3550" }}>{p.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 3. BENEFITS ══════════════════════════════════════════════════════ */}
      <section aria-labelledby="benefits-heading" className="py-16 md:py-20" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <SectionLabel>Kenapa GPP?</SectionLabel>
              <h2 id="benefits-heading" className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Benefit yang nyata untuk kamu
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
            role="list"
          >
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(120,37,124,0.12)" }}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6"
                style={{ border: "1.5px solid #ede0f8", boxShadow: "0 2px 10px rgba(120,37,124,0.05)" }}
                role="listitem"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {b.icon}
                </div>
                <h3 className="text-[14px] font-extrabold text-[#1a1a1a]">{b.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#595959" }}>{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 4. TIERS ═════════════════════════════════════════════════════════ */}
      <section aria-labelledby="tiers-heading" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <SectionLabel>Kalkulasi Profit</SectionLabel>
              <h2 id="tiers-heading" className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Berapa yang bisa kamu hasilkan?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed" style={{ color: "#595959" }}>
                Pilih tier yang sesuai targetmu. Semakin aktif, semakin besar potensi yang bisa kamu raih.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            {tiers.map((t) => (
              <motion.article
                key={t.level}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: t.featured ? "0 28px 56px rgba(120,37,124,0.35)" : "0 20px 40px rgba(0,0,0,0.10)" }}
                className={`relative flex flex-col gap-5 overflow-hidden rounded-2xl p-6 transition-shadow ${t.featured ? "ring-2 ring-[#78257C]" : ""}`}
                style={{
                  background: t.bg,
                  border: t.featured ? "none" : `1.5px solid ${t.borderColor}`,
                  boxShadow: t.featured ? "0 12px 40px rgba(120,37,124,0.30)" : "0 2px 10px rgba(120,37,124,0.05)",
                }}
              >
                {t.featured && (
                  <div className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                    POPULAR
                  </div>
                )}

                <div
                  className="self-start rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white"
                  style={{ background: t.grad }}
                >
                  {t.level}
                </div>

                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${t.featured ? "text-white/70" : "text-[#767676]"}`}>
                    Potensi Laba:
                  </p>
                  <p className={`mt-0.5 text-[26px] font-extrabold leading-tight ${t.featured ? "text-white" : "text-[#1a1a1a]"}`}>
                    {t.laba}
                  </p>
                </div>

                <ul className="flex flex-col gap-2">
                  {t.perks.map((p) => (
                    <li key={p} className={`flex items-start gap-2 text-[13px] font-medium ${t.featured ? "text-white/90" : "text-[#444]"}`}>
                      <span style={{ color: t.featured ? "#fff" : "#78257C" }}>{icons.check}</span>
                      {p}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/reseller/register"
                  className="mt-auto block min-h-[44px] rounded-xl py-3 text-center text-[13px] font-bold transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={t.featured ? { background: "#fff", color: "#78257C" } : { background: t.grad, color: "#fff" }}
                >
                  {t.cta}
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 5. HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section aria-labelledby="steps-heading" className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <SectionLabel>Cara Gabung</SectionLabel>
              <h2 id="steps-heading" className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                4 langkah yang jelas dan mudah
              </h2>
            </div>
          </Reveal>

          <motion.ol
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-8 sm:grid-cols-2 md:grid-cols-4"
          >
            {steps.map((s, i) => (
              <motion.li key={s.n} variants={fadeUp} className="relative flex flex-col items-center text-center gap-4">
                {i < steps.length - 1 && (
                  <div
                    className="absolute left-[calc(50%+28px)] top-7 hidden h-px w-[calc(100%-56px)] md:block"
                    style={{ background: "linear-gradient(90deg, #be3ab4 0%, transparent 100%)", opacity: 0.25 }}
                    aria-hidden="true"
                  />
                )}
                <div
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {s.n}
                </div>
                <h3 className="text-[15px] font-extrabold text-[#1a1a1a]">{s.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#595959" }}>{s.desc}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ══ 6. PRODUCTS ══════════════════════════════════════════════════════ */}
      <section aria-labelledby="products-heading" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <SectionLabel>Produk yang Kamu Jual</SectionLabel>
              <h2 id="products-heading" className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Skincare berkualitas, mudah dijual
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-3"
          >
            {products.map((p) => (
              <motion.article
                key={p.name}
                variants={fadeUp}
                whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(120,37,124,0.14)" }}
                className="overflow-hidden rounded-2xl bg-white"
                style={{ border: "1.5px solid #ede0f8", boxShadow: "0 2px 10px rgba(120,37,124,0.06)" }}
              >
                <div className="relative aspect-square bg-[#fdf5ff]">
                  <Image src={p.img} alt={p.name} fill className="object-contain p-6" sizes="(min-width: 768px) 33vw, 100vw" />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white"
                    style={{ background: p.badge }}
                  >
                    {p.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[13px] font-extrabold text-[#1a1a1a]">{p.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["BPOM RI", "Halal", "Cruelty Free"].map((b) => (
                      <span key={b} className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "#fdf5ff", color: "#78257C", border: "1px solid #e9d5f0" }}>
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

      {/* ══ 7. REWARDS ═══════════════════════════════════════════════════════ */}
      <section aria-labelledby="rewards-heading" className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <SectionLabel>Program Reward</SectionLabel>
              <h2 id="rewards-heading" className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Semakin aktif, semakin banyak reward
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-2"
          >
            <motion.div
              variants={fadeUp}
              className="flex flex-col justify-between rounded-2xl p-7 text-white"
              style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 100%)", boxShadow: "0 12px 40px rgba(120,37,124,0.30)" }}
            >
              <div>
                <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  REWARD TERATAS
                </span>
                <h3 className="mt-4 text-[22px] font-extrabold leading-snug">Top Partner Rewards</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/80">
                  Raih reward eksklusif dari performa penjualan terbaikmu setiap bulan, quartal, dan tahun.
                </p>
              </div>
              <ul className="mt-6 flex flex-col gap-2">
                {["Bonus tunai penjualan bulanan", "Liburan & experience reward", "Program sertifikasi partner"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] font-medium text-white/90">
                    <span className="text-white">{icons.check}</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-white/10 p-3 text-[12px] leading-relaxed text-white/70">
                Reward diumumkan setiap awal bulan melalui grup komunitas partner resmi.
              </div>
            </motion.div>

            <div className="flex flex-col gap-5">
              {[
                {
                  label: "REWARD BULANAN",
                  items: ["Bonus performa penjualan", "Komisi referral partner baru", "Voucher produk gratis"],
                  note: "Dihitung setiap akhir bulan berdasarkan total omzet dan aktivitas kamu.",
                },
                {
                  label: "REWARD QUARTAL",
                  items: ["Challenge quartal dengan hadiah menarik", "Trip partner eksklusif untuk tier Gold"],
                  note: "Top 10 partner aktif di setiap quartal mendapat hadiah spesial dari Ginabo.",
                },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  variants={fadeUp}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-6"
                  style={{ border: "1.5px solid #ede0f8", boxShadow: "0 2px 10px rgba(120,37,124,0.05)" }}
                >
                  <span
                    className="self-start rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "#78257C", background: "#fdf5ff", borderColor: "#e0c8f0" }}
                  >
                    {card.label}
                  </span>
                  <ul className="flex flex-col gap-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] font-medium text-[#444]">
                        <span style={{ color: "#78257C" }}>{icons.check}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-xl bg-[#fdf5ff] p-3 text-[12px] leading-relaxed" style={{ color: "#5a2560" }}>
                    {card.note}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ 8. ECOSYSTEM ═════════════════════════════════════════════════════ */}
      <section aria-labelledby="ecosystem-heading" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">
            <Reveal>
              <SectionLabel>Ekosistem Dukungan</SectionLabel>
              <h2 id="ecosystem-heading" className="mt-2 text-2xl font-extrabold leading-snug text-[#1a1a1a] md:text-3xl">
                Kamu tidak mulai dari nol
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#595959" }}>
                Ginabo menyediakan ekosistem lengkap agar kamu bisa fokus menjual — bukan sibuk membangun dari nol.
              </p>
            </Reveal>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
              className="grid gap-6 sm:grid-cols-2"
            >
              {ecosystem.map((e) => (
                <motion.div key={e.title} variants={fadeUp} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                    >
                      {e.icon}
                    </span>
                    <h3 className="text-[13px] font-extrabold text-[#1a1a1a]">{e.title}</h3>
                  </div>
                  <p className="ml-11 text-[12px] leading-relaxed" style={{ color: "#767676" }}>{e.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 9. TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section aria-labelledby="testimonials-heading" className="py-16 md:py-24" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-12">
              <SectionLabel>Cerita Partner</SectionLabel>
              <h2 id="testimonials-heading" className="mt-2 text-2xl font-extrabold text-[#1a1a1a] md:text-3xl">
                Mereka sudah memulai,{" "}
                <span style={{ color: "#78257C" }}>kamu kapan?</span>
              </h2>
            </div>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-5 md:grid-cols-2"
          >
            {testimonials.map((t) => (
              <motion.article
                key={t.name}
                variants={fadeUp}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6"
                style={{ border: "1.5px solid #ede0f8", boxShadow: "0 2px 10px rgba(120,37,124,0.06)" }}
              >
                <div className="flex gap-1" aria-label={`Rating ${t.stars} dari 5 bintang`}>
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} className="h-4 w-4" fill={si < t.stars ? "#be3ab4" : "#e0e0e0"} viewBox="0 0 24 24" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-[13px] italic leading-relaxed" style={{ color: "#595959" }}>{t.text}</blockquote>
                <footer className="flex items-center gap-3 border-t pt-4" style={{ borderColor: "#ede0f8" }}>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                    aria-hidden="true"
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <cite className="not-italic text-[13px] font-extrabold text-[#1a1a1a]">{t.name}</cite>
                    <p className="text-[11px]" style={{ color: "#767676" }}>{t.role}</p>
                  </div>
                </footer>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 10. FINAL CTA ════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="cta-heading"
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 55%, #be3ab4 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "44px 44px" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-xl px-5 text-center">
          <Reveal>
            <span className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              Slot Partner Terbuka
            </span>
            <h2 id="cta-heading" className="mb-4 text-2xl font-extrabold text-white md:text-4xl">
              Ini peluang yang masuk akal untuk dimulai hari ini
            </h2>
            <p className="mb-8 text-[14px] leading-relaxed text-white/80">
              Gampang dimulai. Sudah ada sistemnya. Dan ada tim yang bantu dari awal sampai kamu bisa jalan sendiri.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/reseller/register"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-[14px] font-extrabold shadow-lg transition hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  style={{ color: "#78257C" }}
                >
                  Daftar Sekarang — Gratis
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {icons.whatsapp}
                  Chat WhatsApp
                </a>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FLOATING JOIN NOW ════════════════════════════════════════════════ */}
      <motion.a
        href="/reseller/register"
        initial={{ opacity: 0, scale: 0.75, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 180, damping: 18 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-3 text-[13px] font-extrabold text-white shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78257C]"
        style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)", boxShadow: "0 8px 32px rgba(120,37,124,0.45)" }}
        aria-label="Daftar sebagai partner Ginabo"
      >
        {icons.arrowRight}
        Join Now
      </motion.a>

    </div>
  );
}
