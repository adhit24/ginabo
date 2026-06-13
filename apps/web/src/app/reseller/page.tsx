"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
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

function SectionLabel({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p
      className={`mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] ${center ? "justify-center" : ""}`}
      style={{ color: "#be3ab4" }}
    >
      <span className="inline-block h-px w-5" style={{ background: "#be3ab4" }} aria-hidden="true" />
      {children}
    </p>
  );
}

function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung sebagai partner reseller. Boleh info lebih lanjut?";
  return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
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

const stats = [
  { value: "40%", label: "Margin per produk" },
  { value: "500+", label: "Partner aktif" },
  { value: "1×24 jam", label: "Approval cepat" },
  { value: "Rp 0", label: "Biaya pendaftaran" },
];

const problems = [
  { icon: icons.money,    text: "Modal besar, tapi tidak yakin produknya laku" },
  { icon: icons.confused, text: "Bingung harus mulai jualan dari mana" },
  { icon: icons.noSignal, text: "Tidak punya sistem atau pengalaman online" },
  { icon: icons.alone,    text: "Jualan sendirian tanpa dukungan tim" },
];

const benefits = [
  { icon: icons.margin,     title: "Margin Lebar",          desc: "Harga khusus partner sampai 40% per produk. Untung jelas di setiap penjualan." },
  { icon: icons.star,       title: "Reward Penjualan",      desc: "Bonus & challenge tiap bulan, quartal, dan tahun untuk performa terbaikmu." },
  { icon: icons.graduation, title: "Training Gratis",       desc: "Product knowledge & teknik closing — bahkan kalau kamu belum pernah jualan." },
  { icon: icons.gift,       title: "Materi Siap Pakai",     desc: "Foto produk, caption, dan konten promosi siap posting. Kamu tinggal jual." },
];

const tiers = [
  {
    level: "BRONZE",
    bg: "#ffffff",
    borderColor: "#e8d5c0",
    laba: "Rp 3,5 jt",
    sub: "/bulan",
    grad: "linear-gradient(135deg, #CD7F32, #e8a853)",
    perks: ["Harga partner Bronze", "Materi promosi digital", "Onboarding awal"],
    cta: "Mulai dari Bronze",
    featured: false,
  },
  {
    level: "SILVER",
    bg: "linear-gradient(160deg, #2d0a5e 0%, #78257C 100%)",
    borderColor: "transparent",
    laba: "Rp 10 jt",
    sub: "/bulan",
    grad: "linear-gradient(135deg, #be3ab4, #e879f9)",
    perks: ["Semua benefit Bronze", "Training penjualan lanjutan", "Priority support & coaching"],
    cta: "Pilih Silver",
    featured: true,
  },
  {
    level: "GOLD",
    bg: "#ffffff",
    borderColor: "#ead49a",
    laba: "Rp 25 jt",
    sub: "/bulan",
    grad: "linear-gradient(135deg, #B8860B, #f5c518)",
    perks: ["Semua benefit Silver", "Business coaching eksklusif", "Reward terbesar", "Early access produk baru"],
    cta: "Naik ke Gold",
    featured: false,
  },
];

const steps = [
  { n: "1", title: "Daftar",   desc: "Isi form singkat. Verifikasi dalam 1×24 jam." },
  { n: "2", title: "Approval", desc: "Dapat harga partner & katalog lengkap." },
  { n: "3", title: "Jual",     desc: "Pakai materi promosi siap pakai dari kami." },
  { n: "4", title: "Profit",   desc: "Margin tiap penjualan plus reward performa." },
];

const products = [
  { name: "GlowAge Multi-Active Serum",   img: "/serumfix.png",  tag: "BESTSELLER", badge: "#78257C" },
  { name: "Bright & Care Moisture Cream", img: "/moistfix.png",  tag: "FAVORIT",    badge: "#be3ab4" },
  { name: "Hydra Moist Gel Ultimate",     img: "/salmonfix.png", tag: "BARU",       badge: "#2d0a5e" },
];

