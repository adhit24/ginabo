"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

type AuthTab = "login" | "signup";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
}

const inputStyle = { background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" };
const inputCls = "min-h-11 w-full rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40";

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

const EMPTY_LOGIN = { email: "", password: "" };
const EMPTY_SIGNUP = { name: "", email: "", phone: "", password: "", confirm: "" };

export function AuthModal({ open, onClose, initialTab = "login" }: AuthModalProps) {
  const { login, signup, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setError("");
    } else {
      setLoginForm(EMPTY_LOGIN);
      setSignupForm(EMPTY_SIGNUP);
      setShowPassword(false);
      setShowConfirm(false);
      setError("");
      setLoading(false);
    }
  }, [open, initialTab]);

  function switchTab(next: AuthTab) {
    setTab(next);
    setError("");
  }

  function handleGoogle() {
    signInWithGoogle();
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(loginForm.email, loginForm.password);
    setLoading(false);
    if (result.ok) {
      onClose();
      router.push("/member");
    } else {
      setError(result.error ?? "Login gagal.");
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (signupForm.password !== signupForm.confirm) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    const result = await signup(signupForm.name, signupForm.email, signupForm.phone, signupForm.password);
    setLoading(false);
    if (result.ok) {
      onClose();
      router.push("/member");
    } else {
      setError(result.error ?? "Pendaftaran gagal.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl p-7"
        style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.35)" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-2xl leading-none text-white/40 transition hover:text-white/80"
          aria-label="Tutup"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-3xl font-extrabold tracking-widest text-white">GINABO</span>
          <span
            className="ml-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white align-middle"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}
          >
            MEMBER
          </span>
        </div>

        {/* Toggle: Masuk / Daftar */}
        <div className="mb-6 flex rounded-xl p-1" style={{ background: "rgba(255,255,255,0.06)" }}>
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
              tab === "login" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
            style={tab === "login" ? { background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 14px rgba(139,92,246,0.35)" } : {}}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => switchTab("signup")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
              tab === "signup" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
            style={tab === "signup" ? { background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 14px rgba(139,92,246,0.35)" } : {}}
          >
            Daftar
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg px-4 py-3 text-sm font-medium text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(139,92,246,0.2)" }}
        >
          <GoogleIcon />
          {tab === "login" ? "Continue with Google" : "Daftar dengan Google"}
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(139,92,246,0.2)" }} />
          <span className="text-xs text-white/30">{tab === "login" ? "atau masuk dengan email" : "atau daftar dengan email"}</span>
          <div className="h-px flex-1" style={{ background: "rgba(139,92,246,0.2)" }} />
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-white">Email</span>
              <input
                type="email"
                required
                placeholder="Contoh: nama@email.com"
                value={loginForm.email}
                onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                className={inputCls}
                style={inputStyle}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Password</span>
                <Link href="#" className="text-xs text-[#c084fc] hover:text-[#e879f9] transition">Lupa password?</Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                className={inputCls}
                style={inputStyle}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg py-3 text-sm font-extrabold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}
              onDoubleClick={() => router.push("/admin/login")}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            <div className="flex items-center justify-center gap-1 text-sm text-white/40">
              <span>Belum punya akun?</span>
              <button type="button" onClick={() => switchTab("signup")} className="font-semibold text-[#c084fc] hover:text-[#e879f9] transition">
                Daftar gratis
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-white">Nama</span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nadia Putri"
                  value={signupForm.name}
                  onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-white">Nomor WhatsApp</span>
                <input
                  type="tel"
                  placeholder="Contoh: 08xxxxxxxxxx"
                  value={signupForm.phone}
                  onChange={e => setSignupForm(f => ({ ...f, phone: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold text-white">Email</span>
              <input
                type="email"
                required
                placeholder="Contoh: nama@email.com"
                value={signupForm.email}
                onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                className={inputCls}
                style={inputStyle}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5 text-sm">
                <span className="font-semibold text-white">Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 karakter"
                    value={signupForm.password}
                    onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                    className={`${inputCls} pr-10`}
                    style={inputStyle}
                  />
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
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Ulangi"
                    value={signupForm.confirm}
                    onChange={e => setSignupForm(f => ({ ...f, confirm: e.target.value }))}
                    className={`${inputCls} pr-10`}
                    style={inputStyle}
                  />
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
              <Link href="/terms" className="text-[#c084fc] hover:text-[#e879f9] underline">Syarat & Ketentuan</Link>{" "}
              dan{" "}
              <Link href="/privacy" className="text-[#c084fc] hover:text-[#e879f9] underline">Kebijakan Privasi</Link> Ginabo.
            </div>

            <div className="flex items-center justify-center gap-1 text-sm text-white/40">
              <span>Sudah punya akun?</span>
              <button type="button" onClick={() => switchTab("login")} className="font-semibold text-[#c084fc] hover:text-[#e879f9] transition">
                Masuk di sini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
