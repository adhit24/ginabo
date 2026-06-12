"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clickCount, setClickCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.ok) {
      router.push("/member");
    } else {
      setError(result.error ?? "Login gagal.");
    }
  };

  const handleGoogle = () => {
    signInWithGoogle();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1e0a38 50%,#2a1040 100%)" }}
    >
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle,#e879f9,transparent 70%)" }}
      />

      <div
        className="relative w-full max-w-md rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-extrabold tracking-widest text-white">GINABO</span>
          <span
            className="ml-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white align-middle"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
          >
            MEMBER
          </span>
          <p className="mt-2 text-sm text-white/50">Masuk dan lanjutkan perjalanan kulitmu</p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
            {error}
          </div>
        )}

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.12)" }} />
          <span className="text-xs text-white/30">atau masuk dengan email</span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.12)" }} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Email</label>
            <input
              type="email"
              required
              placeholder="email@kamu.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              onFocus={e => { e.currentTarget.style.border = "1px solid rgba(168,85,247,0.7)"; }}
              onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)"; }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Password</label>
              <Link href="#" className="text-xs text-white/30 hover:text-white/60 transition">Lupa password?</Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              onFocus={e => { e.currentTarget.style.border = "1px solid rgba(168,85,247,0.7)"; }}
              onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)"; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl py-3.5 text-sm font-bold text-white transition disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }}
            onDoubleClick={() => router.push("/admin/login")}
            onClick={() => setClickCount(n => n + 1)}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1 text-sm text-white/30">
          <span>Belum punya akun?</span>
          <Link href="/auth/signup" className="font-semibold text-white/60 hover:text-white transition">Daftar gratis</Link>
        </div>

        <div className="mt-3 text-center">
          <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition">Kembali ke beranda</Link>
        </div>
      </div>
    </div>
  );
}
