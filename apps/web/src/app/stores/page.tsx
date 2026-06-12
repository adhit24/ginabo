"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

type StoreType = "offline" | "online";

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  hours: string;
  type: StoreType;
  maps?: string;
}

interface OnlineStore {
  name: string;
  logo: string;
  url: string;
  label: string;
  bg: string;
  color: string;
}

const offlineStores: Store[] = [
  {
    id: 1,
    name: "Ginabo Store — Grand Indonesia",
    address: "Grand Indonesia East Mall Lt. 3, Jl. MH Thamrin No.1",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    phone: "021-2358-0001",
    hours: "Senin–Minggu, 10.00–22.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 2,
    name: "Ginabo Store — Pondok Indah Mall",
    address: "Pondok Indah Mall 2 Lt. 2, Jl. Metro Pondok Indah",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    phone: "021-2358-0002",
    hours: "Senin–Minggu, 10.00–22.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 3,
    name: "Ginabo Store — Summarecon Mal Serpong",
    address: "Summarecon Mal Serpong Lt. 1, Jl. Boulevard Gading Serpong",
    city: "Tangerang",
    province: "Banten",
    phone: "021-2358-0003",
    hours: "Senin–Minggu, 10.00–21.30",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 4,
    name: "Ginabo Store — Pakuwon Mall",
    address: "Pakuwon Mall Lt. 2, Jl. Puncak Indah Lontar No.2",
    city: "Surabaya",
    province: "Jawa Timur",
    phone: "031-2358-0001",
    hours: "Senin–Minggu, 10.00–22.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 5,
    name: "Ginabo Store — Tunjungan Plaza",
    address: "Tunjungan Plaza 6 Lt. 3, Jl. Basuki Rahmat No.8",
    city: "Surabaya",
    province: "Jawa Timur",
    phone: "031-2358-0002",
    hours: "Senin–Minggu, 10.00–21.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 6,
    name: "Ginabo Store — Paris Van Java",
    address: "Paris Van Java Lt. 1, Jl. Sukajadi No.137–139",
    city: "Bandung",
    province: "Jawa Barat",
    phone: "022-2358-0001",
    hours: "Senin–Minggu, 10.00–22.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 7,
    name: "Ginabo Store — Hartono Mall",
    address: "Hartono Mall Yogyakarta Lt. 2, Ring Road Utara",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    phone: "0274-2358-001",
    hours: "Senin–Minggu, 10.00–21.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 8,
    name: "Ginabo Store — Mal Ratu Indah",
    address: "Mal Ratu Indah Lt. 2, Jl. Dr. Sam Ratulangi No.8",
    city: "Makassar",
    province: "Sulawesi Selatan",
    phone: "0411-2358-001",
    hours: "Senin–Minggu, 10.00–21.30",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 9,
    name: "Ginabo Store — Sun Plaza",
    address: "Sun Plaza Lt. 3, Jl. KH Zainul Arifin No.7",
    city: "Medan",
    province: "Sumatera Utara",
    phone: "061-2358-0001",
    hours: "Senin–Minggu, 10.00–22.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 10,
    name: "Ginabo Store — Palembang Icon",
    address: "Palembang Icon Lt. 2, Jl. Letkol Iskandar No.541A",
    city: "Palembang",
    province: "Sumatera Selatan",
    phone: "0711-2358-001",
    hours: "Senin–Minggu, 10.00–21.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 11,
    name: "Ginabo Store — Transmart Denpasar",
    address: "Transmart Denpasar Lt. 2, Jl. Sunset Road No.101",
    city: "Denpasar",
    province: "Bali",
    phone: "0361-2358-001",
    hours: "Senin–Minggu, 09.00–22.00",
    type: "offline",
    maps: "https://maps.google.com",
  },
  {
    id: 12,
    name: "Ginabo Store — Mall SKA",
    address: "Mall SKA Pekanbaru Lt. 1, Jl. Soekarno Hatta No.24",
    city: "Pekanbaru",
    province: "Riau",
    phone: "0761-2358-001",
    hours: "Senin–Minggu, 10.00–21.30",
    type: "offline",
    maps: "https://maps.google.com",
  },
];

const onlineStores: OnlineStore[] = [
  {
    name: "Tokopedia",
    logo: "/tokopedia-logo.png",
    url: "https://www.tokopedia.com/ginabo-store",
    label: "tokopedia.com/ginabo-store",
    bg: "#f0fcf4",
    color: "#03AC0E",
  },
  {
    name: "Shopee",
    logo: "/shopee-logo.svg",
    url: "https://shopee.co.id/ginabostore",
    label: "shopee.co.id/ginabostore",
    bg: "#fff4f2",
    color: "#EE4D2D",
  },
  {
    name: "TikTok Shop",
    logo: "/tiktok-shop-logo.svg",
    url: "https://tr.ee/T-0SX7b-OK",
    label: "@ginabo.official",
    bg: "#f5f5f5",
    color: "#010101",
  },
];

const ALL_PROVINCES = ["Semua Provinsi", ...Array.from(new Set(offlineStores.map(s => s.province))).sort()];

