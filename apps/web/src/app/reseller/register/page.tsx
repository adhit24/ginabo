"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export default function ResellerRegisterPage() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    instagram: "",
    experience: "NEW",
    message: ""
  });

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 2 && form.phone.trim().length >= 8 && state.status !== "submitting" && state.status !== "success";
  }, [form.name, form.phone, state.status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/reseller/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setState({ status: "error", message: json?.error?.message ?? "Gagal mengirim pendaftaran." });
        return;
      }
      setState({ status: "success" });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Gagal mengirim pendaftaran." });
    }
  };

  return (
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">
      <section className="py-10 md:py-14">
        <div className="mx-auto grid max-w-3xl gap-6 px-5 md:px-8">
          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/" className="hover:text-brand-700">Home</Link>
              <span>›</span>
              <Link href="/reseller" className="hover:text-brand-700">Reseller Program</Link>
              <span>›</span>
              <span className="font-semibold text-gray-700">Pendaftaran</span>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Pendaftaran Reseller</div>
            <h1 className="text-2xl font-extrabold text-[#2a2a2a] md:text-3xl">Gabung sebagai reseller Ginabo</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#5a516f]">
              Isi form singkat ini. Tim Ginabo akan follow up untuk verifikasi dan onboarding.
            </p>
          </div>

          {state.status === "success" ? (
            <div className="rounded-3xl bg-white p-7 text-center shadow-sm" style={{ border: "1.5px solid #e9fbfa" }}>
              <div className="mx-auto grid max-w-md gap-3">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#2a7c78]">Berhasil</div>
                <div className="text-xl font-extrabold text-[#2a2a2a]">Pendaftaran kamu sudah terkirim</div>
                <p className="text-sm leading-relaxed text-[#5a516f]">
                  Tim Ginabo akan menghubungi kamu melalui WhatsApp atau email untuk langkah berikutnya.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2a7c78] px-7 py-3 text-sm font-extrabold text-white transition hover:opacity-95"
                  >
                    Lihat Produk →
                  </Link>
                  <Link
                    href="/reseller"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#2a7c78] px-7 py-3 text-sm font-bold text-[#2a7c78] transition hover:bg-emerald-50"
                  >
                    Kembali ke Info Program
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #efe6fb" }}>
              <div className="grid gap-5">
                {state.status === "error" ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {state.message}
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-semibold text-gray-900">Nama lengkap</span>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-[#665DAC] focus:ring-2 focus:ring-[#665DAC]/15"
                      placeholder="Contoh: Nadia Putri"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label className="grid gap-1.5 text-sm">
                    <span className="font-semibold text-gray-900">Nomor WhatsApp</span>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-[#665DAC] focus:ring-2 focus:ring-[#665DAC]/15"
                      placeholder="Contoh: 08xxxxxxxxxx"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-semibold text-gray-900">Email (opsional)</span>
                    <input
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-[#665DAC] focus:ring-2 focus:ring-[#665DAC]/15"
                      placeholder="Contoh: nama@email.com"
                      inputMode="email"
                      autoComplete="email"
                      type="email"
                    />
                  </label>

                  <label className="grid gap-1.5 text-sm">
                    <span className="font-semibold text-gray-900">Kota (opsional)</span>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-[#665DAC] focus:ring-2 focus:ring-[#665DAC]/15"
                      placeholder="Contoh: Bandung"
                      autoComplete="address-level2"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-semibold text-gray-900">Instagram (opsional)</span>
                    <input
                      value={form.instagram}
                      onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                      className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-[#665DAC] focus:ring-2 focus:ring-[#665DAC]/15"
                      placeholder="Contoh: @namakamu"
                    />
                  </label>

                  <label className="grid gap-1.5 text-sm">
                    <span className="font-semibold text-gray-900">Pengalaman jualan</span>
                    <select
                      value={form.experience}
                      onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                      className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-[#665DAC] focus:ring-2 focus:ring-[#665DAC]/15"
                    >
                      <option value="NEW">Baru mulai</option>
                      <option value="SELLER">Sudah pernah jualan online</option>
                      <option value="STORE">Punya toko / offline</option>
                    </select>
                  </label>
                </div>

                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold text-gray-900">Catatan (opsional)</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="min-h-[110px] resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-[#665DAC] focus:ring-2 focus:ring-[#665DAC]/15"
                    placeholder="Contoh: Aku mau fokus jualan di komunitas olahraga / kantor."
                  />
                  <span className="text-xs text-gray-500">Maks 500 karakter.</span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/reseller" className="text-sm font-semibold text-[#665DAC] hover:underline">
                    ← Kembali ke info program
                  </Link>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2a7c78] px-8 py-3 text-sm font-extrabold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {state.status === "submitting" ? "Mengirim..." : "Gabung Sekarang →"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
