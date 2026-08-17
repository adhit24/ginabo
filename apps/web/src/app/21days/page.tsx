"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { JoinForm } from "./JoinForm";

// ─── FONTS DEFINITION ────────────────────────────────────────────────────────
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-local",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// ─── MOTION TOKENS ──────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── WHATSAPP LINK HELPER ────────────────────────────────────────────────────
function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung dengan program 21 Days Journey. Boleh info lebih lanjut?";
  return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
}

export default function Journey21Page() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  
  // Bento interactive states
  const [activeProduct, setActiveProduct] = useState<"serum" | "cream">("serum");
  const [activeWeek, setActiveWeek] = useState<1 | 2 | 3>(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches[0]) {
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqs = [
    {
      q: "Apakah aman untuk kulit sensitif?",
      a: "Sangat aman. Kedua produk Ginabo diformulasikan dengan konsentrasi bahan aktif terkalibrasi untuk memperkuat skin barrier dan bebas dari wewangian buatan."
    },
    {
      q: "Kapan hasil mulai terlihat?",
      a: "Hidrasi intensif terasa sejak minggu pertama. Perbaikan tekstur kulit dan skin barrier yang lebih kuat terlihat secara bertahap dalam 14 hingga 21 hari pemakaian konsisten."
    },
    {
      q: "Bolehkah digunakan bersama produk lain?",
      a: "Disarankan untuk tidak mencampurnya dengan bahan aktif keras lain (seperti retinol dosis tinggi atau AHA/BHA kuat) agar Anda dapat menilai efektivitas program ini secara objektif."
    },
    {
      q: "Bagaimana jika ada reaksi di awal?",
      a: "Reaksi adaptasi ringan adalah wajar. Anda mendapatkan akses konsultasi langsung gratis dengan tim pendamping eksklusif kami selama program berlangsung."
    }
  ];

  return (
    <div className={`${playfair.variable} ${plusJakarta.variable} bg-[#fcf9f8] text-[#1c1b1b] min-h-screen selection:bg-[#3a1078]/10 selection:text-[#3a1078] pb-16`}>
      
      {/* ─── 1. HERO SECTION (Asymmetric, Compact) ────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column - Copy */}
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block bg-[#3a1078]/10 text-[#3a1078] px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              PROGRAM 21 HARI GINABO
            </span>
            
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-[#3a1078] leading-tight">
              Kulit Sehat & Kuat,<br />Terawat Konsisten.
            </h1>
            
            <p className="text-sm md:text-base text-[#4a4451] leading-relaxed max-w-lg">
              Rutin 2 langkah praktis pagi & malam dengan formula barrier-first untuk hidrasi mendalam dan tekstur kulit yang lebih halus dalam 21 hari.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-[#4a4451] bg-[#f0eded]">
                ✓ Barrier-First
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-[#4a4451] bg-[#f0eded]">
                ✓ Rutin 2 Langkah
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-[#4a4451] bg-[#f0eded]">
                ✓ Cocok Sensitif
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <a 
                href="#action-section" 
                className="bg-[#3a1078] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-center hover:opacity-95 transition-opacity"
              >
                Ikut Journey Sekarang
              </a>
              <a 
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="border border-[#3a1078] text-[#3a1078] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-center hover:bg-[#3a1078]/5 transition-colors flex items-center justify-center gap-2"
              >
                Tanya WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column - Hero Visual */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-[4/4.5] rounded-2xl overflow-hidden shadow-sm border border-[#ccc3d3]/20 bg-white">
              <Image 
                src="/GlowAge_Multi_Active_Serum&Bright_Care_Moisture_Cream.png"
                alt="Ginabo 21-Day Products"
                fill
                className="object-contain p-5"
                priority
                unoptimized
              />
              
              <div className="absolute top-3 right-3 bg-[#c5a059] text-white px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">
                Garansi 21 Hari
              </div>

              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 shadow-sm">
                <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold">Benefit Program</span>
                <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-[#4a4451] mt-2">
                  <li>✓ 2 Produk Full Size</li>
                  <li>✓ Panduan Harian</li>
                  <li>✓ Progress Tracker</li>
                  <li>✓ Support Group</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 2. THE 21-DAY BLUEPRINT (Bento Grid) ─────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#3a1078]">Blue Print Program 21 Hari</h2>
          <p className="text-xs text-[#71717a] mt-2">Cara kerja, produk, dan ekspektasi progress Anda yang disatukan secara padat.</p>
        </div>

        {/* Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card A: Product Spotlight (Interactive Tab) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">1. Detail Produk</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveProduct("serum")}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${activeProduct === "serum" ? "bg-[#3a1078] text-white" : "bg-[#f0eded] text-[#4a4451]"}`}
                >
                  Serum (Langkah 1)
                </button>
                <button 
                  onClick={() => setActiveProduct("cream")}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${activeProduct === "cream" ? "bg-[#3a1078] text-white" : "bg-[#f0eded] text-[#4a4451]"}`}
                >
                  Moist Cream (Langkah 2)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
              {/* Product Image */}
              <div className="md:col-span-5 flex justify-center bg-[#fcf9f8] p-4 rounded-xl relative aspect-square max-h-[180px]">
                <Image 
                  src={activeProduct === "serum" ? "/GlowAge_Multi_Active_Serum.png" : "/Bright&Care_Moisture_Cream.png"}
                  alt={activeProduct === "serum" ? "GlowAge Serum" : "Bright Care Cream"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Product Details */}
              <div className="md:col-span-7 space-y-3">
                <h3 className="text-base font-bold text-[#3a1078]">
                  {activeProduct === "serum" ? "GlowAge Multi-Active Serum" : "Bright & Care Moisture Cream"}
                </h3>
                <p className="text-xs text-[#71717a] leading-relaxed">
                  {activeProduct === "serum" 
                    ? "Membantu memperbaiki tekstur kulit yang tidak rata serta menjaga kekuatan skin barrier secara optimal." 
                    : "Mengunci kelembapan alami secara mendalam serta membantu menenangkan kulit yang rentan mengalami kemerahan."}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px] text-[#4a4451]">
                  <div>
                    <span className="font-bold text-[#3a1078]">Tekstur:</span>
                    <p className="text-[#71717a] mt-0.5">{activeProduct === "serum" ? "Watery, cepat meresap" : "Cream lembut, ringan"}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[#3a1078]">Bahan Utama:</span>
                    <p className="text-[#71717a] mt-0.5">{activeProduct === "serum" ? "Ceramide, Niacinamide" : "Allantoin, Squalane, Panthenol"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Weekly Progress Timeline (Interactive Stepper) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">2. Ekspektasi Hasil</span>
                <span className="text-[10px] font-semibold text-[#71717a]">Pilih Minggu</span>
              </div>

              {/* Weeks Toggles */}
              <div className="flex justify-between gap-1 mb-4 bg-[#f0eded]/50 p-1 rounded-full">
                {[1, 2, 3].map((wk) => (
                  <button 
                    key={wk}
                    onClick={() => setActiveWeek(wk as 1 | 2 | 3)}
                    className={`flex-1 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeWeek === wk ? "bg-[#3a1078] text-white shadow-sm" : "text-[#71717a] hover:text-[#3a1078]"}`}
                  >
                    W{wk}
                  </button>
                ))}
              </div>

              {/* Target Week Content */}
              <div className="space-y-3 min-h-[110px] flex flex-col justify-center">
                <h4 className="text-sm font-bold text-[#3a1078]">
                  {activeWeek === 1 && "Minggu 1: Adaptasi & Hidrasi"}
                  {activeWeek === 2 && "Minggu 2: Perbaikan & Kekenyalan"}
                  {activeWeek === 3 && "Minggu 3: Stabil & Glowing Maksimal"}
                </h4>
                <ul className="text-xs text-[#71717a] space-y-1.5 pl-4 list-disc">
                  {activeWeek === 1 && (
                    <>
                      <li>Kulit terasa lebih kenyal & lembap sepanjang hari.</li>
                      <li>Kemerahan ringan mulai mereda dan terkalibrasi.</li>
                    </>
                  )}
                  {activeWeek === 2 && (
                    <>
                      <li>Kekuatan skin barrier mulai terasa stabil.</li>
                      <li>Tekstur area kasar perlahan menjadi lebih rata.</li>
                    </>
                  )}
                  {activeWeek === 3 && (
                    <>
                      <li>Warna kulit tampak cerah merata & segar alami.</li>
                      <li>Kulit terlindungi penuh dari risiko dehidrasi harian.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Card C: The 2-Step Daily Ritual (Ritual Harian) */}
          <div className="lg:col-span-4 bg-[#3a1078] text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">3. Ritual Harian</span>
            <div className="space-y-4 my-6">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">AM</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Pagi Hari</h4>
                  <p className="text-[11px] text-white/80 mt-1">Serum (Langkah 1) + Moisture Cream (Langkah 2) untuk perlindungan harian.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">PM</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Malam Hari</h4>
                  <p className="text-[11px] text-white/80 mt-1">Gunakan 2 langkah yang sama sebelum tidur untuk menutrisi kulit semalaman.</p>
                </div>
              </div>
            </div>
            <span className="text-[9px] text-[#c5a059] uppercase font-bold tracking-widest">Waktu Pemakaian: 5 Menit</span>
          </div>

          {/* Card D: Komitmen & Aturan Main */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] border-b border-slate-100 pb-2">4. Aturan Main</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              <div className="flex gap-3">
                <span className="text-sm font-bold text-[#3a1078]">01</span>
                <div>
                  <h4 className="text-xs font-bold text-[#3a1078]">Konsistensi</h4>
                  <p className="text-[11px] text-[#71717a] mt-0.5">Disiplin pagi & malam selama 21 hari tanpa terlewat.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sm font-bold text-[#3a1078]">02</span>
                <div>
                  <h4 className="text-xs font-bold text-[#3a1078]">Foto Progress</h4>
                  <p className="text-[11px] text-[#71717a] mt-0.5">Ambil foto berkala setiap minggu untuk memantau perubahan.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sm font-bold text-[#3a1078]">03</span>
                <div>
                  <h4 className="text-xs font-bold text-[#3a1078]">Batasi Layering</h4>
                  <p className="text-[11px] text-[#71717a] mt-0.5">Hindari mencampur dengan bahan aktif keras brand lain.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-sm font-bold text-[#3a1078]">04</span>
                <div>
                  <h4 className="text-xs font-bold text-[#3a1078]">Evaluasi Grup</h4>
                  <p className="text-[11px] text-[#71717a] mt-0.5">Diskusikan keluhan kulit langsung dengan pendamping.</p>
                </div>
              </div>
            </div>
            <span className="text-[9px] text-[#71717a]">Evaluasi gratis dipandu tim expert.</span>
          </div>

        </div>
      </section>

      {/* ─── 3. ACTION SECTION (Bukti Nyata + Form Registrasi Side-by-Side) ──── */}
      <section id="action-section" className="max-w-[1280px] mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Proof & UGC */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#7b7482]/10 shadow-sm">
              <span className="text-[9px] font-bold text-[#c5a059] tracking-widest uppercase block mb-3 text-center">Geser & Bandingkan</span>
              
              {/* Slider Component */}
              <div 
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl cursor-ew-resize select-none bg-slate-50"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
              >
                {/* Before Image */}
                <div className="absolute inset-0 bg-[#fcece9]">
                  <Image 
                    src="/product-serum-bg.png" 
                    alt="Sebelum" 
                    fill 
                    className="object-contain filter grayscale opacity-70 p-4" 
                    unoptimized
                  />
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] font-bold px-2 py-0.5 rounded">Hari 1: Kusam</span>
                </div>
                
                {/* After Image */}
                <div 
                  className="absolute inset-0 bg-[#f5fbf7]" 
                  style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                >
                  <Image 
                    src="/product-serum-bg.png" 
                    alt="Sesudah" 
                    fill 
                    className="object-contain p-4" 
                    unoptimized
                  />
                  <span className="absolute bottom-2 right-2 bg-[#3a1078] text-white text-[8px] font-bold px-2 py-0.5 rounded">Hari 21: Glowing</span>
                </div>
                
                {/* Slider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-[#3a1078] font-bold text-[10px]">
                    ↔
                  </div>
                </div>
              </div>

              {/* Single Testimonial Quote */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex text-[#c5a059] text-xs">★★★★★</div>
                <p className="text-xs text-[#71717a] leading-relaxed italic">
                  &ldquo;Rutin 2 langkah ini sangat membantu menjaga kelembapan kulit saya yang tadinya kering di area pipi. Kemerahan berkurang bertahap.&rdquo;
                </p>
                <span className="text-[11px] font-bold text-[#3a1078] block">Dita, 27 tahun (Kulit Sensitif)</span>
              </div>
            </div>

            {/* UGC Video Preview (Compact Card) */}
            <div className="bg-white p-4 rounded-xl border border-[#7b7482]/10 shadow-sm flex items-center gap-4">
              <div className="relative w-24 h-16 rounded bg-slate-100 overflow-hidden shrink-0">
                <Image 
                  src="/product-bundle.png" 
                  alt="UGC Video" 
                  fill 
                  className="object-cover opacity-90"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/90 text-[#3a1078] flex items-center justify-center shadow">
                    <svg className="w-2.5 h-2.5 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#3a1078]">Video Review Komunitas</h4>
                <p className="text-[10px] text-[#71717a] mt-0.5">Lihat pengalaman nyata langsung dari ribuan peserta program.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sign Up Form Card */}
          <div className="lg:col-span-6">
            <div className="bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block">Formulir Program</span>
                <h3 className="text-xl font-bold text-[#3a1078] mt-1">Gabung 21 Days Journey</h3>
                <p className="text-xs text-[#71717a] mt-1">Isi formulir pendaftaran untuk memulai program secara gratis. Anda hanya perlu berkomitmen menggunakan 2 produk Ginabo terpilih secara teratur.</p>
              </div>

              <JoinForm />
            </div>
          </div>

        </div>
      </section>

      {/* ─── 4. FAQ SECTION (Accordion) ─────────────────────────────────── */}
      <section className="max-w-[1000px] mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-[#c5a059] tracking-wider uppercase">Pertanyaan Umum</span>
          <h2 className="text-xl md:text-2xl font-bold font-serif text-[#3a1078] mt-1">Sering Ditanyakan (FAQ)</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#7b7482]/10 shadow-sm space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-[#7b7482]/10 last:border-b-0 py-3">
              <button 
                className="flex justify-between items-center w-full text-left font-semibold text-xs md:text-sm text-[#3a1078] hover:text-[#c5a059] transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.q}</span>
                <span className="text-[#c5a059] ml-2">{faqOpen === index ? '−' : '+'}</span>
              </button>
              
              <AnimatePresence>
                {faqOpen === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1, transition: { duration: 0.2, ease: EASE } }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: EASE } }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-xs text-[#71717a] leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
