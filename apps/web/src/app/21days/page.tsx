import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { JoinForm } from "./JoinForm";

export const metadata: Metadata = {
  title: "21 Days Journey | Ginabo Beauty",
  description: "Perjalanan 21 hari untuk membantu kulit terasa lebih sehat, nyaman, dan ternutrisi melalui rutinitas harian yang simpel."
};

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 flex-shrink-0">
      <path
        fill="currentColor"
        d="M9.0 16.2 4.8 12l-1.4 1.4 5.6 5.6L20.6 7.4 19.2 6z"
      />
    </svg>
  );
}

function waLink() {
  const text =
    "Halo Ginabo, aku mau ikut 21 Days Journey. Boleh info langkah daftar dan jadwal programnya?";
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function Journey21Page() {
  return (
    <div className="font-poppins bg-white text-[#2a2a2a]">

      {/* ══ HERO ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10 lg:px-16">
          <div className="grid items-center gap-8 md:grid-cols-[0.85fr_1fr] md:gap-12">
            {/* Left — Text content */}
            <div className="order-2 md:order-1">
              <span
                className="mb-4 inline-block rounded px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
                style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}
              >
                Ginabo 21 Days Journey
              </span>
              <h1 className="text-2xl font-extrabold leading-tight md:text-[2rem]" style={{ color: "#4A1A5E" }}>
                21 hari untuk kulit yang{" "}
                <span className="text-[#9333EA]">lebih sehat dan ternutrisi.</span>
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[#5a4a6a] text-justify">
                Perjalanan sederhana untuk membangun rutinitas yang konsisten. Bukan program instan, bukan gimmick, dan tidak hard selling.
              </p>

              {/* Poin-poin */}
              <ul className="mt-6 flex flex-col gap-2.5">
                {[
                  { icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>, text: "Rutinitas sederhana, selesai dalam beberapa menit" },
                  { icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c3.5 0 7-3.5 7-8.5S12 3 12 3s-7 5 -7 9.5S8.5 21 12 21Z" /></svg>, text: "Fokus nutrisi kulit dan kenyamanan harian" },
                  { icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>, text: "Ada panduan dan komunitas untuk bantu konsisten" },
                ].map((p) => (
                  <li
                    key={p.text}
                    className="flex items-center gap-3.5 rounded-xl px-4 py-3"
                    style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 2px 12px rgba(120,37,124,0.04)" }}
                  >
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}
                    >
                      {p.icon}
                    </span>
                    <span className="text-[13.5px] font-semibold text-[#4A1A5E]">{p.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Hero Image */}
            <div className="relative flex items-center justify-center order-1 md:order-2">
              <div className="relative w-full max-w-[400px] md:max-w-[440px]">
                <div className="relative overflow-hidden rounded-3xl" style={{ aspectRatio: "1/1", boxShadow: "0 25px 60px rgba(139,92,246,0.15), 0 0 40px rgba(168,85,247,0.08)" }}>
                  <Image
                    src="/ginabo_21.png"
                    alt="Ginabo 21 Days Journey Products"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 440px"
                    quality={100}
                    priority
                    unoptimized
                  />
                </div>
                {/* Floating badges */}
                <div
                  className="absolute -left-3 top-1/4 flex items-center gap-2 rounded-xl px-3.5 py-2 backdrop-blur-md md:-left-6"
                  style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,51,234,0.15)", boxShadow: "0 4px 20px rgba(120,37,124,0.08)" }}
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.482 5.19a2.25 2.25 0 0 1-2.163 1.641h-6.71a2.25 2.25 0 0 1-2.163-1.641L5 14.5m14 0H5" /></svg>
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: "#4A1A5E" }}>2 Produk</span>
                </div>
                <div
                  className="absolute -right-3 bottom-1/4 flex items-center gap-2 rounded-xl px-3.5 py-2 backdrop-blur-md md:-right-6"
                  style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,51,234,0.15)", boxShadow: "0 4px 20px rgba(120,37,124,0.08)" }}
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: "#4A1A5E" }}>21 Hari</span>
                </div>
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex w-fit items-center gap-2.5 rounded-xl px-4 py-2.5 backdrop-blur-md"
                  style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(147,51,234,0.15)", boxShadow: "0 4px 20px rgba(120,37,124,0.08)" }}
                >
                  <span className="text-[11px] font-extrabold" style={{ color: "#4A1A5E" }}>BPOM & Halal</span>
                  <span className="h-3 w-px bg-[#E9D5FF]" />
                  <span className="text-[10px] text-[#5a4a6a]">Niacinamide · Ceramide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TENTANG PROGRAM ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Tentang Program
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Rutinitas yang membantu kulit tetap nyaman
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5a4a6a]">
              Ginabo percaya kulit bukan butuh diubah secara cepat, tapi dirawat dan dinutrisi secara konsisten.
            </p>
          </div>

          <div className="grid grid-cols-[1fr_1fr] grid-rows-2 gap-3" style={{ aspectRatio: "2/1" }}>
            {/* Left — tall card */}
            <div className="abt-card group relative overflow-hidden rounded-lg md:rounded-2xl row-span-2 border-[1.5px] border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-purple-400/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.4),0_0_40px_rgba(168,85,247,0.2)]" style={{ background: "#682785" }}>
              <Image src="/abt1.png" alt="Nutrition first" fill className="object-contain transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 50vw" quality={100} priority unoptimized />
            </div>
            {/* Top right */}
            <div className="abt-card group relative overflow-hidden rounded-lg md:rounded-2xl border-[1.5px] border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-purple-400/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.4),0_0_40px_rgba(168,85,247,0.2)]" style={{ background: "#682785" }}>
              <Image src="/abt2.png" alt="Barrier first" fill className="object-contain scale-110 translate-x-2 md:scale-100 md:translate-x-0 transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 50vw" quality={100} priority unoptimized />
            </div>
            {/* Bottom right */}
            <div className="abt-card group relative overflow-hidden rounded-lg md:rounded-2xl border-[1.5px] border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-purple-400/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.4),0_0_40px_rgba(168,85,247,0.2)]" style={{ background: "#682785" }}>
              <Image src="/abt3.png" alt="Comfortable for daily use" fill className="object-contain scale-110 translate-x-2 md:scale-100 md:translate-x-0 transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 50vw" quality={100} priority unoptimized />
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              How It Works
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Programnya sederhana, langkahnya jelas
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { step: "01", title: "Daftar program", desc: "Isi form singkat, tim Ginabo akan follow up." },
              { step: "02", title: "Gunakan produk 21 hari", desc: "Ikuti panduan AM dan PM yang simpel." },
              { step: "03", title: "Dokumentasikan progres", desc: "Update progress sesuai guideline yang diberikan." },
              { step: "04", title: "Bagikan pengalaman", desc: "Cerita real, fokus pada feel dan rutinitas." }
            ].map((s) => (
              <div key={s.step} className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
                  {s.step}
                </span>
                <div className="mt-4 text-base font-bold" style={{ color: "#4A1A5E" }}>{s.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-[#5a4a6a]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRODUK UTAMA ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Produk Utama
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Dua produk, satu rutinitas
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5a4a6a]">
              Program ini fokus pada rutinitas yang bisa kamu ulang setiap hari, dengan feel yang nyaman.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                name: "GlowAge Multi-Active Serum",
                subtitle: "Serum · 30ml",
                desc: "Serum ringan yang membantu kulit tampak lebih cerah alami, terasa lebih halus, dan tetap nyaman dipakai harian.",
                usage: "Pagi & malam, setelah toner, sebelum pelembab",
                keyIngredients: ["Niacinamide", "Hyaluronic Acid", "Centella Asiatica"],
                benefits: ["Membantu mencerahkan warna kulit", "Melembapkan tanpa lengket", "Tekstur ringan, cepat meresap", "Nyaman dipakai sebelum makeup"],
                tags: ["Tekstur ringan", "Cepat meresap", "Nyaman sebelum makeup"],
              },
              {
                name: "Bright & Care Moisture Cream",
                subtitle: "Moisturizer · 10g",
                desc: "Moisture cream yang membantu menjaga kelembapan dan skin barrier. Cocok dipakai pagi dan malam, tanpa rasa berat.",
                usage: "Pagi & malam, sebagai step terakhir skincare",
                keyIngredients: ["Ceramide Complex", "Squalane", "Vitamin E"],
                benefits: ["Menjaga kelembapan sepanjang hari", "Mendukung skin barrier", "Tidak menyumbat pori", "Cocok untuk semua jenis kulit"],
                tags: ["Barrier support", "Hidrasi nyaman", "AM & PM friendly"],
              }
            ].map((p) => (
              <div key={p.name} className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
                <div className="grid gap-5">
                  {/* Header */}
                  <div>
                    <div className="text-xl font-bold text-white">{p.name}</div>
                    <div className="mt-1 text-[12px] font-medium text-[#c084fc]">{p.subtitle}</div>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">{p.desc}</p>
                  </div>

                  {/* Usage */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.12)" }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A855F7] mb-2">Cara Pakai</div>
                    <div className="text-sm text-white/70">{p.usage}</div>
                  </div>

                  {/* Key Ingredients */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c084fc] mb-3">Key Ingredients</div>
                    <div className="flex flex-wrap gap-2">
                      {p.keyIngredients.map((ing) => (
                        <span key={ing} className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-white" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}>
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c084fc] mb-3">Manfaat</div>
                    <div className="grid gap-2">
                      {p.benefits.map((b) => (
                        <div key={b} className="flex items-start gap-2.5">
                          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#C084FC]" />
                          <span className="text-sm text-white/70">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
                    {p.tags.map((tag) => (
                      <span key={tag} className="rounded-md px-3 py-1 text-[11px] font-semibold text-white/80" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TIMELINE ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Journey Timeline
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Progress yang terasa bertahap
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5a4a6a]">
              Tiap orang bisa berbeda. Timeline ini dibuat untuk membantu kamu memahami ritme program.
            </p>
          </div>

          {/* Progress Bar with Checkpoints */}
          <div className="relative">
            {/* Desktop: horizontal bar */}
            <div className="hidden md:block">
              {/* Progress line */}
              <div className="relative mx-12 h-1 rounded-full" style={{ background: "rgba(139,92,246,0.2)" }}>
                <div className="absolute inset-y-0 left-0 w-full rounded-full" style={{ background: "linear-gradient(90deg, #8b5cf6, #c084fc, #e879f9)" }} />
              </div>
              {/* Checkpoints */}
              <div className="relative -mt-4 grid grid-cols-3 gap-6">
                {[
                  { week: "Week 1", day: "Hari 1–7", title: "First Impression", desc: "Mulai kenal tekstur dan feel. Fokus pada rutinitas yang konsisten.", details: ["Kenali produk dan teksturnya", "Bangun kebiasaan AM & PM", "Perhatikan kenyamanan awal"] },
                  { week: "Week 2", day: "Hari 8–14", title: "Progress", desc: "Kulit terasa lebih stabil. Perhatikan kenyamanan dan hidrasi harian.", details: ["Kulit mulai terasa lebih lembap", "Rutinitas semakin natural", "Dokumentasi perubahan awal"] },
                  { week: "Week 3", day: "Hari 15–21", title: "Result", desc: "Kulit terasa lebih ternutrisi dan terlihat lebih rapi. Dokumentasikan perubahan.", details: ["Kulit terasa lebih ternutrisi", "Rutinitas sudah menjadi kebiasaan", "Siap bagikan pengalaman"] }
                ].map((x, i) => (
                  <div key={x.week} className="flex flex-col items-center">
                    {/* Checkpoint dot */}
                    <div className="relative flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 0 16px rgba(139,92,246,0.5)" }}>
                        {i + 1}
                      </div>
                    </div>
                    {/* Card */}
                    <div className="mt-6 w-full rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)" }}>{x.week}</span>
                        <span className="text-[10px] text-[#5a4a6a]">{x.day}</span>
                      </div>
                      <div className="text-base font-bold" style={{ color: "#4A1A5E" }}>{x.title}</div>
                      <div className="mt-2 text-sm leading-relaxed text-[#5a4a6a]">{x.desc}</div>
                      <div className="mt-4 grid gap-2">
                        {x.details.map((d) => (
                          <div key={d} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#9333EA]" />
                            <span className="text-[13px] text-[#5a4a6a]">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: vertical progress */}
            <div className="md:hidden">
              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-[14px] top-0 bottom-0 w-0.5 rounded-full" style={{ background: "linear-gradient(180deg, #8b5cf6, #c084fc, #e879f9)" }} />

                <div className="grid gap-6">
                  {[
                    { week: "Week 1", day: "Hari 1–7", title: "First Impression", desc: "Mulai kenal tekstur dan feel. Fokus pada rutinitas yang konsisten.", details: ["Kenali produk dan teksturnya", "Bangun kebiasaan AM & PM", "Perhatikan kenyamanan awal"] },
                    { week: "Week 2", day: "Hari 8–14", title: "Progress", desc: "Kulit terasa lebih stabil. Perhatikan kenyamanan dan hidrasi harian.", details: ["Kulit mulai terasa lebih lembap", "Rutinitas semakin natural", "Dokumentasi perubahan awal"] },
                    { week: "Week 3", day: "Hari 15–21", title: "Result", desc: "Kulit terasa lebih ternutrisi dan terlihat lebih rapi. Dokumentasikan perubahan.", details: ["Kulit terasa lebih ternutrisi", "Rutinitas sudah menjadi kebiasaan", "Siap bagikan pengalaman"] }
                  ].map((x, i) => (
                    <div key={x.week} className="relative">
                      {/* Dot on line */}
                      <div className="absolute -left-8 top-0 flex items-center justify-center">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 0 12px rgba(139,92,246,0.5)" }}>
                          {i + 1}
                        </div>
                      </div>
                      {/* Card */}
                      <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)" }}>{x.week}</span>
                          <span className="text-[10px] text-[#5a4a6a]">{x.day}</span>
                        </div>
                        <div className="text-base font-bold" style={{ color: "#4A1A5E" }}>{x.title}</div>
                        <div className="mt-2 text-sm leading-relaxed text-[#5a4a6a]">{x.desc}</div>
                        <div className="mt-4 grid gap-2">
                          {x.details.map((d) => (
                            <div key={d} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#9333EA]" />
                              <span className="text-[13px] text-[#5a4a6a]">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ RULES & GUIDELINES ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Rules & Guidelines
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Aturan yang menjaga trust
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl p-7" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
              <div className="text-base font-bold text-white">Program Rules</div>
              <div className="mt-5 grid gap-3 text-sm text-white/70">
                {[
                  "Wajib ikut selama 21 hari",
                  "Ikuti panduan AM dan PM",
                  "Update progress sesuai jadwal program",
                  "Gunakan pencahayaan yang konsisten saat dokumentasi"
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C084FC]" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-7" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
              <div className="text-base font-bold text-white">Content Guideline</div>
              <div className="mt-5 grid gap-4 text-sm">
                <div className="rounded-xl p-4" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A855F7]">Do</div>
                  <div className="mt-2.5 grid gap-2 text-white/70">
                    {["Pakai kata membantu, menutrisi, menjaga, merawat", "Fokus pada pengalaman real", "Tunjukkan tekstur dan feel produk"].map((t) => (
                      <div key={t} className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-[#C084FC]"><IconCheck /></span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Don&apos;t</div>
                  <div className="mt-2.5 grid gap-2 text-white/70">
                    {["Klaim instan atau overpromise", "Edit berlebihan", "Hard selling"].map((t) => (
                      <div key={t} className="flex items-start gap-2.5">
                        <span className="mt-0.5 text-red-400">
                          <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0"><path fill="currentColor" d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                        </span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Benefit
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Alasan banyak yang tertarik ikut
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {[
              { icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>, t: "Produk & panduan", d: "Ada arahan supaya rutinitas terasa lebih mudah." },
              { icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>, t: "Komunitas", d: "Bantu konsisten lewat check-in dan progress." },
              { icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>, t: "Exposure", d: "Kesempatan tampil di konten campaign." },
              { icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>, t: "Partnership", d: "Peluang kolaborasi untuk peserta terbaik." }
            ].map((b) => (
              <div key={b.t} className="rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}>
                <div className="mb-3 mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#9333EA]" style={{ background: "rgba(147,51,234,0.08)" }}>{b.icon}</div>
                <div className="text-sm font-bold" style={{ color: "#4A1A5E" }}>{b.t}</div>
                <div className="mt-2 text-[13px] leading-relaxed text-[#5a4a6a]">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-12 px-6">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Social Proof
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Progress yang bisa kamu lihat
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "Amira", meta: "Kulit kering, daily makeup", text: "Rutinitasnya simpel. Yang paling aku rasain itu kulit lebih nyaman dipakai seharian." },
              { name: "Nadya", meta: "Kulit kombinasi, sering outdoor", text: "Aku jadi lebih rapi soal urutan dan konsistensi. Progress-nya terasa pelan tapi jelas." },
              { name: "Dina", meta: "Kulit sensitif, sering di AC", text: "Teksturnya ringan dan enak. Aku jadi lebih berani pakai rutin karena feel-nya nyaman." }
            ].map((t) => (
              <div key={t.name} className="rounded-2xl p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1" style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #9333EA, #C084FC)" }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "#4A1A5E" }}>{t.name}</div>
                    <div className="text-[11px] text-[#9333EA] font-medium">{t.meta}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#5a4a6a] italic">&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REGISTRATION ══ */}
      <section id="join" className="py-16 md:py-24" style={{ background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
          <div className="grid content-start gap-4">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white w-fit" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Registration
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Mulai journey kamu hari ini
            </h2>
            <p className="text-[15px] leading-relaxed text-[#5a4a6a]">
              Isi form singkat ini untuk ikut program. Setelah itu tim Ginabo akan menghubungi kamu untuk detail langkah dan jadwal.
            </p>
            <div className="mt-4 rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #ffffff, #faf5ff)", border: "1px solid rgba(147,51,234,0.1)", boxShadow: "0 4px 20px rgba(120,37,124,0.06)" }}>
              <div className="text-sm font-bold" style={{ color: "#4A1A5E" }}>Butuh tanya cepat?</div>
              <p className="mt-2 text-sm leading-relaxed text-[#5a4a6a]">
                Kalau kamu mau tanya dulu sebelum daftar, kamu bisa chat WhatsApp.
              </p>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              >
                Chat WhatsApp
              </a>
            </div>
          </div>

          <JoinForm />
        </div>
      </section>

      {/* ══ CTA FOOTER ══ */}
      <section className="py-16 text-center" style={{ background: "linear-gradient(135deg, #7C3AED, #9333EA, #A855F7)" }}>
        <div className="mx-auto max-w-xl px-6">
          <h2 className="mb-4 text-2xl font-extrabold text-white md:text-3xl">
            21 hari, satu rutinitas yang rapi
          </h2>
          <p className="mb-8 text-[15px] text-white/90 leading-relaxed">
            Mulai dari langkah kecil yang bisa kamu ulang. Fokus pada konsistensi, kenyamanan, dan progress yang realistis.
          </p>
          <Link
            href="#join"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            style={{ color: "#7C3AED" }}
          >
            Gabung Sekarang
          </Link>
        </div>
      </section>

    </div>
  );
}
