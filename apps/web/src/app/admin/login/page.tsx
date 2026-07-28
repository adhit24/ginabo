"use client";

import { useState } from "react";
import Link from "next/link";
import { store } from "@/lib/adminStore";
export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        store.setAdminSession(true);
        window.location.href = "/admin";
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: { message?: string } }).error?.message ?? "Username atau password salah.");
        setLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1e0a38 50%,#2a1040 100%)" }}>
      {/* Glow blobs */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle,#e879f9,transparent 70%)" }} />

      <div className="relative w-full max-w-md rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="font-staatliches text-3xl text-white tracking-wider">GINABO</span>
          <span className="ml-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white align-middle"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>ADMIN</span>
          <p className="mt-2 text-sm text-white/50">Panel manajemen Ginabo</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Username</label>
            <input
              type="text"
              required
              placeholder="Masukkan username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
          >
            {loading ? "Memproses..." : "Masuk sebagai Admin"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/30">
          Akses admin hanya untuk tim internal Ginabo.
        </p>

        <Link
          href="/"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white/50 transition hover:text-white/80"
        >
          Kembali ke Home
        </Link>
      </div>
    </div>
  );
}
