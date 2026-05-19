"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Gyroscope effect for mobile
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return;

    let baseGamma = 0;
    let baseBeta  = 0;
    let calibrated = false;

    function handleOrientation(e: DeviceOrientationEvent) {
      const gamma = e.gamma ?? 0; // left/right tilt (-90 to 90)
      const beta  = e.beta  ?? 0; // front/back tilt (-180 to 180)

      if (!calibrated) {
        baseGamma  = gamma;
        baseBeta   = beta;
        calibrated = true;
        return;
      }

      const dx = Math.max(-30, Math.min(30, gamma - baseGamma));
      const dy = Math.max(-30, Math.min(30, beta  - baseBeta));

      x.set(dx / 30 * 0.5);
      y.set(dy / 30 * 0.5);
    }

    // iOS 13+ requires permission
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function") {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then(res => {
          if (res === "granted") window.addEventListener("deviceorientation", handleOrientation);
        })
        .catch(() => {});
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [x, y]);

  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    // Mock: simulate Google OAuth flow with a fake Google account
    await new Promise(r => setTimeout(r, 1200));
    const mockGoogleName  = "Pengguna Google";
    const mockGoogleEmail = `google_${Math.random().toString(36).slice(2, 8)}@gmail.com`;
    const result = await signup(mockGoogleName, mockGoogleEmail, "google-oauth");
    setGoogleLoading(false);
    if (result.ok) router.push("/member");
  }

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
    <div className="flex min-h-screen items-center justify-center gap-10 bg-brand-50 px-6 py-12 lg:px-16">

      {/* Left card — floating 3D, hidden on mobile */}
      <motion.div
        ref={cardRef}
        className="hidden lg:block flex-shrink-0 overflow-hidden rounded-3xl cursor-pointer"
        style={{
          width: "clamp(320px, 36vw, 520px)",
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          transformPerspective: 800,
          boxShadow: "0 30px 60px rgba(120,37,124,0.25), 0 8px 20px rgba(120,37,124,0.15)",
        }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.03 }}
      >
        {/* Shine overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)" }}
        />
        <Image
          src="/auth_signup.png"
          alt="Ginabo signup"
          width={520}
          height={780}
          className="w-full h-auto"
          priority
        />
      </motion.div>

      {/* Right form panel */}
      <div className="flex w-full max-w-md flex-col justify-center">
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

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-200" />
            <span className="text-xs text-brand-400">atau daftar dengan</span>
            <div className="h-px flex-1 bg-brand-200" />
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-[#dadce0] bg-white px-4 py-3 text-sm font-semibold text-[#3c4043] shadow-sm transition hover:bg-[#f8f9fa] hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {googleLoading ? (
              <svg className="h-5 w-5 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}
          </button>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-brand-400 hover:text-brand-600">← Kembali ke beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
