import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reseller Program – Ginabo Beauty",
  description: "Petunjuk dan informasi resmi untuk bergabung sebagai reseller Ginabo."
};

export default function ResellerProgramPage() {
  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #123a38 0%, #1e6b68 40%, #3cb8b2 100%)",
          minHeight: 320
        }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 55%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 1px, transparent 1px)",
            backgroundSize: "56px 56px"
          }}
        />
        <div className="relative mx-auto flex min-h-[320px] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            Program Kemitraan
          </span>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-5xl">
            Reseller Ginabo,{" "}
            <span className="italic font-light">tumbuh bareng</span>.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
            Program resmi untuk partner, stockist, dan distributor. Sistemnya jelas, support-nya jalan, dan dibangun untuk pertumbuhan yang sehat.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/reseller/register"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-extrabold text-[#1e6b68] shadow-sm transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e6b68]"
            >
              Gabung Sekarang →
            </Link>
            <Link
              href="/campaign"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e6b68]"
            >
              Lihat Program Lain
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:px-8">
          <div className="grid gap-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Cara Gabung</div>
            <h2 className="text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Mulai dari langkah yang jelas</h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#5a516f]">
              Kami bantu dari awal supaya kamu bisa fokus jualan dan bertumbuh konsisten.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "Isi Form Pendaftaran", desc: "Ceritakan domisili, kontak, dan pengalaman jualan (kalau ada)." },
              { step: "02", title: "Verifikasi & Onboarding", desc: "Tim kami review, lalu bantu arahan basic selling dan product knowledge." },
              { step: "03", title: "Mulai Jualan", desc: "Akses harga partner, materi promosi, dan support rutin untuk aktivitas harian." }
            ].map((s) => (
              <div key={s.step} className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: "1.5px solid #e9fbfa" }}>
                <div className="text-xs font-black tracking-[0.2em] text-[#2a7c78]">{s.step}</div>
                <div className="mt-2 text-base font-extrabold text-[#2a2a2a]">{s.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-[#5a516f]">{s.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #efe6fb" }}>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#665DAC]">Benefit Partner</div>
              <div className="mt-3 grid gap-2 text-sm text-[#3d3550]">
                {[
                  { t: "Margin lebar", d: "Harga khusus partner yang memungkinkan keuntungan lebih optimal." },
                  { t: "Reward penjualan", d: "Program challenge & insentif untuk dorong performa." },
                  { t: "Bimbingan & training", d: "Product knowledge + basic selling untuk bantu closing lebih mudah." },
                  { t: "Free sample & support tools", d: "Mendukung trial dan aktivitas penjualan harian." }
                ].map((i) => (
                  <div key={i.t} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#665DAC]" />
                    <span>
                      <span className="font-semibold">{i.t}</span>, {i.d}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #efe6fb" }}>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#665DAC]">Program Reward</div>
              <div className="mt-4 grid gap-3 text-sm text-[#3d3550]">
                <div className="rounded-2xl bg-[#fbf8ff] p-4" style={{ border: "1.5px solid #efe6fb" }}>
                  <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#665DAC]">Bulanan</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Top Sales Partner", "Top Growth Partner", "Top Recruit Partner"].map((t) => (
                      <span key={t} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#3d3550]" style={{ border: "1.5px solid #efe6fb" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs font-semibold text-[#6a5a88]">Bonus produk, voucher, saldo, materi promosi eksklusif, support konten atau ads.</div>
                </div>
                <div className="rounded-2xl bg-[#fbf8ff] p-4" style={{ border: "1.5px solid #efe6fb" }}>
                  <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#665DAC]">Quartal</div>
                  <div className="mt-2 text-sm text-[#3d3550]">Bonus omzet, gift eksklusif, business coaching, akselerasi kenaikan level.</div>
                </div>
                <div className="rounded-2xl bg-[#fbf8ff] p-4" style={{ border: "1.5px solid #efe6fb" }}>
                  <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#665DAC]">Tahunan</div>
                  <div className="mt-2 text-sm text-[#3d3550]">Hadiah performa nasional berdasarkan pencapaian dan target perusahaan.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #efe6fb" }}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#665DAC]">Harga Reseller</div>
                <div className="mt-2 text-xl font-extrabold text-[#2a2a2a]">Contoh struktur harga</div>
              </div>
              <div className="text-xs font-semibold text-[#6a5a88]">Harga final mengikuti katalog terbaru.</div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-2xl bg-white" style={{ border: "1.5px solid #efe6fb" }}>
              <table className="min-w-[720px] w-full text-left text-xs text-[#3d3550]">
                <thead className="bg-[#F0EBFA] text-[11px] font-bold uppercase tracking-[0.16em] text-[#665DAC]">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Marketplace</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Store</th>
                    <th className="px-4 py-3">Reseller</th>
                    <th className="px-4 py-3">Profit</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-[#efe6fb]">
                  {[
                    { product: "Item 1", marketplace: "85.000", event: "80.000", store: "90.000", reseller: "65.000", profit: "15.000" },
                    { product: "Item 2", marketplace: "95.000", event: "90.000", store: "98.000", reseller: "75.000", profit: "15.000" },
                    { product: "Item 3", marketplace: "120.000", event: "115.000", store: "125.000", reseller: "95.000", profit: "20.000" }
                  ].map((row) => (
                    <tr key={row.product} className="bg-white">
                      <td className="px-4 py-3 font-semibold text-[#2a2a2a]">{row.product}</td>
                      <td className="px-4 py-3">{row.marketplace}</td>
                      <td className="px-4 py-3">{row.event}</td>
                      <td className="px-4 py-3">{row.store}</td>
                      <td className="px-4 py-3 font-semibold">{row.reseller}</td>
                      <td className="px-4 py-3">{row.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <section className="rounded-3xl p-7 text-center text-white" style={{ background: "linear-gradient(135deg, #1e6b68, #3cb8b2)" }}>
            <div className="mx-auto max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Siap Mulai?</div>
              <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Gabung sekarang, kami bantu dari awal</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/85">
                Isi form pendaftaran reseller, lalu tim Ginabo akan follow up untuk verifikasi dan onboarding.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/reseller/register"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-extrabold text-[#1e6b68] shadow-sm transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e6b68]"
                >
                  Gabung Sekarang →
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e6b68]"
                >
                  Tanya Admin
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
