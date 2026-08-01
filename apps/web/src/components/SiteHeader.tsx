"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { CartMini } from "@/components/cart/CartMini";
import { CurrencySwitcher } from "@/components/currency/CurrencySwitcher";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

const EASE = [0.25, 1, 0.5, 1] as const;

const announcements = [
  "Gratis ongkir untuk pembelian di atas Rp 200.000 · Belanja Sekarang",
  "Member baru dapat 100 poin selamat datang! · Daftar Gratis",
  "Konsultasi kulit gratis bersama skin expert kami · Booking",
];

const infoMenu = [
  { label: "Blog",                 href: "/blog" },
  { label: "FAQ",                  href: "/faq" },
  { label: "Kontak Kami",          href: "/contact" },
  { label: "Jadi Reseller",        href: "/reseller" },
  { label: "Syarat & Ketentuan",   href: "/terms" },
  { label: "Kebijakan Privasi",    href: "/privacy" },
];

const programMenu = [
  { label: "21 Days", href: "/21days" },
];

export function SiteHeader() {
  const pathname             = usePathname();
  const router               = useRouter();
  const { user, logout }     = useAuth();
  const [annIdx, setAnnIdx]  = useState(0);
  const [infoOpen, setInfoOpen]   = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"menu" | "info">("menu");
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [mobileProgramOpen, setMobileProgramOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  const infoRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setAnnIdx(i => (i + 1) % announcements.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) setInfoOpen(false);
      if (programRef.current && !programRef.current.contains(e.target as Node)) setProgramOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    logout();
    setUserOpen(false);
    router.push("/");
  }

  const isHomeActive = pathname === "/";
  const isInfoActive = ["/faq", "/contact", "/reseller", "/terms", "/privacy"].some(p => pathname.startsWith(p));
  const isProgramActive = pathname === "/21days";
  const isKonsultasiActive = pathname === "/booking";

  return (
    <header className="sticky top-0 z-40" suppressHydrationWarning>

      {/* ── Announcement Bar ── */}
      <div className="bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#C084FC] py-2 overflow-hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
          <p className="text-[11px] font-medium text-white/90 text-center transition-all duration-500 line-clamp-1">
            {announcements[annIdx]}
          </p>
        </div>
      </div>

      {/* ── Desktop Navbar — Glassmorphic ── */}
      <div className={`hidden md:block transition-all duration-500 ${
        scrolled
          ? "bg-white/75 backdrop-blur-2xl shadow-[0_8px_32px_rgba(120,37,124,0.08)] border-b border-white/50"
          : "bg-white/60 backdrop-blur-xl border-b border-white/30"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6" style={{ height: 68 }}>

          {/* Left: Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/LOGO_GINABO.png"
              alt="Ginabo"
              width={130}
              height={44}
              className="object-contain"
              style={{ height: 44, width: "auto" }}
              priority
            />
          </Link>

          {/* Right: Nav Links + Konsultasi + User + Cart */}
          <div className="flex items-center gap-1">

            {/* Nav Links */}
            <nav className="flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>

              {/* HOME link */}
              <Link
                href="/"
                className={`relative px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full transition-all duration-300
                  ${isHomeActive ? "text-white" : "text-[#4A1A5E] hover:text-[#78257C]"}`}
              >
                {isHomeActive && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9333EA] via-[#7C3AED] to-[#6D28D9] shadow-[0_2px_8px_rgba(120,37,124,0.3)]" />
                )}
                <span className="relative">HOME</span>
              </Link>

              {/* INFO dropdown */}
              <div className="relative" ref={infoRef}>
                <button
                  onClick={() => { setInfoOpen(v => !v); }}
                  className={`relative flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full transition-all duration-300
                    ${infoOpen || isInfoActive ? "text-white" : "text-[#4A1A5E] hover:text-[#78257C]"}`}
                >
                  {(infoOpen || isInfoActive) && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9333EA] via-[#7C3AED] to-[#6D28D9] shadow-[0_2px_8px_rgba(120,37,124,0.3)] transition-opacity duration-300" />
                  )}
                  <span className="relative">INFO</span>
                  <svg className={`relative w-3.5 h-3.5 transition-transform duration-300 ease-out ${infoOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className={`absolute left-0 top-full z-50 pt-3 transition-all duration-300 ease-out ${
                  infoOpen
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 -translate-y-2 scale-[0.97] pointer-events-none"
                }`}>
                  <div className="w-56 rounded-2xl bg-white backdrop-blur-2xl shadow-[0_16px_48px_rgba(120,37,124,0.14)] border border-white/60 ring-1 ring-black/[0.03] overflow-hidden">
                    <ul className="flex flex-col py-2">
                      {infoMenu.map((item, idx) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setInfoOpen(false)}
                            className="group flex items-center gap-3 px-5 py-3 text-[13px] text-[#606060] transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F3E8FF]/60 hover:to-transparent hover:text-[#78257C]"
                            style={{ transitionDelay: infoOpen ? `${idx * 30}ms` : "0ms" }}
                          >
                            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-[#C084FC] to-[#A855F7] opacity-0 scale-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* PROGRAM dropdown */}
              <div className="relative" ref={programRef}>
                <button
                  onClick={() => { setProgramOpen(v => !v); }}
                  className={`relative flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full transition-all duration-300
                    ${programOpen || isProgramActive ? "text-white" : "text-[#4A1A5E] hover:text-[#78257C]"}`}
                >
                  {(programOpen || isProgramActive) && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9333EA] via-[#7C3AED] to-[#6D28D9] shadow-[0_2px_8px_rgba(120,37,124,0.3)] transition-opacity duration-300" />
                  )}
                  <span className="relative">PROGRAM</span>
                  <svg className={`relative w-3.5 h-3.5 transition-transform duration-300 ease-out ${programOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className={`absolute left-0 top-full z-50 pt-3 transition-all duration-300 ease-out ${
                  programOpen
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 -translate-y-2 scale-[0.97] pointer-events-none"
                }`}>
                  <div className="w-48 rounded-2xl bg-white backdrop-blur-2xl shadow-[0_16px_48px_rgba(120,37,124,0.14)] border border-white/60 ring-1 ring-black/[0.03] overflow-hidden">
                    <ul className="flex flex-col py-2">
                      {programMenu.map((item, idx) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setProgramOpen(false)}
                            className="group flex items-center gap-3 px-5 py-3 text-[13px] text-[#606060] transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F3E8FF]/60 hover:to-transparent hover:text-[#78257C]"
                            style={{ transitionDelay: programOpen ? `${idx * 30}ms` : "0ms" }}
                          >
                            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-[#C084FC] to-[#A855F7] opacity-0 scale-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Konsultasi */}
              <Link
                href="/booking"
                className={`relative px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full transition-all duration-300
                  ${isKonsultasiActive ? "text-white" : "text-[#4A1A5E] hover:text-[#78257C]"}`}
              >
                {isKonsultasiActive && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9333EA] via-[#7C3AED] to-[#6D28D9] shadow-[0_2px_8px_rgba(120,37,124,0.3)]" />
                )}
                <span className="relative">Konsultasi</span>
              </Link>

            </nav>

            <CurrencySwitcher />

            <div className="w-px h-5 bg-[#E9D5FF]/60 mx-2" />

            {/* User */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen(v => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                  userOpen
                    ? "bg-gradient-to-br from-[#A855F7] to-[#7C3AED] text-white shadow-[0_4px_16px_rgba(120,37,124,0.3)]"
                    : "border border-white/60 bg-white/50 backdrop-blur-sm hover:border-[#D8B4FE] hover:shadow-[0_2px_12px_rgba(120,37,124,0.1)]"
                }`}
                aria-label="Akun"
              >
                {user ? (
                  <span className={`text-[13px] font-bold transition-colors duration-300 ${userOpen ? "text-white" : "text-[#78257C]"}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg className={`h-4 w-4 transition-colors duration-300 ${userOpen ? "text-white" : "text-[#808080]"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <div className={`absolute right-0 top-full z-50 pt-3 transition-all duration-300 ease-out ${
                userOpen
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-2 scale-[0.97] pointer-events-none"
              }`}>
                <div className="w-60 rounded-2xl bg-white/80 backdrop-blur-2xl shadow-[0_16px_48px_rgba(120,37,124,0.14)] border border-white/60 ring-1 ring-black/[0.03] overflow-hidden">
                  {user ? (
                    <>
                      <div className="px-5 py-4 bg-gradient-to-r from-[#F3E8FF]/40 to-transparent border-b border-[#F3E8FF]/50">
                        <p className="text-[13px] font-semibold text-[#303030] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#808080] truncate mt-0.5">{user.email}</p>
                      </div>
                      <ul className="flex flex-col py-1">
                        <li>
                          <Link href="/member" onClick={() => setUserOpen(false)} className="group flex items-center gap-3 px-5 py-3 text-[13px] text-[#606060] transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F3E8FF]/60 hover:to-transparent hover:text-[#78257C]">
                            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-[#C084FC] to-[#A855F7] opacity-0 scale-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" />
                            Profil Saya
                          </Link>
                        </li>
                        <li>
                          <Link href="/member" onClick={() => setUserOpen(false)} className="group flex items-center gap-3 px-5 py-3 text-[13px] text-[#606060] transition-all duration-200 hover:bg-gradient-to-r hover:from-[#F3E8FF]/60 hover:to-transparent hover:text-[#78257C]">
                            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-[#C084FC] to-[#A855F7] opacity-0 scale-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100" />
                            Pesanan Saya
                          </Link>
                        </li>
                      </ul>
                      <div className="border-t border-[#F3E8FF]/50 py-1">
                        <button onClick={handleLogout} className="block w-full px-5 py-3 text-left text-[13px] text-red-400 hover:bg-red-50/40 transition-colors duration-200">Keluar</button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex flex-col gap-2.5">
                      <Link href="/auth/login" onClick={() => setUserOpen(false)}
                        className="block w-full rounded-xl border border-[#D8B4FE]/50 py-2.5 text-center text-[13px] font-semibold text-[#78257C] transition-all duration-200 hover:bg-[#F3E8FF]/40 hover:border-[#C084FC]/60">
                        Masuk
                      </Link>
                      <Link href="/auth/signup" onClick={() => setUserOpen(false)}
                        className="block w-full rounded-xl py-2.5 text-center text-[13px] font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#9333EA] to-[#7C3AED] hover:shadow-[0_6px_20px_rgba(120,37,124,0.35)]">
                        Daftar Gratis
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cart */}
            <CartMini />
          </div>
        </div>
      </div>

      {/* ── Mobile Navbar — Glassmorphic ── */}
      <div className={`flex md:hidden items-center justify-between px-4 transition-all duration-500 ${
        scrolled
          ? "bg-white/75 backdrop-blur-2xl shadow-[0_8px_32px_rgba(120,37,124,0.08)] border-b border-white/50"
          : "bg-white/60 backdrop-blur-xl border-b border-white/30"
      }`} style={{ height: 56 }}>

        {/* Hamburger — matches cart pill style */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-90 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #1e1b3a, #2d2556)",
            boxShadow: "0 4px 12px rgba(20,15,50,0.25)",
          }}
          aria-label="Menu"
        >
          <div className="flex flex-col gap-[4.5px]">
            <span className="block h-[1.5px] w-[16px] bg-white rounded-full" />
            <span className="block h-[1.5px] w-[12px] bg-white rounded-full" />
            <span className="block h-[1.5px] w-[16px] bg-white rounded-full" />
          </div>
        </button>

        {/* Logo — left-aligned (after hamburger) */}
        <Link href="/" className="absolute left-[4.5rem]">
          <Image
            src="/LOGO_GINABO.png"
            alt="Ginabo"
            width={100}
            height={34}
            className="object-contain"
            style={{ height: 34, width: "auto" }}
            priority
          />
        </Link>

        {/* Right: currency + user + cart */}
        <div className="flex items-center gap-1.5">
          <CurrencySwitcher />
          <Link href={user ? "/member" : "/auth/login"} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#F3E8FF]/40">
            <svg className="h-5 w-5 text-[#808080]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          </Link>
          <CartMini />
        </div>
      </div>

      {/* ── Mobile Full-Screen Menu — Glassmorphic ── */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col md:hidden transition-all duration-400 ${
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-400 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Panel */}
        <div className={`relative flex flex-col h-full backdrop-blur-2xl transition-transform duration-400 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`} style={{ maxWidth: "85vw", background: "linear-gradient(160deg, rgba(15,10,30,0.92) 0%, rgba(30,11,56,0.95) 50%, rgba(42,16,64,0.92) 100%)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <Image
              src="/LOGO_GINABO.png"
              alt="Ginabo"
              width={100}
              height={34}
              className="object-contain brightness-0 invert opacity-80"
              style={{ height: 30, width: "auto" }}
            />
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors duration-200 hover:bg-white/20"
              aria-label="Tutup menu"
            >
              <svg width="14" height="14" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-[#c084fc]/30 via-[#8b5cf6]/15 to-transparent" />

          {/* Navigation — same structure as desktop */}
          <nav className="flex-1 overflow-y-auto px-4 pt-5">
            <div
              className="rounded-[20px] p-5"
              style={{
                background: "linear-gradient(135deg, #1e1b3a 0%, #2d2556 100%)",
                border: "1px solid rgba(139,92,246,0.15)",
                boxShadow: "0 8px 32px rgba(20,15,50,0.25)",
              }}
            >
              <ul className="flex flex-col gap-1">
                {/* HOME */}
                <li>
                  <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    className={`block w-full text-left px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                      isHomeActive
                        ? "text-white shadow-md"
                        : "text-[#a5a0c8] hover:text-white hover:bg-white/10"
                    }`}
                    style={isHomeActive ? {
                      background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                      boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
                    } : {}}
                  >
                    HOME
                  </Link>
                </li>

                {/* INFO — expandable dropdown */}
                <li>
                  <button
                    onClick={() => setMobileInfoOpen(v => !v)}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                      mobileInfoOpen || isInfoActive
                        ? "text-white bg-white/10"
                        : "text-[#a5a0c8] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>INFO</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${mobileInfoOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <ul className={`overflow-hidden transition-all duration-300 ${mobileInfoOpen ? "max-h-[400px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    {infoMenu.map(item => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setDrawerOpen(false)}
                            className={`block w-full text-left pl-7 pr-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                              isActive
                                ? "text-[#c084fc]"
                                : "text-[#a5a0c8]/70 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>

                {/* PROGRAM — expandable dropdown */}
                <li>
                  <button
                    onClick={() => setMobileProgramOpen(v => !v)}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                      mobileProgramOpen || isProgramActive
                        ? "text-white bg-white/10"
                        : "text-[#a5a0c8] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>PROGRAM</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${mobileProgramOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <ul className={`overflow-hidden transition-all duration-300 ${mobileProgramOpen ? "max-h-[200px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    {programMenu.map(item => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setDrawerOpen(false)}
                            className={`block w-full text-left pl-7 pr-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                              isActive
                                ? "text-[#c084fc]"
                                : "text-[#a5a0c8]/70 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>

                {/* Konsultasi */}
                <li>
                  <Link
                    href="/booking"
                    onClick={() => setDrawerOpen(false)}
                    className={`block w-full text-left px-3.5 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200 ${
                      isKonsultasiActive
                        ? "text-white shadow-md"
                        : "text-[#a5a0c8] hover:text-white hover:bg-white/10"
                    }`}
                    style={isKonsultasiActive ? {
                      background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                      boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
                    } : {}}
                  >
                    Konsultasi
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Bottom CTA */}
          <div className="border-t border-white/[0.08] p-4" style={{ background: "rgba(15,10,30,0.5)" }}>
            {user ? (
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[13px] font-semibold text-white">{user.name}</p>
                  <p className="text-[11px] text-white/50">{user.email}</p>
                </div>
                <button
                  onClick={() => { handleLogout(); setDrawerOpen(false); }}
                  className="text-[12px] text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full rounded-lg border border-[#c084fc]/30 py-3 text-center text-[13px] font-semibold text-[#c084fc] transition-all duration-200 hover:bg-white/[0.06]"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full rounded-lg py-3 text-center text-[13px] font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#8b5cf6] to-[#e879f9] hover:shadow-[0_6px_20px_rgba(139,92,246,0.35)]"
                >
                  Daftar Gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
