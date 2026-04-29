"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    const result = await signup(form.name, form.email, form.password);
    setLoading(false);
    if (result.ok) {
      router.push("/member");
    } else {
      setError(result.error ?? "Pendaftaran gagal.");
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-50">
      {/* Left panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src="/product-serum-2.png"
          alt="Ginabo skincare"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-900/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6 text-3xl font-extrabold tracking-widest text-white">GINABO</div>
          <p className="text-sm font-medium leading-relaxed text-white/80">
            Sentuhan Mewah Setiap Hari.<br />
            Daftar sekarang dan mulai perjalanan kulit sehatmu.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {["Free ongkir untuk member", "Akses promo eksklusif", "Histori pembelian tersimpan"].map(b => (
              <div key={b} className="flex items-center gap-2 text-sm text-white/90">
                <span className="text-brand-200">✦</span> {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="text-2xl font-extrabold tracking-widest text-brand-700">GINABO</Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-brand-900">Buat Akun Baru</h1>
            <p className="mt-1 text-sm text-brand-500">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="font-semibold text-brand-700 hover:underline">Masuk di sini</Link>
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Nama kamu"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-[16px] text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Email</label>
              <input
                type="email"
                required
                placeholder="email@kamu.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-[16px] text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">No. WhatsApp</label>
              <input
                type="tel"
                placeholder="08xx-xxxx-xxxx"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-[16px] text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Password</label>
              <input
                type="password"
                required
                placeholder="Min. 8 karakter"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-[16px] text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Konfirmasi Password</label>
              <input
                type="password"
                required
                placeholder="Ulangi password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-[16px] text-brand-900 outline-none placeholder:text-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 md:text-sm"
              />
            </div>

            <p className="text-[11px] text-brand-400">
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="#" className="text-brand-600 hover:underline">Syarat & Ketentuan</Link>{" "}
              dan{" "}
              <Link href="#" className="text-brand-600 hover:underline">Kebijakan Privasi</Link> Ginabo.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white shadow-brand transition hover:bg-brand-800 disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs text-brand-400 hover:text-brand-600">← Kembali ke beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
