"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_CREDS, store } from "@/lib/adminStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
        store.setAdminSession(true);
        router.replace("/admin");
      } else {
        setError("Username atau password salah.");
        setLoading(false);
      }
    }, 500);
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

        <p className="mt-6 text-center text-xs text-white/30">
          Akses admin hanya untuk tim internal Ginabo.
        </p>
      </div>
    </div>
  );
}
