"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useResellerTier } from "@/components/reseller/ResellerTierProvider";

function waLink() {
  const text = "Halo Ginabo, saya butuh bantuan sebagai partner.";
  return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
}

const kpis = [
  { label: "Omzet bulan ini", value: "Rp12.400.000", chipBg: "#EDF9F1", chipColor: "#2E9E63", chip: "+18% vs Juli", valueColor: "#241338" },
  { label: "Profit bersih", value: "Rp4.340.000", chipBg: "#F4EEFD", chipColor: "#7C3AED", chip: "Margin 35%", valueColor: "#7C3AED" },
  { label: "Poin terkumpul", value: "1.240", chipBg: "#FDF8EC", chipColor: "#B98A2E", chip: "260 poin lagi ke Premier", valueColor: "#241338" },
  { label: "Order aktif", value: "3", chipBg: "#F4F0FA", chipColor: "#6b5c80", chip: "1 menunggu pembayaran", valueColor: "#241338" },
];

const chart = [
  { m: "Mar", v: 6.2 },
  { m: "Apr", v: 7.4 },
  { m: "Mei", v: 8.1 },
  { m: "Jun", v: 9.6 },
  { m: "Jul", v: 10.5 },
  { m: "Agu", v: 12.4 },
];

const orders: { id: string; item: string; total: string; date: string; status: string; bg: string; color: string }[] = [
  { id: "GNB-24081", item: "Paket Growth Restock", total: "Rp4.200.000", date: "12 Agu 2026", status: "Dikirim", bg: "#EEF4FE", color: "#3B6FD4" },
  { id: "GNB-24072", item: "GlowAge Serum ×48", total: "Rp3.120.000", date: "6 Agu 2026", status: "Selesai", bg: "#EDF9F1", color: "#2E9E63" },
  { id: "GNB-24065", item: "Bundling Serum + Cream", total: "Rp2.850.000", date: "2 Agu 2026", status: "Menunggu bayar", bg: "#FDF4E7", color: "#B98A2E" },
  { id: "GNB-24051", item: "Hydra Moist Gel ×24", total: "Rp2.280.000", date: "24 Jul 2026", status: "Selesai", bg: "#EDF9F1", color: "#2E9E63" },
];

