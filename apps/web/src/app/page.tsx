import Link from "next/link";
import Image from "next/image";
import { SkinTypeSection } from "@/components/SkinTypeSection";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

// Figma composite brand image — 3 individual products side-by-side in one wide image
// Expires 7 days from 2026-05-02 — replace with permanent URL after upload
const FIGMA_PRODUCT_IMG =
  "https://www.figma.com/api/mcp/asset/f08002bb-2c3c-4151-b729-0f966e524df5";

const products = [
  { name: "GlowAge Multi-Active Serum",   type: "Serum · 30ml",       badge: "BESTSELLER", price: "Rp 285.000", rating: "4.9", reviews: "2.1k", img: "/product-serum-1.png",  figmaPos: "100% 30%" },
  { name: "Bright & Care Moisture Cream", type: "Moisturizer · 10g",  badge: "FAVORITE",   price: "Rp 195.000", rating: "4.8", reviews: "1.8k", img: "/product-cream-bg.png", figmaPos: "50% 32%"  },
  { name: "Hydra Moist Gel Ultimate",     type: "DNA Salmon · 30ml",  badge: "BESTSELLER", price: "Rp 215.000", rating: "4.9", reviews: "890",   img: "/product-dna-bg.png",   figmaPos: "0% 28%"   },
  { name: "Daily Skin Nutrition Set",     type: "Bundling AM/PM",     badge: "BUNDLING",   price: "Rp 380.000", rating: "5.0", reviews: "3.2k",  img: "/product-bundle.png" },
];

const seriesBanners = [
  { title: "GlowAge Series",    sub: "Brightening + Anti-aging", href: "/shop", img: "/product-serum-2.png" },
  { title: "Hydration Series",  sub: "Deep moisture daily",       href: "/shop", img: "/product-cream-1.png" },
  { title: "Barrier Series",    sub: "Soothing & repair",         href: "/shop", img: "/product-dna-1.png" },
  { title: "DNA Salmon Series", sub: "Calming + recovery",        href: "/shop", img: "/product-dna-2.png" },
];

const blogPosts = [
  { title: "Kenali Tanda-tanda Skin Barrier Kamu Rusak",    date: "12 Apr 2024", tag: "Skin Barrier", read: "4 min", img: "/product-serum-3.png" },
  { title: "Urutan Skincare yang Benar untuk Pemula",       date: "5 Apr 2024",  tag: "Beginner",     read: "6 min", img: "/product-cream-2.png" },
  { title: "Serum vs Essence: Mana yang Kamu Butuhkan?",   date: "28 Mar 2024", tag: "Tips",         read: "5 min", img: "/product-serum-4.png" },
  { title: "Cara Pakai Sunscreen yang Efektif Setiap Hari",date: "20 Mar 2024", tag: "Sunscreen",    read: "3 min", img: "/product-dna-3.png" },
];

const shopCategories = [
  { label: "SERUM",       href: "/shop", img: "/product-serum-bg.png" },
  { label: "MOISTURIZER", href: "/shop", img: "/product-cream-bg.png" },
  { label: "DNA SALMON",  href: "/shop", img: "/product-dna-bg.png" },
  { label: "BUNDLING",    href: "/shop", img: "/product-bundle.png" },
  { label: "SERUM SET",   href: "/shop", img: "/product-serum-1.png" },
  { label: "CREAM SET",   href: "/shop", img: "/product-cream-1.png" },
];

const marqueeItems = [
  "BPOM ✓", "Halal ✓", "Dermatologist Tested", "No Parabens",
  "Barrier-First", "Gentle Formula", "AM & PM Routine", "2 Years Research",
];

