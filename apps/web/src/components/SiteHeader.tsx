"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CartMini } from "@/components/cart/CartMini";

const EASE = [0.25, 1, 0.5, 1] as const;

const announcements = [
  { text: "✨ Gratis ongkir untuk pembelian di atas Rp 200.000", cta: "Belanja", href: "/shop" },
  { text: "🎁 Member baru dapat 100 poin selamat datang!", cta: "Daftar", href: "/auth/signup" },
  { text: "💜 Konsultasi kulit gratis bersama skin expert kami", cta: "Booking", href: "/booking" },
];

const navItems = [
  { href: "/",         label: "Home" },
  { href: "/shop",     label: "Produk" },
  { href: "/campaign", label: "Campaign" },
  { href: "/booking",  label: "Konsultasi" },
  { href: "/contact",  label: "Kontak" },
];

export function SiteHeader() {
  const pathname                        = usePathname();
  const [annIdx, setAnnIdx]             = useState(0);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [userOpen, setUserOpen]         = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [user, setUser]                 = useState<{ name: string } | null>(null);
  const timerRef                        = useRef<ReturnType<typeof setInterval> | null>(null);
  const userMenuRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setAnnIdx(i => (i + 1) % announcements.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ginabo_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    localStorage.removeItem("ginabo_user");
    setUser(null);
    setUserOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const ann = announcements[annIdx];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-400 ${
      scrolled ? "shadow-[0_2px_24px_rgba(120,37,124,0.10)]" : ""
    }`}>

      {/* ── Announcement Bar ── */}
      <div className="py-2 overflow-hidden bg-gradient-to-r from-[#3b0764] via-[#78257C] to-[#a855f7]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={annIdx}
              className="text-[11px] font-medium text-white/90 md:text-xs line-clamp-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {ann.text}
            </motion.span>
          </AnimatePresence>
          <Link
            href={ann.href}
            className="shrink-0 rounded-full border border-white/40 bg-white/10 px-3 py-0.5 text-[11px] font-semibold text-white transition hover:bg-white/25"
          >
            {ann.cta} →
          </Link>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className={`transition-all duration-400 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl"
          : "bg-[#fffafa]"
      }`}>

        {/* ── Mobile logo row (above navbar) ── */}
        <div className="flex items-center justify-center py-2 md:hidden border-b border-[#f0d8eb]/50">
          <Link href="/">
            <div style={{ width: 108, height: 26, overflow: "hidden", position: "relative" }}>
              <Image
                src="/logo.png"
                alt="Ginabo"
                width={400}
                height={160}
                style={{
                  position: "absolute",
                  top: "-42%",
                  left: "-2%",
                  width: "104%",
                  height: "auto",
                  filter: "invert(29%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(80%)",
                }}
              />
            </div>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 md:px-8" style={{ height: 68 }}>

          {/* ── Hamburger (mobile) ── */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-xl md:hidden"
            aria-label="Menu"
          >
            <span className="block h-[2px] w-[18px] rounded-full bg-[#78257C] transition-all" />
            <span className="block h-[2px] w-[18px] rounded-full bg-[#78257C] transition-all" />
            <span className="block h-[2px] w-[12px] self-start rounded-full bg-[#78257C] transition-all" />
          </button>

          {/* ── Logo (desktop only) ── */}
          <Link href="/" className="shrink-0 hidden md:block">
            <div style={{ width: 108, height: 26, overflow: "hidden", position: "relative" }}>
              <Image
                src="/logo.png"
                alt="Ginabo"
                width={400}
                height={160}
                style={{
                  position: "absolute",
                  top: "-42%",
                  left: "-2%",
                  width: "104%",
                  height: "auto",
                  filter: "invert(29%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(80%)",
                }}
              />
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {/* Diamond logo — kiri sebelum HOME, diberi separator */}
            <Link href="/" className="shrink-0 mr-6">
              <Image
                src="/logo_diamond.png"
                alt="Ginabo Diamond"
                width={128}
                height={52}
                className="object-contain transition hover:scale-105"
                style={{ filter: "drop-shadow(0 2px 8px rgba(120,37,124,0.22))" }}
              />
            </Link>
            <div className="mr-4 h-7 w-px shrink-0 bg-[#e8d5f0]" />
            {navItems.map(item => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-[14px] font-semibold transition-all duration-200 ${
                    active
                      ? "text-white"
                      : "text-[#5a3a7e] hover:text-[#78257C] hover:bg-[#f5eafc]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#c026d3] to-[#e879f9]"
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">

            {/* Shop CTA — desktop only */}
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#c026d3] to-[#e879f9] px-5 py-2 text-[13px] font-bold text-white shadow-sm transition hover:opacity-90 hover:shadow-md hover:-translate-y-0.5"
            >
              Belanja
            </Link>

            {/* Account — desktop only */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setUserOpen(v => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition hover:scale-105 ${
                  userOpen ? "border-[#78257C]" : "border-[#f0d8eb]"
                } bg-[#FBF0F8]`}
                aria-label="Akun"
              >
                {user ? (
                  <span className="text-[13px] font-bold text-[#78257C]">{user.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <svg className="h-4 w-4 text-[#78257C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-[#f0d8eb] bg-white shadow-xl"
                    initial={{ opacity: 0, scale: 0.94, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -8 }}
                    transition={{ duration: 0.18, ease: EASE }}
                  >
                    {user ? (
                      <>
                        <div className="border-b border-[#f0d8eb] px-4 py-3">
                          <p className="text-xs text-[#999]">Masuk sebagai</p>
                          <p className="text-sm font-bold text-[#78257C]">{user.name}</p>
                        </div>
                        <div className="p-2">
                          <Link href="/member" onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#333] hover:bg-[#FBF0F8]">
                            Dashboard Member
                          </Link>
                          <button onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
                            Keluar
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-2">
                        <Link href="/auth/login" onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#333] hover:bg-[#FBF0F8]">
                          Masuk
                        </Link>
                        <Link href="/auth/signup" onClick={() => setUserOpen(false)}
                          className="mt-1 flex items-center justify-center gap-2 rounded-xl badge-bg px-3 py-2.5 text-sm font-bold text-white">
                          Daftar Gratis →
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <CartMini />
          </div>
        </div>

        {/* ── Mobile quick-nav pill strip ── */}
        <nav className="flex gap-1.5 overflow-x-auto border-t border-[#f0d8eb]/60 px-4 py-2 md:hidden scrollbar-none">
          {navItems.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
                  active ? "badge-bg text-white shadow-sm" : "text-[#78257C] hover:bg-[#f5eafc]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Mobile Drawer Backdrop ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            key="drawer"
            className="fixed left-0 top-0 z-[60] flex h-full w-72 flex-col bg-white shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[#f0d8eb] px-5 py-4">
              <div style={{ width: 108, height: 26, overflow: "hidden", position: "relative" }}>
                <Image
                  src="/logo.png"
                  alt="Ginabo"
                  width={400}
                  height={160}
                  style={{
                    position: "absolute",
                    top: "-42%",
                    left: "-2%",
                    width: "104%",
                    height: "auto",
                    filter: "invert(29%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(80%)",
                  }}
                />
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBF0F8] text-[#78257C] transition hover:bg-[#f0d8eb]"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.05, duration: 0.26, ease: EASE }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition ${
                      isActive(item.href)
                        ? "badge-bg text-white shadow-sm"
                        : "text-[#5a3a7e] hover:bg-[#f5eafc]"
                    }`}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="ml-auto text-white/70">→</span>
                    )}
                  </Link>
                </motion.div>
              ))}

              <div className="my-3 border-t border-[#f0d8eb]" />

              {user ? (
                <>
                  <div className="mb-2 flex items-center gap-3 rounded-2xl bg-[#FBF0F8] px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full badge-bg text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] text-[#999]">Masuk sebagai</p>
                      <p className="text-sm font-bold text-[#78257C]">{user.name}</p>
                    </div>
                  </div>
                  <Link href="/member" onClick={() => setDrawerOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-[#665dac] hover:bg-[#FBF0F8]">
                    Dashboard Member
                  </Link>
                  <button onClick={() => { handleLogout(); setDrawerOpen(false); }}
                    className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50">
                    Keluar
                  </button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setDrawerOpen(false)}
                  className="mt-1 rounded-2xl badge-bg px-4 py-3 text-center text-sm font-bold text-white shadow-sm">
                  Masuk / Daftar Gratis
                </Link>
              )}
            </nav>

            {/* Drawer footer */}
            <div className="border-t border-[#f0d8eb] px-5 py-4">
              <p className="text-[11px] text-[#bbb] text-center">© 2025 Ginabo. All rights reserved.</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
