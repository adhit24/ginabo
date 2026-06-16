"use client";

import Link from "next/link";
import { ScrollTopButton } from "@/components/ui/ScrollTopButton";

const footerLinks = [
  {
    heading: "INFO",
    items: [
      { label: "Contact Us",        href: "/contact" },
      { label: "Become Our Reseller", href: "/reseller" },
      { label: "Market Place",      href: "/shop" },
      { label: "Join Us",           href: "/about" },
    ],
  },
  {
    heading: "ACCOUNT",
    items: [
      { label: "FAQ, Shipping, & Delivery", href: "/faq" },
      { label: "Terms & Conditions",        href: "/terms" },
      { label: "Privacy Policy",            href: "/privacy" },
    ],
  },
  {
    heading: "LAYANAN PENGADUAN KONSUMEN",
    items: [
      { label: "PT Tiga Sas Berlian",       href: "#" },
      { label: "Green Galunggung Residence B2 No 10, RT.008 RW.016, Kecapi, Harjamukti, Kota Cirebon, Jawa Barat, Indonesia 45143", href: "#" },
      { label: "0851-9926-4835",            href: "https://wa.me/6285199264835" },
    ],
  },
];

const paymentLogos = [
  { name: "BCA",       src: "/BCA.svg" },
  { name: "Mandiri",   src: "/mandiri.svg" },
  { name: "BRI",       src: "/bri.svg" },
  { name: "GoPay",     src: "/gopay.svg" },
  { name: "Dana",      src: "/dana.svg" },
  { name: "ShopeePay", src: "/shopeepay.svg" },
];

const shippingLogos = [
  { name: "JNE",      src: "/jne.svg" },
  { name: "J&T",      src: "/j&t.png" },
  { name: "Anteraja", src: "/anteraja.png" },
];

export function SiteFooter() {
  return (
    <>
      <footer style={{ background: "#2e2a3b" }}>

        {/* ── Newsletter section ── */}
        <div className="border-b border-white/10 py-10 px-5 md:px-10">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-[18px] font-bold text-white mb-1">
                Hei, tetap terhubung dengan kami!
              </h3>
              <p className="text-[13px] text-white/60">
                Subscribe dan dapatkan diskon 10% untuk pembelian pertamamu.
              </p>
            </div>
            <div className="flex w-full max-w-md overflow-hidden rounded-[5px]">
              <input
                type="email"
                placeholder="Masukkan email kamu"
                className="flex-1 bg-white/10 px-4 py-3 text-[13px] text-white placeholder-white/40 outline-none border-none"
              />
              <button
                className="px-5 py-3 text-[13px] font-bold text-white flex-shrink-0 transition hover:opacity-90"
                style={{ background: "#78257C" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* ── Main columns ── */}
        <div className="mx-auto max-w-7xl px-5 md:px-10 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <img src="/l0go.png" alt="Ginabo" className="object-contain mb-4" style={{ height: 48 }} />
              <p className="text-[13px] leading-relaxed text-white/60 mb-5">
                Skincare Friendly Expert — seperti teman yang paling paham kulitmu.
              </p>
              <div className="flex gap-2">
                <Link href="https://www.instagram.com/ginabo.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-[5px]"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <img src="/instagram.png" alt="Instagram" style={{ width: 18, height: 18 }} />
                </Link>
                <Link href="https://wa.me/6285199264835" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-[5px]"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <img src="/whatsapp.png" alt="WhatsApp" style={{ width: 18, height: 18 }} />
                </Link>
                <Link href="https://www.tiktok.com/@ginabo.official?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                  className="flex h-8 w-8 items-center justify-center rounded-[5px]"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15Z"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Link columns */}
            {footerLinks.map(col => (
              <div key={col.heading}>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/40">
                  {col.heading}
                </h4>
                <ul className="flex flex-col gap-2">
                  {col.items.map(item => (
                    <li key={item.label}>
                      <Link href={item.href}
                        className="text-[13px] text-white/70 transition hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Payment & Shipping ── */}
        <div className="border-t border-white/10 py-5 px-5 md:px-10">
          <div className="mx-auto max-w-7xl flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-white/40 mr-1 flex-shrink-0">Pembayaran:</span>
              {paymentLogos.map(p => (
                <span key={p.name}
                  className="flex items-center justify-center rounded-[5px] overflow-hidden flex-shrink-0"
                  style={{ background: "#ffffff", height: 28, padding: "4px 8px" }}>
                  <img src={p.src} alt={p.name} loading="lazy"
                    style={{ height: 18, width: "auto", maxWidth: 76, objectFit: "contain", display: "block" }} />
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-white/40 mr-1 flex-shrink-0">Pengiriman:</span>
              {shippingLogos.map(s => (
                <span key={s.name}
                  className="flex items-center justify-center rounded-[5px] overflow-hidden flex-shrink-0"
                  style={{ background: "#ffffff", height: 28, padding: "4px 8px" }}>
                  <img src={s.src} alt={s.name} loading="lazy"
                    style={{ height: 18, width: "auto", maxWidth: 76, objectFit: "contain", display: "block" }} />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 py-4 px-5 md:px-10">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-white/40">
              © 2026 PT Ginabo Nusantara. All rights reserved.
            </p>
            <p className="text-[11px] text-white/30">
              BPOM Terdaftar · Halal MUI · Dermatologist Tested
            </p>
          </div>
        </div>
      </footer>

      <ScrollTopButton />
    </>
  );
}
