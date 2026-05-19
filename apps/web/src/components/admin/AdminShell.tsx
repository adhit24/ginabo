"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { store } from "@/lib/adminStore";

const navItems = [
  { href: "/admin",            label: "Dashboard" },
  { href: "/admin/products",   label: "Produk"    },
  { href: "/admin/bundles",    label: "Bundle"    },
  { href: "/admin/flashsale",  label: "Flash Sale"},
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!store.isAdminLoggedIn()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [router]);

  function handleLogout() {
    store.setAdminSession(false);
    router.replace("/admin/login");
  }

  if (!ready) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ background: "#0f0a1e" }}>
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r" style={{ borderColor: "rgba(255,255,255,0.08)", background: "linear-gradient(180deg,#1a0a38,#0f0a1e)" }}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="font-staatliches text-[22px] tracking-wider text-white">GINABO</span>
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
                  active ? "text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"
                }`}
                style={active ? { background: "linear-gradient(135deg,#8b5cf6,#e879f9)" } : {}}
              >
                {item.label}
              </Link>
            );
          })}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

