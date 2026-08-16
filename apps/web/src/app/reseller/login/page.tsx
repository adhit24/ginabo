"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

function waLink() {
  const text = "Halo Ginabo, saya butuh bantuan masuk ke akun partner saya.";
  return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
}

export default function ResellerLoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      router.push("/reseller/dashboard");
    } else {
      setError(result.error ?? "Login gagal.");
    }
  }

  return (
    <div className="grid min-h-[620px] grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-14 md:px-12">
        <h1 className="text-[30px] font-extrabold leading-[1.25] tracking-[-.02em]" style={{ color: "#241338" }}>
          Masuk ke akun partner
        </h1>
        <p className="mt-3 text-[13.5px] leading-[1.7] text-[#6b5c80]">
          Kelola penjualan, poin, dan order kamu dalam satu dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex max-w-[400px] flex-col gap-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1.5 text-[12px] font-semibold" style={{ color: "#4a3b60" }}>
            Email atau nomor WhatsApp
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="h-[46px] rounded-xl px-3.5 text-[13px] outline-none"
              style={{ border: "1px solid #E7DFF5", background: "#FCFBFE", color: "#241338" }}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[12px] font-semibold" style={{ color: "#4a3b60" }}>
            Kata sandi
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-[46px] rounded-xl px-3.5 text-[13px] outline-none"
              style={{ border: "1px solid #E7DFF5", background: "#FCFBFE", color: "#241338" }}
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[12.5px] font-medium text-[#6b5c80]">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-[15px] w-[15px] accent-[#7C3AED]" />
              Ingat saya
            </label>
            <Link href="#" className="text-[12.5px] font-semibold" style={{ color: "#7C3AED" }}>
              Lupa kata sandi?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-[50px] rounded-[13px] text-[14px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6D28D9,#9333EA)", boxShadow: "0 12px 28px rgba(109,40,217,.3)" }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "#EDE7F8" }} />
            <span className="text-[11.5px] font-medium text-[#a294b5]">atau</span>
            <span className="h-px flex-1" style={{ background: "#EDE7F8" }} />
          </div>

          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2.5 rounded-[13px] text-[13.5px] font-bold"
            style={{ border: "1px solid #E3DAF3", color: "#4A1A5E" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.4c1.5.8 3.2 1.4 5 1.4 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .9.8-3-.2-.3A8 8 0 1 1 12 20z" />
            </svg>
            Butuh bantuan? Chat WhatsApp
          </a>

          <p className="mt-1.5 text-[12.5px] font-medium text-[#8b7aa8]">
            Belum jadi partner?{" "}
            <Link href="/reseller/register" className="font-bold" style={{ color: "#7C3AED" }}>
              Daftar sekarang
            </Link>
          </p>
        </form>
      </div>

      <div className="relative flex flex-col justify-end gap-4 overflow-hidden p-11" style={{ background: "linear-gradient(160deg,#2A1244,#4A1A5E)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative full-bleed background photo */}
        <img
          src="/hero/reseller.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.32, objectPosition: "74% center" }}
        />
        <div className="relative">
          <p className="max-w-[360px] text-[22px] font-semibold leading-[1.45] text-white">
            Sistem sudah ada, produk berkualitas, bimbingan sampai bisa.
          </p>
          <p className="mt-3.5 max-w-[340px] text-[13px] leading-[1.7] text-white/65">
            Lebih dari 500 partner aktif menjalankan bisnis skincare mereka bersama Ginabo.
          </p>
        </div>
      </div>
    </div>
  );
}
