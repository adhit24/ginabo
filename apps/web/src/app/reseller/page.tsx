import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ginabo Partner Program – Jualan Skincare, Tumbuh Bareng Ginabo",
  description: "Bergabung sebagai reseller, stockist, atau distributor Ginabo. Sistem sudah siap, produk berkualitas, margin lebar. Cocok untuk pemula sekalipun.",
};

const benefits = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
      </svg>
    ),
    title: "Margin Lebar",
    desc: "Harga khusus partner yang memungkinkan keuntungan lebih optimal dari setiap produk yang kamu jual.",
    highlight: "Profit per produk mulai Rp 15.000",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
    title: "Reward Penjualan",
    desc: "Program challenge dan insentif bulanan, quartal, dan tahunan untuk mendorong performa dan memberikan penghargaan.",
    highlight: "Bonus, voucher & hadiah eksklusif",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </svg>
    ),
    title: "Bimbingan & Training",
    desc: "Product knowledge dan basic selling untuk bantu kamu closing lebih mudah. Tidak perlu pengalaman sebelumnya.",
    highlight: "Dibimbing sampai bisa jualan",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.54 15.5 1 13 1c-1.5 0-2.91.66-3.86 1.64L7 5h-.09C4.8 4.62 2.8 5.9 2.8 7.99c0 1.55.92 2.71 2.2 3.04V13c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 5H8V9h6v2z" />
      </svg>
    ),
    title: "Free Sample & Support",
    desc: "Mendukung trial dan aktivitas penjualan harian. Materi promosi siap pakai agar kamu tidak mulai dari nol.",
    highlight: "Tools promosi & support rutin",
  },
];

const problems = [
  { icon: "😕", text: "Bingung mau mulai bisnis dari mana" },
  { icon: "😰", text: "Takut produknya tidak laku" },
  { icon: "🤷", text: "Tidak punya sistem atau pengalaman jualan" },
  { icon: "😓", text: "Jualan sendirian tanpa support" },
];

const profitRows = [
  { product: "GlowAge Multi-Active Serum", marketplace: "285.000", reseller: "220.000", profit: "65.000" },
  { product: "Bright & Care Moisture Cream", marketplace: "195.000", reseller: "155.000", profit: "40.000" },
  { product: "Hydra Moist Gel Ultimate", marketplace: "215.000", reseller: "165.000", profit: "50.000" },
];

const steps = [
  { step: "01", title: "Daftar jadi partner", desc: "Isi form singkat. Tim Ginabo akan verifikasi dan follow up dalam 1×24 jam." },
  { step: "02", title: "Dapat harga khusus", desc: "Akses harga partner dan katalog lengkap setelah onboarding selesai." },
  { step: "03", title: "Mulai jualan", desc: "Gunakan materi promosi siap pakai dan panduan yang kami sediakan." },
  { step: "04", title: "Dapat profit & reward", desc: "Terima margin dari setiap penjualan plus reward performa dari sistem kami." },
];

const marketingSupport = [
  { title: "Sport & Healthy Campaign", desc: "Aktivasi di event sepeda dan komunitas aktif. Trial produk langsung ke market." },
  { title: "Campus Activation", desc: "Ekspansi ke market mahasiswa. Rekrut KOL & affiliate untuk jangkauan lebih luas." },
  { title: "Website & Landing Page", desc: "Pusat informasi resmi dan konten edukasi yang membantu proses closing." },
  { title: "WhatsApp Closing System", desc: "Sistem komunikasi langsung dengan customer untuk closing yang lebih efektif." },
  { title: "SEO & Marketplace", desc: "Kehadiran di platform digital untuk memperkuat brand dan mendorong penjualan organik." },
];

const rewards = [
  { period: "Bulanan", items: ["Top Sales Partner", "Top Growth Partner", "Top Recruit Partner"], note: "Bonus produk, voucher, saldo, materi promosi eksklusif, support konten & ads" },
  { period: "Quartal", items: ["Bonus Omzet Quartal", "Gift Eksklusif", "Business Coaching"], note: "Akselerasi kenaikan level dan akses program spesial" },
  { period: "Tahunan", items: ["Hadiah Performa Nasional"], note: "Berdasarkan pencapaian dan target perusahaan selama setahun" },
];

