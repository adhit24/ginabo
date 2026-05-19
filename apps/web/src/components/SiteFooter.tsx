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
                  src="https://www.figma.com/api/mcp/asset/e5797810-a867-406f-acef-b33c8d7875be"
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
                {[
                  { label: "Instagram", icon: "https://www.figma.com/api/mcp/asset/9d1c7c74-408c-4c1f-8a20-6b0d80ba3254" },
                  { label: "WhatsApp",  icon: "https://www.figma.com/api/mcp/asset/03017871-7669-40bd-ae8a-2eceb7a36c6c" },
                  { label: "TikTok",    icon: "https://www.figma.com/api/mcp/asset/e294cac6-66c8-4caf-9272-784cc56564f6" },
                ].map(s => (
                  <Link key={s.label} href="#" aria-label={s.label}
                    className="social-icon flex items-center justify-center overflow-hidden rounded-[5px]"
                    style={{ background: "#6958bd", width: 38, height: 33 }}>
                    <img src={s.icon} alt={s.label} style={{ width: 24, height: 24 }} />
                  </Link>
                ))}
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
              <img src="https://www.figma.com/api/mcp/asset/a4393ce6-d180-413b-bb3d-a3ca9d9a3c7d" alt="" style={{ width: 16, height: 16 }} />
              <span className="font-bold text-white text-[11px]">Ginabo</span>
              <span className="text-white text-[9px]">All Rights Reserved.</span>
            </div>
            <span className="text-white font-bold text-[15px] md:ml-6">Powered by</span>
            <Link href="https://kinaryalokadigital.vercel.app/" target="_blank" rel="noopener noreferrer">
              <img src="https://www.figma.com/api/mcp/asset/d0c38736-757a-469f-a5b8-5e3e96d096d0" alt="Kinaryaloka Digital" className="object-contain" style={{ height: 31, width: 34 }} />
            </Link>
          </div>
        </div>
      </footer>

      <ScrollTopButton />
    </>
  );
}
