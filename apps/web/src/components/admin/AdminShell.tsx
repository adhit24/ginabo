"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { store } from "@/lib/adminStore";

type NavGroup = {
  label: string;
  items: { href: string; label: string; icon: string; badge?: string }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Ikhtisar",
    items: [
      { href: "/admin", label: "Command Center", icon: "⚡" },
      { href: "/admin/executive", label: "CEO Dashboard", icon: "👑" },
      { href: "/admin/alerts", label: "Alert Center", icon: "🔔", badge: "!" },
    ],
  },
  {
    label: "Pelanggan",
    items: [
      { href: "/admin/intelligence", label: "Customer Intelligence", icon: "🧠" },
      { href: "/admin/customers", label: "Daftar Pelanggan", icon: "👥" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/orders", label: "Order", icon: "📦" },
      { href: "/admin/logistics", label: "Logistics Center", icon: "🚚" },
      { href: "/admin/returns", label: "Retur", icon: "↩️" },
      { href: "/admin/returns/intelligence", label: "Return Intelligence", icon: "🔍" },
    ],
  },
  {
    label: "Inventori",
    items: [
      { href: "/admin/inventory", label: "Inventory Intelligence", icon: "📊" },
      { href: "/admin/products", label: "Produk", icon: "🧴" },
    ],
  },
  {
    label: "Marketing & Bisnis",
    items: [
      { href: "/admin/marketing", label: "Marketing Intelligence", icon: "📣" },
      { href: "/admin/skincare", label: "Skincare Intelligence", icon: "✨" },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { href: "/admin/bookings", label: "Booking", icon: "📅" },
      { href: "/admin/bundles", label: "Bundle", icon: "🎁" },
      { href: "/admin/flashsale", label: "Flash Sale", icon: "⚡" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  href,
  label,
  icon,
  badge,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all ${
        active
          ? "text-white shadow-sm"
          : "text-white/40 hover:bg-white/5 hover:text-white/70"
      }`}
      style={active ? { background: "linear-gradient(135deg,#8b5cf6,#e879f9)" } : {}}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge && !active && (
        <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const backdropRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!store.isAdminLoggedIn()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [router]);

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

  const sidebarWidth = collapsed ? "w-16" : "w-60";

  const sidebar = (
    <div
      className="flex h-full flex-col"
      style={{ background: "linear-gradient(180deg,#1a0a38,#0f0a1e)" }}
    >
      {/* Logo */}
      <div
        className={`flex h-14 items-center gap-2 border-b px-4 ${collapsed ? "justify-center" : ""}`}
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {!collapsed && (
          <>
            <span className="font-staatliches text-[20px] tracking-wider text-white">GINABO</span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
            >
              BOS
            </span>
          </>
        )}
        {collapsed && (
          <span className="text-lg font-bold text-white">G</span>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto rounded p-1 text-white/30 hover:text-white/60"
            aria-label="Collapse sidebar"
          >
            ◀
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center justify-center py-2 text-white/30 hover:text-white/60"
          aria-label="Expand sidebar"
        >
          ▶
        </button>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <p className="mb-1 mt-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/20">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              if (collapsed) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-center rounded-xl py-2.5 text-base transition-all ${
                      active
                        ? "text-white"
                        : "text-white/40 hover:bg-white/5 hover:text-white/70"
                    }`}
                    style={active ? { background: "linear-gradient(135deg,#8b5cf6,#e879f9)" } : {}}
                  >
                    {item.icon}
                  </Link>
                );
              }
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  active={active}
                  onClick={() => setMobileOpen(false)}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t p-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {collapsed ? (
          <button
            onClick={handleLogout}
            title="Keluar"
            className="flex w-full items-center justify-center rounded-xl py-2.5 text-base text-red-400/60 transition hover:bg-red-500/10"
          >
            🚪
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <span>🚪</span>
            <span>Keluar</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ background: "#0f0a1e" }}>
      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-shrink-0 border-r transition-all duration-200 lg:flex lg:flex-col ${sidebarWidth}`}
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
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
          <aside className="fixed inset-y-0 left-0 z-50 w-60 flex-shrink-0 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div
          className="flex h-14 items-center justify-between border-b px-4 lg:hidden"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <span className="font-staatliches text-[20px] tracking-wider text-white">GINABO</span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
            >
              BOS
            </span>
          </div>
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
