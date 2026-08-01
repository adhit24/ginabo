"use client";

import Link from "next/link";

const MODULES = [
  {
    href: "/admin/executive",
    icon: "👑",
    title: "CEO Dashboard",
    desc: "Revenue, profit, dan proyeksi bisnis",
    color: "border-fuchsia-500/40 hover:border-fuchsia-500/70",
    badge: null,
  },
  {
    href: "/admin/intelligence",
    icon: "🧠",
    title: "Customer Intelligence",
    desc: "Segmentasi, LTV, dan churn prediction",
    color: "border-violet-500/40 hover:border-violet-500/70",
    badge: "198 at risk",
  },
  {
    href: "/admin/logistics",
    icon: "🚚",
    title: "Logistics Center",
    desc: "Pipeline order dan performa kurir",
    color: "border-cyan-500/40 hover:border-cyan-500/70",
    badge: "6 terlambat",
  },
  {
    href: "/admin/inventory",
    icon: "📦",
    title: "Inventory Intelligence",
    desc: "Stok kritikal dan rekomendasi restock",
    color: "border-amber-500/40 hover:border-amber-500/70",
    badge: "5 kritikal",
  },
  {
    href: "/admin/returns/intelligence",
    icon: "🔍",
    title: "Return Intelligence",
    desc: "Analitik retur dan deteksi fraud",
    color: "border-rose-500/40 hover:border-rose-500/70",
    badge: "3 fraud",
  },
  {
    href: "/admin/marketing",
    icon: "📣",
    title: "Marketing Intelligence",
    desc: "ROAS, CAC, dan performa channel",
    color: "border-blue-500/40 hover:border-blue-500/70",
    badge: null,
  },
  {
    href: "/admin/skincare",
    icon: "✨",
    title: "Skincare Intelligence",
    desc: "Analitik unik tipe kulit pelanggan",
    color: "border-emerald-500/40 hover:border-emerald-500/70",
    badge: null,
  },
  {
    href: "/admin/alerts",
    icon: "🔔",
    title: "Alert Center",
    desc: "Semua peringatan sistem terpusat",
    color: "border-rose-500/50 hover:border-rose-500/80",
    badge: "7 belum dibaca",
  },
];

export function BOSModuleNav() {
  return (
    <div className="border-b px-4 pt-4 pb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/20">
        Business Operating System — Modul
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`group flex shrink-0 flex-col gap-1 rounded-xl border bg-white/[0.03] p-3 transition-all hover:bg-white/[0.06] ${m.color}`}
            style={{ minWidth: "140px", maxWidth: "160px" }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-lg">{m.icon}</span>
              {m.badge && (
                <span className="rounded-full bg-rose-500/30 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 truncate">
                  {m.badge}
                </span>
              )}
            </div>
            <p className="text-[12px] font-bold text-white leading-tight">{m.title}</p>
            <p className="text-[10px] text-white/30 leading-snug">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
