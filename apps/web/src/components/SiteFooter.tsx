import Link from "next/link";

const footerLinks = [
  {
    heading: "Produk",
    links: [
      { label: "Serum",        href: "/shop" },
      { label: "Moisturizer",  href: "/shop" },
      { label: "Toner",        href: "/shop" },
      { label: "Sunscreen",    href: "/shop" },
      { label: "Bundling Set", href: "/shop" },
    ],
  },
  {
    heading: "Ginabo",
    links: [
      { label: "Tentang Kami",   href: "/about"   },
      { label: "Konsultasi",     href: "/booking" },
      { label: "Blog & Tips",    href: "#"        },
      { label: "Hubungi Kami",   href: "/contact" },
    ],
  },
  {
    heading: "Bantuan",
    links: [
      { label: "FAQ",                    href: "#" },
      { label: "Kebijakan Pengiriman",   href: "#" },
      { label: "Kebijakan Pengembalian", href: "#" },
      { label: "Syarat & Ketentuan",     href: "#" },
      { label: "Kebijakan Privasi",      href: "#" },
    ],
  },
];

const socialLinks = [
  { label: "Instagram", href: "#", icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  )},
  { label: "TikTok", href: "#", icon: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9a8.2 8.2 0 004.78 1.52V7.1a4.86 4.86 0 01-1.01-.41z"/>
    </svg>
  )},
  { label: "WhatsApp", href: "#", icon: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )},
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-900">

      {/* ── Main Footer ── */}
      <div className="mx-auto w-full max-w-8xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            <div className="mb-3 text-xl font-extrabold tracking-[0.15em] text-white">GINABO</div>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-brand-300">
              Skincare Friendly Expert — seperti teman yang paling paham kulitmu. Cerah yang tetap nyaman, hari ini dan seterusnya.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {socialLinks.map(s => (
                <Link key={s.label} href={s.href} aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 text-brand-300 transition hover:bg-brand-700 hover:text-white">
                  {s.icon}
                </Link>
              ))}
            </div>
            {/* Newsletter */}
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">Newsletter</div>
              <div className="flex overflow-hidden rounded-xl border border-brand-700 bg-brand-800">
                <input
                  type="email"
                  placeholder="email kamu"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-brand-500 outline-none"
                />
                <button className="shrink-0 bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-500">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(col => (
            <div key={col.heading}>
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-400">{col.heading}</div>
              <div className="flex flex-col gap-2.5">
                {col.links.map(l => (
                  <Link key={l.label} href={l.href}
                    className="text-sm text-brand-300 transition hover:text-white">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment + Legal ── */}
      <div className="border-t border-brand-800">
        <div className="mx-auto flex w-full max-w-8xl flex-col items-center gap-4 px-4 py-6 md:flex-row md:justify-between md:px-8">
          {/* Payment badges */}
          <div className="flex flex-wrap items-center gap-2">
            {["VISA", "MC", "BCA", "BNI", "GoPay", "OVO", "QRIS"].map(p => (
              <span key={p} className="rounded-md border border-brand-700 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-400">
                {p}
              </span>
            ))}
          </div>
          {/* Legal */}
          <div className="text-xs text-brand-500">
            © {new Date().getFullYear()} Ginabo Beauty. All rights reserved. · BPOM Registered
          </div>
        </div>
      </div>

    </footer>
  );
}
