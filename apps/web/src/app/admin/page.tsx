"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { store } from "@/lib/adminStore";

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState({ products: 0, bundles: 0, flash: 0 });

  useEffect(() => {
    setCounts({
      products: store.getProducts().length,
      bundles:  store.getBundles().length,
      flash:    store.getFlash().length,
    });
  }, []);

  const quickLinks = [
    { href: "/admin/products",  label: "Kelola Produk",    desc: `${counts.products} produk aktif`  },
    { href: "/admin/bundles",   label: "Kelola Bundle",    desc: `${counts.bundles} bundle aktif`   },
    { href: "/admin/flashsale", label: "Atur Flash Sale",  desc: `${counts.flash} item di flash sale` },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40">Selamat datang di panel admin Ginabo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Produk" value={counts.products} sub="produk single" />
        <StatCard label="Bundle" value={counts.bundles}  sub="paket bundle"  />
        <StatCard label="Flash Sale" value={counts.flash} sub="item aktif"   />
      </div>

      {/* Quick Links */}
      <div className="grid gap-3">
        {quickLinks.map(q => (
          <Link key={q.href} href={q.href}
            className="flex items-center justify-between rounded-2xl p-5 transition hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div>
              <p className="font-semibold text-white text-sm">{q.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{q.desc}</p>
            </div>
            <span className="text-white/30 text-lg">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

