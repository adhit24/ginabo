"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const tiers = ["Regular", "Silver", "Gold", "Platinum"];

const tierProgress: Record<string, number> = {
  Regular: 0, Silver: 1, Gold: 2, Platinum: 3,
};

const tierNext: Record<string, string> = {
  Regular:  "Sedikit lagi kamu naik ke level Silver. Lakukan pembelanjaan Rp 500.000 untuk naik level. Semangat!",
  Silver:   "Sedikit lagi kamu naik ke level Gold. Lakukan pembelanjaan Rp 1.500.000 untuk naik level. Semangat!",
  Gold:     "Sedikit lagi kamu naik ke level Platinum. Lakukan pembelanjaan Rp 3.000.000 untuk naik level. Semangat!",
  Platinum: "Selamat! Kamu sudah berada di tier tertinggi Ginabo.",
};

function IconProfile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconOrders() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}
function IconAddress() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function IconReviews() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconWishlist() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconPoints() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
function IconReferral() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const menuItems = [
  { id: "profile",   label: "Pengaturan Akun",   icon: <IconProfile /> },
  { id: "orders",    label: "Pesanan Saya",       icon: <IconOrders /> },
  { id: "address",   label: "Alamat Pengiriman",  icon: <IconAddress /> },
  { id: "reviews",   label: "Ulasan",             icon: <IconReviews /> },
  { id: "wishlist",  label: "Wishlist",           icon: <IconWishlist /> },
  { id: "points",    label: "Riwayat Poin",       icon: <IconPoints /> },
  { id: "referral",  label: "Kode Referral",      icon: <IconReferral /> },
];