const ecosystem = [
  { icon: icons.sports, title: "Sports & Campus Marketing", desc: "Aktivasi komunitas kampus & olahraga sebagai jalur distribusi organik." },
  { icon: icons.zap,    title: "Energy Activation",         desc: "Event offline & online yang mendorong penjualanmu di berbagai kanal." },
  { icon: icons.globe,  title: "Website & Landing Page",    desc: "Infrastruktur digital yang bantu kamu closing lebih profesional." },
  { icon: icons.chat,   title: "Community & Content",       desc: "Konten siap pakai dan grup partner aktif untuk sharing strategi." },
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
    text: "Training dan materi promonya lengkap. Tidak perlu bingung cara jual — tinggal ikuti sistemnya, hasilnya langsung terasa.",
  },
];

// ─── REUSABLE ─────────────────────────────────────────────────────────────────

function SectionHeading({
  label,
  title,
  desc,
  center = true,
  id,
}: {
  label: string;
  title: React.ReactNode;
  desc?: string;
  center?: boolean;
  id?: string;
}) {
  return (
    <Reveal className={`mb-8 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <SectionLabel center={center}>{label}</SectionLabel>
      <h2 id={id} className="text-[22px] font-extrabold leading-tight text-[#1a1a1a] md:text-[28px]">
        {title}
      </h2>
      {desc && (
        <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: "#5a5560" }}>
          {desc}
        </p>
      )}
    </Reveal>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ResellerProgramPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
      <section aria-label="Hero" className="relative w-full overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: "1280/430" }}>
          <Image
            src="/hero/reseller.png"
            alt="Gabung jadi Reseller Ginabo – Jualan Jadi Lebih Mudah, Bukan Sendirian"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <motion.a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            aria-label="Daftar sekarang jadi partner Ginabo via WhatsApp"
            className="hidden md:absolute md:bottom-[-16%] md:left-[3%] md:w-[40%] md:max-w-[500px] md:min-w-[140px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78257C]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Image
              src="/hero/CTAreseller.png"
              alt="Daftar Sekarang – Mulai Bisnismu Hari Ini"
              width={420}
              height={84}
              className="h-auto w-full drop-shadow-lg"
            />
          </motion.a>
        </div>
      </section>

      {/* ══ 2. STATS BAR ─ social proof dini ─────────────────────────────────── */}
      <section aria-label="Statistik program" style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 100%)" }}>
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

      {/* ══ 3. PROBLEM ─ asimetris, rapat ────────────────────────────────────── */}
      <section aria-labelledby="problem-heading" className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-center gap-8 md:grid-cols-[0.85fr_1fr] md:gap-12">
            <Reveal>
              <SectionLabel>Kamu Pernah Merasa Ini?</SectionLabel>
              <h2 id="problem-heading" className="text-[22px] font-extrabold leading-tight text-[#1a1a1a] md:text-[28px]">
                Bukan salahmu. <span style={{ color: "#78257C" }}>Sistemnya yang belum ada.</span>
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "#5a5560" }}>
                Kebanyakan orang gagal bisnis bukan karena malas — tapi karena tidak ada yang menunjukkan jalan dan sistemnya. Di sini, kamu tidak mulai sendirian.
              </p>
            </Reveal>

            <motion.ul
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
              className="flex flex-col gap-2.5"
            >
              {problems.map((p) => (
                <motion.li
                  key={p.text}
                  variants={fadeUp}
                  className="flex items-center gap-3.5 rounded-xl px-4 py-3"
                  style={{ background: "#FDFAFF", border: "1.5px solid #ede0f8" }}
                >
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                  >
                    {p.icon}
                  </span>
                  <span className="text-[13.5px] font-semibold" style={{ color: "#3d3550" }}>{p.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ══ 4. BENEFITS ─ bento rapat ────────────────────────────────────────── */}
      <section aria-labelledby="benefits-heading" className="py-12 md:py-16" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            id="benefits-heading"
            label="Kenapa Ginabo Partner"
            title="Benefit nyata, bukan janji manis"
          />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            role="list"
          >
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group flex flex-col gap-3 rounded-2xl bg-white p-5 transition-shadow hover:shadow-[0_16px_36px_rgba(120,37,124,0.12)]"
                style={{ border: "1.5px solid #ede0f8" }}
                role="listitem"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-[14px] font-extrabold text-[#1a1a1a]">{b.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "#5a5560" }}>{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 5. TIERS ─ kalkulasi profit ──────────────────────────────────────── */}
      <section aria-labelledby="tiers-heading" className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            id="tiers-heading"
            label="Potensi Penghasilan"
            title="Berapa yang bisa kamu hasilkan?"
            desc="Pilih tier sesuai targetmu. Semakin aktif, semakin besar yang kamu raih."
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
                  border: t.featured ? "none" : `1.5px solid ${t.borderColor}`,
                  boxShadow: t.featured ? "0 16px 44px rgba(120,37,124,0.32)" : "0 2px 10px rgba(120,37,124,0.05)",
                }}
              >
                {t.featured && (
                  <div className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                    TERPOPULER
                  </div>
                )}

                <div className="self-start rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ background: t.grad }}>
                  {t.level} PARTNER
                </div>

                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${t.featured ? "text-white/65" : "text-[#8a7d92]"}`}>
                    Potensi laba
                  </p>
                  <p className={`mt-0.5 flex items-baseline gap-1 ${t.featured ? "text-white" : "text-[#1a1a1a]"}`}>
                    <span className="text-[28px] font-extrabold leading-none">{t.laba}</span>
                    <span className={`text-[13px] font-medium ${t.featured ? "text-white/60" : "text-[#8a7d92]"}`}>{t.sub}</span>
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
                  className="mt-auto block min-h-[44px] rounded-xl py-3 text-center text-[13px] font-bold transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78257C]"
                  style={t.featured ? { background: "#fff", color: "#78257C" } : { background: t.grad, color: "#fff" }}
                >
                  {t.cta}
                </Link>
              </motion.article>
            ))}
          </motion.div>

          <p className="mt-4 text-center text-[11.5px]" style={{ color: "#8a7d92" }}>
            *Estimasi berdasarkan rata-rata partner aktif. Hasil aktual bergantung pada usaha masing-masing.
          </p>
        </div>
      </section>

      {/* ══ 6. HOW IT WORKS ─ langkah rapat ──────────────────────────────────── */}
      <section aria-labelledby="steps-heading" className="py-12 md:py-16" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading id="steps-heading" label="Cara Gabung" title="4 langkah, mulai hari ini" />

          <motion.ol
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((s) => (
              <motion.li
                key={s.n}
                variants={fadeUp}
                className="flex items-start gap-3.5 rounded-2xl bg-white p-5"
                style={{ border: "1.5px solid #ede0f8" }}
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                  style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                >
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[14px] font-extrabold text-[#1a1a1a]">{s.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "#5a5560" }}>{s.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ══ 7. PRODUCTS ─ row rapat ──────────────────────────────────────────── */}
      <section aria-labelledby="products-heading" className="bg-white py-12 md:py-16">
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
                className="overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-[0_20px_44px_rgba(120,37,124,0.14)]"
                style={{ border: "1.5px solid #ede0f8" }}
              >
                <div className="relative aspect-square bg-[#fdf5ff]">
                  <Image src={p.img} alt={p.name} fill className="object-contain p-5" sizes="(min-width: 640px) 33vw, 100vw" />
                  <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white" style={{ background: p.badge }}>
                    {p.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-[13px] font-extrabold text-[#1a1a1a]">{p.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["BPOM RI", "Halal", "Cruelty Free"].map((b) => (
                      <span key={b} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#fdf5ff", color: "#78257C", border: "1px solid #e9d5f0" }}>
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

      {/* ══ 8. REWARDS + ECOSYSTEM ─ digabung, rapat ─────────────────────────── */}
      <section aria-labelledby="rewards-heading" className="py-12 md:py-16" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            id="rewards-heading"
            label="Reward & Dukungan"
            title="Semakin aktif, semakin banyak reward"
          />

          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            {/* Reward highlight */}
            <Reveal>
              <div
                className="flex h-full flex-col gap-4 rounded-2xl p-6 text-white"
                style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 100%)", boxShadow: "0 14px 40px rgba(120,37,124,0.28)" }}
              >
                <span className="self-start rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Reward Teratas
                </span>
                <div>
                  <h3 className="text-[19px] font-extrabold leading-snug">Top Partner Rewards</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
                    Reward eksklusif dari performa terbaikmu — bulanan, quartal, dan tahunan.
                  </p>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {["Bonus tunai bulanan", "Liburan & experience", "Sertifikasi partner", "Komisi referral"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[12.5px] font-medium text-white/90">
                      <span className="text-white">{icons.check}</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto rounded-xl bg-white/10 p-3 text-[11.5px] leading-relaxed text-white/70">
                  Reward diumumkan tiap awal bulan di grup komunitas partner resmi.
                </div>
              </div>
            </Reveal>

            {/* Ecosystem support */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
              className="grid gap-3 sm:grid-cols-2"
            >
              {ecosystem.map((e) => (
                <motion.div
                  key={e.title}
                  variants={fadeUp}
                  className="flex flex-col gap-2 rounded-2xl bg-white p-5"
                  style={{ border: "1.5px solid #ede0f8" }}
                >
                  <span
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                  >
                    {e.icon}
                  </span>
                  <h3 className="text-[13px] font-extrabold leading-snug text-[#1a1a1a]">{e.title}</h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: "#767083" }}>{e.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 9. TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section aria-labelledby="testimonials-heading" className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            id="testimonials-heading"
            center={false}
            label="Cerita Partner"
            title={<>Mereka sudah mulai, <span style={{ color: "#78257C" }}>kamu kapan?</span></>}
          />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
            className="grid gap-4 md:grid-cols-2"
          >
            {testimonials.map((t) => (
              <motion.article
                key={t.name}
                variants={fadeUp}
                className="flex flex-col gap-3.5 rounded-2xl bg-[#FDFAFF] p-6"
                style={{ border: "1.5px solid #ede0f8" }}
              >
                <div className="flex gap-1" aria-label={`Rating ${t.stars} dari 5 bintang`}>
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} className="h-4 w-4" fill={si < t.stars ? "#be3ab4" : "#e0e0e0"} viewBox="0 0 24 24" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-[13.5px] leading-relaxed" style={{ color: "#4a4453" }}>&ldquo;{t.text}&rdquo;</blockquote>
                <footer className="flex items-center gap-3 border-t pt-3.5" style={{ borderColor: "#ede0f8" }}>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
                    aria-hidden="true"
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <cite className="not-italic text-[13px] font-extrabold text-[#1a1a1a]">{t.name}</cite>
                    <p className="text-[11px]" style={{ color: "#8a7d92" }}>{t.role}</p>
                  </div>
                </footer>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ 10. FINAL CTA ────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="relative overflow-hidden py-16 md:py-20"
        style={{ background: "linear-gradient(135deg, #2d0a5e 0%, #78257C 55%, #be3ab4 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-xl px-5 text-center">
          <Reveal>
            <span className="mb-4 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
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

      {/* ══ STICKY MOBILE CTA BAR ─ konversi ─────────────────────────────────── */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 22 }}
        className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2 border-t border-[#ede0f8] bg-white/95 px-4 py-2.5 backdrop-blur md:hidden"
        style={{ boxShadow: "0 -4px 20px rgba(120,37,124,0.12)" }}
      >
        <a
          href={waLink()}
          target="_blank"
          rel="noreferrer"
          aria-label="Tanya via WhatsApp"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ede0f8] text-[#25D366]"
        >
          {icons.whatsapp}
        </a>
        <Link
          href="/reseller/register"
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-[14px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)" }}
        >
          Daftar Gratis Sekarang
          {icons.arrowRight}
        </Link>
      </motion.div>

      {/* ══ FLOATING JOIN ─ desktop saja ─────────────────────────────────────── */}
      <motion.a
        href="/reseller/register"
        initial={{ opacity: 0, scale: 0.75, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 180, damping: 18 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 hidden min-h-[44px] items-center gap-2 rounded-full px-5 py-3 text-[13px] font-extrabold text-white shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#78257C] md:inline-flex"
        style={{ background: "linear-gradient(135deg, #78257C, #be3ab4)", boxShadow: "0 8px 32px rgba(120,37,124,0.45)" }}
        aria-label="Daftar sebagai partner Ginabo"
      >
        {icons.arrowRight}
        Gabung Sekarang
      </motion.a>

    </div>
  );
}
