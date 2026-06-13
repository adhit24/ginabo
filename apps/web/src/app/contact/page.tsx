import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – Ginabo Beauty",
  description: "Hubungi tim Ginabo untuk pertanyaan produk, konsultasi kulit, atau informasi program mitra.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#2a1a3e 0%,#4a1a6b 50%,#78257C 100%)" }}
      >
        <div className="pointer-events-none absolute -top-16 right-0 h-[300px] w-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#c972bd,transparent 70%)" }} />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-10 md:px-10 md:py-12 text-center">
          <span
            className="mb-3 inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
          >
            Hubungi Kami
          </span>
          <h1 className="mt-3 font-staatliches text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.05] text-white">
            Kami Siap, <span style={{ color: "#e8b4e8" }}>Membantu.</span>
          </h1>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/60">
            Punya pertanyaan soal produk, rutinitas, atau program mitra? Tim Ginabo siap merespons kamu.
          </p>
        </div>

        {/* Trust badges strip */}
        <div className="flex items-center justify-center gap-4 md:gap-6 border-t border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm">
          {["✓ Respons Cepat", "✓ Konsultasi Gratis", "✓ Tim Profesional", "✓ Privasi Terjaga"].map(t => (
            <span key={t} className="text-[11px] font-semibold text-white/80">{t}</span>
          ))}
        </div>
      </section>

      {/* ── CONTACT CARDS ── */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="grid gap-6 md:grid-cols-2">

            {/* WhatsApp Card */}
            <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm" style={{ border: "1.5px solid #f0d8eb" }}>
              <div className="flex items-end justify-between px-6 pb-5 pt-6" style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", minHeight: 110 }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow backdrop-blur">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  Chat Langsung
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2a2a2a]">WhatsApp</h2>
                  <p className="mt-1 text-xs font-semibold" style={{ color: "#128C7E" }}>Respons cepat · Senin – Sabtu, 09.00–18.00</p>
                </div>
                <div className="h-px w-10 rounded-full bg-[#25D366]" />
                <p className="text-sm leading-relaxed text-[#555]">
                  Cocok untuk pertanyaan cepat seputar produk, status pesanan, atau konsultasi singkat seputar rutinitas kulitmu.
                </p>
                <ul className="flex flex-col gap-2 rounded-2xl bg-[#f0fdf4] p-4">
                  {["Pertanyaan produk & rutinitas", "Status pesanan & pengiriman", "Info program & promo", "Konsultasi kulit awal"].map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-[#444]">
                      <span className="mt-px shrink-0 text-base leading-none text-[#25D366]">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="https://tr.ee/LFexnAKyhp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto rounded-xl py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
                >
                  Chat via WhatsApp
                </Link>
              </div>
            </div>

            {/* Email Card */}
            <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm" style={{ border: "1.5px solid #f0d8eb" }}>
              <div className="flex items-end justify-between px-6 pb-5 pt-6" style={{ background: "linear-gradient(135deg, #665dac 0%, #78257C 100%)", minHeight: 110 }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow backdrop-blur">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  Email
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2a2a2a]">Email</h2>
                  <p className="mt-1 text-xs font-semibold" style={{ color: "#665dac" }}>Respons dalam 1×24 jam kerja</p>
                </div>
                <div className="h-px w-10 rounded-full" style={{ background: "#665dac" }} />
                <p className="text-sm leading-relaxed text-[#555]">
                  Untuk pertanyaan detail, kerja sama bisnis, media partnership, atau laporan yang membutuhkan dokumentasi tertulis.
                </p>
                <ul className="flex flex-col gap-2 rounded-2xl p-4" style={{ background: "#F0EBFA" }}>
                  {["Kerja sama & kemitraan bisnis", "Media & press inquiry", "Feedback & saran produk", "Pertanyaan detail formulasi"].map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-[#444]">
                      <span className="mt-px shrink-0 text-base leading-none" style={{ color: "#665dac" }}>✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="mailto:hello@ginabo.co"
                  className="mt-auto rounded-xl py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #665dac 0%, #78257C 100%)" }}
                >
                  Kirim Email
                </Link>
              </div>
            </div>
          </div>

          {/* Social & Info strip */}
          <div className="mt-8 rounded-3xl bg-white p-6 md:p-8" style={{ border: "1.5px solid #f0d8eb" }}>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#CF99B4" }}>Jam Operasional</div>
                <div className="text-sm font-semibold text-[#2a2a2a]">Senin – Sabtu</div>
                <div className="text-xs text-[#666]">09.00 – 18.00 WIB</div>
                <div className="text-xs text-[#666]">Minggu & Hari Libur: tutup</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#CF99B4" }}>Ikuti Kami</div>
                <div className="flex gap-3 pt-1">
                  {[
                    { name: "Instagram", href: "https://www.instagram.com/ginabo.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                    { name: "TikTok",    href: "https://tr.ee/T-0SX7b-OK", icon: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.8a4.85 4.85 0 01-1.07-.11z" },
                  ].map(s => (
                    <Link key={s.name} href={s.href}
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-80"
                      style={{ background: "linear-gradient(135deg, #665dac, #78257C)" }}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
                        <path d={s.icon} />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#CF99B4" }}>Program Mitra</div>
                <div className="text-sm leading-relaxed text-[#555]">
                  Tertarik jadi reseller atau stockist Ginabo?
                </div>
                <Link href="/reseller" className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-bold transition hover:opacity-80" style={{ color: "#78257C" }}>
                  Lihat GPP
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
