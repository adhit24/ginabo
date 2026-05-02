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
  { href: "/",         label: "Home",         icon: "https://www.figma.com/api/mcp/asset/b55152af-a3e2-4f5d-bb7d-8904895dc1d6" },
  { href: "/shop",     label: "Products",     icon: "https://www.figma.com/api/mcp/asset/d969c946-5978-437e-8eb0-d3a0f9356a68" },
  { href: "/campaign", label: "Campaign",     icon: null },
  { href: "/booking",  label: "Consultation", icon: "https://www.figma.com/api/mcp/asset/5c04d404-9118-4b70-9e43-be97700c07fa" },
  { href: "/contact",  label: "Contact",      icon: "https://www.figma.com/api/mcp/asset/d45af86e-f343-4fa4-a623-48128a7d505f" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [annIdx, setAnnIdx]         = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userOpen, setUserOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [user, setUser]             = useState<{ name: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setAnnIdx(i => (i + 1) % announcements.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ginabo_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const ann = announcements[annIdx];

  function handleLogout() {
    localStorage.removeItem("ginabo_user");
    setUser(null);
    setUserOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className={`sticky top-0 z-40 bg-[#fffafa] transition-all duration-300 ${scrolled ? "nav-scrolled" : ""}`}>

      {/* ── Mobile Drawer Backdrop ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer"
            className="fixed left-0 top-0 z-50 h-full w-72 bg-[#fffafa] shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-[#f0d8eb] px-5 py-4">
              <Image src="/logo.png" alt="Ginabo" width={130} height={52} className="w-auto object-contain" style={{ height: "48px", filter: "invert(29%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(80%)" }} />
              <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-1.5 text-[#78257C]">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-3 py-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.28, ease: EASE }}
                >
                  <Link href={item.href} onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${isActive(item.href) ? "badge-bg text-white" : "text-[#78257C] hover:bg-[#FBF0F8]"}`}>
                    {item.icon && <img src={item.icon} alt="" className="h-6 w-6 flex-shrink-0 object-contain" />}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="my-2 border-t border-[#f0d8eb]" />
              {user ? (
                <>
                  <Link href="/member" onClick={() => setDrawerOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-[#665dac] hover:bg-[#FBF0F8]">
                    Dashboard Member
                  </Link>
                  <button onClick={() => { handleLogout(); setDrawerOpen(false); }} className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50">
                    Keluar
                  </button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setDrawerOpen(false)}
                  className="mt-2 rounded-xl badge-bg px-4 py-3 text-center text-sm font-semibold text-white">
                  Masuk / Daftar
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Announcement Bar ── */}
      <div className="badge-bg py-1.5 md:py-2 overflow-hidden">
        <div className="mx-auto flex max-w-8xl items-center justify-center gap-2 px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={annIdx}
              className="line-clamp-1 text-[12px] font-medium text-white md:text-xs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {ann.text}
            </motion.span>
          </AnimatePresence>
          <Link href={ann.href}
            className="shrink-0 rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20">
            {ann.cta} →
          </Link>
        </div>
      </div>

      {/* ── Main Header Row ── */}
      <div className="mx-auto flex w-full max-w-8xl items-center justify-between px-5 py-3 md:px-8 md:py-3" style={{ minHeight: 72 }}>

        {/* Hamburger (mobile only) */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl md:hidden hover:bg-[#FBF0F8]"
          aria-label="Menu"
        >
          <span className="block h-[1.5px] w-5 bg-[#78257C]" />
          <span className="block h-[1.5px] w-5 bg-[#78257C]" />
          <span className="block h-[1.5px] w-4 bg-[#78257C]" />
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:mr-8">
          <div style={{ width: 110, height: 28, overflow: "hidden", position: "relative" }}>
            <Image src="/logo.png" alt="Ginabo" width={400} height={160}
              style={{ position: "absolute", top: "-42%", left: "-2%", width: "104%", height: "auto", filter: "invert(29%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(80%)" }} />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex lg:gap-10">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`nav-link flex items-center gap-2 rounded-[10px] px-4 py-2 font-semibold leading-none transition ${
                isActive(item.href)
                  ? "badge-bg text-white text-xl"
                  : "text-[#78257c] text-xl hover:text-[#665dac]"
              }`}
              style={isActive(item.href) ? { minWidth: 100 } : undefined}
            >
              {item.icon && (
                <img src={item.icon} alt="" className="h-6 w-6 flex-shrink-0 object-contain" />
              )}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Account + Cart */}
        <div className="flex items-center gap-2">
          {/* Account (desktop) */}
          <div className="relative hidden md:block">
            <button onClick={() => setUserOpen(v => !v)}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full badge-bg shadow transition hover:opacity-90">
              <img
                src="https://www.figma.com/api/mcp/asset/3f0f42c3-0498-4b04-8ed6-83fd4d3c3018"
                alt="Account"
                className="h-9 w-9 object-contain"
              />
            </button>
            <AnimatePresence>
              {userOpen && (
                <motion.div
                  className="absolute right-0 top-13 z-50 w-48 rounded-xl border border-[#f0d8eb] bg-white p-2 shadow-xl"
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.18, ease: EASE }}
                >
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-[#665dac]">{user.name}</div>
                      <Link href="/member" onClick={() => setUserOpen(false)} className="flex rounded-lg px-3 py-2 text-sm text-[#2a2a2a] hover:bg-[#FBF0F8]">Dashboard</Link>
                      <button onClick={handleLogout} className="flex w-full rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">Keluar</button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setUserOpen(false)} className="flex rounded-lg px-3 py-2 text-sm text-[#2a2a2a] hover:bg-[#FBF0F8]">Masuk</Link>
                      <Link href="/auth/signup" onClick={() => setUserOpen(false)} className="flex rounded-lg px-3 py-2 text-sm font-semibold text-[#78257C] hover:bg-[#FBF0F8]">Daftar Gratis</Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <CartMini />
        </div>
      </div>

      {/* ── Mobile quick-nav strip ── */}
      <nav className="flex gap-1 overflow-x-auto border-t border-[#f0d8eb] bg-[#FBF0F8] px-3 py-2 md:hidden">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${isActive(item.href) ? "badge-bg text-white" : "text-[#78257C] hover:bg-white"}`}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
