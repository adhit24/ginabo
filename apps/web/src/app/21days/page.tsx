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
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── WHATSAPP LINK HELPERS ───────────────────────────────────────────────────
function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung dengan program 21 Days Journey. Boleh info lebih lanjut?";
  return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
}

export default function Journey21Page() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

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
      a: "Sangat aman. Kedua produk utama diformulasikan dengan konsentrasi bahan aktif yang terkalibrasi untuk memperkuat skin barrier dan meminimalisir iritasi, serta bebas dari pewangi buatan."
    },
    {
      q: "Kapan hasil mulai terlihat?",
      a: "Adaptasi hidrasi biasanya terasa sejak minggu pertama pemakaian. Perbaikan tekstur kulit dan skin barrier yang lebih kuat terlihat secara bertahap dalam 14 hingga 21 hari pemakaian konsisten."
    },
    {
      q: "Bolehkah digunakan bersamaan dengan produk lain?",
      a: "Selama program 21 hari, kami menyarankan untuk tidak mencampurkan (layering) dengan bahan aktif keras dari brand lain (seperti retinol dosis tinggi atau AHA/BHA kuat) agar Anda bisa mengevaluasi hasil Ginabo secara objektif."
    },
    {
      q: "Bagaimana jika ada reaksi di awal pemakaian?",
      a: "Reaksi ringan seperti penyesuaian hidrasi adalah wajar. Anda memiliki akses ke komunitas eksklusif Ginabo untuk berkonsultasi langsung dengan tim pendamping kami selama program berlangsung."
    }
  ];

  return (
    <div className={`${playfair.variable} ${plusJakarta.variable} bg-[#fcf9f8] text-[#1c1b1b] min-h-screen selection:bg-[#3a1078]/10 selection:text-[#3a1078]`}>
      
      {/* ─── 1. STICKY HEADER ───────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcf9f8]/85 backdrop-blur-md border-b border-[#ccc3d3]/30">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold font-serif text-[#3a1078]">Ginabo</span>
            <span className="bg-[#3a1078]/10 text-[#3a1078] text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 rounded-full uppercase">21 DAYS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#cara-kerja" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4a4451] hover:text-[#3a1078] transition-colors">Cara Kerja</a>
            <a href="#produk" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4a4451] hover:text-[#3a1078] transition-colors">Produk</a>
            <a href="#timeline" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4a4451] hover:text-[#3a1078] transition-colors">Timeline</a>
            <a href="#testimoni" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4a4451] hover:text-[#3a1078] transition-colors">Testimoni</a>
            <a href="#faq" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#4a4451] hover:text-[#3a1078] transition-colors">FAQ</a>
          </nav>

          <div>
            <a 
              href="#join-section" 
              className="bg-[#3a1078] hover:opacity-90 transition-opacity text-white text-xs font-bold uppercase tracking-[0.1em] px-6 h-10 rounded-full inline-flex items-center"
            >
              Gabung Program
            </a>
          </div>
        </div>
      </header>

      {/* spacer to prevent content shift */}
      <div className="h-20" />

      {/* ─── 2. HERO SECTION ────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block bg-[#3a1078]/10 text-[#3a1078] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
              PROGRAM 21 HARI
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-[#3a1078] leading-tight">
              Kulit lebih sehat, kuat, & terawat konsisten.
            </h1>
            
            <p className="text-base md:text-lg text-[#4a4451] leading-relaxed max-w-xl">
              Program skincare 21 hari dengan 2 produk barrier-first untuk memperbaiki skin barrier, hidrasi, dan kecerahan alami.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#4a4451] bg-[#f0eded]">
                ✓ Barrier-first
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#4a4451] bg-[#f0eded]">
                ✓ Rutin 2 langkah
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#4a4451] bg-[#f0eded]">
                ✓ Cocok pemula
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-[#ccc3d3]/30 max-w-md">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold">Durasi</span>
                <p className="text-lg font-bold text-[#3a1078] mt-0.5">21 Hari</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold">Rutin</span>
                <p className="text-lg font-bold text-[#3a1078] mt-0.5">2 Langkah</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold">Untuk</span>
                <p className="text-lg font-bold text-[#3a1078] mt-0.5">Semua Kulit</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a 
                href="#join-section" 
                className="bg-[#3a1078] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider text-center hover:opacity-95 transition-opacity"
              >
                Gabung Program Sekarang
              </a>
              <a 
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="border border-[#3a1078] text-[#3a1078] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider text-center hover:bg-[#3a1078]/5 transition-colors flex items-center justify-center gap-2"
              >
                Chat WhatsApp
              </a>
            </div>
          </div>

          {/* Right Hero Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-3xl overflow-hidden shadow-sm border border-[#ccc3d3]/20 bg-white">
              <Image 
                src="/GlowAge_Multi_Active_Serum&Bright_Care_Moisture_Cream.png"
                alt="Ginabo 21-Day Products Bundle"
                fill
                className="object-contain p-6"
                priority
                unoptimized
              />
              
              {/* Garansi Badge */}
              <div className="absolute top-4 right-4 bg-[#c5a059] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                Garansi 21 Hari
              </div>

              {/* Yang kamu dapatkan overlay card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-purple-100/50 shadow-sm">
                <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">Yang Kamu Dapatkan</span>
                <h3 className="text-sm font-bold text-[#3a1078] mt-1 mb-2">Paket Lengkap Perjalanan Kulit</h3>
                <ul className="grid grid-cols-2 gap-2 text-xs text-[#4a4451]">
                  <li className="flex items-center gap-1.5">✓ 2 Produk Full Size</li>
                  <li className="flex items-center gap-1.5">✓ Guide Pemakaian</li>
                  <li className="flex items-center gap-1.5">✓ Tracker Progress</li>
                  <li className="flex items-center gap-1.5">✓ Komunitas Support</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 3. CARA KERJA SECTION ──────────────────────────────────────────── */}
      <section id="cara-kerja" className="bg-[#f0eded]/40 py-24 border-y border-[#ccc3d3]/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-[#c5a059] tracking-[0.2em] uppercase">Langkah Program</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#3a1078] mt-2">Cara Kerja Program 21 Hari</h2>
            <p className="text-sm text-[#71717a] mt-3">Skema sederhana untuk membangun kebiasaan merawat wajah secara konsisten harian.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Daftar", desc: "Isi data diri singkat & pilih concern utamamu di form pendaftaran." },
              { num: "2", title: "Pakai 21 Hari", desc: "Gunakan 2 langkah rutin Ginabo pagi dan malam secara teratur." },
              { num: "3", title: "Upload Progress", desc: "Kirim foto dan bagikan update berkala di grup untuk evaluasi bersama." }
            ].map((step) => (
              <div 
                key={step.num} 
                className="bg-white rounded-2xl p-8 border border-[#7b7482]/10 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                style={{ boxShadow: "0 10px 30px rgba(58, 16, 120, 0.02)" }}
              >
                <div className="w-12 h-12 rounded-full bg-[#3a1078]/10 text-[#3a1078] flex items-center justify-center text-lg font-bold mb-6 group-hover:bg-[#3a1078] group-hover:text-white transition-colors">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-[#3a1078] mb-2">{step.title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. PRODUK & MANFAAT ────────────────────────────────────────────── */}
      <section id="produk" className="max-w-[1280px] mx-auto px-6 md:px-10 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold text-[#c5a059] tracking-[0.2em] uppercase">Formulasi Utama</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#3a1078] mt-2">2 Produk, 2 Langkah, Hasil Maksimal</h2>
          <p className="text-sm text-[#71717a] mt-3">Produk inti yang dirancang saling melengkapi untuk mengunci kelembapan dan menutrisi kulit secara aman.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Product 1: GlowAge Serum */}
          <div className="bg-white rounded-2xl border border-[#7b7482]/10 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-[45%] bg-[#f0eded]/50 p-6 flex items-center justify-center relative">
              <div className="relative w-full aspect-square max-w-[200px]">
                <Image 
                  src="/GlowAge_Multi_Active_Serum.png" 
                  alt="GlowAge Multi-Active Serum"
                  fill 
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="absolute top-4 left-4 bg-[#3a1078] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">Langkah 1</span>
            </div>
            <div className="w-full md:w-[55%] p-8 flex flex-col justify-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#3a1078]">GlowAge Multi-Active Serum</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Hydration & Texture Renewal</p>
              </div>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Membantu memperbaiki tekstur kulit yang tidak rata serta menjaga kekuatan skin barrier secara optimal.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#7b7482]/10 text-xs">
                <div>
                  <span className="font-semibold text-[#3a1078]">Fungsi utama:</span>
                  <p className="text-[#71717a] mt-0.5">Memperbaiki barrier & meratakan tekstur kulit.</p>
                </div>
                <div>
                  <span className="font-semibold text-[#3a1078]">Tekstur:</span>
                  <p className="text-[#71717a] mt-0.5">Ringan, cepat meresap, bebas lengket.</p>
                </div>
                <div>
                  <span className="font-semibold text-[#3a1078]">Key ingredients:</span>
                  <p className="text-[#71717a] mt-0.5">Ceramide NP, 5% Niacinamide, Panthenol, Centella.</p>
                </div>
                <div>
                  <span className="font-semibold text-[#3a1078]">Cocok untuk:</span>
                  <p className="text-[#71717a] mt-0.5">Semua jenis kulit, kusam, tekstur kasar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product 2: Bright & Care Moisture Cream */}
          <div className="bg-white rounded-2xl border border-[#7b7482]/10 shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-[45%] bg-[#f0eded]/50 p-6 flex items-center justify-center relative">
              <div className="relative w-full aspect-square max-w-[200px]">
                <Image 
                  src="/Bright&Care_Moisture_Cream.png" 
                  alt="Bright & Care Moisture Cream"
                  fill 
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="absolute top-4 left-4 bg-[#3a1078] text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">Langkah 2</span>
            </div>
            <div className="w-full md:w-[55%] p-8 flex flex-col justify-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#3a1078]">Bright & Care Moisture Cream</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Moisture Lock & Calming</p>
              </div>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Mengunci kelembapan alami secara mendalam serta membantu menenangkan kulit yang rentan mengalami kemerahan.
              </p>
              <div className="space-y-2 pt-2 border-t border-[#7b7482]/10 text-xs">
                <div>
                  <span className="font-semibold text-[#3a1078]">Fungsi utama:</span>
                  <p className="text-[#71717a] mt-0.5">Mengunci hidrasi & menenangkan inflamasi.</p>
                </div>
                <div>
                  <span className="font-semibold text-[#3a1078]">Tekstur:</span>
                  <p className="text-[#71717a] mt-0.5">Cream ringan, lembut, nyaman di kulit.</p>
                </div>
                <div>
                  <span className="font-semibold text-[#3a1078]">Key ingredients:</span>
                  <p className="text-[#71717a] mt-0.5">Ceramide, Panthenol, Allantoin, Squalane.</p>
                </div>
                <div>
                  <span className="font-semibold text-[#3a1078]">Cocok untuk:</span>
                  <p className="text-[#71717a] mt-0.5">Kulit kering, sensitif, mudah memerah.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 5. TIMELINE HASIL SECTION ──────────────────────────────────────── */}
      <section id="timeline" className="bg-[#f0eded]/40 py-24 border-y border-[#ccc3d3]/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold text-[#c5a059] tracking-[0.2em] uppercase">Ekspektasi Progres</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#3a1078] mt-2">Timeline Hasil (Ekspektasi Realistis)</h2>
            <p className="text-sm text-[#71717a] mt-3">Perubahan kulit wajah yang sehat membutuhkan waktu dan konsistensi yang nyata.</p>
          </div>

          <div className="max-w-4xl mx-auto relative pl-8 md:pl-0 md:flex md:gap-6">
            
            {/* progress line for desktop */}
            <div className="hidden md:block absolute top-[15px] left-8 right-8 h-0.5 bg-[#ccc3d3]/40 z-0" />

            {[
              {
                week: "Minggu 1",
                title: "Adaptasi & Hidrasi",
                items: ["Kulit terasa lebih lembap", "Kemerahan mulai berkurang", "Tekstur terasa sedikit lebih halus"]
              },
              {
                week: "Minggu 2",
                title: "Perbaikan & Kuat",
                items: ["Skin barrier mulai terasa stabil", "Kulit terasa kenyal & sehat", "Noda ringan perlahan memudar"]
              },
              {
                week: "Minggu 3",
                title: "Stabil & Glowing",
                items: ["Warna kulit cerah merata", "Hidrasi terkunci optimal", "Kulit tampak bersih, sehat, & glowing"]
              }
            ].map((milestone, idx) => (
              <div key={milestone.week} className="relative z-10 md:flex-1 md:text-center pb-8 md:pb-0">
                
                {/* timeline point */}
                <div className="absolute -left-10 md:left-1/2 md:-translate-x-1/2 top-0 md:top-[-10px] w-6 h-6 rounded-full bg-[#3a1078] border-4 border-white flex items-center justify-center" />
                
                <div className="md:mt-8 bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm inline-block w-full text-left">
                  <span className="text-[10px] font-bold text-[#c5a059] tracking-wider uppercase">{milestone.week}</span>
                  <h3 className="text-base font-bold text-[#3a1078] mt-1 mb-3">{milestone.title}</h3>
                  <ul className="space-y-2 text-xs text-[#71717a]">
                    {milestone.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#3a1078] mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ─── 6. BUKTI NYATA (SOCIAL PROOF) ──────────────────────────────────── */}
      <section id="testimoni" className="max-w-[1280px] mx-auto px-6 md:px-10 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold text-[#c5a059] tracking-[0.2em] uppercase">Testimoni Nyata</span>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#3a1078] mt-2">Bukti Nyata dari Mereka</h2>
          <p className="text-sm text-[#71717a] mt-3">Hasil pemakaian rutin dari anggota komunitas 21 Days Journey Ginabo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Before After Image Slider */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm">
            <h3 className="text-sm font-bold text-[#3a1078] mb-4 text-center uppercase tracking-wider">Geser Progres (21 Hari)</h3>
            <div 
              className="relative aspect-square w-full overflow-hidden rounded-2xl cursor-ew-resize select-none"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              {/* Before Image (Left side base) */}
              <div className="absolute inset-0 bg-[#fcece9]">
                <Image 
                  src="/product-serum-bg.png" 
                  alt="Sebelum" 
                  fill 
                  className="object-contain filter grayscale opacity-70 p-4" 
                  unoptimized
                />
                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded">Hari 1: Kusam & Kemerahan</span>
              </div>
              
              {/* After Image (Right side overlay) */}
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
                <span className="absolute bottom-3 right-3 bg-[#3a1078] text-white text-[9px] font-bold px-2 py-0.5 rounded">Hari 21: Sehat & Glowing</span>
              </div>
              
              {/* Slider Bar */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-[#3a1078] font-bold text-xs">
                  ↔
                </div>
              </div>
            </div>
            <p className="text-[10px] text-center text-[#71717a] mt-4">Arahkan kursor atau sentuh gambar untuk melihat perubahan detail.</p>
          </div>

          {/* Column 2: Testimonial Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm space-y-3">
              <div className="flex text-[#c5a059]">★★★★★</div>
              <p className="text-xs text-[#71717a] leading-relaxed italic">
                &ldquo;Kulit saya terasa jauh lebih lembap dan kemerahan berkurang secara bertahap dalam satu minggu pemakaian konsisten.&rdquo;
              </p>
              <div>
                <span className="text-xs font-bold text-[#3a1078]">Anisa, 24 tahun</span>
                <p className="text-[10px] text-[#71717a]">Kulit Sensitif</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm space-y-3">
              <div className="flex text-[#c5a059]">★★★★★</div>
              <p className="text-xs text-[#71717a] leading-relaxed italic">
                &ldquo;Rutin 2 langkah ini sangat membantu menjaga kelembapan kulit saya yang tadinya kering di area pipi. Suka sekali dengan teksturnya.&rdquo;
              </p>
              <div>
                <span className="text-xs font-bold text-[#3a1078]">Dita, 27 tahun</span>
                <p className="text-[10px] text-[#71717a]">Kulit Kombinasi</p>
              </div>
            </div>
          </div>

          {/* Column 3: UGC Video Section */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-[#3a1078] mb-4 text-center uppercase tracking-wider">Video Pengalaman</h3>
            <div className="relative w-full aspect-video rounded-xl bg-slate-100 overflow-hidden group">
              <Image 
                src="/product-bundle.png" 
                alt="UGC Video Thumbnail" 
                fill 
                className="object-cover opacity-90 transition group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 text-[#3a1078] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 cursor-pointer">
                  <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-[#71717a] mt-4 font-semibold">Lihat pengalaman jujur mereka langsung dari komunitas Ginabo.</p>
          </div>

        </div>
      </section>

      {/* ─── 7. RULES & FAQ SECTION ─────────────────────────────────────────── */}
      <section id="faq" className="bg-[#f0eded]/40 py-24 border-y border-[#ccc3d3]/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Rules column */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold text-[#c5a059] tracking-[0.2em] uppercase">Panduan Dasar</span>
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#3a1078] mt-2">Aturan Main Program</h2>
                <p className="text-xs text-[#71717a] mt-2">Patuhi komitmen berikut untuk mendapatkan hasil perbaikan kulit yang maksimal.</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Komitmen 21 Hari",
                    desc: "Wajib melakukan pemakaian rutin pagi & malam secara disiplin tanpa terputus."
                  },
                  {
                    title: "Foto Progress Berjangka",
                    desc: "Dokumentasikan progres kulit wajah Anda setiap minggu sesuai instruksi tracker."
                  },
                  {
                    title: "Kejujuran & Evaluasi",
                    desc: "Sampaikan reaksi kulit Anda apa adanya agar tim pendamping dapat memberikan tips yang tepat."
                  },
                  {
                    title: "Dukungan Komunitas",
                    desc: "Saling mendukung, berbagi cerita, dan berkonsultasi di grup eksklusif program."
                  }
                ].map((rule, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white border border-[#7b7482]/10">
                    <div className="w-8 h-8 rounded-full bg-[#3a1078]/10 text-[#3a1078] flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#3a1078]">{rule.title}</h4>
                      <p className="text-xs text-[#71717a] mt-1">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ column */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold text-[#c5a059] tracking-[0.2em] uppercase">Tanya Jawab</span>
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#3a1078] mt-2">Pertanyaan Umum</h2>
                <p className="text-xs text-[#71717a] mt-2">Informasi penting yang sering ditanyakan seputar pendaftaran & penggunaan.</p>
              </div>

              <div className="space-y-2 bg-white p-6 rounded-2xl border border-[#7b7482]/10 shadow-sm">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-[#7b7482]/10 last:border-b-0 py-3.5">
                    <button 
                      className="flex justify-between items-center w-full text-left font-semibold text-sm text-[#3a1078] hover:text-[#c5a059] transition-colors"
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.q}</span>
                      <span className="text-[#c5a059] ml-2">{faqOpen === index ? '−' : '+'}</span>
                    </button>
                    
                    <AnimatePresence>
                      {faqOpen === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: EASE } }}
                          exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: EASE } }}
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
            </div>

          </div>
        </div>
      </section>

      {/* ─── 8. FINAL CTA (REGISTRATION FORM) ───────────────────────────────── */}
      <section id="join-section" className="max-w-[1280px] mx-auto px-6 md:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="inline-block bg-[#3a1078]/10 text-[#3a1078] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
              Mulai Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#3a1078] leading-tight">
              Siap mulai perjalanan 21 hari kulit sehatmu?
            </h2>
            <p className="text-sm text-[#71717a] leading-relaxed max-w-md">
              Lengkapi formulir pendaftaran di samping untuk segera terdaftar dalam program Ginabo 21 Days Journey. Pendampingan eksklusif menanti Anda.
            </p>
            
            <div className="bg-[#f0eded]/50 p-6 rounded-2xl border border-[#7b7482]/10 space-y-2">
              <span className="text-xs font-bold text-[#3a1078] block">Informasi Pendaftaran</span>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Pendaftaran tidak dipungut biaya admin tambahan. Anda hanya perlu berkomitmen mengikuti program dengan menggunakan 2 produk Ginabo terpilih secara teratur.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-[500px]">
              <JoinForm />
            </div>
          </div>

        </div>
      </section>

      {/* ─── 9. FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#ccc3d3]/30 py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            <div className="space-y-4">
              <span className="text-lg font-bold font-serif text-[#3a1078]">Ginabo</span>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Program skincare 21 hari yang fokus memberikan nutrisi mendalam secara bertahap & aman bagi skin barrier Anda.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3a1078] mb-4">Navigasi</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#cara-kerja" className="text-[#71717a] hover:text-[#3a1078]">Cara Kerja</a></li>
                <li><a href="#produk" className="text-[#71717a] hover:text-[#3a1078]">Produk</a></li>
                <li><a href="#timeline" className="text-[#71717a] hover:text-[#3a1078]">Timeline</a></li>
                <li><a href="#testimoni" className="text-[#71717a] hover:text-[#3a1078]">Testimoni</a></li>
                <li><a href="#faq" className="text-[#71717a] hover:text-[#3a1078]">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3a1078] mb-4">Kebijakan</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/privacy" className="text-[#71717a] hover:text-[#3a1078]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-[#71717a] hover:text-[#3a1078]">Terms & Conditions</Link></li>
                <li><Link href="/legal" className="text-[#71717a] hover:text-[#3a1078]">Refund Policy</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3a1078] mb-4">Ikuti Kami</h4>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#71717a] hover:text-[#3a1078] text-sm">Instagram</a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="text-[#71717a] hover:text-[#3a1078] text-sm">TikTok</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-[#71717a] hover:text-[#3a1078] text-sm">YouTube</a>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-[#ccc3d3]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-[#71717a]">
            <p>© 2024 Ginabo. All rights reserved.</p>
            <p>Made with ❤️ for healthy skin.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
