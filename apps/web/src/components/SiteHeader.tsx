"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { CartMini } from "@/components/cart/CartMini";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

const announcements = [
  "Gratis ongkir untuk pembelian di atas Rp 200.000 ✦ Belanja Sekarang",
  "Member baru dapat 100 poin selamat datang! ✦ Daftar Gratis",
  "Konsultasi kulit gratis bersama skin expert kami ✦ Booking",
];

const shopMenu = [
  { label: "Semua Produk",  href: "/shop" },
  { label: "New Arrival",   href: "/shop?col=new" },
  { label: "Best Sellers",  href: "/shop?col=bestseller" },
  { label: "Bundling",      href: "/shop?col=bundling" },
];

const infoMenu = [
  { label: "FAQ",                  href: "/faq" },
  { label: "Kontak Kami",          href: "/contact" },
  { label: "Jadi Reseller",        href: "/reseller" },
  { label: "Syarat & Ketentuan",   href: "/terms" },
  { label: "Kebijakan Privasi",    href: "/privacy" },
];

export function SiteHeader() {
  const pathname             = usePathname();
  const router               = useRouter();
  const { user, logout }     = useAuth();
  const [annIdx, setAnnIdx]  = useState(0);
  const [shopOpen, setShopOpen]   = useState(false);
  const [infoOpen, setInfoOpen]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"produk" | "info">("produk");
  const [userOpen, setUserOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  const shopRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
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
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) setInfoOpen(false);
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

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${scrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.08)]" : ""}`}>

      {/* ── Announcement Bar ── */}
      <div className="bg-[#78257C] py-2 overflow-hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
          <p className="text-[11px] font-medium text-white text-center transition-all duration-500 line-clamp-1">
            {announcements[annIdx]}
          </p>
        </div>
      </div>

      {/* ── Desktop Navbar ── */}
      <div className="hidden md:block border-b border-[#f0f0f0]">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6" style={{ height: 64 }}>

          {/* Left: PRODUK + INFO */}
          <div className="flex items-center gap-1">

            {/* PRODUK mega menu */}
            <div className="relative" ref={shopRef}>
              <button
                onClick={() => { setShopOpen(v => !v); setInfoOpen(false); }}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] font-semibold transition hover:text-[#78257C] ${shopOpen ? "text-[#78257C]" : "text-[#303030]"}`}
              >
                PRODUK
                <svg className={`w-3.5 h-3.5 transition-transform ${shopOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {shopOpen && (
                <div className="absolute left-0 top-full z-50 mt-0 w-48 rounded-b-[5px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#f0f0f0] border-t-0">
                  <ul className="flex flex-col py-2">
                    {shopMenu.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setShopOpen(false)}
                          className="block px-5 py-2.5 text-[13px] text-[#808080] transition hover:bg-[#fdf5ff] hover:text-[#78257C]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* INFO mega menu */}
            <div className="relative" ref={infoRef}>
              <button
                onClick={() => { setInfoOpen(v => !v); setShopOpen(false); }}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] font-semibold transition hover:text-[#78257C] ${infoOpen ? "text-[#78257C]" : "text-[#303030]"}`}
              >
                INFO
                <svg className={`w-3.5 h-3.5 transition-transform ${infoOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {infoOpen && (
                <div className="absolute left-0 top-full z-50 mt-0 w-52 rounded-b-[5px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#f0f0f0] border-t-0">
                  <ul className="flex flex-col py-2">
                    {infoMenu.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setInfoOpen(false)}
                          className="block px-5 py-2.5 text-[13px] text-[#808080] transition hover:bg-[#fdf5ff] hover:text-[#78257C]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo_diamond.png"
              alt="Ginabo"
              width={160}
              height={56}
              className="object-contain"
              style={{ height: 56, width: "auto" }}
              priority
            />
          </Link>

          {/* Right: Konsultasi + User + Cart */}
          <div className="flex items-center justify-end gap-1">

            <Link href="/booking" className="px-4 py-2 text-[13px] font-semibold text-[#303030] transition hover:text-[#78257C]">
              Konsultasi
            </Link>

            {/* User */}
            <div className="relative ml-2" ref={userRef}>
              <button
                onClick={() => setUserOpen(v => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E2E2] bg-white transition hover:border-[#78257C]"
                aria-label="Akun"
              >
                {user ? (
                  <span className="text-[13px] font-bold text-[#78257C]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg className="h-4 w-4 text-[#808080]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              {userOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-[5px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E2E2E2] overflow-hidden">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#f5f5f5]">
                        <p className="text-[13px] font-semibold text-[#303030] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#808080] truncate">{user.email}</p>
                      </div>
                      <ul className="flex flex-col py-1">
                        <li><Link href="/member" onClick={() => setUserOpen(false)} className="block px-4 py-2.5 text-[13px] text-[#808080] hover:bg-[#fdf5ff] hover:text-[#78257C]">Profil Saya</Link></li>
                        <li><Link href="/member" onClick={() => setUserOpen(false)} className="block px-4 py-2.5 text-[13px] text-[#808080] hover:bg-[#fdf5ff] hover:text-[#78257C]">Pesanan Saya</Link></li>
                      </ul>
                      <div className="border-t border-[#f5f5f5] py-1">
                        <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-[13px] text-red-500 hover:bg-red-50">Keluar</button>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 flex flex-col gap-2">
                      <Link href="/auth/login" onClick={() => setUserOpen(false)}
                        className="block w-full rounded-[5px] border border-[#78257C] py-2 text-center text-[13px] font-semibold text-[#78257C] transition hover:bg-[#fdf5ff]">
                        Masuk
                      </Link>
                      <Link href="/auth/signup" onClick={() => setUserOpen(false)}
                        className="block w-full rounded-[5px] py-2 text-center text-[13px] font-bold text-white transition hover:opacity-90"
                        style={{ background: "#78257C" }}>
                        Daftar Gratis
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <CartMini />
          </div>
        </div>
      </div>

      {/* ── Mobile Navbar ── */}
      <div className="flex md:hidden items-center justify-between px-4 border-b border-[#f0f0f0]" style={{ height: 52 }}>

        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col gap-[5px] p-2"
          aria-label="Menu"
        >
          <span className="block h-0.5 w-5 bg-[#303030] rounded-full" />
          <span className="block h-0.5 w-4 bg-[#303030] rounded-full" />
          <span className="block h-0.5 w-5 bg-[#303030] rounded-full" />
        </button>

        {/* Logo center */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <div style={{ width: 100, height: 25, overflow: "hidden", position: "relative" }}>
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

        {/* Right: user + cart */}
        <div className="flex items-center gap-1">
          <Link href={user ? "/member" : "/auth/login"} className="flex h-9 w-9 items-center justify-center">
            <svg className="h-5 w-5 text-[#808080]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          </Link>
          <CartMini />
        </div>
      </div>

      {/* ── Mobile Full-Screen Menu ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white md:hidden">

          {/* Tab bar header */}
          <div className="flex items-end justify-between px-5 pt-5 pb-0">
            <div className="flex gap-6">
              <button
                onClick={() => setDrawerTab("produk")}
                className={`pb-3 text-[14px] font-bold border-b-2 transition-colors ${
                  drawerTab === "produk"
                    ? "border-[#78257C] text-[#78257C]"
                    : "border-transparent text-[#aaaaaa]"
                }`}
              >
                PRODUK
              </button>
              <button
                onClick={() => setDrawerTab("info")}
                className={`pb-3 text-[14px] font-bold border-b-2 transition-colors ${
                  drawerTab === "info"
                    ? "border-[#78257C] text-[#78257C]"
                    : "border-transparent text-[#aaaaaa]"
                }`}
              >
                INFO
              </button>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5]"
              aria-label="Tutup menu"
            >
              <svg width="14" height="14" fill="none" stroke="#808080" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-px bg-[#f0f0f0]" />

          {/* Tab content */}
          <nav className="flex-1 overflow-y-auto">
            {drawerTab === "produk" && shopMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-5 py-4 text-[16px] font-medium text-[#303030] border-b border-[#f5f5f5] hover:text-[#78257C]"
              >
                {item.label}
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}

            {drawerTab === "info" && (
              <>
                {infoMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center px-5 py-4 text-[16px] font-medium text-[#303030] border-b border-[#f5f5f5] hover:text-[#78257C]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/booking"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center px-5 py-4 text-[16px] font-medium text-[#303030] border-b border-[#f5f5f5] hover:text-[#78257C]"
                >
                  Konsultasi
                </Link>
              </>
            )}
          </nav>

          {/* Bottom CTA */}
          <div className="border-t border-[#f0f0f0] p-4">
            {user ? (
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[13px] font-semibold text-[#303030]">{user.name}</p>
                  <p className="text-[11px] text-[#808080]">{user.email}</p>
                </div>
                <button
                  onClick={() => { handleLogout(); setDrawerOpen(false); }}
                  className="text-[12px] text-red-500"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full rounded-[5px] border border-[#78257C] py-3 text-center text-[13px] font-semibold text-[#78257C] hover:bg-[#fdf5ff]"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full rounded-[5px] py-3 text-center text-[13px] font-bold text-white hover:opacity-90"
                  style={{ background: "#78257C" }}
                >
                  Daftar Gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