export default function ResellerDashboardPage() {
  const { user, isLoading } = useAuth();
  const { setTier } = useResellerTier();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/reseller/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center" style={{ background: "#FAF8FD" }}>
        <p className="text-[13px] font-medium text-[#8b7aa8]">Memuat dashboard partner...</p>
      </div>
    );
  }

  const firstName = user.name.split(" ")[0];
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-wrap items-stretch" style={{ background: "#FAF8FD" }}>
      <aside className="w-full max-w-full border-r px-4.5 py-6.5 md:max-w-[230px] md:flex-1" style={{ borderColor: "#F1ECF9", background: "#fff" }}>
        <div className="flex items-center gap-2.5 rounded-[13px] p-3" style={{ background: "#F7F3FE" }}>
          <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[15px] font-extrabold text-white" style={{ background: "linear-gradient(135deg,#7C3AED,#9333EA)" }}>
            {initial}
          </span>
          <span className="min-w-0">
            <b className="block truncate text-[13px] font-extrabold" style={{ color: "#241338" }}>{user.name}</b>
            <span className="text-[11px] font-semibold" style={{ color: "#7C3AED" }}>Growth Partner</span>
          </span>
        </div>

        <nav className="mt-5 flex flex-col gap-0.5">
          <span className="flex items-center gap-2.5 rounded-[11px] px-3.5 py-2.5 text-[13px] font-semibold text-white" style={{ background: "#7C3AED" }}>
            Ringkasan
          </span>
          <Link href="/reseller/catalog" className="rounded-[11px] px-3.5 py-2.5 text-[13px] font-semibold text-[#6b5c80] hover:bg-[#F7F3FE]">
            Katalog partner
          </Link>
          <span className="rounded-[11px] px-3.5 py-2.5 text-[13px] font-semibold text-[#6b5c80]">Order saya</span>
          <span className="rounded-[11px] px-3.5 py-2.5 text-[13px] font-semibold text-[#6b5c80]">Poin &amp; reward</span>
          <span className="rounded-[11px] px-3.5 py-2.5 text-[13px] font-semibold text-[#6b5c80]">Materi promosi</span>
          <Link href="/reseller/tier" className="rounded-[11px] px-3.5 py-2.5 text-[13px] font-semibold text-[#6b5c80] hover:bg-[#F7F3FE]">
            Tier &amp; benefit
          </Link>
        </nav>

        <div className="mt-6 rounded-2xl p-4" style={{ background: "linear-gradient(160deg,#2A1244,#4A1A5E)" }}>
          <b className="block text-[12.5px] font-extrabold text-white">Butuh bantuan?</b>
          <p className="mt-1.5 mb-3 text-[11.5px] leading-relaxed text-white/60">Account manager kamu siap membantu.</p>
          <a href={waLink()} target="_blank" rel="noreferrer" className="flex h-[34px] items-center justify-center rounded-lg text-[11.5px] font-bold text-white" style={{ background: "rgba(255,255,255,.14)" }}>
            Chat sekarang
          </a>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-6 py-7 md:flex-[1_1_520px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[25px] font-extrabold tracking-[-.015em]" style={{ color: "#241338" }}>Halo, {firstName}</h1>
            <p className="mt-1.5 text-[13px] text-[#7b6b90]">Ringkasan performa bisnismu bulan ini.</p>
          </div>
          <div className="flex gap-2">
            <span className="flex h-[38px] items-center gap-2 rounded-[11px] px-3.5 text-[12.5px] font-semibold text-[#6b5c80]" style={{ border: "1px solid #E7DFF5", background: "#fff" }}>
              Agustus 2026
            </span>
            <Link href="/reseller/catalog" className="flex h-[38px] items-center rounded-[11px] px-4 text-[12.5px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6D28D9,#9333EA)" }}>
              Buat order baru
            </Link>
          </div>
        </div>

        <div className="mt-5.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl p-5" style={{ border: "1px solid #F1ECF9", background: "#fff" }}>
              <span className="text-[11.5px] font-semibold text-[#8b7aa8]">{k.label}</span>
              <b className="mt-2 block text-[25px] font-extrabold" style={{ color: k.valueColor }}>{k.value}</b>
              <span className="mt-2 inline-block rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: k.chipBg, color: k.chipColor }}>{k.chip}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-stretch gap-4">
          <div className="min-w-0 flex-[2_1_380px] rounded-[18px] p-6" style={{ border: "1px solid #F1ECF9", background: "#fff" }}>
            <div className="flex items-baseline justify-between gap-3.5">
              <b className="text-[15px] font-extrabold" style={{ color: "#241338" }}>Penjualan 6 bulan terakhir</b>
              <span className="text-[11.5px] font-medium text-[#8b7aa8]">dalam juta rupiah</span>
            </div>
            <div className="mt-5.5 flex h-[190px] items-end gap-4">
              {chart.map((c) => (
                <div key={c.m} className="flex flex-1 flex-col items-center gap-2.5">
                  <span className="text-[11px] font-bold" style={{ color: "#7C3AED" }}>{c.v.toFixed(1)}</span>
                  <span className="w-full rounded-t-lg" style={{ background: "linear-gradient(180deg,#A855F7,#7C3AED)", height: `${Math.round((c.v / 13) * 150)}px` }} />
                  <span className="text-[11px] font-semibold text-[#9d8ab8]">{c.m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-[1_1_250px] rounded-[18px] p-6" style={{ background: "linear-gradient(160deg,#7C3AED,#6D28D9)" }}>
            <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-white/70">Tier kamu</span>
            <b className="mt-2.5 block text-[22px] font-extrabold text-white">Growth Partner</b>
            <p className="mt-2.5 mb-4.5 text-[12.5px] leading-relaxed text-white/70">
              Kumpulkan 260 poin lagi untuk naik ke Premier Partner dan margin 40%.
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <span className="block h-full w-[83%] bg-white" />
            </div>
            <div className="mt-2.5 flex justify-between text-[11px] font-semibold text-white/75">
              <span>1.240 poin</span>
              <span>1.500 poin</span>
            </div>
            <Link
              href="/reseller/tier"
              onClick={() => setTier("premier")}
              className="mt-5 block rounded-[11px] bg-white py-2.5 text-center text-[12.5px] font-bold"
              style={{ color: "#6D28D9" }}
            >
              Lihat benefit Premier
            </Link>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[18px]" style={{ border: "1px solid #F1ECF9", background: "#fff" }}>
          <div className="flex items-center justify-between gap-3.5 px-6 py-5">
            <b className="text-[15px] font-extrabold" style={{ color: "#241338" }}>Order terakhir</b>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1fr_1.4fr_1fr_1fr_1fr] text-[11px] font-bold uppercase tracking-[.06em] text-[#8b7aa8]" style={{ background: "#F9F6FE" }}>
                <span className="px-6 py-3">No. order</span>
                <span className="px-3.5 py-3">Produk</span>
                <span className="px-3.5 py-3">Total</span>
                <span className="px-3.5 py-3">Tanggal</span>
                <span className="px-3.5 py-3">Status</span>
              </div>
              {orders.map((o) => (
                <div key={o.id} className="grid grid-cols-[1fr_1.4fr_1fr_1fr_1fr] items-center border-t" style={{ borderColor: "#F4F0FA" }}>
                  <span className="px-6 py-4 text-[12.5px] font-semibold" style={{ color: "#241338" }}>{o.id}</span>
                  <span className="px-3.5 py-4 text-[12.5px] text-[#6b5c80]">{o.item}</span>
                  <span className="px-3.5 py-4 text-[12.5px] font-bold" style={{ color: "#241338" }}>{o.total}</span>
                  <span className="px-3.5 py-4 text-[12.5px] text-[#8b7aa8]">{o.date}</span>
                  <span className="px-3.5 py-4">
                    <span className="rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: o.bg, color: o.color }}>{o.status}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
