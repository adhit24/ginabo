"use client";

import { useState } from "react";
import Link from "next/link";
import { store } from "@/lib/adminStore";
export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleDemoLogin() {
    store.setAdminSession(true);
    window.location.href = "/admin";
  }

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
              placeholder="ginabo_admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            />
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

        {/* Demo credentials hint */}
        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-1">Demo Credentials</p>
          <p className="text-xs text-white/50">Username: <span className="font-mono text-white/70">ginabo_admin</span></p>
          <p className="text-xs text-white/50">Password: <span className="font-mono text-white/70">ginabo2024</span></p>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="mt-3 w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white/80"
        >
          Masuk Demo (Bypass Login)
        </button>

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
