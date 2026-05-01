import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { JoinForm } from "./JoinForm";

export const metadata: Metadata = {
  title: "21 Days Journey – Ginabo Beauty",
  description: "Perjalanan 21 hari untuk membantu kulit terasa lebih sehat, nyaman, dan ternutrisi melalui rutinitas harian yang simpel."
};

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
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
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2a1635 0%, #78257C 45%, #CF99B4 100%)",
          minHeight: 360
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 55%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 1px, transparent 1px)",
            backgroundSize: "56px 56px"
          }}
        />

        <div className="relative mx-auto grid min-h-[360px] max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-20">
          <div className="text-center md:text-left">
            <span className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              Ginabo 21 Days Journey
            </span>
            <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
              21 hari untuk kulit yang{" "}
              <span className="italic font-light">lebih sehat dan ternutrisi</span>.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
              Perjalanan sederhana untuk membangun rutinitas yang konsisten. Bukan program instan, bukan gimmick, dan tidak hard selling.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                href="#join"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-extrabold text-[#78257C] shadow-sm transition hover:bg-purple-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#78257C]"
              >
                Ikuti Program →
              </Link>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#78257C]"
              >
                Tanya via WhatsApp
              </a>
            </div>

            <div className="mt-7 grid max-w-xl gap-2 text-sm text-white/85">
              {[
                "Rutinitas sederhana, selesai dalam beberapa menit",
                "Fokus nutrisi kulit dan kenyamanan harian",
                "Ada panduan dan komunitas untuk bantu konsisten"
              ].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <span className="mt-0.5 text-white"><IconCheck /></span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-sm backdrop-blur">
              <Image
                src="/product-serum-bg.png"
                alt="Ginabo 21 Days Journey"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a1635]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/15 p-4 text-white backdrop-blur" style={{ border: "1.5px solid rgba(255,255,255,0.22)" }}>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Program ringkas</div>
                <div className="mt-1 text-base font-extrabold">AM & PM Routine</div>
                <div className="mt-1 text-sm text-white/85">GlowAge Serum + Bright & Care Cream</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Tentang Program</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Rutinitas yang membantu kulit tetap nyaman</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-brand-600">
              Ginabo percaya kulit bukan butuh diubah secara cepat, tapi dirawat dan dinutrisi secara konsisten. Program ini membantu kamu membangun kebiasaan yang lebih rapi, tanpa ribet.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Nutrition-first", desc: "Fokus pada nutrisi kulit, bukan hasil instan." },
              { title: "Barrier-first", desc: "Bantu menjaga skin barrier agar kulit terasa stabil." },
              { title: "Comfortable daily use", desc: "Tekstur nyaman, cocok untuk aktivitas dan sebelum makeup." }
            ].map((c) => (
              <div key={c.title} className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
                <div className="text-base font-extrabold text-brand-900">{c.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-brand-600">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-50 py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">How It Works</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Programnya sederhana, langkahnya jelas</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { step: "01", title: "Daftar program", desc: "Isi form singkat, tim Ginabo akan follow up." },
              { step: "02", title: "Gunakan produk 21 hari", desc: "Ikuti panduan AM dan PM yang simpel." },
              { step: "03", title: "Dokumentasikan progres", desc: "Update progress sesuai guideline yang diberikan." },
              { step: "04", title: "Bagikan pengalaman", desc: "Cerita real, fokus pada feel dan rutinitas." }
            ].map((s) => (
              <div key={s.step} className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
                <div className="text-xs font-black tracking-[0.2em] text-brand-400">{s.step}</div>
                <div className="mt-2 text-base font-extrabold text-brand-900">{s.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-brand-600">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Produk Utama</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Dua produk, satu rutinitas</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-brand-600">
              Kamu tidak perlu layering yang ribet. Program ini fokus pada rutinitas yang bisa kamu ulang setiap hari, dengan feel yang nyaman.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                name: "GlowAge Multi-Active Serum",
                desc: "Serum ringan yang membantu kulit tampak lebih cerah alami, terasa lebih halus, dan tetap nyaman dipakai harian.",
                img: "/product-serum-bg.png",
                tags: ["Tekstur ringan", "Cepat meresap", "Nyaman sebelum makeup"]
              },
              {
                name: "Bright & Care Moisture Cream",
                desc: "Moisture cream yang membantu menjaga kelembapan dan skin barrier. Cocok dipakai pagi dan malam, tanpa rasa berat.",
                img: "/product-cream-bg.png",
                tags: ["Barrier support", "Hidrasi nyaman", "AM & PM friendly"]
              }
            ].map((p) => (
              <div key={p.name} className="overflow-hidden rounded-3xl bg-white shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
                <div className="relative aspect-[16/10] bg-brand-50">
                  <Image src={p.img} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 520px" />
                </div>
                <div className="grid gap-3 p-6">
                  <div className="text-base font-extrabold text-brand-900">{p.name}</div>
                  <div className="text-sm leading-relaxed text-brand-600">{p.desc}</div>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700" style={{ border: "1.5px solid #f0e8f8" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="pt-1">
                    <Link href="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                      Lihat detail produk →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Journey Timeline</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Progress yang terasa bertahap</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-brand-600">
              Tiap orang bisa berbeda. Timeline ini dibuat untuk membantu kamu memahami ritme program dan menjaga ekspektasi tetap realistis.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { w: "Week 1", t: "First impression", d: "Mulai kenal tekstur dan feel. Fokus pada rutinitas yang konsisten." },
              { w: "Week 2", t: "Progress", d: "Kulit terasa lebih stabil. Perhatikan kenyamanan dan hidrasi harian." },
              { w: "Week 3", t: "Result", d: "Kulit terasa lebih ternutrisi dan terlihat lebih rapi. Dokumentasikan perubahan dengan natural." }
            ].map((x) => (
              <div key={x.w} className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-400">{x.w}</div>
                <div className="mt-2 text-base font-extrabold text-brand-900">{x.t}</div>
                <div className="mt-2 text-sm leading-relaxed text-brand-600">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-50 py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Rules & Guidelines</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Aturan yang menjaga trust</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
              <div className="text-base font-extrabold text-brand-900">Program rules</div>
              <div className="mt-4 grid gap-2 text-sm text-brand-700">
                {[
                  "Wajib ikut selama 21 hari",
                  "Ikuti panduan AM dan PM",
                  "Update progress sesuai jadwal program",
                  "Gunakan pencahayaan yang konsisten saat dokumentasi"
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand-700"><IconCheck /></span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
              <div className="text-base font-extrabold text-brand-900">Content guideline</div>
              <div className="mt-4 grid gap-4 text-sm">
                <div className="rounded-2xl bg-brand-50 p-4" style={{ border: "1.5px solid #f0e8f8" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Do</div>
                  <div className="mt-2 grid gap-1 text-brand-700">
                    {["Pakai kata membantu, menutrisi, menjaga, merawat", "Fokus pada pengalaman real", "Tunjukkan tekstur dan feel produk"].map((t) => (
                      <div key={t} className="flex items-start gap-2">
                        <span className="mt-0.5 text-brand-700"><IconCheck /></span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4" style={{ border: "1.5px solid #f0e8f8" }}>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Don’t</div>
                  <div className="mt-2 grid gap-1 text-brand-700">
                    {["Klaim instan atau overpromise", "Edit berlebihan", "Hard selling"].map((t) => (
                      <div key={t} className="flex items-start gap-2">
                        <span className="mt-0.5 text-brand-700"><IconCheck /></span>
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

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Benefit</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Alasan banyak yang tertarik ikut</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { t: "Produk & panduan", d: "Ada arahan supaya rutinitas terasa lebih mudah." },
              { t: "Komunitas", d: "Bantu konsisten lewat check-in dan progress." },
              { t: "Exposure", d: "Kesempatan tampil di konten campaign (sesuai kurasi)." },
              { t: "Opportunity partnership", d: "Peluang kolaborasi untuk peserta dengan performa terbaik." }
            ].map((b) => (
              <div key={b.t} className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
                <div className="text-sm font-extrabold text-brand-900">{b.t}</div>
                <div className="mt-2 text-sm leading-relaxed text-brand-600">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Social Proof</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Progress yang bisa kamu lihat</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-brand-600">
              Konten before-after, testimoni, dan UGC akan dibagikan sesuai guideline supaya tetap natural dan terpercaya.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Amira", meta: "Kulit kering, daily makeup", text: "Rutinitasnya simpel. Yang paling aku rasain itu kulit lebih nyaman dipakai seharian." },
              { name: "Nadya", meta: "Kulit kombinasi, sering outdoor", text: "Aku jadi lebih rapi soal urutan dan konsistensi. Progress-nya terasa pelan tapi jelas." },
              { name: "Dina", meta: "Kulit sensitif, sering di AC", text: "Teksturnya ringan dan enak. Aku jadi lebih berani pakai rutin karena feel-nya nyaman." }
            ].map((t) => (
              <div key={t.name} className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #f0e8f8" }}>
                <div className="text-sm font-extrabold text-brand-900">{t.name}</div>
                <div className="mt-1 text-xs font-semibold text-brand-400">{t.meta}</div>
                <p className="mt-4 text-sm leading-relaxed text-brand-600">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="join" className="py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8 md:grid-cols-2">
          <div className="grid content-start gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">Registration</div>
            <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">Mulai journey kamu hari ini</h2>
            <p className="text-sm leading-relaxed text-brand-600">
              Isi form singkat ini untuk ikut program. Setelah itu tim Ginabo akan menghubungi kamu untuk detail langkah dan jadwal.
            </p>
            <div className="mt-4 rounded-3xl bg-brand-50 p-6" style={{ border: "1.5px solid #f0e8f8" }}>
              <div className="text-sm font-extrabold text-brand-900">Butuh tanya cepat?</div>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">
                Kalau kamu mau tanya dulu sebelum daftar, kamu bisa chat WhatsApp. Tim Ginabo akan bantu jelasin programnya.
              </p>
              <a
                href={waLink()}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#25D366] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2"
              >
                Chat WhatsApp →
              </a>
            </div>
          </div>

          <JoinForm />
        </div>
      </section>

      <section className="py-14 text-center" style={{ background: "linear-gradient(135deg, #78257C, #CF99B4)" }}>
        <div className="mx-auto max-w-xl px-5">
          <h2 className="mb-3 text-2xl font-extrabold text-white md:text-3xl">
            21 hari, satu rutinitas yang rapi
          </h2>
          <p className="mb-7 text-sm text-white/85">
            Mulai dari langkah kecil yang bisa kamu ulang. Fokus pada konsistensi, kenyamanan, dan progress yang realistis.
          </p>
          <Link
            href="#join"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold transition hover:bg-purple-50"
            style={{ color: "#78257C" }}
          >
            Gabung Sekarang →
          </Link>
        </div>
      </section>
    </div>
  );
}
