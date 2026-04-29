import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">Contact</h1>
      <div className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-8">
        <p className="text-sm leading-relaxed text-gray-700">
          Punya pertanyaan tentang rutinitas, produk, atau jadwal konsultasi? Hubungi kami melalui channel berikut.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-semibold text-gray-900">WhatsApp</div>
            <div className="mt-1 text-sm text-gray-600">Struktur notifikasi WhatsApp sudah disiapkan (API-ready).</div>
            <Link href="#" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">
              +62 8xx-xxxx-xxxx
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-semibold text-gray-900">Email</div>
            <div className="mt-1 text-sm text-gray-600">Untuk pertanyaan detail dan follow up.</div>
            <Link href="mailto:hello@ginabo.co" className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">
              hello@ginabo.co
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
