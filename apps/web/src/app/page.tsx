import Link from "next/link";
import Image from "next/image";
import { SkinTypeSection } from "@/components/SkinTypeSection";

const heroSlides = [
  {
    tag: "Barrier-first · Daily · Trust-based",
    title: "Kulit Sehat Dimulai dari Rutinitas yang Tepat",
    sub: "Ginabo hadir untuk membantu kamu merawat kulit dengan cara yang sederhana, konsisten, dan aman untuk pemakaian harian.",
    cta: "Belanja Sekarang",
    href: "/shop",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80",
    imgAlt: "Model skincare Ginabo",
  },
  {
    tag: "New Arrival · GlowAge Series",
    title: "Brightening yang Menghormati Skin Barrier",
    sub: "Cerah bertahap tanpa efek purging. Diformulasikan untuk pemakaian AM/PM yang nyaman setiap hari.",
    cta: "Lihat Produk",
    href: "/shop",
    img: "/product-serum-bg.png",
    imgAlt: "Skincare Brightening Series",
  },
  {
    tag: "Konsultasi Gratis · Skin Expert",
    title: "Yuk Kenali Kondisi Kulitmu Lebih Dalam",
    sub: "Booking sesi konsultasi singkat bersama ahli kami — gratis, tanpa paksaan beli.",
    cta: "Booking Sekarang",
    href: "/booking",
    img: "/product-dna-bg.png",
    imgAlt: "Konsultasi skincare",
  },
];

const products = [
  {
    name: "GlowAge Multi-Active Serum",
    type: "Serum · 30ml",
    badge: "BESTSELLER",
    price: "Rp 285.000",
    rating: "4.9",
    reviews: "2.1k",
    img: "/product-serum-1.png",
  },
  {
    name: "Bright & Care Moisture Cream",
    type: "Moisturizer · 10g",
    badge: "FAVORITE",
    price: "Rp 195.000",
    rating: "4.8",
    reviews: "1.8k",
    img: "/product-cream-bg.png",
  },
  {
    name: "Hydra Moist Gel Ultimate",
    type: "DNA Salmon · 30ml",
    badge: "BESTSELLER",
    price: "Rp 215.000",
    rating: "4.9",
    reviews: "890",
    img: "/product-dna-bg.png",
  },
  {
    name: "Daily Barrier Routine Set",
    type: "Bundling AM/PM",
    badge: "BUNDLING",
    price: "Rp 380.000",
    rating: "5.0",
    reviews: "3.2k",
    img: "/product-bundle.png",
  },
];

const seriesBanners = [
  {
    title: "GlowAge Series",
    sub: "Brightening + Anti-aging",
    href: "/shop",
    img: "/product-serum-2.png",
  },
  {
    title: "Hydration Series",
    sub: "Deep moisture daily",
    href: "/shop",
    img: "/product-cream-1.png",
  },
  {
    title: "Barrier Series",
    sub: "Soothing & repair",
    href: "/shop",
    img: "/product-dna-1.png",
  },
  {
    title: "DNA Salmon Series",
    sub: "Calming + recovery",
    href: "/shop",
    img: "/product-dna-2.png",
  },
];

const blogPosts = [
  { title: "Kenali Tanda-tanda Skin Barrier Kamu Rusak", date: "12 Apr 2024", tag: "Skin Barrier", read: "4 min", img: "/product-serum-3.png" },
  { title: "Urutan Skincare yang Benar untuk Pemula",    date: "5 Apr 2024",  tag: "Beginner",     read: "6 min", img: "/product-cream-2.png" },
  { title: "Serum vs Essence: Mana yang Kamu Butuhkan?", date: "28 Mar 2024", tag: "Tips",         read: "5 min", img: "/product-serum-4.png" },
  { title: "Cara Pakai Sunscreen yang Efektif Setiap Hari", date: "20 Mar 2024", tag: "Sunscreen", read: "3 min", img: "/product-dna-3.png" },
];

