"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { CartMini } from "@/components/cart/CartMini";

const announcements = [
  { text: "✨ Gratis ongkir untuk pembelian di atas Rp 200.000", cta: "Belanja", href: "/shop" },
  { text: "🎁 Member baru dapat 100 poin selamat datang!", cta: "Daftar", href: "/auth/signup" },
  { text: "💜 Konsultasi kulit gratis bersama skin expert kami", cta: "Booking", href: "/booking" },
];

const navItems = [
  { href: "/",        label: "Home"       },
  { href: "/shop",    label: "Produk"     },
  { href: "/about",   label: "About Us"   },
  { href: "/booking", label: "Konsultasi" },
  { href: "/contact", label: "Contact"    },
];

export function SiteHeader() {
  const [annIdx, setAnnIdx]       = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [user, setUser]           = useState<{ name: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setAnnIdx(i => (i + 1) % announcements.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
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

  return (
    <header className="sticky top-0 z-40 bg-white shadow-brand-sm">

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}
      <div className={`fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-brand-lg transition-transform duration-300 md:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
          <Image src="/logo.png" alt="Ginabo" width={130} height={52} className="w-auto object-contain" style={{height: "56px", filter: "invert(29%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(80%)"}} />
          <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-1.5 text-brand-500 hover:bg-brand-50">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-brand-800 hover:bg-brand-50">
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t border-brand-100" />
          {user ? (
            <>
              <Link href="/member" onClick={() => setDrawerOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50">
                Dashboard Member
              </Link>
              <button onClick={() => { handleLogout(); setDrawerOpen(false); }} className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50">
                Keluar
              </button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setDrawerOpen(false)}
              className="mt-2 rounded-xl bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800">
              Masuk / Daftar
            </Link>
          )}
        </nav>
      </div>

      {/* ── Announcement Bar ── */}
      <div className="bg-gradient-purple py-1.5 md:py-2">
        <div className="mx-auto flex max-w-8xl items-center justify-center gap-2 px-4 text-center">
          <span className="line-clamp-1 text-[12px] font-medium text-white md:text-xs">{ann.text}</span>
          <Link href={ann.href}
            className="shrink-0 rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-white/20">
            {ann.cta} →
          </Link>
        </div>
      </div>

      {/* ── Main Header Row ── */}
      <div className="mx-auto flex w-full max-w-8xl items-center justify-between px-4 py-2.5 md:px-8 md:py-4">

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl md:hidden hover:bg-brand-50"
          aria-label="Menu"
        >
          <span className="block h-[1.5px] w-5 bg-brand-800" />
          <span className="block h-[1.5px] w-5 bg-brand-800" />
          <span className="block h-[1.5px] w-4 bg-brand-800" />
        </button>

        {/* Logo — centered mobile, left desktop */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <div style={{width: "110px", height: "28px", overflow: "hidden", position: "relative"}}>
            <Image src="/logo.png" alt="Ginabo" width={400} height={160} style={{position: "absolute", top: "-42%", left: "-2%", width: "104%", height: "auto", filter: "invert(29%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(80%)"}} />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="text-sm font-medium text-brand-800 transition hover:text-brand-600 relative after:absolute after:-bottom-0.5 after:left-0 after:h-[1.5px] after:w-0 after:bg-brand-600 after:transition-all hover:after:w-full">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Account */}
          <div className="relative hidden md:block">
            <button onClick={() => setUserOpen(v => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold tracking-widest text-brand-700 transition hover:bg-brand-100">
              ACCOUNT
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="mt-px"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {userOpen && (
              <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-brand-100 bg-white p-2 shadow-brand">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-brand-500">{user.name}</div>
                    <Link href="/member" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-800 hover:bg-brand-50">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-800 hover:bg-brand-50">
                      Masuk
                    </Link>
                    <Link href="/auth/signup" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                      Daftar Gratis
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <CartMini />
        </div>
      </div>

      {/* ── Mobile quick-nav strip ── */}
      <nav className="flex gap-1 overflow-x-auto border-t border-brand-100 bg-brand-50 px-3 py-2 md:hidden">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className="shrink-0 rounded-full px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
