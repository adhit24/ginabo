import Image from "next/image";
import Link from "next/link";

const onlineStores = [
  {
    name: "Tokopedia",
    logo: "/tokopedia-logo.png",
    url: "https://www.tokopedia.com/ginabo-store",
    label: "tokopedia.com/ginabo-store",
    bg: "#f0fcf4",
  },
  {
    name: "Shopee",
    logo: "/shopee-logo.svg",
    url: "https://shopee.co.id/ginabostore",
    label: "shopee.co.id/ginabostore",
    bg: "#fff4f2",
  },
  {
    name: "TikTok Shop",
    logo: "/tiktok-shop-logo.svg",
    url: "https://tr.ee/T-0SX7b-OK",
    label: "@ginabo.official",
    bg: "#f5f5f5",
  },
];

export default function StoresPage() {
  return (
    <main className="min-h-screen bg-[#FDFAFF]">

      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#f0e6f6] py-14 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center mb-5">
            <Image src="/storeloc.png" alt="Store Locator" width={72} height={72} className="object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#303030] mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Beli Ginabo Online
          </h1>
          <p className="text-[15px] text-[#808080] max-w-md mx-auto leading-relaxed">
            Ginabo tersedia eksklusif di marketplace resmi kami. Belanja mudah, aman, dan langsung ke tanganmu.
          </p>
        </div>
      </section>

      {/* ── Marketplace Cards ── */}
      <section className="mx-auto max-w-2xl px-5 py-14">
        <div className="flex flex-col gap-4">
          {onlineStores.map(store => (
            <a
              key={store.name}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-[14px] border border-[#f0e6f6] p-6 flex items-center gap-5 hover:border-[#c89bd4] hover:shadow-lg transition-all group"
            >
              <div
                className="w-20 h-14 rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden p-2.5"
                style={{ background: store.bg }}
              >
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-bold text-[#303030] group-hover:text-[#78257C] transition">{store.name}</p>
                <p className="text-[12px] text-[#aaa] mt-0.5 truncate">{store.label}</p>
              </div>
              <svg
                className="flex-shrink-0 text-[#ccc] group-hover:text-[#78257C] transition"
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          ))}
        </div>

        {/* Safety note */}
        <div className="mt-8 rounded-[12px] border border-[#f0e6f6] bg-white p-5 text-center">
          <p className="text-[13px] text-[#808080] mb-1">Pastikan kamu berbelanja di toko resmi Ginabo</p>
          <p className="text-[12px] text-[#bbb]">
            Cari label <strong className="text-[#78257C]">"Official Store"</strong> atau <strong className="text-[#78257C]">"Star Seller"</strong> untuk keamanan transaksi.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="border-t border-[#f0e6f6] py-12 px-5"
        style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #fff 100%)" }}
      >
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest mb-2" style={{ color: "#CF99B4" }}>Ada Pertanyaan?</p>
          <h2 className="text-[22px] font-bold text-[#303030] mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Hubungi Kami
          </h2>
          <p className="text-[13px] text-[#808080] mb-6 leading-relaxed">
            Tim Ginabo siap membantu kamu menemukan produk yang tepat untuk kulitmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] text-[13px] font-bold text-white transition hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.997 2C6.477 2 2 6.478 2 12c0 1.88.516 3.637 1.41 5.142L2 22l4.978-1.388A9.945 9.945 0 0 0 12 22c5.522 0 10-4.478 10-10S17.522 2 11.997 2zm.003 18a7.965 7.965 0 0 1-4.075-1.114l-.292-.173-3.03.845.852-3.042-.19-.305A7.965 7.965 0 0 1 4 12C4 7.582 7.582 4 12 4s8 4.582 8 8-3.582 8-8 8z"/>
              </svg>
              Chat WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] text-[13px] font-bold transition hover:opacity-80"
              style={{ background: "#f5eeff", color: "#78257C" }}
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
