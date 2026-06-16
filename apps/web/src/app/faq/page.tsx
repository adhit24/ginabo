"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  {
    key: "Umum",
    label: "General",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M24 14c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.2V28h6v-2.8c1.8-1.1 3-3 3-5.2 0-3.3-2.7-6-6-6z" fill="currentColor" opacity=".15"/>
        <rect x="21" y="30" width="6" height="6" rx="1" fill="currentColor"/>
        <path d="M24 14c-3.3 0-6 2.7-6 6 0 2.2 1.2 4.1 3 5.2V28h6v-2.8c1.8-1.1 3-3 3-5.2 0-3.3-2.7-6-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: "Pemesanan",
    label: "Order",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M16 12V10a8 8 0 0 1 16 0v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M16 24h16M16 31h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="33" cy="31" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "Pengiriman",
    label: "Shipping",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <path d="M6 16h24v20H6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M30 20h6l6 8v8h-12V20z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="14" cy="38" r="3.5" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="36" cy="38" r="3.5" stroke="currentColor" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    key: "Produk & Retur",
    label: "Product & Return",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <path d="M24 6L6 14v20l18 8 18-8V14L24 6z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M24 6v28M6 14l18 8 18-8" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: "Reseller",
    label: "Reseller",
    href: "/reseller",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="32" cy="16" r="7" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M4 40c0-6.6 5.4-12 12-12h16c6.6 0 12 5.4 12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  Umum: [
    {
      q: "Apakah produk GINABO sudah terdaftar BPOM?",
      a: "Ya, seluruh produk GINABO telah terdaftar dan mendapatkan izin edar resmi dari BPOM (Badan Pengawas Obat dan Makanan) Republik Indonesia. Nomor BPOM dapat ditemukan pada kemasan produk.",
    },
    {
      q: "Apakah produk GINABO sudah bersertifikasi Halal?",
      a: "GINABO berkomitmen untuk memastikan seluruh produk memenuhi standar kehalalan. Produk yang telah mendapatkan sertifikasi Halal MUI akan menampilkan logo halal pada kemasannya. Proses sertifikasi untuk lini produk lainnya sedang berjalan.",
    },
    {
      q: "Apakah produk GINABO cocok untuk semua jenis kulit?",
      a: "Produk GINABO dirancang untuk berbagai jenis kulit, termasuk kulit sensitif. Setiap produk memiliki keterangan jenis kulit yang disarankan. Jika Anda memiliki kondisi kulit khusus, kami sarankan untuk melakukan patch test terlebih dahulu sebelum penggunaan penuh.",
    },
    {
      q: "Bagaimana cara menghubungi Customer Service GINABO?",
      a: "Kamu bisa menghubungi tim kami melalui:\n• WhatsApp: 0851-9926-4835 (Senin–Jumat, 09.00–17.00 WIB)\n• Email: cs@ginabo.id\n• Atau melalui fitur chat di website ini.",
    },
    {
      q: "Bagaimana cara menjadi reseller GINABO?",
      a: "Daftarkan dirimu melalui halaman 'Become Our Reseller' di website kami. Isi formulir pendaftaran dengan lengkap dan tim kami akan menghubungi kamu untuk proses selanjutnya.",
    },
  ],
  Pemesanan: [
    {
      q: "Bagaimana cara memesan produk GINABO?",
      a: "Pemesanan dapat dilakukan melalui:\n1. Website resmi ginabo.id — daftarkan akun, tambah produk ke keranjang, lakukan checkout\n2. Marketplace resmi kami (Tokopedia, Shopee)\n3. Hubungi tim kami via WhatsApp untuk pemesanan langsung",
    },
    {
      q: "Apakah saya harus membuat akun untuk berbelanja?",
      a: "Untuk pengalaman belanja terbaik — termasuk melacak pesanan, mengumpulkan poin loyalitas, dan mendapatkan penawaran eksklusif — kami sarankan untuk membuat akun. Namun pembelian tamu juga tersedia.",
    },
    {
      q: "Metode pembayaran apa saja yang tersedia?",
      a: "GINABO menerima berbagai metode pembayaran:\n• Transfer bank (BCA, Mandiri, BRI, BNI)\n• Dompet digital (GoPay, OVO, Dana, ShopeePay)\n• Kartu kredit/debit\n• QRIS\n• Cicilan (tergantung metode pembayaran)",
    },
    {
      q: "Bisakah saya mengubah atau membatalkan pesanan?",
      a: "Perubahan atau pembatalan pesanan dapat dilakukan selama pesanan belum diproses untuk pengiriman. Hubungi tim CS kami sesegera mungkin melalui WhatsApp atau email jika kamu perlu melakukan perubahan.",
    },
  ],
  Pengiriman: [
    {
      q: "Berapa lama estimasi pengiriman?",
      a: "Estimasi pengiriman tergantung pada layanan yang dipilih:\n• Reguler (JNE Reg, J&T Reguler): 2–5 hari kerja\n• Express (JNE YES, J&T Express): 1–2 hari kerja\n• Instant (GoSend, GrabExpress): 2–6 jam (tersedia di area tertentu)\n• Luar Jawa: 3–7 hari kerja\n\nEstimasi dihitung setelah pesanan diverifikasi dan diproses.",
    },
    {
      q: "Kapan pesanan saya diproses?",
      a: "Pesanan diproses pada hari kerja (Senin–Jumat, 09.00–16.00 WIB). Pesanan yang masuk setelah pukul 16.00 atau pada akhir pekan/hari libur akan diproses pada hari kerja berikutnya.",
    },
    {
      q: "Ke mana saja GINABO bisa mengirim produk?",
      a: "Kami melayani pengiriman ke seluruh wilayah Indonesia. Untuk pengiriman ke luar Jawa, estimasi waktu dan biaya pengiriman mungkin berbeda. Tersedia juga layanan COD (Cash on Delivery) di area tertentu.",
    },
    {
      q: "Bagaimana jika produk saya rusak atau hilang saat pengiriman?",
      a: "Setiap pesanan dikemas dengan standar perlindungan yang ketat. Apabila produk diterima dalam kondisi rusak atau tidak sesuai, segera dokumentasikan (foto/video) dan hubungi CS kami dalam 1×24 jam setelah produk diterima.",
    },
    {
      q: "Apakah ada biaya pengiriman gratis?",
      a: "Ya! GINABO memberikan gratis ongkos kirim untuk pembelian di atas nominal tertentu (cek promo terkini di halaman utama kami). Selain itu, member dengan tier Silver ke atas juga mendapatkan keuntungan ongkos kirim spesial.",
    },
  ],
  "Produk & Retur": [
    {
      q: "Bagaimana cara mengetahui urutan pemakaian skincare yang benar?",
      a: "Urutan dasar pemakaian skincare GINABO:\n1. Cleanser\n2. Toner\n3. Serum / Treatment\n4. Moisturizer\n5. Sunscreen (pagi hari)\n\nUntuk panduan lebih lengkap sesuai kondisi kulitmu, kamu bisa konsultasi gratis dengan Beauty Expert kami via WhatsApp.",
    },
    {
      q: "Berapa lama produk bisa digunakan setelah dibuka?",
      a: "Setiap produk GINABO memiliki informasi Period After Opening (PAO) yang tertera pada kemasan (contoh: 12M artinya 12 bulan setelah dibuka). Pastikan produk disimpan sesuai anjuran untuk menjaga kualitasnya.",
    },
    {
      q: "Bagaimana kebijakan pengembalian produk (retur)?",
      a: "Retur dapat diajukan dalam kondisi:\n• Produk diterima dalam keadaan rusak/cacat\n• Produk yang diterima tidak sesuai pesanan\n• Produk masih tersegel (belum dibuka)\n\nPengajuan retur dilakukan maksimal 3 hari setelah produk diterima dengan menyertakan foto/video sebagai bukti. Hubungi CS kami untuk proses selanjutnya.",
    },
    {
      q: "Apakah GINABO menyediakan konsultasi kulit gratis?",
      a: "Ya! Tim Beauty Expert GINABO siap membantu konsultasi perawatan kulit secara gratis via WhatsApp (0851-9926-4835) setiap Senin–Jumat pukul 09.00–17.00 WIB. Kami akan merekomendasikan produk yang paling sesuai dengan kondisi kulitmu.",
    },
  ],
};

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("Umum");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i);
  const currentItems = faqs[activeCategory] ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#fffafa" }}>

      {/* ── Header ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-5 py-10 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h1>
        </div>

        {/* ── Category Tabs ── */}
        <div className="mx-auto max-w-4xl px-5 pb-0">
          <div className="flex items-end gap-0 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key && !cat.href;
              if (cat.href) {
                return (
                  <Link
                    key={cat.key}
                    href={cat.href}
                    className="flex flex-col items-center gap-2 px-6 py-4 min-w-[90px] border-b-2 border-transparent text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-gray-400">{cat.icon}</span>
                    <span className="text-[11px] font-semibold capitalize whitespace-nowrap">{cat.label}</span>
                  </Link>
                );
              }
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setOpenIndex(null); }}
                  className="flex flex-col items-center gap-2 px-6 py-4 min-w-[90px] border-b-2 transition-colors"
                  style={{
                    borderColor: isActive ? "#78257C" : "transparent",
                    color: isActive ? "#78257C" : "#9ca3af",
                  }}
                >
                  <span style={{ color: isActive ? "#78257C" : "#9ca3af" }}>{cat.icon}</span>
                  <span className="text-[11px] font-semibold capitalize whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FAQ Content ── */}
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="grid md:grid-cols-[220px_1fr] gap-8">

          {/* Sidebar (desktop) */}
          <aside className="hidden md:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Kategori</p>
            <nav className="flex flex-col gap-1">
              {categories.filter(c => !c.href).map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); setOpenIndex(null); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors"
                    style={{
                      background: isActive ? "#f5eeff" : "transparent",
                      color: isActive ? "#78257C" : "#6b7280",
                    }}
                  >
                    <span className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? "#78257C" : "#9ca3af" }}>
                      {cat.icon}
                    </span>
                    {cat.label}
                  </button>
                );
              })}
              <Link
                href="/reseller"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="w-5 h-5 flex-shrink-0 text-gray-400">
                  {categories[4].icon}
                </span>
                Reseller
              </Link>
            </nav>

            {/* Contact box */}
            <div className="mt-8 rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg,#f5eeff,#fce8ff)" }}>
              <p className="text-xs font-semibold text-gray-700 mb-1">Butuh bantuan lainnya?</p>
              <p className="text-[11px] text-gray-500 mb-3">Tim kami siap membantu</p>
              <a
                href="https://wa.me/6285199264835"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-4 py-2.5 rounded-full text-xs font-bold text-white transition hover:opacity-90"
                style={{ background: "#78257C" }}
              >
                Chat WhatsApp
              </a>
            </div>
          </aside>

          {/* Accordion */}
          <div>
            <h2 className="text-sm font-bold mb-5" style={{ color: "#78257C" }}>
              {categories.find(c => c.key === activeCategory)?.label}
            </h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {currentItems.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={i}>
                    <button
                      className="w-full flex items-center justify-between py-4 text-left gap-4"
                      onClick={() => toggle(i)}
                    >
                      <span className="text-sm font-medium text-gray-800">{item.q}</span>
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-base font-bold transition-transform"
                        style={{
                          background: isOpen ? "#78257C" : "#e5e7eb",
                          color: isOpen ? "#fff" : "#9ca3af",
                          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-5">
                        <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile CTA */}
            <div className="mt-10 rounded-2xl p-6 text-center md:hidden" style={{ background: "linear-gradient(135deg,#f5eeff,#fce8ff)" }}>
              <p className="text-sm font-semibold text-gray-700 mb-1">Masih ada pertanyaan?</p>
              <p className="text-xs text-gray-500 mb-4">Tim GINABO siap membantu kamu setiap saat.</p>
              <a
                href="https://wa.me/6285199264835"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "#78257C" }}
              >
                Chat via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
