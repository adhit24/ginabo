"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 4.22-5.19M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a20.3 20.3 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

export default function SignupPage() {
  const { signup, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleGoogle = () => {
    signInWithGoogle();
  };

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

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const glowX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(springY, [0, 1], ["0%", "100%"]);

  function handleCardMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleCardMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setIsHovered(false);
  }


  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    borderColor: "rgba(139,92,246,0.2)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "#ffffff" }}
    >
      <div className="relative z-10 flex w-full max-w-5xl items-center gap-12">

        {/* Left — kartu member floating */}
        <div className="hidden lg:flex flex-shrink-0 flex-col items-center gap-6">
          <motion.div
            ref={cardRef}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex cursor-pointer items-center justify-center"
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleCardMouseLeave}
            whileHover={{ scale: 1.03 }}
          >
            {/* Glow — follows mouse via motion values */}
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 460,
                height: 300,
                translateX: "-50%",
                translateY: "-50%",
                left: glowX,
                top: glowY,
                background: isHovered
                  ? "radial-gradient(ellipse at center, rgba(147,51,234,0.35) 0%, rgba(147,51,234,0.15) 45%, transparent 72%)"
                  : "radial-gradient(ellipse at center, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0.05) 45%, transparent 75%)",
                filter: isHovered ? "blur(24px)" : "blur(36px)",
                transition: "background 0.25s ease, filter 0.25s ease",
                zIndex: 0,
              }}
            />
            <Image
              src="/kartu_member.png"
              alt="Kartu Member Ginabo"
              width={510}
              height={330}
              className="relative rounded-2xl"
              style={{ zIndex: 1 }}
              priority
            />
          </motion.div>

          {/* Info below card */}
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c084fc]">Member Card</p>
            <p className="mt-1 text-sm font-medium text-[#4A1A5E]">Dapatkan kartu member eksklusif</p>
            <div className="mt-4 flex flex-col gap-2">
              {["Poin reward setiap pembelian", "Diskon eksklusif member", "Akses flash sale lebih awal"].map(t => (
                <div key={t} className="flex items-center gap-2 text-xs text-[#5a4a6a]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b5cf6]" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form card */}
        <div
          className="w-full max-w-md rounded-2xl p-7"
          style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <span className="text-3xl font-extrabold tracking-widest text-white">GINABO</span>
            <span
              className="ml-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white align-middle"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}
            >
              MEMBER
            </span>
            <p className="mt-2 text-sm text-white/50">Buat akun dan mulai perjalanan kulitmu</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(139,92,246,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Daftar dengan Google
          </button>

          {/* Divider */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "rgba(139,92,246,0.2)" }} />
            <span className="text-xs text-white/30">atau daftar dengan email</span>
            <div className="h-px flex-1" style={{ background: "rgba(139,92,246,0.2)" }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-white">Nama</span>
                <input type="text" required placeholder="Contoh: Nadia Putri"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="min-h-11 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
                  style={inputStyle} />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-white">Nomor WhatsApp</span>
                <input type="tel" placeholder="Contoh: 08xxxxxxxxxx"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="min-h-11 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
                  style={inputStyle} />
              </label>
            </div>

            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold text-white">Email</span>
              <input type="email" required placeholder="Contoh: nama@email.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="min-h-11 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
                style={inputStyle} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-white">Password</span>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="Min. 8 karakter"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="min-h-11 w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
                    style={inputStyle} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/80"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-white">Konfirmasi</span>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} required placeholder="Ulangi"
                    value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    className="min-h-11 w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
                    style={inputStyle} />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/80"
                    aria-label={showConfirm ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex min-h-11 items-center justify-center rounded-lg py-3 text-sm font-extrabold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>

            <div className="text-center text-xs text-white/40">
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="#" className="text-[#c084fc] hover:text-[#e879f9] underline">Syarat & Ketentuan</Link>{" "}
              dan{" "}
              <Link href="#" className="text-[#c084fc] hover:text-[#e879f9] underline">Kebijakan Privasi</Link> Ginabo.
            </div>
          </form>

          <div className="mt-5 flex items-center justify-center gap-1 text-sm text-white/40">
            <span>Sudah punya akun?</span>
            <Link href="/auth/login" className="font-semibold text-[#c084fc] hover:text-[#e879f9] transition">Masuk di sini</Link>
          </div>
          <div className="mt-2 text-center">
            <Link href="/" className="text-xs text-white/30 hover:text-white/50 transition">Kembali ke beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
