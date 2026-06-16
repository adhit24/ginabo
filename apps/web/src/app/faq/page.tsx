"use client";

import { useState } from "react";

const faqs = [
  {
    category: "Umum",
    items: [
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
  },
  {
    category: "Pemesanan",
    items: [
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
  },
  {
    category: "Pengiriman",
    items: [
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
  },
  {
    category: "Produk & Retur",
    items: [
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
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => setOpenIndex(prev => prev === key ? null : key);

  return (
    <div className="min-h-screen" style={{ background: "#fffafa" }}>
      {/* Hero */}
      <div className="py-16 px-5 text-center" style={{ background: "linear-gradient(135deg,#2e2a3b 0%,#4a1a6b 100%)" }}>
        <p className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-3">Pusat Bantuan</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">FAQ, Pengiriman & Informasi</h1>
        <p className="text-white/60 max-w-lg mx-auto text-sm">
          Temukan jawaban atas pertanyaan yang sering ditanyakan seputar produk, pemesanan, dan pengiriman GINABO.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-14">
        {faqs.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#78257C" }}>
              {section.category}
            </h2>
            <div className="flex flex-col gap-3">
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key}
                    className="rounded-xl overflow-hidden border"
                    style={{ borderColor: isOpen ? "#78257C" : "#e5e7eb", background: "#fff" }}>
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                      onClick={() => toggle(key)}
                    >
                      <span className="text-sm font-semibold text-gray-800">{item.q}</span>
                      <span className="flex-shrink-0 text-lg font-light" style={{ color: "#78257C" }}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <div className="h-px mb-4" style={{ background: "#f0e8f5" }} />
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="mt-10 rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg,#f5eeff,#fce8ff)" }}>
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
  );
}
