import Link from "next/link";
import { ScrollTopButton } from "@/components/ui/ScrollTopButton";

export function SiteFooter() {
  return (
    <>
      <footer className="overflow-hidden" style={{ background: "#2e2a3b", padding: "60px 0 40px" }}>
        <div className="mx-auto px-5 md:px-20" style={{ maxWidth: 1600 }}>
          <div className="flex flex-col gap-10 md:flex-row md:gap-10">

            {/* ── Brand column ── */}
            <div className="flex-shrink-0 md:w-[400px]">
              {/* Logo */}
              <div className="mb-4">
                <img
                  src="/l0go.png"
                  alt="Ginabo"
                  className="object-contain"
                  style={{ height: 59 }}
                />
              </div>
              {/* Tagline */}
              <p className="mb-6 text-[15px] font-semibold leading-snug text-white text-justify" style={{ maxWidth: 338 }}>
                Skincare Friendly Expert : Seperti teman yang paling paham kulitmu. Cerah yang tetap nyaman, hari ini dan seterusnya
              </p>
              {/* Social icons */}
              <div className="mb-6 flex gap-3">
                <Link href="#" aria-label="Instagram"
                  className="social-icon flex items-center justify-center overflow-hidden rounded-[5px]"
                  style={{ background: "#6958bd", width: 38, height: 33 }}>
                  <img src="/instagram.png" alt="Instagram" style={{ width: 24, height: 24 }} />
                </Link>
                <Link href="#" aria-label="WhatsApp"
                  className="social-icon flex items-center justify-center overflow-hidden rounded-[5px]"
                  style={{ background: "#6958bd", width: 38, height: 33 }}>
                  <img src="/whatsapp.png" alt="WhatsApp" style={{ width: 24, height: 24 }} />
                </Link>
                <Link href="#" aria-label="TikTok"
                  className="social-icon flex items-center justify-center overflow-hidden rounded-[5px]"
                  style={{ background: "#6958bd", width: 38, height: 33 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15Z"/>
                  </svg>
                </Link>
              </div>
              {/* Email subscribe */}
              <div className="flex overflow-hidden rounded-[10px]" style={{ background: "#4a3b72", width: "100%", maxWidth: 470, height: 44 }}>
                <div className="flex flex-1 items-center px-6">
                  <input type="email" placeholder="Email kamu" className="subscribe-input" />
                </div>
                <div className="subscribe-btn flex items-center px-6" style={{ background: "#6959bc", borderRadius: "0 5px 5px 0" }}>
                  <span className="font-semibold text-white text-[17px]">Subscribe</span>
                </div>
              </div>
            </div>

            {/* ── Link columns ── */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:flex md:flex-1 md:justify-end md:gap-10">
            {[
              {
                heading: "Produk",
                links: ["Serum", "Moisturizer", "Toner", "Sunscreen", "Bundling Set"],
                hrefs: ["/shop", "/shop", "/shop", "/shop", "/shop"],
              },
              {
                heading: "Ginabo",
                links: ["Tentang Kami", "Campaign", "Konsultasi", "Blog & Tips", "Hubungi Kami"],
                hrefs: ["/about", "/campaign", "/booking", "#", "/contact"],
              },
              {
                heading: "Bantuan",
                links: ["FAQ", "Kebijakan Pengiriman", "Kebijakan Pengembalian", "Syarat & Ketentuan", "Kebijakan Privasi"],
                hrefs: ["#", "#", "#", "#", "#"],
              },
            ].map(col => (
              <div key={col.heading}>
                <h3 className="mb-2 text-white text-[28px] md:text-[32px] font-extrabold">{col.heading}</h3>
                <ul className="flex flex-col gap-0.5">
                  {col.links.map((label, i) => (
                    <li key={label}>
                      <Link href={col.hrefs[i]} className="footer-link text-white text-[15px] font-semibold">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="mt-10 flex flex-col items-center justify-end gap-2 md:flex-row">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
              </svg>
              <span className="font-bold text-white text-[11px]">Ginabo</span>
              <span className="text-white text-[9px]">All Rights Reserved.</span>
            </div>
            <span className="text-white font-bold text-[15px] md:ml-6">Powered by</span>
            <Link href="https://kinaryalokadigital.vercel.app/" target="_blank" rel="noopener noreferrer">
              <img src="\k_logo.png" alt="Kinaryaloka Digital" className="object-contain" style={{ height: 31, width: 34 }} />
            </Link>
          </div>
        </div>
      </footer>

      <ScrollTopButton />
    </>
  );
}