const testimonials = [
  { name: "Siti R.", role: "Reseller, Surabaya", text: "Awalnya takut karena belum pernah jualan online. Ternyata ada panduan dan tim yang bantu. Sekarang sudah bisa tutup 20+ pesanan per bulan.", since: "Partner sejak 4 bulan" },
  { name: "Dian M.", role: "Stockist, Jakarta", text: "Produknya mudah dijual karena kualitasnya memang bagus. Customer sering repeat order sendiri. Margin-nya juga cukup untuk jadi income sampingan yang jalan.", since: "Partner sejak 7 bulan" },
  { name: "Nanda P.", role: "Reseller, Bandung", text: "Yang paling aku suka itu support materialnya. Nggak perlu buat konten dari nol. Tinggal pakai yang sudah disediakan dan sesuaikan.", since: "Partner sejak 3 bulan" },
];

function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung sebagai partner reseller. Boleh info lebih lanjut tentang Ginabo Partner Program?";
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function ResellerProgramPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ══ 1. HERO ══ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #123a38 0%, #1e6b68 45%, #3cb8b2 100%)",
          minHeight: 420,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 60%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative mx-auto grid min-h-[420px] max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
          <div className="text-center md:text-left">
            <span className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              Ginabo Partner Program
            </span>
            <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
              Jualan jadi lebih mudah,{" "}
              <span className="italic font-light">bukan sendirian</span>.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 md:text-base">
              Sistem sudah disiapkan, produknya ada, tinggal jalan. Cocok untuk pemula dengan modal ringan dan margin yang jelas.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                href="/reseller/register"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-extrabold text-[#1e6b68] shadow-sm transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Daftar Sekarang
              </Link>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Tanya via WhatsApp
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              {["Modal ringan", "Margin jelas", "Dibimbing dari awal"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                  <span className="text-emerald-300">✦</span> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-lg backdrop-blur">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/product-bundle.png"
                  alt="Ginabo Products"
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 90vw, 380px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123a38]/70 via-transparent to-transparent" />
                <div
                  className="absolute bottom-5 left-5 right-5 rounded-2xl p-4 text-white backdrop-blur"
                  style={{ background: "rgba(30,107,104,0.75)", border: "1.5px solid rgba(255,255,255,0.2)" }}
                >
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Contoh profit sederhana</div>
                  <div className="mt-1.5 text-base font-extrabold">10 produk / bulan</div>
                  <div className="mt-0.5 text-sm text-white/85">≈ Rp 500.000 profit bersih</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. PROBLEM ══ */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Kamu Pernah Merasa Ini?</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Bukan salahmu. Sistemnya yang belum ada.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#555]">
              Banyak orang mau mulai bisnis tapi berhenti di langkah awal. Bukan karena tidak mampu, tapi karena tidak ada support yang tepat.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {problems.map((p) => (
              <div
                key={p.text}
                className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-sm"
                style={{ border: "1.5px solid #e9fbfa" }}
              >
                <span className="text-4xl">{p.icon}</span>
                <span className="text-sm font-semibold leading-snug text-[#3d3550]">{p.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-3xl p-6 text-center md:p-8" style={{ background: "#EDFAF9", border: "1.5px solid #b2e8e4" }}>
            <div className="text-lg font-extrabold text-[#1e6b68]">Ginabo Partner Program hadir untuk menyelesaikan semua itu.</div>
            <p className="mt-2 text-sm text-[#3d6b68]">Sistem sudah ada. Produk sudah ada. Yang kami butuhkan hanya semangat kamu untuk mulai.</p>
          </div>
        </div>
      </section>

      {/* ══ 3. BENEFITS ══ */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Kenapa GPP?</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Benefit yang nyata untuk kamu</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                style={{ border: "1.5px solid #e9fbfa" }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                  style={{ background: "linear-gradient(135deg, #1e6b68, #3cb8b2)" }}
                >
                  {b.icon}
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#2a2a2a]">{b.title}</div>
                  <div className="mt-2 text-xs leading-relaxed text-[#555]">{b.desc}</div>
                </div>
                <div className="mt-auto rounded-xl px-3 py-2 text-xs font-bold text-[#1e6b68]" style={{ background: "#EDFAF9" }}>
                  {b.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. PROFIT SIMULATION ══ */}
      <section className="py-14 md:py-20" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Kalkulasi Profit</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Berapa yang bisa kamu hasilkan?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#555]">
              Contoh sederhana berdasarkan struktur harga partner. Semakin banyak yang kamu jual, semakin besar profit yang didapat.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm" style={{ border: "1.5px solid #e9fbfa" }}>
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full text-left text-sm text-[#3d3550]">
                <thead style={{ background: "linear-gradient(135deg, #1e6b68, #3cb8b2)" }}>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    <th className="px-5 py-4">Produk</th>
                    <th className="px-5 py-4">Harga Marketplace</th>
                    <th className="px-5 py-4">Harga Partner</th>
                    <th className="px-5 py-4 text-emerald-200">Profit Kamu</th>
                  </tr>
                </thead>
                <tbody>
                  {profitRows.map((row, i) => (
                    <tr key={row.product} className={i % 2 === 0 ? "bg-white" : "bg-[#EDFAF9]/50"}>
                      <td className="px-5 py-4 font-semibold text-[#2a2a2a]">{row.product}</td>
                      <td className="px-5 py-4">Rp {row.marketplace}</td>
                      <td className="px-5 py-4">Rp {row.reseller}</td>
                      <td className="px-5 py-4 font-extrabold text-[#1e6b68]">Rp {row.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t p-6" style={{ borderColor: "#e9fbfa", background: "#EDFAF9" }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#3d6b68]">
                  * Harga final mengikuti katalog resmi terbaru. Hubungi admin untuk info terkini.
                </div>
                <div className="text-sm font-extrabold text-[#1e6b68]">
                  Jual 20 produk/bulan = ±Rp 1.000.000 profit bersih
                </div>
              </div>
            </div>
          </div>

          {/* Simple calculator pills */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { qty: "10 produk / bulan", est: "±Rp 500.000", label: "Income sampingan" },
              { qty: "30 produk / bulan", est: "±Rp 1.500.000", label: "Income yang konsisten" },
              { qty: "50+ produk / bulan", est: "±Rp 2.500.000+", label: "Bisnis yang berkembang" },
            ].map((c) => (
              <div
                key={c.qty}
                className="rounded-2xl p-5 text-center"
                style={{ background: "#EDFAF9", border: "1.5px solid #b2e8e4" }}
              >
                <div className="text-xs font-semibold text-[#3d6b68]">{c.qty}</div>
                <div className="mt-1 text-xl font-extrabold text-[#1e6b68]">{c.est}</div>
                <div className="mt-0.5 text-[11px] text-[#3d6b68]">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. HOW IT WORKS ══ */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Cara Gabung</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">4 langkah yang jelas dan mudah</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col gap-3">
                {i < steps.length - 1 && (
                  <div className="absolute left-8 top-8 hidden h-px flex-1 md:block" style={{ right: "-50%", background: "linear-gradient(90deg, #3cb8b2, transparent)" }} />
                )}
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #1e6b68, #3cb8b2)" }}
                >
                  <span className="text-xl font-extrabold">{s.step}</span>
                </div>
                <div className="text-base font-extrabold text-[#2a2a2a]">{s.title}</div>
                <div className="text-sm leading-relaxed text-[#555]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6. PRODUCT PREVIEW ══ */}
      <section className="py-14 md:py-20" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Produk yang Kamu Jual</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Skincare berkualitas, mudah dijual</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#555]">
              Produk Ginabo sudah BPOM, Halal, dan terbukti disukai pelanggan. Customer yang puas = repeat order yang jalan sendiri.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "GlowAge Multi-Active Serum", desc: "Brightening + Anti-aging + Hidrasi. Serum unggulan dengan formula riset 2 tahun.", img: "/product-serum-bg.png", tags: ["BESTSELLER", "Rating 4.9"] },
              { name: "Bright & Care Moisture Cream", desc: "Barrier repair + hidrasi + brightening support. Cream harian yang mudah direkomendasikan.", img: "/product-cream-bg.png", tags: ["FAVORITE", "Rating 4.8"] },
              { name: "Hydra Moist Gel Ultimate", desc: "3-in-1: moisturizer, makeup prep, sleeping mask. Nilai lebih untuk customer, closing lebih mudah.", img: "/product-dna-bg.png", tags: ["MULTIFUNGSI", "Rating 4.9"] },
            ].map((p) => (
              <div
                key={p.name}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                style={{ border: "1.5px solid #e9fbfa" }}
              >
                <div className="relative aspect-[4/3]">
                  <Image src={p.img} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 340px" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                        style={{ background: "rgba(30,107,104,0.85)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-sm font-extrabold text-[#2a2a2a]">{p.name}</div>
                  <div className="mt-2 text-xs leading-relaxed text-[#555]">{p.desc}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["BPOM RI", "Halal", "Cruelty Free"].map((b) => (
                      <span key={b} className="rounded-full px-2.5 py-1 text-[10px] font-bold text-[#1e6b68]" style={{ background: "#EDFAF9", border: "1px solid #b2e8e4" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. REWARD SYSTEM ══ */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Program Reward</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Semakin aktif, semakin banyak reward</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {rewards.map((r) => (
              <div
                key={r.period}
                className="flex flex-col gap-4 rounded-3xl p-6 shadow-sm"
                style={{ background: "#FDFAFF", border: "1.5px solid #e9fbfa" }}
              >
                <div
                  className="inline-flex self-start rounded-xl px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-white"
                  style={{ background: "linear-gradient(135deg, #1e6b68, #3cb8b2)" }}
                >
                  {r.period}
                </div>
                <ul className="flex flex-col gap-2">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-semibold text-[#2a2a2a]">
                      <span className="text-[#3cb8b2]">✦</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto rounded-2xl p-3 text-xs leading-relaxed text-[#3d6b68]" style={{ background: "#EDFAF9" }}>
                  {r.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 8. MARKETING SUPPORT ══ */}
      <section className="py-14 md:py-20" style={{ background: "#FDFAFF" }}>
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Ekosistem Dukungan</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Kamu tidak mulai dari nol</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#555]">
              Ginabo membangun ekosistem pemasaran yang membantu partner mendapatkan lebih banyak exposure dan kepercayaan dari customer.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
            {marketingSupport.map((m, i) => (
              <div
                key={m.title}
                className={`flex gap-4 rounded-3xl bg-white p-6 shadow-sm ${i === 4 ? "sm:col-span-2 md:col-span-1" : ""}`}
                style={{ border: "1.5px solid #e9fbfa" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: "linear-gradient(135deg, #1e6b68, #3cb8b2)" }}
                >
                  <span className="text-sm font-bold">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#2a2a2a]">{m.title}</div>
                  <div className="mt-1 text-xs leading-relaxed text-[#555]">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. SOCIAL PROOF ══ */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="mb-10 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Cerita Partner</div>
            <h2 className="mt-2 text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Mereka sudah memulai, kamu kapan?</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm"
                style={{ border: "1.5px solid #e9fbfa" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, #1e6b68, #3cb8b2)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#2a2a2a]">{t.name}</div>
                    <div className="text-[11px] text-[#3d6b68]">{t.role}</div>
                  </div>
                  <div className="ml-auto text-xs text-[#3cb8b2]">{"★★★★★"}</div>
                </div>
                <p className="text-xs leading-relaxed text-[#555]">"{t.text}"</p>
                <div className="mt-auto text-[10px] font-bold uppercase tracking-[0.15em] text-[#3d6b68]">{t.since}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 10. FINAL CTA ══ */}
      <section
        className="py-16 md:py-24"
        style={{ background: "linear-gradient(135deg, #123a38 0%, #1e6b68 45%, #3cb8b2 100%)" }}
      >
        <div className="mx-auto max-w-xl px-5 text-center">
          <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            Slot Partner Terbuka
          </span>
          <h2 className="mb-4 text-2xl font-extrabold text-white md:text-4xl">
            Ini peluang yang masuk akal untuk dimulai hari ini
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-white/85">
            Gampang dimulai. Sudah ada sistemnya. Dan ada tim yang bantu dari awal sampai kamu bisa jalan sendiri.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/reseller/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold text-[#1e6b68] shadow-sm transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Daftar Sekarang
            </Link>
            <a
              href={waLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              Chat WhatsApp
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-white/75">
            {["Tidak ada biaya daftar", "Support dari awal", "Produk BPOM & Halal"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-emerald-300">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
