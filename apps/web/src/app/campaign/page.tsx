import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign – Ginabo Beauty",
  description: "Ikuti program eksklusif Ginabo: Partner Program, Loyalty Program, dan 21 Days Challenge.",
};

function IconCard() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <rect x="2" y="4" width="20" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 9h20" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5" y="13" width="6" height="2" rx="1" fill="currentColor" />
      <rect x="5" y="16.5" width="4" height="1.2" rx="0.6" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <rect x="3" y="4" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="7" y="12" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="10.75" y="12" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="14.5" y="12" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="7" y="16" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      <rect x="10.75" y="16" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <rect x="2" y="7" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M2 13h20" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* ─── Campaign card data ─── */
const campaigns = [
  {
    id: "partner",
    icon: <IconBriefcase />,
    badge: "Reseller",
    badgeColor: "#2a7c78",
    title: "Ginabo Partner Program (GPP)",
    tagline: "Jualan jadi lebih mudah, bukan sendirian.",
    desc: "Buat kamu yang mau mulai bisnis tapi bingung mulai dari mana. Sistem sudah disiapkan, kamu tinggal jalan. Cocok untuk pemula dengan modal ringan dan margin jelas.",
    perks: [
      "Harga partner untuk dijual lagi dengan profit",
      "Dibimbing sampai bisa jualan (training & support)",
      "Reward dan insentif performa (bulanan, quartal, tahunan)",
      "Materi promosi dan support tools biar tidak mulai dari nol",
    ],
    cta: "Daftar Sekarang",
    href: "/reseller",
    gradient: "linear-gradient(135deg, #1e6b68 0%, #3cb8b2 100%)",
    accentBg: "#EDFAF9",
  },
  {
    id: "21days",
    icon: <IconCalendar />,
    badge: "Limited Challenge",
    badgeColor: "#78257C",
    title: "21 Days Challenge",
    tagline: "21 hari. 1 rutinitas. Kulit yang berubah.",
    desc: "Tantang dirimu untuk konsisten merawat kulit selama 21 hari berturut-turut dengan rangkaian Ginabo. Dokumentasikan perjalananmu dan menangkan hadiah menarik.",
    perks: [
      "Panduan rutinitas AM & PM lengkap",
      "Check-in harian via komunitas",
      "Hadiah untuk peserta konsisten",
      "Sertifikat digital eksklusif",
    ],
    cta: "Mulai Journey",
    href: "/21days",
    gradient: "linear-gradient(135deg, #78257C 0%, #CF99B4 100%)",
    accentBg: "#FBF0F8",
  },
  {
    id: "loyalty",
    icon: <IconCard />,
    badge: "Member Exclusive",
    badgeColor: "#665DAC",
    title: "Loyalty Program",
    tagline: "Setiap pembelian, ada poinnya.",
    desc: "Kumpulkan poin dari setiap transaksi dan tukarkan dengan diskon, produk gratis, atau akses early sale eksklusif. Makin sering belanja, makin banyak keuntungannya.",
    perks: [
      "1 Poin = Rp 1.000 pembelian",
      "Tukar poin jadi diskon atau produk",
      "Akses early sale khusus member",
      "Birthday reward setiap tahun",
    ],
    cta: "Gabung Sekarang",
    href: "/auth/signup",
    gradient: "linear-gradient(135deg, #665DAC 0%, #BD6CC9 100%)",
    accentBg: "#F0EBFA",
  },
];

/* ─── Page ─── */
export default function CampaignPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1e0a38 50%,#2a1040 100%)" }}
    >
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle,#e879f9,transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle,#c026d3,transparent 70%)" }}
      />

      {/* ── HEADER ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 pt-20 pb-10 text-center md:pt-28 md:pb-14">
        <span
          className="mb-4 inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
        >
          Program & Campaign
        </span>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl">
          Lebih dari Sekadar{" "}
          <span
            className="italic font-light"
            style={{ background: "linear-gradient(135deg,#c084fc,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Skincare.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50 md:text-base">
          Ikuti program eksklusif Ginabo, raih rewards, buktikan transformasimu,
          dan tumbuh bersama komunitas kami.
        </p>
      </div>

      {/* ── CAMPAIGN CARDS ── */}
      <section className="relative z-10 pb-16 md:pb-24">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 md:px-8 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(24px)",
              }}
            >
              {/* Coloured top accent */}
              <div className="relative px-6 pb-5 pt-6" style={{ background: c.gradient }}>
                <div className="flex items-end justify-between">
                  {/* Icon bubble */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur">
                    {c.icon}
                  </div>
                  {/* Badge */}
                  <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                    {c.badge}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    {c.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold" style={{ color: "#c084fc" }}>
                    {c.tagline}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px w-10 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />

                <p className="text-sm leading-relaxed text-white/60">
                  {c.desc}
                </p>

                {/* Perks list */}
                <ul
                  className="flex flex-col gap-2 rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {c.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs text-white/70">
                      <span className="mt-px shrink-0 text-base leading-none" style={{ color: "#c084fc" }}>
                        ✦
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={c.href}
                  className="mt-auto rounded-xl py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }}
                >
                  {c.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 pb-20 text-center">
        <div
          className="mx-auto max-w-xl px-8 py-10"
        >
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            Ada Pertanyaan Soal Program Kami?
          </h2>
          <p className="mb-7 text-sm text-white/50">
            Tim Ginabo siap membantu kamu memilih program yang paling sesuai.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-extrabold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }}
          >
            Hubungi Kami
          </Link>
        </div>
      </section>

    </div>
  );
}