export default function HomePage() {
  return (
    <div className="bg-[#fffafa] overflow-x-hidden">

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section className="relative bg-[#fffafa] overflow-hidden px-5 pt-10 pb-20 md:px-16 lg:px-40" style={{ minHeight: 680 }}>

        {/* LEFT: Staggered entrance — each element reveals in sequence */}
        <div className="relative z-10 flex flex-col" style={{ maxWidth: 560, paddingTop: 20 }}>

          <Reveal direction="up" delay={0}>
            <div className="badge-bg self-start rounded-[10px] px-8 py-2 mb-6">
              <span className="font-bold text-white text-[13px] tracking-wider whitespace-nowrap">
                BARRIER-FIRST &nbsp;&nbsp;&nbsp; DAILY &nbsp;&nbsp;&nbsp; TRUSTED
              </span>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="mb-5">
              <p className="font-staatliches text-[clamp(2.8rem,7vw,70px)] leading-[0.9] text-[#665dac]">Kulit yang lelah</p>
              <p className="font-staatliches text-[clamp(2.8rem,7vw,70px)] leading-[0.9] text-[#cf99b4]">butuh istirahat,</p>
              <p className="font-staatliches text-[clamp(2.8rem,7vw,70px)] leading-[0.9] text-[#665dac]">bukan eksperimen.</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <p className="text-[#777] text-[12px] text-justify leading-relaxed mb-10" style={{ maxWidth: 556 }}>
              Ginabo hadir sebagai skincare yang memiliki banyak manfaat pada kulit, mempentingkan keamanan dan kenyamanan penggunaan, dan fokus pada hasil nyata dengan pendekatan yang modern dan elegan.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.3}>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/shop" className="relative flex items-center badge-bg rounded-[10px] px-5 py-3 gap-3 btn-hover">
                <img src="https://www.figma.com/api/mcp/asset/ee14f4a0-7728-498b-b012-612b6343003b" alt="" className="w-8 h-8 flex-shrink-0" />
                <span className="font-semibold text-white text-[17px] whitespace-nowrap">Belanja Sekarang</span>
              </Link>
              <Link href="/about" className="relative flex items-center bg-white rounded-[10px] px-5 py-3 gap-3 btn-hover shadow">
                <span className="font-semibold text-[17px] whitespace-nowrap" style={{ color: "#bd6cc9" }}>Tentang Kami</span>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* RIGHT: Product image + badges — scale in from right */}
        <Reveal direction="scale" delay={0.15}
          className="relative flex-shrink-0 mt-10 md:mt-0 md:absolute md:right-[5%] lg:right-[8%]"
          style={{ top: 0, bottom: 0 }}
        >
          <div className="flex md:h-full md:items-center">
            <div className="relative">
              <div className="float-anim rounded-[50px] overflow-hidden" style={{ width: "clamp(280px, 40vw, 500px)", height: "clamp(280px, 40vw, 500px)" }}>
                <Image
                  src="/product-serum-bg.png"
                  alt="Ginabo Product"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover object-center"
                  priority
                />
              </div>

              <div className="badge-pulse absolute flex items-center gap-3 rounded-[10px] px-4 py-2.5 shadow-lg"
                style={{ background: "rgba(43,18,44,0.85)", top: "22%", left: "-80px", backdropFilter: "blur(6px)" }}>
                <img src="https://www.figma.com/api/mcp/asset/62d658f6-8bc6-4dee-9b3c-093e10faa9ef" alt="" className="w-9 h-8 flex-shrink-0" />
                <span className="font-bold text-white text-[28px] leading-none">BPOM</span>
              </div>

              <div className="badge-pulse absolute flex items-center gap-3 rounded-[10px] px-4 py-2.5 shadow-lg"
                style={{ background: "rgba(43,18,44,0.85)", bottom: "14%", right: "-90px", backdropFilter: "blur(6px)", animationDelay: "1.4s" }}>
                <img src="https://www.figma.com/api/mcp/asset/62d658f6-8bc6-4dee-9b3c-093e10faa9ef" alt="" className="w-9 h-8 flex-shrink-0" />
                <span className="font-bold text-white text-[28px] leading-none">Halal</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE STRIP — trust signals
      ══════════════════════════════════════════ */}
      <div className="border-y border-[#f0d8eb] bg-white py-3.5">
        <Marquee
          items={marqueeItems}
          speed={28}
          itemClassName="font-bold text-[13px] tracking-wide text-[#78257C]"
          separator="✦"
        />
      </div>

      {/* ══════════════════════════════════════════
          2. CUSTOMER FAVORITE
      ══════════════════════════════════════════ */}
      <section className="bg-[#FDFAFF] py-10 md:py-20">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <Reveal>
            <div className="mb-1 text-center text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#CF99B4" }}>Customer Favorite</div>
            <h2 className="mb-2 text-center text-xl font-bold text-brand-900 md:text-3xl">Produk Terlaris Ginabo</h2>
            <p className="mb-7 text-center text-xs text-brand-500 md:text-sm">Diformulasi dari riset bertahun-tahun — ringan di kulit, konsisten pada hasil.</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <Link href="/shop" className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-brand-sm transition hover:shadow-brand h-full">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {p.figmaPos ? (
                      <div
                        className="absolute inset-0 transition duration-500 group-hover:scale-105"
                        style={{
                          backgroundImage: `url('${FIGMA_PRODUCT_IMG}')`,
                          backgroundSize: "300% auto",
                          backgroundPosition: p.figmaPos,
                        }}
                      />
                    ) : (
                      <Image src={p.img} alt={p.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
                    )}
                    <span className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                      style={{ background: p.badge === "BUNDLING" ? "#665dac" : "#78257C" }}>
                      {p.badge}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center py-3 text-xs font-semibold text-white transition-transform duration-200 group-hover:translate-y-0"
                      style={{ background: "#78257Cee" }}>
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
                    <div className="mt-2 font-bold" style={{ color: "#665dac" }}>{p.price}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <div className="mt-10 text-center">
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-xl border-2 px-8 py-3 text-sm font-bold text-white transition hover:opacity-90"
                style={{ borderColor: "#78257C", background: "#78257C" }}>
                Lihat Semua Produk →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. SHOP BY CATEGORY
      ══════════════════════════════════════════ */}
      <section className="bg-white py-8 md:py-16">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <Reveal>
            <h2 className="mb-5 text-center text-xl font-bold text-brand-900 md:text-3xl">Shop By Category</h2>
          </Reveal>
          <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-none">
            {shopCategories.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.07} direction="scale">
                <Link href={c.href}
                  className="group flex shrink-0 flex-col items-center gap-2 rounded-2xl border bg-[#FBF0F8] p-3 transition hover:border-[#CF99B4] hover:bg-[#F8E8F5]"
                  style={{ minWidth: 90, borderColor: "#f0d8eb" }}>
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-brand-sm">
                    <Image src={c.img} alt={c.label} fill className="object-cover" sizes="56px" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.1em] text-center" style={{ color: "#78257C" }}>{c.label}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. SERIES BANNERS
      ══════════════════════════════════════════ */}
      <section className="bg-[#FDFAFF] py-10 md:py-20">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <Reveal>
            <div className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#CF99B4" }}>The Story Behind Our Series</div>
            <h2 className="mb-6 text-center text-xl font-bold text-brand-900 md:text-3xl">Skincare Series untuk Setiap Kebutuhan</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {seriesBanners.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <Link href={s.href} className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl">
                  <Image src={s.img} alt={s.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #2a1635cc, #78257C40, transparent)" }} />
                  <div className="relative p-5">
                    <div className="font-bold text-white">{s.title}</div>
                    <div className="mt-1 text-xs text-white/70">{s.sub}</div>
                    <div className="mt-3 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "#CF99B4" }}>Lihat Series →</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. SKIN TYPE RECS
      ══════════════════════════════════════════ */}
      <SkinTypeSection />

      {/* ══════════════════════════════════════════
          6. SOLUTION
      ══════════════════════════════════════════ */}
      <section className="bg-[#FDFAFF] py-10 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#CF99B4" }}>Pendekatan Kami</div>
              <h2 className="mb-4 text-xl font-bold text-brand-900 md:text-3xl">Nutrition Skin Approach</h2>
              <p className="mb-7 text-sm leading-relaxed text-brand-600">
                GINABO tidak mengejar hasil instan. Kami percaya kulit yang sehat dibangun dari rutinitas yang konsisten dan bahan-bahan yang benar-benar bersahabat dengan kulitmu.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { num: "01", title: "Gentle",          desc: "Formula ringan yang aman dipakai rutin setiap hari tanpa khawatir efek samping" },
                { num: "02", title: "Barrier-focused", desc: "Prioritas pertama adalah menjaga lapisan pelindung kulit tetap kuat dan sehat" },
                { num: "03", title: "Daily Use",       desc: "Dirancang untuk AM & PM — simpel, nyaman, dan hasilnya kelihatan konsisten" },
              ].map((s, i) => (
                <Reveal key={s.num} delay={i * 0.1}>
                  <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-brand-sm">
                    <div className="text-3xl font-extrabold" style={{ color: "#CF99B4" }}>{s.num}</div>
                    <div className="text-base font-bold text-brand-800">{s.title}</div>
                    <div className="text-xs leading-relaxed text-brand-500">{s.desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="bg-white py-10 md:py-24">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <Reveal>
            <div className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#CF99B4" }}>Testimoni</div>
            <h2 className="mb-6 text-center text-xl font-bold text-brand-900 md:text-3xl">Apa Kata Mereka?</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Rizka A.",      skin: "Kulit kering",    rating: 5, text: "Pakai 2 minggu udah kerasa bedanya. Kulitku yang kering banget akhirnya bisa lembap seharian!", img: "/product-serum-1.png" },
              { name: "Diandra S.",   skin: "Kulit berminyak", rating: 5, text: "Skeptis awalnya, tapi sekarang udah jadi holy grail. Minyak berkurang, pori nggak kelihatan melar!", img: "/product-cream-bg.png" },
              { name: "Marshanda P.", skin: "Kulit sensitif",  rating: 5, text: "Kulit sensitifku nggak kena iritasi sama sekali. Teksturnya ringan banget.", img: "/product-dna-bg.png" },
              { name: "Tiara W.",     skin: "Kombinasi",       rating: 5, text: "T-zone tetap terkontrol, pipi nggak kering. Akhirnya nemu yang bisa handle kombinasi skin!", img: "/product-serum-2.png" },
              { name: "Felicia N.",   skin: "Kulit normal",    rating: 5, text: "Udah 3 bulan konsisten dan kulit glowing banget. Banyak yang nanya skincare apa yang aku pakai!", img: "/product-cream-1.png" },
              { name: "Amira K.",     skin: "Kulit kering",    rating: 5, text: "Serum-nya ringan banget, nggak lengket, cepet meresap. Bisa dipake sebelum makeup juga!", img: "/product-dna-1.png" },
            ].map((r, i) => (
              <Reveal key={r.name} delay={(i % 3) * 0.1}>
                <div className="flex flex-col gap-4 rounded-2xl border p-6 h-full" style={{ background: "#FBF0F8", borderColor: "#f0d8eb" }}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 flex-shrink-0" style={{ borderColor: "#CF99B4" }}>
                      <Image src={r.img} alt={r.name} fill className="object-cover" sizes="44px" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-brand-900">{r.name}</div>
                      <div className="text-[11px] text-brand-400">{r.skin}</div>
                    </div>
                    <div className="ml-auto text-xs font-bold text-amber-400">{"★".repeat(r.rating)}</div>
                  </div>
                  <p className="text-xs leading-relaxed text-brand-600">&quot;{r.text}&quot;</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          8. BRAND ESSENCE
      ══════════════════════════════════════════ */}
      <section className="overflow-hidden" style={{ background: "#2a2356", minHeight: 755 }}>
        <div className="flex w-full flex-col md:flex-row" style={{ minHeight: 755 }}>
          {/* Left: store image */}
          <Reveal direction="left" className="flex-shrink-0 md:w-[50%] lg:w-[45%]" style={{ minHeight: 320 }}>
            <div className="relative h-full" style={{ minHeight: 320 }}>
              <img
                src="https://www.figma.com/api/mcp/asset/f9678e73-6e89-4128-95a5-f2d6a342fcc5"
                alt="Ginabo Store"
                className="h-full w-full object-cover"
                style={{ minHeight: 320 }}
              />
            </div>
          </Reveal>

          {/* Right: content */}
          <Reveal direction="right" className="flex flex-1 flex-col justify-center px-8 py-16 md:px-16 md:py-20 lg:px-20">
            <div className="badge-bg self-start rounded-[10px] px-8 py-2 mb-8">
              <span className="font-bold text-white text-[13px]">Brand Essence</span>
            </div>
            <h2 className="mb-8 font-bold leading-tight" style={{ color: "#ffa8f8", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              &quot;Cerah yang tetap nyaman.&quot;
            </h2>
            <p className="mb-12 text-[14px] leading-[20px] text-justify text-white" style={{ maxWidth: 600 }}>
              GINABO membantu kulitmu tampak lebih cerah dan terawat melalui rutinitas yang nyaman dan konsisten. Bukan skincare instan, tapi perawatan yang bikin kulit terasa nyaman, terawat, dan hasilnya makin konsisten dari waktu ke waktu.
            </p>
            <div className="flex flex-wrap gap-12">
              {[
                { label: "Riset Per Produk",    counter: null, val: "~2 Tahun" },
                { label: "Usia Mulai Pemakaian", counter: { to: 15, suffix: "+" }, val: null },
                { label: "Rutinitas Simpel",     counter: null, val: "AM/PM" },
              ].map((s, i) => (
                <Reveal key={s.label} delay={i * 0.15}>
                  <div>
                    <p className="font-bold leading-[30px]" style={{ color: "#ffa8f8", fontSize: "2rem" }}>
                      {s.counter
                        ? <AnimatedCounter to={s.counter.to} suffix={s.counter.suffix} />
                        : s.val}
                    </p>
                    <p className="font-semibold text-white text-[16px] leading-[20px]">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. BRAND PILLARS
      ══════════════════════════════════════════ */}
      <section className="bg-[#fffafa] py-20">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 1340 }}>
          <Reveal>
            <div className="flex justify-center mb-8">
              <div className="badge-bg rounded-[10px] px-8 py-2">
                <span className="font-bold text-white text-[13px]">Brand Pillars</span>
              </div>
            </div>
            <div className="flex justify-center items-center gap-3 mb-12 flex-wrap">
              <div className="flex items-center justify-center rounded-[10px]" style={{ background: "#8f5b8b", width: 66, height: 66 }}>
                <span className="font-bold text-white text-[48px] leading-none">4</span>
              </div>
              <h2 className="font-bold text-[#8f5b8b] text-[clamp(1.8rem,4vw,3rem)] leading-tight">Pilar Fondasi Ginabo</h2>
            </div>
          </Reveal>

          <Reveal>
            <div className="flex justify-center mb-12">
              <div className="overflow-hidden rounded-[50px] w-full" style={{ maxWidth: 990, aspectRatio: "990/545" }}>
                <img src="https://www.figma.com/api/mcp/asset/3ea0fd34-0405-426e-8e02-98e83702897f" alt="Ginabo Products" className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{ maxWidth: 1003, margin: "0 auto" }}>
            {[
              { title: "Brightening while respecting the skin barrier",   desc: "Mencerahkan kulit tanpa mengorbankan lapisan pelindungnya. Hasil bertahap, aman dipakai rutin.",                   icon: "https://www.figma.com/api/mcp/asset/b6cbcd94-656a-4698-acb7-934ea4240065", topOffset: "37px" },
              { title: "hydration as the foundation",                     desc: "Hidrasi bukan sekedar step rutinitas, ini merupakan standar dari semua langkah skincare kamu.",                    icon: "https://www.figma.com/api/mcp/asset/1c756e91-dfac-405b-8042-4823a95b9cec", topOffset: "58px" },
              { title: "Soothing for daily comfort",                      desc: "Kulit yang tenang adalah kulit yang sehat. Setiap produk Ginabo diformulasikan untuk memberikan rasa nyaman sejak pemakaian pertama.", icon: "https://www.figma.com/api/mcp/asset/e3942d64-3894-4147-a5a0-4185ea1c4b0f", topOffset: "58px" },
              { title: "Anti-aging support",                              desc: "Menjaga kualitas kulit jangka panjang. Bukan anti-aging yang agresif, tapi yang bekerja bersama kulitmu setiap hari.", icon: "https://www.figma.com/api/mcp/asset/b6cbcd94-656a-4698-acb7-934ea4240065", topOffset: "58px" },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1}>
                <div className="pillar-card relative overflow-hidden rounded-[20px]" style={{ background: "#c972bd", height: 316 }}>
                  <p className="font-staatliches text-white absolute z-10" style={{ top: card.topOffset, left: 34, width: 423, fontSize: "clamp(2rem,4vw,64px)", lineHeight: "60px" }}>
                    {card.title}
                  </p>
                  <p className="font-medium text-white text-[15px] leading-[20px] text-justify absolute z-10" style={{ bottom: 32, left: 34, width: "min(408px, calc(100% - 68px))" }}>
                    {card.desc}
                  </p>
                  <div className="card-icon absolute pointer-events-none" style={{ top: "-7%", right: "-1%", bottom: "17%", left: "48%", transform: "rotate(-10.63deg)", opacity: 0.9 }}>
                    <img src={card.icon} alt="" className="w-full h-full object-contain" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. BRAND CHARACTER
      ══════════════════════════════════════════ */}
      <section className="bg-[#fffafa] py-20">
        <div className="mx-auto px-5 md:px-10" style={{ maxWidth: 1340 }}>
          <Reveal>
            <div className="flex justify-center mb-8">
              <div className="badge-bg rounded-[10px] px-8 py-2">
                <span className="font-bold text-white text-[13px]">Brand Character</span>
              </div>
            </div>
            <div className="flex justify-center items-center mb-12 flex-wrap gap-3">
              <h2 className="font-bold text-[#8f5b8b]" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.1 }}>Jika Ginabo Adalah&nbsp;&nbsp;</h2>
              <span className="font-bold text-white rounded-[10px] px-4 py-1" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.1, background: "#8f5b8b" }}>Seseorang</span>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <Reveal direction="left" className="flex-shrink-0">
              <div className="overflow-hidden rounded-[50px] mx-auto" style={{ width: 262, height: 379 }}>
                <img src="https://www.figma.com/api/mcp/asset/98169c77-5c09-4f02-8b6e-72f7ed9f27a5" alt="Ginabo Character" className="w-full h-full object-cover" />
              </div>
            </Reveal>

            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Warm",        desc: "Terasa hangat dan mudah didekati, bukan brand yang menghakimi kondisi kulitmu." },
                { label: "Reliable",    desc: "Riset bertahun-tahun untuk formula yang seimbang antara performa dan kenyamanan." },
                { label: "Trustworthy", desc: "Kami serius di kualitas, karena kulit kamu bukan tempat coba-coba." },
                { label: "Clear",       desc: "Komunikasi jujur & realistis. Tidak ada klaim berlebihan seperti \"putih instan\"." },
              ].map((c, i) => (
                <Reveal key={c.label} delay={i * 0.1}>
                  <div className="char-card overflow-hidden rounded-[20px] bg-white shadow" style={{ height: 164 }}>
                    <div className="badge-bg relative flex items-center justify-center" style={{ height: 76 }}>
                      <p className="font-staatliches text-white text-[40px] leading-[60px] text-center relative z-10">{c.label}</p>
                    </div>
                    <div className="px-5 py-3" style={{ background: "#2a2356", height: 88 }}>
                      <p className="font-semibold text-white text-[14px] leading-[18px] text-justify">{c.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. POSITIONING
      ══════════════════════════════════════════ */}
      <section className="overflow-hidden" style={{ background: "#1e1840", minHeight: 558, padding: "40px 0 60px" }}>
        <div className="mx-auto px-5 md:px-20" style={{ maxWidth: 1600 }}>
          <Reveal>
            <div className="flex justify-center mb-10">
              <div className="badge-bg rounded-[10px] px-8 py-2">
                <span className="font-bold text-[#fafafa] text-[13px]">Positioning</span>
              </div>
            </div>
            <h2 className="mb-4 font-bold text-center" style={{ color: "#ffa8f8", fontSize: "clamp(2rem,5vw,3rem)", lineHeight: "50px" }}>
              &quot;Friendly expert.&quot;
            </h2>
            <p className="mb-10 font-semibold text-white text-center leading-[35px] mx-auto" style={{ fontSize: "clamp(1rem,2vw,1.5rem)", maxWidth: 1206 }}>
              Ginabo berbicara seperti teman yang memahami perawatan kulit, bukan seperti sales yang mengejar penjualan. Informatif, not judging. Jujur dan memberikan rasa aman.
            </p>
          </Reveal>

          <div className="mb-14 flex flex-wrap justify-center gap-4 md:gap-5">
            {["Calm & Mature", "Informative", "Not Judging", "Honest"].map((tag, i) => (
              <Reveal key={tag} delay={i * 0.1} direction="scale">
                <div className="tag-pill rounded-[10px] px-6 py-3" style={{ background: "#4a3662" }}>
                  <span className="font-semibold text-white text-[17px]">{tag}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="flex justify-center">
              <Link href="/shop" className="badge-bg btn-hover rounded-[10px] px-8 py-4 flex items-center gap-3">
                <img src="https://www.figma.com/api/mcp/asset/6ba3af05-ba16-4985-ab84-466462d5d4fb" alt="" className="flex-shrink-0 object-contain" style={{ width: 36, height: 30 }} />
                <span className="font-semibold text-white text-[17px] whitespace-nowrap">Rawat Sekarang</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          12. BLOG
      ══════════════════════════════════════════ */}
      <section className="bg-[#FDFAFF] py-14 md:py-20">
        <div className="mx-auto w-full max-w-8xl px-4 md:px-8">
          <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#CF99B4" }}>Edukasi & Tips</div>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Info & Tips Terkini</h2>
            <Link href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-800 hover:underline">Lihat Semua →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post, i) => (
              <Reveal key={post.title} delay={i * 0.1}>
                <Link href="#" className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-brand-sm transition hover:shadow-brand h-full">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={post.img} alt={post.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
                    <span className="absolute left-3 top-3 rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: "#78257C" }}>{post.tag}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-center gap-2 text-[11px] text-brand-400">
                      <span>{post.date}</span><span>·</span><span>{post.read} read</span>
                    </div>
                    <div className="text-sm font-semibold leading-snug text-brand-900 transition group-hover:text-brand-600">{post.title}</div>
                    <div className="mt-auto pt-2 text-xs font-semibold text-brand-500 group-hover:text-brand-700">Baca selengkapnya →</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