export default function MemberPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({ name: "", phone: "", email: "", dob_d: "", dob_m: "", dob_y: "", gender: "" });

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
    if (user) setForm(f => ({ ...f, name: user.name, email: user.email }));
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  function handleLogout() { logout(); router.push("/"); }

  const initials = user.name.slice(0, 2).toUpperCase();
  const tierIdx = tierProgress[user.tier] ?? 0;

  const inputCls = "w-full rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40";
  const inputStyle = { background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" };
  const labelCls = "mb-1.5 block text-xs font-semibold text-white/70";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0f0a1e 0%, #1a0930 30%, #2a1040 60%, #1e0a38 100%)" }}>

      {/* ── Breadcrumb ── */}
      <div className="px-4 py-3 md:px-8" style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="mx-auto flex max-w-6xl items-center gap-2 text-xs text-white/40">
          <Link href="/" className="hover:text-[#c084fc] transition">Home</Link>
          <span>›</span>
          <span className="font-semibold text-white/70">Profil</span>
        </div>
      </div>

      {/* ── Profile Banner ── */}
      <div style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Left: avatar + info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
                  {initials}
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{user.name}</div>
                <div className="text-xs text-white/40">Bergabung sejak {user.joinedAt}</div>
                <span className="mt-1 inline-block rounded-md px-3 py-0.5 text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)" }}>
                  Level {tierIdx + 1} · {user.tier}
                </span>
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex items-center rounded-xl" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)" }}>
              {[
                { label: "Total Pesanan", val: "0 Pesanan" },
                { label: "Total Ulasan",  val: "0 Ulasan"  },
                { label: "Total Poin",    val: `${user.points} Point` },
              ].map((s, i) => (
                <div key={s.label} className="flex flex-col items-center px-6 py-3" style={i > 0 ? { borderLeft: "1px solid rgba(139,92,246,0.1)" } : {}}>
                  <span className="text-[11px] text-white/40">{s.label}</span>
                  <span className="mt-0.5 text-sm font-bold text-white">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Membership Level Bar ── */}
      <div style={{ borderBottom: "1px solid rgba(139,92,246,0.1)" }}>
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#c084fc]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 13.125 10.875h-2.25A3.375 3.375 0 0 0 7.5 14.25v4.5m6-6V6.75m0 0a2.25 2.25 0 1 0-4.5 0m4.5 0a2.25 2.25 0 1 1-4.5 0" /></svg> Membership Level
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            {/* Progress dots */}
            <div className="flex flex-1 items-center">
              {tiers.map((t, i) => (
                <div key={t} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition ${
                      i <= tierIdx
                        ? "text-white"
                        : "text-white/30"
                    }`} style={i <= tierIdx ? { background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 0 10px rgba(139,92,246,0.4)" } : { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      {i <= tierIdx ? <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> : ""}
                    </div>
                    <span className={`text-[10px] font-semibold ${i <= tierIdx ? "text-[#c084fc]" : "text-white/30"}`}>{t}</span>
                  </div>
                  {i < tiers.length - 1 && (
                    <div className="mx-1 h-0.5 flex-1 rounded-full" style={{ background: i < tierIdx ? "linear-gradient(90deg, #8b5cf6, #c084fc)" : "rgba(139,92,246,0.15)" }} />
                  )}
                </div>
              ))}
            </div>
            {/* Text + button */}
            <div className="flex items-center gap-4">
              <p className="max-w-xs text-xs text-white/50">{tierNext[user.tier]}</p>
              <button className="shrink-0 rounded-lg px-4 py-2 text-xs font-bold text-white transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>
                All Rewards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-Column Layout ── */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">

          {/* Sidebar menu */}
          <aside className="w-full shrink-0 md:w-52">
            <nav className="flex flex-col gap-0.5">
              {menuItems.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                    activeTab === m.id
                      ? "font-semibold text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                  style={activeTab === m.id ? { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" } : {}}
                >
                  <span className="flex-shrink-0">{m.icon}</span>
                  {m.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
              >
                <span className="flex-shrink-0"><IconLogout /></span> Keluar
              </button>
            </nav>
          </aside>

          {/* Content area */}
          <div className="flex-1 rounded-xl p-6" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>

            {/* ── Pengaturan Akun ── */}
            {activeTab === "profile" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Pengaturan Akun</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />

                {/* Avatar upload area */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-extrabold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
                      {initials}
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] text-white shadow" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" /></svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls}>Nama Lengkap</label>
                    <input className={inputCls} style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" />
                  </div>
                  <div>
                    <label className={labelCls}>Nomor Handphone</label>
                    <input className={inputCls} style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+62" />
                    {!form.phone && <p className="mt-1 text-[11px] text-red-400/80">Belum diverifikasi</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Tanggal Lahir</label>
                    <div className="flex gap-2">
                      <select className={inputCls} style={inputStyle} value={form.dob_d} onChange={e => setForm(f => ({ ...f, dob_d: e.target.value }))}>
                        <option value="">Date</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select className={inputCls} style={inputStyle} value={form.dob_m} onChange={e => setForm(f => ({ ...f, dob_m: e.target.value }))}>
                        <option value="">Month</option>
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                          <option key={m} value={i + 1}>{m}</option>
                        ))}
                      </select>
                      <select className={inputCls} style={inputStyle} value={form.dob_y} onChange={e => setForm(f => ({ ...f, dob_y: e.target.value }))}>
                        <option value="">Year</option>
                        {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Jenis Kelamin</label>
                    <div className="flex gap-3">
                      {["Laki-laki", "Perempuan"].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, gender: g }))}
                          className={`flex-1 rounded-lg border py-2.5 text-sm transition ${
                            form.gender === g ? "font-semibold text-white" : "text-white/50"
                          }`}
                          style={form.gender === g ? { background: "rgba(139,92,246,0.2)", borderColor: "rgba(139,92,246,0.4)" } : { background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Email Lengkap</label>
                    <input className={inputCls} style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@kamu.com" />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Password</label>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <p className="text-xs text-white/40">Jika ingin mengubah password demi keamanan privasi</p>
                      <button className="ml-3 shrink-0 rounded-lg px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>
                        Ganti Password ›
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Alamat</label>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <p className="text-xs text-white/40">belum ada alamat profile</p>
                      <button className="ml-3 shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:text-white" style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
                        Tambah Alamat ›
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button className="rounded-xl px-12 py-3 text-sm font-bold text-white shadow transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}>
                    Simpan
                  </button>
                </div>
              </div>
            )}

            {/* ── Pesanan Saya ── */}
            {activeTab === "orders" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Pesanan Saya</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />
                <div className="rounded-xl p-12 text-center" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <div className="mb-3 flex justify-center"><svg className="h-10 w-10 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg></div>
                  <p className="text-sm font-semibold text-white/70">Belum ada pesanan</p>
                  <p className="mt-1 text-xs text-white/40">Yuk mulai belanja produk Ginabo favoritmu!</p>
                  <Link href="/shop" className="mt-5 inline-block rounded-xl px-8 py-2.5 text-sm font-bold text-white transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>
                    Belanja Sekarang
                  </Link>
                </div>
              </div>
            )}

            {/* ── Alamat Pengiriman ── */}
            {activeTab === "address" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Alamat Pengiriman</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />
                <div className="rounded-xl p-10 text-center" style={{ background: "rgba(139,92,246,0.06)", border: "1px dashed rgba(139,92,246,0.25)" }}>
                  <p className="text-sm text-white/40">Belum ada alamat tersimpan</p>
                  <button className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-white/70 transition hover:text-white" style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
                    + Tambah Alamat
                  </button>
                </div>
              </div>
            )}

            {/* ── Ulasan ── */}
            {activeTab === "reviews" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Ulasan Saya</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />
                <div className="rounded-xl p-12 text-center" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <div className="mb-3 flex justify-center"><svg className="h-10 w-10 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg></div>
                  <p className="text-sm text-white/40">Belum ada ulasan</p>
                </div>
              </div>
            )}

            {/* ── Wishlist ── */}
            {activeTab === "wishlist" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Wishlist</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />
                <div className="rounded-xl p-12 text-center" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <div className="mb-3 flex justify-center"><svg className="h-10 w-10 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg></div>
                  <p className="text-sm text-white/40">Wishlist kamu masih kosong</p>
                </div>
              </div>
            )}

            {/* ── Riwayat Poin ── */}
            {activeTab === "points" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Riwayat Poin</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />
                <div className="mb-4 flex items-center justify-between rounded-xl px-5 py-4" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <span className="text-sm text-white/60">Total Poin Kamu</span>
                  <span className="text-2xl font-extrabold text-[#c084fc]">{user.points.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                    <div>
                      <div className="text-sm font-semibold text-white">Pendaftaran Member</div>
                      <div className="text-xs text-white/40">{user.joinedAt}</div>
                    </div>
                    <span className="text-sm font-bold text-green-400">+100 poin</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Kode Referral ── */}
            {activeTab === "referral" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Kode Referral</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />
                <div className="rounded-xl p-6 text-center" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <p className="mb-3 text-xs text-white/50">Bagikan kode referralmu dan dapatkan 100 poin untuk setiap teman yang mendaftar!</p>
                  <div className="mx-auto w-fit rounded-xl px-8 py-4 text-xl font-extrabold tracking-widest text-[#c084fc]" style={{ border: "2px dashed rgba(139,92,246,0.4)", background: "rgba(139,92,246,0.1)" }}>
                    GINABO-{user.id.slice(-6).toUpperCase()}
                  </div>
                  <button className="mt-4 rounded-xl px-8 py-2.5 text-sm font-bold text-white transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}>
                    Salin Kode
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
