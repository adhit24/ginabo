import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us – Ginabo Beauty",
  description:
    "Ginabo hadir buat perempuan aktif yang ingin kulitnya tetap ternutrisi dan sehat di tengah kesibukan. Kenali story, filosofi, dan visi kami.",
};

/* ─── Data ─── */
const missions = [
  "Menghadirkan skincare yang fokus pada nutrisi, kelembapan, kenyamanan, dan perawatan skin barrier.",
  "Memadukan ingredient modern dengan tekstur yang nyaman buat dipakai rutin tiap hari.",
  "Bikin skincare jadi lebih gampang dipahami lewat komunikasi yang jujur, hangat, dan relevan.",
  "Menemani kamu merawat diri dengan cara yang sederhana, konsisten, dan meyakinkan.",
];

const whatWeCreate = [
  { title: "Hydration", text: "Menjaga kelembapan dan merawat skin barrier.", icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.966 8.966 0 0 0 5.982-2.275M12 21a8.966 8.966 0 0 1-5.982-2.275M12 21V3m0 0a8.966 8.966 0 0 1 5.982 2.275M12 3a8.966 8.966 0 0 0-5.982 2.275" /></svg> },
  { title: "Comfort", text: "Membantu kulit terasa lebih nyaman, segar, dan sehat.", icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg> },
  { title: "Radiance", text: "Membuat kulit tampak cerah dan terawat.", icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg> },
];

const beliefs = [
  { title: "Mudah Dipahami", desc: "Skincare nggak harus rumit. Kami bicara jujur dan lugas.", icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg> },
  { title: "Nyaman Dipakai", desc: "Tekstur yang ringan dan cocok untuk rutinitas harian.", icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg> },
  { title: "Konsisten Itu Kunci", desc: "Perawatan rutin lebih berarti daripada janji instan.", icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
  { title: "Relevan untuk Hidupmu", desc: "Skincare yang dirancang sesuai kebutuhan nyata perempuan aktif.", icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg> },
];

/* ─── Page ─── */
export default function AboutPage() {
  return (
    <div className="font-poppins bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ══ HERO — Dark Glassmorphic ══ */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, #0f0a1e 0%, #1e0a38 50%, #2a1040 100%)" }}
      >
        <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/3 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #e879f9, transparent 70%)" }} />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-6 text-center">
          <span
            className="mb-5 inline-block rounded-lg px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}
          >
            About Us
          </span>
          <h1 className="text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Healthy skin,{" "}
            <span
              className="italic font-light"
              style={{ background: "linear-gradient(135deg, #c084fc, #e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              nourished for real life.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/60">
            Ginabo hadir buat kamu — perempuan aktif yang pengen tetap merawat
            kulit di tengah padatnya jadwal harian. Fokus kami:{" "}
            <strong className="text-white font-semibold">Nutrition Skin for Active Woman.</strong>
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Nutrition", "Hydration", "Comfort", "Consistency"].map((v) => (
              <span
                key={v}
                className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white/85 backdrop-blur"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OPENING STATEMENT ══ */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #FDFAFF 0%, #f8f4ff 100%)" }}>
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <p className="mb-5 text-base leading-relaxed text-[#5a4a6a] md:text-lg">
            Kami percaya kalau kulit yang sehat, nyaman, dan ternutrisi itu bukan
            cuma soal penampilan aja — tapi soal rasa percaya diri biar kamu bisa
            menjalani hari dengan lebih tenang.
          </p>
          <p className="text-base leading-relaxed text-[#5a4a6a] md:text-lg">
            Makanya, kami menghadirkan skincare yang beneran relevan dengan
            kebutuhan kulit kamu dalam kehidupan nyata.
          </p>
        </div>
      </section>

      {/* ══ OUR STORY ══ */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #f8f4ff 0%, #FDFAFF 100%)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Our Story
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Cerita di balik Ginabo
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <div className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
              <blockquote className="border-l-4 pl-6 text-xl font-bold italic leading-snug text-white md:text-2xl" style={{ borderColor: "#c084fc" }}>
                &ldquo;Bukan cuma skincare yang terdengar meyakinkan — tapi yang
                bener-bener terasa nyaman setiap hari.&rdquo;
              </blockquote>
            </div>

            <div className="flex flex-col gap-5 text-sm leading-relaxed text-[#5a4a6a]">
              <p>
                Ginabo lahir karena kami ingin menghadirkan skincare yang terasa
                lebih dekat, gampang dipahami, dan relevan buat perempuan masa kini.
              </p>
              <p>
                Kita nggak bicara soal hasil instan, tapi soal perawatan yang
                konsisten. Bagi kami, kulit sehat itu dibangun dari rutinitas
                yang lembut, tepat, dan bisa kamu pertahankan terus.
              </p>
              <p>
                Itulah kenapa Ginabo memilih pendekatan yang menggabungkan
                ingredient modern, tekstur nyaman, dan manfaat yang jelas — biar
                momen skincare-an jadi bagian yang menyenangkan di keseharian kamu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ OUR PHILOSOPHY ══ */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #FDFAFF 0%, #f8f4ff 100%)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Our Philosophy
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Nutrition Skin for Active Woman
            </h2>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #e879f9, transparent 70%)" }} />

            <div className="relative max-w-2xl">
              <div className="flex flex-col gap-4 text-sm leading-relaxed text-white/70">
                <p>
                  Kami melihat skincare sebagai nutrisi harian untuk kulitmu.
                  Kulit yang terus beraktivitas perlu dijaga, dilembapkan, dan
                  dirawat biar tetap nyaman dan sehat.
                </p>
                <p>
                  Kami percaya kamu nggak butuh skincare yang berlebihan. Yang
                  paling penting adalah produk yang terasa cocok, mudah dipakai
                  rutin, dan bisa mendukung kulit kamu tetap dalam kondisi terbaiknya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VISION & MISSION ══ */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #f8f4ff 0%, #FDFAFF 100%)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              Vision & Mission
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Tujuan dan misi kami
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl p-7" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#C084FC]" style={{ background: "rgba(192,132,252,0.1)" }}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              </div>
              <div className="text-base font-bold text-white">Vision</div>
              <div className="mt-3 text-sm leading-relaxed text-white/70">
                Menjadi partner kesehatan kulit harian terpercaya bagi perempuan
                aktif lewat skincare yang membantu kulit tetap ternutrisi, sehat,
                nyaman, dan terawat di tengah kesibukan.
              </div>
            </div>

            <div className="rounded-2xl p-7" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#C084FC]" style={{ background: "rgba(192,132,252,0.1)" }}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>
              </div>
              <div className="text-base font-bold text-white">Mission</div>
              <ul className="mt-3 flex flex-col gap-2.5">
                {missions.map((m, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #9333EA, #A855F7)" }}>
                      {i + 1}
                    </span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHAT WE CREATE ══ */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #FDFAFF 0%, #f8f4ff 100%)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              What We Create
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Produk Ginabo fokus pada kebutuhan kulitmu
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5a4a6a]">
              Setiap produk dirancang dengan lembut tapi tetap ampuh — buat kamu yang ingin kulitnya tetap terasa baik meski harinya super sibuk.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {whatWeCreate.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#C084FC]" style={{ background: "rgba(192,132,252,0.1)" }}>
                  {w.icon}
                </div>
                <div className="text-base font-bold text-white">{w.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-white/70">{w.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHAT WE BELIEVE ══ */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, #f8f4ff 0%, #FDFAFF 100%)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white mb-4" style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}>
              What We Believe
            </span>
            <h2 className="text-2xl font-extrabold md:text-[2rem]" style={{ color: "#4A1A5E" }}>
              Prinsip yang kami pegang
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5a4a6a]">
              Skincare itu harus gampang dipahami, nyaman dipakai, dan relevan.
              Kulit sehat jauh lebih penting daripada klaim yang berlebihan.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {beliefs.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#C084FC]" style={{ background: "rgba(192,132,252,0.1)" }}>
                  {b.icon}
                </div>
                <div className="text-sm font-bold text-white">{b.title}</div>
                <div className="mt-2 text-xs leading-relaxed text-white/70">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OUR PROMISE — Final CTA ══ */}
      <section
        className="relative overflow-hidden py-20 text-center"
        style={{ background: "linear-gradient(135deg, #0f0a1e 0%, #1e0a38 50%, #2a1040 100%)" }}
      >
        <div className="pointer-events-none absolute top-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 -translate-y-1/3 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-[300px] w-[300px] -translate-x-1/2 translate-y-1/3 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #e879f9, transparent 70%)" }} />

        <div className="relative mx-auto max-w-2xl px-5">
          <span className="mb-5 inline-block rounded-lg px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>
            Our Promise
          </span>

          <h2 className="mb-6 text-2xl font-bold leading-snug text-white md:text-3xl">
            Menghadirkan skincare yang membantu kulit kamu<br className="hidden md:block" />
            terasa lebih{" "}
            <span className="italic font-light" style={{ background: "linear-gradient(135deg, #c084fc, #e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ternutrisi dan sehat</span>{" "}
            setiap hari.
          </h2>

          <p className="mb-8 text-sm leading-relaxed text-white/60 md:text-base">
            Karena merawat kulit itu bukan tentang menjadi orang lain. Merawat
            kulit adalah tentang menjaga diri kamu sendiri — setiap hari.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl px-8 py-3.5 text-sm font-extrabold text-white transition hover:scale-[1.03] hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 6px 24px rgba(139,92,246,0.4)" }}
            >
              Mulai Rawat Kulitmu
            </Link>
            <Link
              href="/booking"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Konsultasi Gratis
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
