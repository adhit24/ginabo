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
  { icon: "💧", text: "Menjaga kelembapan dan merawat skin barrier." },
  { icon: "✨", text: "Membantu kulit terasa lebih nyaman, segar, dan sehat." },
  { icon: "🌸", text: "Membuat kulit tampak cerah dan terawat." },
];

const beliefs = [
  { icon: "🧴", title: "Mudah Dipahami", desc: "Skincare nggak harus rumit. Kami bicara jujur dan lugas." },
  { icon: "🤲", title: "Nyaman Dipakai", desc: "Tekstur yang ringan dan cocok untuk rutinitas harian." },
  { icon: "📅", title: "Konsisten Itu Kunci", desc: "Perawatan rutin lebih berarti daripada janji instan." },
  { icon: "🌿", title: "Relevan untuk Hidupmu", desc: "Skincare yang dirancang sesuai kebutuhan nyata perempuan aktif." },
];

/* ─── Page ─── */
export default function AboutPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ════════════════════════════════════════
          HERO — Above the fold
      ════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2a1635 0%, #78257C 55%, #BD6CC9 100%)",
          minHeight: 380,
        }}
      >
        {/* subtle dot texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto flex min-h-[380px] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
          {/* pill */}
          <span className="mb-5 inline-block rounded-full border border-white/25 bg-white/12 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
            About Us
          </span>

          {/* headline */}
          <h1 className="mb-5 text-3xl font-bold leading-[1.15] text-white md:text-[3.2rem]">
            Healthy skin,{" "}
            <span className="italic font-light">nourished for real life.</span>
          </h1>

          {/* sub */}
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            Ginabo hadir buat kamu — perempuan aktif yang pengen tetap merawat
            kulit di tengah padatnya jadwal harian. Fokus kami:{" "}
            <strong className="text-white font-semibold">
              Nutrition Skin for Active Woman.
            </strong>
          </p>

          {/* value badge */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Nutrition", "Hydration", "Comfort", "Consistency"].map((v) => (
              <span
                key={v}
                className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/85 backdrop-blur"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OPENING STATEMENT
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <p className="mb-5 text-base leading-relaxed text-[#444] md:text-lg">
            Kami percaya kalau kulit yang sehat, nyaman, dan ternutrisi itu bukan
            cuma soal penampilan aja — tapi soal rasa percaya diri biar kamu bisa
            menjalani hari dengan lebih tenang.
          </p>
          <p className="text-base leading-relaxed text-[#444] md:text-lg">
            Makanya, kami menghadirkan skincare yang beneran relevan dengan
            kebutuhan kulit kamu dalam kehidupan nyata.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OUR STORY
      ════════════════════════════════════════ */}
      <section
        className="py-16 md:py-24"
        style={{ background: "#F7F3FB" }}
      >
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          {/* section label */}
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "#665DAC" }}
            >
              01
            </div>
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "#665DAC" }}
            >
              Our Story
            </span>
          </div>

          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            {/* left — big quote */}
            <div>
              <blockquote
                className="mb-6 border-l-4 pl-6 text-xl font-bold italic leading-snug md:text-2xl"
                style={{ borderColor: "#BD6CC9", color: "#2a2a2a" }}
              >
                "Bukan cuma skincare yang terdengar meyakinkan — tapi yang
                bener-bener terasa nyaman setiap hari."
              </blockquote>
              <div
                className="h-px w-12 rounded-full"
                style={{ background: "#BD6CC9" }}
              />
            </div>

            {/* right — paragraphs */}
            <div className="flex flex-col gap-5 text-sm leading-relaxed text-[#555]">
              <p>
                Ginabo lahir karena kami ingin menghadirkan skincare yang terasa
                lebih dekat, gampang dipahami, dan relevan buat perempuan masa
                kini.
              </p>
              <p>
                Kita nggak bicara soal hasil instan, tapi soal perawatan yang
                konsisten. Bagi kami, kulit sehat itu dibangun dari rutinitas
                yang lembut, tepat, dan bisa kamu pertahankan terus.
              </p>
              <p>
                Itulah kenapa Ginabo memilih pendekatan yang menggabungkan
                ingredient modern, tekstur nyaman, dan manfaat yang jelas — biar
                momen skincare-an jadi bagian yang menyenangkan di keseharian
                kamu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OUR PHILOSOPHY
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "#78257C" }}
            >
              02
            </div>
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "#78257C" }}
            >
              Our Philosophy
            </span>
          </div>

          {/* philosophy card */}
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{
              background: "linear-gradient(135deg, #78257C, #BD6CC9)",
            }}
          >
            {/* decorative circle */}
            <div
              className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10"
              style={{ background: "#fff" }}
            />
            <div
              className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full opacity-10"
              style={{ background: "#fff" }}
            />

            <div className="relative max-w-2xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-white/60">
                Semangat kami
              </p>
              <h2 className="mb-6 text-2xl font-bold italic text-white md:text-3xl">
                "Nutrition Skin for Active Woman"
              </h2>
              <div className="flex flex-col gap-4 text-sm leading-relaxed text-white/85">
                <p>
                  Kami melihat skincare sebagai nutrisi harian untuk kulitmu.
                  Kulit yang terus beraktivitas perlu dijaga, dilembapkan, dan
                  dirawat biar tetap nyaman dan sehat.
                </p>
                <p>
                  Kami percaya kamu nggak butuh skincare yang berlebihan. Yang
                  paling penting adalah produk yang terasa cocok, mudah dipakai
                  rutin, dan bisa mendukung kulit kamu tetap dalam kondisi
                  terbaiknya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VISION & MISSION
      ════════════════════════════════════════ */}
      <section
        className="py-16 md:py-24"
        style={{ background: "#F7F3FB" }}
      >
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "#BD6CC9" }}
            >
              03
            </div>
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "#BD6CC9" }}
            >
              Vision &amp; Mission
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Vision */}
            <div
              className="flex flex-col gap-4 rounded-2xl bg-white p-7"
              style={{ boxShadow: "0 2px 16px rgba(100,50,120,0.07)", border: "1px solid #f0e8f8" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔭</span>
                <h2 className="text-lg font-extrabold" style={{ color: "#2a2a2a" }}>
                  Vision
                </h2>
              </div>
              <div className="h-px w-8 rounded-full" style={{ background: "#BD6CC9" }} />
              <p className="text-sm leading-relaxed" style={{ color: "#555" }}>
                Menjadi partner kesehatan kulit harian terpercaya bagi perempuan
                aktif lewat skincare yang membantu kulit tetap ternutrisi, sehat,
                nyaman, dan terawat di tengah kesibukan.
              </p>
            </div>

            {/* Mission */}
            <div
              className="flex flex-col gap-4 rounded-2xl bg-white p-7"
              style={{ boxShadow: "0 2px 16px rgba(100,50,120,0.07)", border: "1px solid #f0e8f8" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <h2 className="text-lg font-extrabold" style={{ color: "#2a2a2a" }}>
                  Mission
                </h2>
              </div>
              <div className="h-px w-8 rounded-full" style={{ background: "#BD6CC9" }} />
              <ul className="flex flex-col gap-3">
                {missions.map((m, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "#555" }}>
                    <span
                      className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: "#BD6CC9" }}
                    >
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

      {/* ════════════════════════════════════════
          WHAT WE CREATE
      ════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "#CF99B4" }}
            >
              04
            </div>
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "#CF99B4" }}
            >
              What We Create
            </span>
          </div>

          <h2 className="mb-4 text-2xl font-bold md:text-3xl" style={{ color: "#2a2a2a" }}>
            Produk Ginabo fokus pada{" "}
            <span style={{ color: "#BD6CC9" }}>kebutuhan kulitmu sehari-hari.</span>
          </h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed" style={{ color: "#666" }}>
            Setiap produk dirancang dengan lembut tapi tetap ampuh — buat kamu
            yang ingin kulitnya tetap terasa baik meski harinya super sibuk.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {whatWeCreate.map((w) => (
              <div
                key={w.text}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 transition hover:shadow-md"
                style={{ border: "1.5px solid #f0e8f8", boxShadow: "0 1px 8px rgba(100,50,120,0.05)" }}
              >
                <span className="shrink-0 text-3xl">{w.icon}</span>
                <p className="text-sm leading-relaxed" style={{ color: "#444" }}>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHAT WE BELIEVE
      ════════════════════════════════════════ */}
      <section
        className="py-16 md:py-24"
        style={{ background: "#F7F3FB" }}
      >
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: "#665DAC" }}
            >
              05
            </div>
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: "#665DAC" }}
            >
              What We Believe
            </span>
          </div>

          <p className="mb-10 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "#555" }}>
            Skincare itu harus gampang dipahami, nyaman dipakai, dan relevan.
            Kulit sehat jauh lebih penting daripada klaim yang berlebihan, dan
            perawatan yang konsisten jauh lebih berarti daripada sekadar janji
            hasil instan.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {beliefs.map((b) => (
              <div
                key={b.title}
                className="flex flex-col gap-3 rounded-2xl bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                style={{ boxShadow: "0 2px 10px rgba(100,50,120,0.06)", border: "1px solid #f0e8f8" }}
              >
                <span className="text-3xl">{b.icon}</span>
                <div>
                  <div className="mb-1 font-bold" style={{ color: "#2a2a2a" }}>{b.title}</div>
                  <div className="h-px w-6 rounded-full" style={{ background: "#BD6CC9" }} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          OUR PROMISE — Final CTA
      ════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20 text-center"
        style={{
          background: "linear-gradient(135deg, #2a1635 0%, #78257C 50%, #BD6CC9 100%)",
        }}
      >
        {/* texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative mx-auto max-w-2xl px-5">
          <span className="mb-5 inline-block rounded-full border border-white/25 bg-white/12 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
            Our Promise
          </span>

          <h2 className="mb-6 text-2xl font-bold leading-snug text-white md:text-3xl">
            Menghadirkan skincare yang membantu kulit kamu<br className="hidden md:block" />
            terasa lebih{" "}
            <span className="italic font-light">ternutrisi dan sehat</span>{" "}
            setiap hari.
          </h2>

          <p className="mb-8 text-sm leading-relaxed text-white/80 md:text-base">
            Karena merawat kulit itu bukan tentang menjadi orang lain. Merawat
            kulit adalah tentang menjaga diri kamu sendiri — setiap hari.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold transition hover:bg-purple-50"
              style={{ color: "#78257C" }}
            >
              Mulai Rawat Kulitmu →
            </Link>
            <Link
              href="/booking"
              className="rounded-xl border-2 border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Konsultasi Gratis
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