const shopCategories = [
  { label: "SERUM",       href: "/shop", img: "/product-serum-bg.png" },
  { label: "MOISTURIZER", href: "/shop", img: "/product-cream-bg.png" },
  { label: "DNA SALMON",  href: "/shop", img: "/product-dna-bg.png" },
  { label: "BUNDLING",    href: "/shop", img: "/product-bundle.png" },
  { label: "SERUM SET",   href: "/shop", img: "/product-serum-1.png" },
  { label: "CREAM SET",   href: "/shop", img: "/product-cream-1.png" },
];

export default function HomePage() {
  return (
    <div>

      {/* ── 1. HERO SLIDER ── */}
      <section className="relative overflow-hidden">
        {heroSlides.map((s, i) => (
          <div key={i} className={i === 0 ? "block" : "hidden"}>
            <div className="relative min-h-[60vh] w-full overflow-hidden md:min-h-[88vh]">
              {/* background photo */}
              <Image
                src={s.img}
                alt={s.imgAlt}
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-900/70 via-brand-800/40 to-transparent" />
              {/* content */}
              <div className="relative mx-auto flex h-full w-full max-w-8xl flex-col items-start justify-center gap-5 px-6 py-20 md:min-h-[88vh] md:gap-7 md:px-12 md:py-0">
                <span className="rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                  {s.tag}
                </span>
                <h1 className="max-w-xl text-3xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
                  {s.title}
                </h1>
                <p className="max-w-md text-sm leading-relaxed text-white/80 md:text-base">{s.sub}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href={s.href}
                    className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-brand-800 shadow-brand transition hover:bg-brand-50">
                    {s.cta}
                  </Link>
                  <Link href="/about"
                    className="rounded-xl border border-white/50 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
                    Tentang Kami
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, i) => (
            <span key={i} className={`block h-1.5 rounded-full transition-all ${i === 0 ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
          ))}
        </div>
      </section>

      {/* ── 3. CUSTOMER FAVORITE ── */}
      <section className="bg-brand-50 py-16 md:py-20">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-1 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
            Customer Favorite
          </div>
          <h2 className="mb-2 text-center text-2xl font-bold text-brand-900 md:text-3xl">
            Produk Terlaris Ginabo
          </h2>
          <p className="mb-10 text-center text-sm text-brand-500">
            Diformulasi dari riset bertahun-tahun — ringan di kulit, konsisten pada hasil.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.map((p) => (
              <Link key={p.name} href="/shop" className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-brand-sm transition hover:shadow-brand">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={p.img} alt={p.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
                  <span className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                    p.badge === "NEW" ? "bg-accent" : p.badge === "BUNDLING" ? "bg-brand-500" : "bg-brand-700"
                  }`}>{p.badge}</span>
                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-brand-700/90 py-3 text-xs font-semibold text-white transition-transform duration-200 group-hover:translate-y-0">
                    + Tambah ke Keranjang
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3 md:p-4">
                  <div className="text-[11px] text-brand-400">{p.type}</div>
                  <div className="text-sm font-semibold leading-snug text-brand-900 md:text-base">{p.name}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-amber-400">★ {p.rating}</span>
                    <span className="text-[11px] text-brand-400">({p.reviews})</span>
                  </div>
                  <div className="mt-2 font-bold text-brand-700">{p.price}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-700 px-8 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-700 hover:text-white">
              Lihat Semua Produk →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. SHOP BY CATEGORY ── */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-brand-900 md:text-3xl">
            Shop By Category
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {shopCategories.map((c) => (
              <Link key={c.label} href={c.href}
                className="group flex shrink-0 flex-col items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 transition hover:border-brand-300 hover:bg-brand-100"
                style={{ minWidth: 110 }}>
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-brand-sm">
                  <Image src={c.img} alt={c.label} fill className="object-cover" sizes="64px" />
                </div>
                <span className="text-[11px] font-bold tracking-[0.12em] text-brand-800">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SERIES BANNERS ── */}
      <section className="bg-brand-50 py-14 md:py-20">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
            The Story Behind Our Series
          </div>
          <h2 className="mb-10 text-center text-2xl font-bold text-brand-900 md:text-3xl">
            Skincare Series untuk Setiap Kebutuhan
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {seriesBanners.map((s) => (
              <Link key={s.title} href={s.href}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl">
                <Image src={s.img} alt={s.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/20 to-transparent" />
                <div className="relative p-5">
                  <div className="font-bold text-white">{s.title}</div>
                  <div className="mt-1 text-xs text-white/70">{s.sub}</div>
                  <div className="mt-3 text-xs font-bold text-brand-200 opacity-0 transition-opacity group-hover:opacity-100">
                    Lihat Series →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PRODUCT RECOMMENDATIONS ── */}
      <SkinTypeSection />

      {/* ── 6b. FEATURE STRIP ── */}
      <section className="bg-brand-700">
        <div className="mx-auto grid w-full max-w-8xl grid-cols-1 divide-y divide-brand-600 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              title: "FREE SHIPPING AROUND INDONESIA",
              icon: (
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="h-12 w-12">
                  <rect x="2" y="20" width="40" height="26" rx="3"/><path d="M42 28h10l8 10v8H42V28z"/><circle cx="16" cy="50" r="5"/><circle cx="50" cy="50" r="5"/><path d="M11 20V14a2 2 0 012-2h26a2 2 0 012 2v6"/>
                </svg>
              ),
            },
            {
              title: "SPECIAL GIFT WITH PURCHASE\n(WEBSITE ONLY)",
              icon: (
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="h-12 w-12">
                  <rect x="8" y="24" width="48" height="36" rx="2"/><rect x="4" y="16" width="56" height="10" rx="2"/><path d="M32 16v44M20 16a8 8 0 010-10 8 8 0 0112 0M44 16a8 8 0 000-10 8 8 0 00-12 0"/>
                </svg>
              ),
            },
            {
              title: "CLEARANCE SALE AND DISCOUNT\n(MONDAY AND FRIDAY)",
              icon: (
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="h-12 w-12">
                  <circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="18"/><path d="M24 40l16-16M24 26a2 2 0 110-4 2 2 0 010 4zM40 42a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              ),
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-5 px-8 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white">
                {f.icon}
              </div>
              <span className="whitespace-pre-line text-[11px] font-bold tracking-[0.15em] text-white/90">{f.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. PROBLEM SECTION ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Tantangan Kulit Sehari-hari</div>
          <h2 className="mb-4 text-center text-2xl font-bold text-brand-900 md:text-3xl">
            Apakah Kamu Merasakannya?
          </h2>
          <p className="mb-12 text-center text-sm text-brand-500">
            Kulitmu butuh nutrisi, bukan treatment keras.
          </p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: "💧", title: "Kulit Kering", desc: "Terasa ketarik sepanjang hari walau sudah pakai moisturizer" },
              { icon: "🌫️", title: "Kusam & Tidak Merata", desc: "Wajah terlihat lelah meski sudah tidur cukup" },
              { icon: "😫", title: "Kulit Mudah Iritasi", desc: "Produk baru langsung bikin kemerahan atau purging" },
              { icon: "💄", title: "Makeup Tidak Nyaman", desc: "Foundation mudah luntur, pori-pori terlihat jelas" },
            ].map(p => (
              <div key={p.title} className="flex flex-col items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center">
                <span className="text-4xl">{p.icon}</span>
                <div className="text-sm font-bold text-brand-900">{p.title}</div>
                <div className="text-xs leading-relaxed text-brand-500">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. SOLUTION SECTION ── */}
      <section className="bg-brand-50 py-16 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Pendekatan Kami</div>
            <h2 className="mb-6 text-2xl font-bold text-brand-900 md:text-3xl">Nutrition Skin Approach</h2>
            <p className="mb-10 text-sm leading-relaxed text-brand-600">
              GINABO tidak mengejar hasil instan. Kami percaya kulit yang sehat dibangun dari rutinitas yang konsisten dan bahan-bahan yang benar-benar bersahabat dengan kulitmu.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { num: "01", title: "Gentle", desc: "Formula ringan yang aman dipakai rutin setiap hari tanpa khawatir efek samping" },
                { num: "02", title: "Barrier-focused", desc: "Prioritas pertama adalah menjaga lapisan pelindung kulit tetap kuat dan sehat" },
                { num: "03", title: "Daily Use", desc: "Dirancang untuk AM & PM — simpel, nyaman, dan hasilnya kelihatan konsisten" },
              ].map(s => (
                <div key={s.num} className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-brand-sm">
                  <div className="text-3xl font-extrabold text-brand-200">{s.num}</div>
                  <div className="text-base font-bold text-brand-800">{s.title}</div>
                  <div className="text-xs leading-relaxed text-brand-500">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. HERO PRODUCT ── */}
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid w-full max-w-8xl md:grid-cols-2">
          <div className="relative min-h-[360px] overflow-hidden md:min-h-[540px]">
            <Image
              src="/product-serum-bg.png"
              alt="GlowAge Multi-Active Serum"
              fill
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center gap-5 px-6 py-12 md:px-12 md:py-16">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Hero Product</div>
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">GlowAge Multi-Active Serum</h2>
            <p className="text-sm leading-relaxed text-brand-600">
              Diformulasi hampir 2 tahun untuk membantu meratakan warna kulit, menjaga kelembapan & skin barrier, dan menenangkan kemerahan — dalam satu langkah simpel.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                "✦ Brightening bertahap — rata merata tanpa iritasi",
                "✦ Barrier support — kulit tetap kuat & terlindungi",
                "✦ Anti-aging ringan — cocok mulai usia 18+",
              ].map(b => (
                <li key={b} className="text-sm font-medium text-brand-700">{b}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {["BPOM RI", "Cruelty Free", "Dermat. Tested", "Daily Safe"].map(badge => (
                <span key={badge} className="rounded-full bg-brand-100 px-3 py-1 text-[11px] font-bold text-brand-700">{badge}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xl font-extrabold text-brand-700">Rp 285.000</span>
              <span className="text-xs text-brand-400 line-through">Rp 320.000</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-xl bg-brand-700 px-7 py-3 text-sm font-bold text-white shadow-brand transition hover:bg-brand-800">
                Coba First Try
              </Link>
              <Link href="/shop" className="rounded-xl border border-brand-300 px-7 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
                Lihat Detail →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. HOW IT WORKS ── */}
      <section className="bg-brand-50 py-16 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Cara Kerja</div>
          <h2 className="mb-12 text-center text-2xl font-bold text-brand-900 md:text-3xl">Semudah 3 Langkah</h2>
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* connector line */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-brand-200 md:block" style={{left:"16%", right:"16%"}} />
            {[
              { step: "01", title: "Apply Daily", desc: "Pakai serum & moisturizer pagi dan malam setelah cuci muka. Cukup 2–3 menit." },
              { step: "02", title: "Skin Feels Better", desc: "Minggu pertama kulit mulai terasa lebih lembap, lebih tenang, dan nyaman sepanjang hari." },
              { step: "03", title: "Visible Improvement", desc: "Setelah konsisten 4–8 minggu, warna kulit lebih merata dan cerah terlihat jelas." },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center gap-4 text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-lg font-extrabold text-white shadow-brand">
                  {s.step}
                </div>
                <div className="text-base font-bold text-brand-900">{s.title}</div>
                <div className="max-w-xs text-xs leading-relaxed text-brand-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. SOCIAL PROOF ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Testimoni</div>
          <h2 className="mb-10 text-center text-2xl font-bold text-brand-900 md:text-3xl">Apa Kata Mereka?</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Rizka A.",    skin: "Kulit kering",    rating: 5, text: "Pakai 2 minggu udah kerasa bedanya. Kulitku yang kering banget akhirnya bisa lembap seharian tanpa re-apply!", img: "/product-serum-1.png" },
              { name: "Diandra S.",  skin: "Kulit berminyak", rating: 5, text: "Skeptis awalnya, tapi sekarang udah jadi holy grail. Minyak berkurang, pori nggak kelihatan melar, dan makeup nempel lama!", img: "/product-cream-bg.png" },
              { name: "Marshanda P.",skin: "Kulit sensitif",  rating: 5, text: "Kulit sensitifku nggak kena iritasi sama sekali. Teksturnya ringan banget dan wanginya segar nggak bikin migrain.", img: "/product-dna-bg.png" },
              { name: "Tiara W.",    skin: "Kombinasi",       rating: 5, text: "T-zone tetap terkontrol, pipi nggak kering. Akhirnya nemu yang bisa handle kombinasi skin!",                         img: "/product-serum-2.png" },
              { name: "Felicia N.",  skin: "Kulit normal",    rating: 5, text: "Udah 3 bulan konsisten dan kulit glowing banget. Banyak yang nanya skincare apa yang aku pakai!",                     img: "/product-cream-1.png" },
              { name: "Amira K.",    skin: "Kulit kering",    rating: 5, text: "Serum-nya ringan banget, nggak lengket, cepet meresap. Bahkan bisa dipake sebelum makeup dan nggak bikin blobor.",     img: "/product-dna-1.png" },
            ].map(r => (
              <div key={r.name} className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-brand-200">
                    <Image src={r.img} alt={r.name} fill className="object-cover" sizes="44px" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-900">{r.name}</div>
                    <div className="text-[11px] text-brand-400">{r.skin}</div>
                  </div>
                  <div className="ml-auto text-xs font-bold text-amber-400">{"★".repeat(r.rating)}</div>
                </div>
                <p className="text-xs leading-relaxed text-brand-600">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. FIRST TRY SECTION ── */}
      <section className="bg-brand-700 py-16 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 text-center md:px-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-200">Khusus Kamu yang Belum Pernah Coba</div>
          <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl">Mulai dari First Try</h2>
          <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-brand-200">
            Ukuran kecil, harga terjangkau. Rasakan sendiri manfaatnya sebelum komit ke full size — tanpa risiko, tanpa tekanan.
          </p>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: "Ukuran 10ml", icon: "🧴" },
              { label: "Harga mulai Rp 75.000", icon: "💜" },
              { label: "Free shipping", icon: "🚚" },
              { label: "Garansi kepuasan", icon: "✅" },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 rounded-full border border-brand-500 bg-brand-800/50 px-4 py-2 text-sm text-white">
                <span>{f.icon}</span><span>{f.label}</span>
              </div>
            ))}
          </div>
          <Link href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-base font-extrabold text-brand-800 shadow-brand-lg transition hover:bg-brand-50">
            Coba First Try Sekarang →
          </Link>
        </div>
      </section>

      {/* ── 13. BUNDLE SECTION ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Hemat Lebih Banyak</div>
          <h2 className="mb-10 text-center text-2xl font-bold text-brand-900 md:text-3xl">Paket Bundling Terbaik</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter Kit",
                desc: "Cocok untuk yang baru mau mulai skincare",
                items: ["Bright & Care Moisture Cream", "DNA Salmon Essence"],
                price: "Rp 360.000",
                original: "Rp 410.000",
                save: "Hemat 12%",
                img: "/product-cream-bg.png",
                highlight: false,
              },
              {
                name: "Daily Barrier Set",
                desc: "Rutinitas AM/PM lengkap untuk kulit sehat konsisten",
                items: ["GlowAge Serum", "Bright & Care Cream", "DNA Salmon Essence"],
                price: "Rp 620.000",
                original: "Rp 695.000",
                save: "Hemat 20%",
                img: "/product-bundle.png",
                highlight: true,
              },
              {
                name: "Brightening Set",
                desc: "Fokus cerahkan kulit bertahap dan merata",
                items: ["GlowAge Serum", "Bright & Care Cream"],
                price: "Rp 435.000",
                original: "Rp 480.000",
                save: "Hemat 9%",
                img: "/product-serum-bg.png",
                highlight: false,
              },
            ].map(b => (
              <div key={b.name} className={`flex flex-col overflow-hidden rounded-2xl border transition hover:shadow-brand ${b.highlight ? "border-brand-500 shadow-brand" : "border-brand-100"}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src={b.img} alt={b.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  {b.highlight && (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold text-white">TERLARIS</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="text-base font-bold text-brand-900">{b.name}</div>
                  <div className="text-xs text-brand-500">{b.desc}</div>
                  <ul className="flex flex-col gap-1">
                    {b.items.map(i => <li key={i} className="text-xs text-brand-600">· {i}</li>)}
                  </ul>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div>
                      <div className="text-lg font-extrabold text-brand-700">{b.price}</div>
                      <div className="text-[11px] text-brand-400 line-through">{b.original}</div>
                    </div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">{b.save}</span>
                  </div>
                  <Link href="/shop" className={`mt-2 rounded-xl py-2.5 text-center text-sm font-bold transition ${b.highlight ? "bg-brand-700 text-white hover:bg-brand-800" : "border border-brand-700 text-brand-700 hover:bg-brand-700 hover:text-white"}`}>
                    Pilih Paket Ini
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 14. ROUTINE SECTION ── */}
      <section className="bg-brand-50 py-16 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Rutinitas Simpel</div>
          <h2 className="mb-4 text-center text-2xl font-bold text-brand-900 md:text-3xl">AM & PM Dalam 3 Langkah</h2>
          <p className="mb-12 text-center text-sm text-brand-500">Ringan tapi nutrisi lengkap — selesai dalam 5 menit.</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { step: "Step 1", name: "Cleanser", desc: "Bersihkan wajah dengan lembut. Cukup sekali — jangan over-cleanse.", time: "1 menit", img: "/product-serum-1.png" },
              { step: "Step 2", name: "Serum", desc: "Aplikasikan GlowAge Serum. Tunggu 15–30 menit agar menyerap sempurna.", time: "15–30 menit", img: "/product-serum-2.png" },
              { step: "Step 3", name: "Moisturizer", desc: "Tutup dengan Bright & Care Cream. Lock in semua nutrisi dan hidrasi.", time: "1 menit", img: "/product-cream-1.png" },
            ].map(r => (
              <div key={r.step} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-brand-sm">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={r.img} alt={r.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  <span className="absolute left-4 top-4 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-bold text-white">{r.step}</span>
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <div className="text-base font-bold text-brand-900">{r.name}</div>
                  <div className="text-xs leading-relaxed text-brand-500">{r.desc}</div>
                  <div className="mt-2 text-[11px] font-semibold text-brand-400">⏱ {r.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. PRESS LOGOS ── */}
      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
            Dipercaya & Diliput
          </div>
          <p className="mb-10 text-center text-base font-medium text-brand-700 md:text-lg">
            "Produk Ginabo menggunakan bahan-bahan yang aman dan teruji untuk pemakaian harian."
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { name: "Kompas TV",     style: "border border-brand-200 px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-white" },
              { name: "Female Daily", style: "border-2 border-pink-400 px-4 py-2 rounded-full text-sm font-bold text-pink-500 bg-white" },
              { name: "Forbes",       style: "text-xl font-black text-brand-900 tracking-tight" },
              { name: "Beauty Journal", style: "text-sm font-bold tracking-widest text-brand-800 uppercase" },
              { name: "CNN Indonesia", style: "text-sm font-black text-red-700 tracking-tight" },
              { name: "Detik Health", style: "text-sm font-bold text-brand-700" },
            ].map((p) => (
              <div key={p.name} className={p.style}>{p.name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. SPLIT ABOUT BANNER ── */}
      <section className="overflow-hidden bg-brand-50">
        <div className="mx-auto grid w-full max-w-8xl md:grid-cols-2">
          <div className="relative min-h-[320px] overflow-hidden md:min-h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80"
              alt="Model Ginabo"
              fill
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-brand-900/20" />
          </div>
          <div className="flex flex-col justify-center gap-5 bg-white px-6 py-12 md:px-12 md:py-16">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Tentang Kami</div>
            <h2 className="text-2xl font-bold leading-snug text-brand-900 md:text-3xl">
              Skincare yang Terasa Seperti Teman yang Paling Paham Kulitmu
            </h2>
            <p className="text-sm leading-relaxed text-brand-600">
              GINABO hadir sebagai Friendly Expert — hangat, jelas, dan berbasis alasan. Bukan sekadar jualan, tapi benar-benar membantu kamu membangun rutinitas yang konsisten dan aman.
            </p>
            <div className="grid grid-cols-3 gap-4 border-t border-brand-100 pt-5">
              {[
                { val: "~2 Thn", desc: "Riset per produk" },
                { val: "15+",    desc: "Usia mulai pakai" },
                { val: "AM/PM",  desc: "Rutinitas simpel" },
              ].map(s => (
                <div key={s.desc}>
                  <div className="text-lg font-extrabold text-brand-700 md:text-xl">{s.val}</div>
                  <div className="text-xs text-brand-400">{s.desc}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/about" className="rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-800">
                Tentang Kami
              </Link>
              <Link href="/booking" className="rounded-xl border border-brand-300 px-6 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100">
                Booking Konsultasi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. CERTIFICATIONS ── */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <p className="mb-8 text-center text-sm font-semibold text-brand-600 md:text-base">
            Inspired by Nature, Created for You
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { label: "PETA",            bg: "bg-yellow-50",  text: "text-yellow-800",  border: "border-yellow-200" },
              { label: "HALAL",           bg: "bg-green-50",   text: "text-green-800",   border: "border-green-300" },
              { label: "Cruelty Free",    bg: "bg-brand-50",   text: "text-brand-700",   border: "border-brand-200" },
              { label: "Vegan",           bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
              { label: "BPOM RI",         bg: "bg-blue-50",    text: "text-blue-800",    border: "border-blue-200" },
              { label: "Dermat. Tested",  bg: "bg-violet-50",  text: "text-violet-800",  border: "border-violet-200" },
            ].map(c => (
              <div key={c.label}
                className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 ${c.bg} ${c.border} p-2 text-center`}>
                <span className={`text-[11px] font-bold leading-tight ${c.text}`}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ── */}
      <section className="bg-brand-50 py-16 md:py-20">
        <div className="mx-auto w-full max-w-3xl px-4 text-center md:px-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Brand Story</div>
          <blockquote className="mb-6 text-xl font-bold leading-relaxed text-brand-900 md:text-2xl">
            "Ginabo dibuat untuk wanita aktif yang butuh skincare simpel dan efektif."
          </blockquote>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-brand-600">
            Kami tidak percaya pada janji instan. GINABO lahir dari keyakinan bahwa kulit yang sehat adalah hasil dari rutinitas konsisten, bukan treatment agresif. Setiap produk kami dibangun di atas riset, komitmen pada keamanan, dan rasa hormat terhadap kulit kamu.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {[
              { val: "2 Tahun", label: "Riset per formula" },
              { val: "15+",     label: "Usia mulai pakai" },
              { val: "50K+",    label: "Pelanggan aktif" },
              { val: "4.9★",    label: "Rating rata-rata" },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className="text-2xl font-extrabold text-brand-700">{s.val}</div>
                <div className="text-xs text-brand-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-purple py-20 md:py-28">
        <div className="mx-auto w-full max-w-8xl px-4 text-center md:px-8">
          <h2 className="mb-4 text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">Your Skin, But Better.</h2>
          <p className="mx-auto mb-10 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Mulai perjalanan skincare yang benar-benar konsisten. Tidak ada janji berlebihan — hanya hasil nyata dari rutinitas yang tepat.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop"
              className="rounded-xl bg-white px-10 py-4 text-base font-extrabold text-brand-800 shadow-brand-lg transition hover:bg-brand-50">
              Shop Now →
            </Link>
            <Link href="/shop"
              className="rounded-xl border-2 border-white/50 px-10 py-4 text-base font-semibold text-white transition hover:bg-white/10">
              Coba First Try
            </Link>
          </div>
        </div>
      </section>

      {/* ── 10. BLOG ── */}
      <section className="bg-brand-50 py-14 md:py-20">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Edukasi & Tips</div>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Info & Tips Terkini</h2>
            <Link href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-800 hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post) => (
              <Link key={post.title} href="#"
                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-brand-sm transition hover:shadow-brand">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={post.img} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
                  <span className="absolute left-3 top-3 rounded-md bg-brand-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {post.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2 text-[11px] text-brand-400">
                    <span>{post.date}</span><span>·</span><span>{post.read} read</span>
                  </div>
                  <div className="text-sm font-semibold leading-snug text-brand-900 transition group-hover:text-brand-600">
                    {post.title}
                  </div>
                  <div className="mt-auto pt-2 text-xs font-semibold text-brand-500 group-hover:text-brand-700">
                    Baca selengkapnya →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
