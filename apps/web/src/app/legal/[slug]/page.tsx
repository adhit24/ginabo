import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── KONTEN KEBIJAKAN ──────────────────────────────────────────────────────────
// Kerangka resmi — heading sudah disiapkan, isi paragraf ditulis oleh tim Ginabo.
// Tandai `draft: true` selama konten belum final.

type Policy = {
  title: string;
  intro: string;
  sections: { heading: string; body?: string }[];
  draft?: boolean;
};

const POLICIES: Record<string, Policy> = {
  "syarat-ketentuan": {
    title: "Syarat & Ketentuan",
    intro:
      "Dengan mengakses dan menggunakan layanan Ginabo, kamu menyetujui syarat dan ketentuan berikut.",
    draft: true,
    sections: [
      { heading: "Penggunaan Layanan" },
      { heading: "Akun & Keamanan" },
      { heading: "Pemesanan & Pembayaran" },
      { heading: "Hak & Kewajiban Pengguna" },
      { heading: "Batasan Tanggung Jawab" },
      { heading: "Perubahan Ketentuan" },
    ],
  },
  privasi: {
    title: "Kebijakan Privasi",
    intro:
      "Privasimu penting bagi kami. Halaman ini menjelaskan bagaimana Ginabo mengumpulkan, menggunakan, dan melindungi data pribadimu.",
    draft: true,
    sections: [
      { heading: "Data yang Kami Kumpulkan" },
      { heading: "Cara Kami Menggunakan Data" },
      { heading: "Berbagi Data dengan Pihak Ketiga" },
      { heading: "Cookie & Teknologi Pelacakan" },
      { heading: "Hak Kamu atas Data" },
      { heading: "Keamanan Data" },
    ],
  },
  pengiriman: {
    title: "Kebijakan Pengiriman",
    intro:
      "Informasi mengenai jasa kirim, estimasi waktu, dan ongkos pengiriman pesananmu.",
    draft: true,
    sections: [
      { heading: "Area & Jasa Pengiriman" },
      { heading: "Estimasi Waktu Pengiriman" },
      { heading: "Ongkos Kirim" },
      { heading: "Pelacakan Pesanan" },
      { heading: "Kendala Pengiriman" },
    ],
  },
  pengembalian: {
    title: "Kebijakan Pengembalian",
    intro:
      "Ketentuan pengembalian produk dan pengembalian dana untuk pembelian di Ginabo.",
    draft: true,
    sections: [
      { heading: "Syarat Pengembalian" },
      { heading: "Periode Klaim" },
      { heading: "Proses Pengembalian" },
      { heading: "Pengembalian Dana" },
      { heading: "Produk yang Tidak Dapat Dikembalikan" },
    ],
  },
};

const SLUGS = Object.keys(POLICIES);

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) return { title: "Halaman tidak ditemukan — Ginabo" };
  return {
    title: `${policy.title} — Ginabo`,
    description: policy.intro,
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <div className="bg-[#FBF8F4] text-[#2a2a2a]">
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          {/* Breadcrumb */}
          <div className="mb-7 flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#78257C]">Home</Link>
            <span>›</span>
            <span className="font-semibold text-gray-700">{policy.title}</span>
          </div>

          <p className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9A2D8C]">
            <span className="inline-block h-px w-5 bg-[#9A2D8C]" aria-hidden="true" />
            Legal
          </p>
          <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight text-[#1C1A17] md:text-[42px]">
            {policy.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#5a5560] md:text-[15px]">
            {policy.intro}
          </p>

          {policy.draft && (
            <div className="mt-6 rounded-2xl border border-[#E9DFD2] bg-[#F4EEE6] px-4 py-3 text-[12.5px] leading-relaxed text-[#7a6f5e]">
              Konten kebijakan ini sedang dalam penyusunan. Untuk pertanyaan, silakan{" "}
              <Link href="/contact" className="font-semibold text-[#78257C] underline">hubungi tim kami</Link>.
            </div>
          )}

          {/* Sections */}
          <div className="mt-10 flex flex-col gap-8">
            {policy.sections.map((s, i) => (
              <section key={s.heading} aria-label={s.heading}>
                <h2 className="font-display text-[19px] font-semibold text-[#1C1A17] md:text-[22px]">
                  <span className="mr-2 text-[#be3ab4]">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#5a5560]">
                  {s.body ?? "Konten bagian ini akan diisi oleh tim Ginabo."}
                </p>
              </section>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-12 border-t border-[#1C1A17]/[0.06] pt-6 text-[12px] text-[#8a7d92]">
            <p>PT Ginabo Nusantara · Terakhir diperbarui: —</p>
            <p className="mt-1">
              Butuh bantuan?{" "}
              <Link href="/contact" className="font-semibold text-[#78257C] underline">Hubungi Kami</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