export default function StoresPage() {
  const [tab, setTab] = useState<"offline" | "online">("offline");
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("Semua Provinsi");

  const filtered = useMemo(() => {
    return offlineStores.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
      const matchProvince = province === "Semua Provinsi" || s.province === province;
      return matchSearch && matchProvince;
    });
  }, [search, province]);

  return (
    <main className="min-h-screen bg-[#FDFAFF]">

      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#f0e6f6] py-12 px-5">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-4">
            <Image src="/storeloc.png" alt="Store Locator" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#303030] mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Store Locator
          </h1>
          <p className="text-[15px] text-[#808080] max-w-xl mx-auto leading-relaxed">
            Temukan toko Ginabo terdekat — baik offline di mall favoritmu maupun official store di marketplace.
          </p>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#f0e6f6] shadow-sm">
        <div className="mx-auto max-w-5xl px-5 flex gap-0">
          {(["offline", "online"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-4 text-[14px] font-semibold transition-all border-b-2"
              style={{
                borderColor: tab === t ? "#78257C" : "transparent",
                color: tab === t ? "#78257C" : "#808080",
              }}
            >
              {t === "offline" ? "🏬  Toko Fisik" : "🛒  Toko Online"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10">

        {/* ── Offline Stores ── */}
        {tab === "offline" && (
          <>
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Cari nama toko atau kota..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-[8px] border border-[#e8dff0] bg-white text-[13px] text-[#303030] outline-none focus:border-[#78257C] transition"
                />
              </div>
              <select
                value={province}
                onChange={e => setProvince(e.target.value)}
                className="sm:w-52 px-3 py-2.5 rounded-[8px] border border-[#e8dff0] bg-white text-[13px] text-[#303030] outline-none focus:border-[#78257C] transition"
              >
                {ALL_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <p className="text-[12px] text-[#aaa] mb-5">
              Menampilkan <strong className="text-[#78257C]">{filtered.length}</strong> toko
              {province !== "Semua Provinsi" && ` di ${province}`}
            </p>

            {/* Store grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#ccc] text-5xl mb-4">🏬</p>
                <p className="text-[14px] text-[#aaa]">Tidak ada toko ditemukan. Coba kata kunci lain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(store => (
                  <div key={store.id}
                    className="bg-white rounded-[12px] border border-[#f0e6f6] p-5 flex flex-col gap-3 hover:border-[#c89bd4] hover:shadow-md transition-all">

                    {/* Province badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                        style={{ background: "#f5eeff", color: "#78257C" }}>
                        {store.province}
                      </span>
                    </div>

                    {/* Store name */}
                    <h3 className="text-[14px] font-bold text-[#303030] leading-snug">{store.name}</h3>

                    {/* Details */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start gap-2">
                        <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78257C" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p className="text-[12px] text-[#606060] leading-relaxed">{store.address}, {store.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78257C" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.7 3.38 2 2 0 0 1 3.68 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.76a16 16 0 0 0 8.33 8.33l1.22-1.22a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 17.92"/>
                        </svg>
                        <p className="text-[12px] text-[#606060]">{store.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78257C" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p className="text-[12px] text-[#606060]">{store.hours}</p>
                      </div>
                    </div>

                    {/* Maps button */}
                    {store.maps && (
                      <a href={store.maps} target="_blank" rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-semibold transition hover:opacity-80"
                        style={{ color: "#78257C" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                        </svg>
                        Lihat di Google Maps
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Online Stores ── */}
        {tab === "online" && (
          <div>
            <p className="text-[14px] text-[#808080] mb-8 text-center">
              Temukan produk Ginabo di berbagai platform belanja online terpercaya.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {onlineStores.map(store => (
                <a key={store.name} href={store.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white rounded-[12px] border border-[#f0e6f6] p-6 flex items-center gap-5 hover:border-[#c89bd4] hover:shadow-md transition-all group">
                  <div className="w-16 h-14 rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden p-2"
                    style={{ background: store.bg }}>
                    <img src={store.logo} alt={store.name}
                      className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[#303030] group-hover:text-[#78257C] transition">{store.name}</p>
                    <p className="text-[12px] text-[#aaa] mt-0.5 truncate">{store.label}</p>
                  </div>
                  <svg className="flex-shrink-0 text-[#ccc] group-hover:text-[#78257C] transition" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              ))}
            </div>

            <div className="mt-10 bg-white rounded-[12px] border border-[#f0e6f6] p-6 text-center">
              <p className="text-[13px] text-[#808080] mb-2">Pastikan kamu berbelanja di toko resmi Ginabo</p>
              <p className="text-[12px] text-[#bbb]">Cari label <strong className="text-[#78257C]">"Official Store"</strong> atau <strong className="text-[#78257C]">"Star Seller"</strong> untuk keamanan transaksi.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── CTA Banner ── */}
      <section className="border-t border-[#f0e6f6] py-12 px-5" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #fff 100%)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest mb-2" style={{ color: "#CF99B4" }}>Tidak Menemukan Toko?</p>
          <h2 className="text-[22px] font-bold text-[#303030] mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Hubungi Kami
          </h2>
          <p className="text-[13px] text-[#808080] mb-6 leading-relaxed">
            Kami terus membuka gerai baru. Hubungi tim kami untuk informasi toko terdekat di kotamu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] text-[13px] font-bold text-white transition hover:opacity-90"
              style={{ background: "#25D366" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.997 2C6.477 2 2 6.478 2 12c0 1.88.516 3.637 1.41 5.142L2 22l4.978-1.388A9.945 9.945 0 0 0 12 22c5.522 0 10-4.478 10-10S17.522 2 11.997 2zm.003 18a7.965 7.965 0 0 1-4.075-1.114l-.292-.173-3.03.845.852-3.042-.19-.305A7.965 7.965 0 0 1 4 12C4 7.582 7.582 4 12 4s8 4.582 8 8-3.582 8-8 8z"/>
              </svg>
              Chat WhatsApp
            </a>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] text-[13px] font-bold transition hover:opacity-80"
              style={{ background: "#f5eeff", color: "#78257C" }}>
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
