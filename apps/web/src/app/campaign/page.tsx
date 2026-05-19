import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign – Ginabo Beauty",
  description: "Ikuti program eksklusif Ginabo: Partner Program, Loyalty Program, dan 21 Days Challenge.",
};

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        fill="currentColor"
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      />
    </svg>
  );
}

function IconFlame() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        fill="currentColor"
        d="M12 22c4.42 0 8-3.35 8-7.5 0-3.13-2.1-5.1-3.91-6.8-1.1-1.03-2.14-2-2.47-3.2-.14-.5-.17-.96-.12-1.42a.75.75 0 0 0-1.33-.53C9.8 5.5 7 8.36 7 12.02c0 .89.18 1.74.51 2.52.12.29.06.62-.17.83-.5.46-1.07 1.16-1.07 2.2C6.27 20.14 8.84 22 12 22Zm.08-7.82c.21.4.08.89-.3 1.14-.52.34-.9.93-.9 1.62 0 1.1.9 2 2.02 2 1.18 0 2.14-.94 2.14-2.14 0-1.26-.69-2.23-1.58-3.4-.22-.29-.45-.6-.67-.93-.26.83-.92 1.18-.71 1.7Z"
      />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        fill="currentColor"
        d="M7.2 12.4 5 10.2c-.39-.39-.39-1.02 0-1.41l2.1-2.1c.87-.87 2.28-.87 3.16 0l.44.44a1 1 0 0 1 0 1.41L9.6 9.8a1 1 0 0 0 0 1.41l1.2 1.2a1 1 0 0 0 1.41 0l1.8-1.8a3 3 0 0 1 4.24 0l.75.75a1 1 0 0 1 0 1.41l-4.1 4.1a2.5 2.5 0 0 1-3.54 0l-.46-.46a.75.75 0 0 1 1.06-1.06l.46.46c.39.39 1.02.39 1.41 0l3.57-3.57a1.5 1.5 0 0 0-2.12 0l-1.8 1.8a2.5 2.5 0 0 1-3.54 0l-1.2-1.2a2.5 2.5 0 0 1 0-3.54l.39-.39a.5.5 0 0 0-.71 0L6.06 9.55l1.85 1.85a.75.75 0 0 1-1.06 1.06ZM5.5 14.9l.46.46c.39.39 1.02.39 1.41 0l.46-.46a.75.75 0 0 1 1.06 1.06l-.46.46a2.5 2.5 0 0 1-3.54 0l-.46-.46a.75.75 0 1 1 1.06-1.06Zm2.2 2.2.46.46c.39.39 1.02.39 1.41 0l.46-.46a.75.75 0 1 1 1.06 1.06l-.46.46a2.5 2.5 0 0 1-3.54 0l-.46-.46a.75.75 0 1 1 1.06-1.06Z"
      />
    </svg>
  );
}

/* ─── Campaign card data ─── */
const campaigns = [
  {
    id: "partner",
    icon: <IconHandshake />,
    badge: "Reseller · Stockist · Distributor",
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
    icon: <IconFlame />,
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
    icon: <IconStar />,
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
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2a1635 0%, #78257C 50%, #BD6CC9 100%)",
          minHeight: 280,
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 55%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="relative mx-auto flex min-h-[280px] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            Program & Campaign
          </span>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-5xl">
            Lebih dari Sekadar{" "}
            <span className="italic font-light">Skincare.</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-white/80 md:text-base">
            Ikuti program eksklusif Ginabo, raih rewards, buktikan transformasimu,
            dan tumbuh bersama komunitas kami.
          </p>
        </div>
      </section>

      {/* ── CAMPAIGN CARDS ── */}
      <section className="py-14 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 md:px-8 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              style={{ border: "1.5px solid #f0e8f8" }}
            >
              {/* Coloured top strip */}
              <div
                className="flex items-end justify-between px-6 pb-5 pt-6"
                style={{ background: c.gradient, minHeight: 120 }}
              >
                {/* Icon bubble */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow backdrop-blur">
                  {c.icon}
                </div>
                {/* Badge */}
                <span
                  className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur"
                >
                  {c.badge}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: "#2a2a2a" }}>
                    {c.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold" style={{ color: c.badgeColor }}>
                    {c.tagline}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px w-10 rounded-full" style={{ background: c.badgeColor }} />

                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                  {c.desc}
                </p>

                {/* Perks list */}
                <ul
                  className="flex flex-col gap-2 rounded-2xl p-4"
                  style={{ background: c.accentBg }}
                >
                  {c.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs" style={{ color: "#444" }}>
                      <span className="mt-px shrink-0 text-base leading-none" style={{ color: c.badgeColor }}>
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
                  style={{ background: c.gradient }}
                >
                  {c.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA STRIP ── */}
      <section
        className="py-14 text-center"
        style={{ background: "linear-gradient(135deg, #78257C, #BD6CC9)" }}
      >
        <div className="mx-auto max-w-xl px-5">
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            Ada Pertanyaan Soal Program Kami?
          </h2>
          <p className="mb-7 text-sm text-white/80">
            Tim Ginabo siap membantu kamu memilih program yang paling sesuai.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold transition hover:bg-purple-50"
            style={{ color: "#78257C" }}
          >
            Hubungi Kami →
          </Link>
        </div>
      </section>

    </div>
  );
}
