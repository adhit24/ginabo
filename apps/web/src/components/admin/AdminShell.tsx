"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { store } from "@/lib/adminStore";

const navItems = [
  { href: "/admin",           label: "Dashboard"  },
  { href: "/admin/orders",    label: "Order"      },
  { href: "/admin/products",  label: "Produk"     },
  { href: "/admin/customers", label: "Pelanggan"  },
  { href: "/admin/bookings",  label: "Booking"    },
  { href: "/admin/returns",   label: "Retur"      },
  { href: "/admin/bundles",   label: "Bundle"     },
  { href: "/admin/flashsale", label: "Flash Sale" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
        active ? "text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"
      }`}
      style={active ? { background: "linear-gradient(135deg,#8b5cf6,#e879f9)" } : {}}
    >
      {label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const backdropRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!store.isAdminLoggedIn()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [router]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleLogout() {
    store.setAdminSession(false);
    router.replace("/admin/login");
  }

  if (!ready) return null;

  const sidebar = (
    <div className="flex h-full flex-col" style={{ background: "linear-gradient(180deg,#1a0a38,#0f0a1e)" }}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <span className="font-staatliches text-[22px] tracking-wider text-white">GINABO</span>
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
        >
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={isActive(pathname, item.href)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t p-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-red-400 transition hover:bg-red-500/10"
        >
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ background: "#0f0a1e" }}>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r lg:flex lg:flex-col" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {sidebar}
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <>
          <button
            ref={backdropRef}
            aria-label="Tutup navigasi"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-56 flex-shrink-0 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center justify-between border-b px-4 lg:hidden" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="font-staatliches text-[20px] tracking-wider text-white">GINABO</span>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Buka navigasi"
            className="rounded-lg p-2 text-white/60 hover:bg-white/10"
          >
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
