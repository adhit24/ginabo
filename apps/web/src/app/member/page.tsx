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

const menuItems = [
  { id: "profile",   label: "Pengaturan Akun",   icon: "👤" },
  { id: "orders",    label: "Pesanan Saya",       icon: "📋" },
  { id: "address",   label: "Alamat Pengiriman",  icon: "📍" },
  { id: "reviews",   label: "Ulasan",             icon: "💬" },
  { id: "wishlist",  label: "Wishlist",           icon: "🤍" },
  { id: "points",    label: "Riwayat Poin",       icon: "🎯" },
  { id: "referral",  label: "Kode Referral",      icon: "🔗" },
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

  const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200";
  const labelCls = "mb-1.5 block text-xs font-semibold text-gray-600";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span>›</span>
          <span className="font-semibold text-gray-700">Profil</span>
        </div>
      </div>

      {/* ── Profile Banner ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            {/* Left: avatar + info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-extrabold text-gray-500 ring-2 ring-gray-300">
                  {initials}
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-400">Bergabung sejak {user.joinedAt}</div>
                <span className="mt-1 inline-block rounded-full bg-brand-700 px-3 py-0.5 text-[11px] font-bold text-white">
                  Level {tierIdx + 1} · {user.tier}
                </span>
              </div>
            </div>

            {/* Right: stats */}
            <div className="flex items-center divide-x divide-gray-200 rounded-xl border border-gray-200 bg-gray-50">
              {[
                { label: "Total Pesanan", val: "0 Pesanan" },
                { label: "Total Ulasan",  val: "0 Ulasan"  },
                { label: "Total Poin",    val: `${user.points} Point` },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center px-6 py-3">
                  <span className="text-[11px] text-gray-400">{s.label}</span>
                  <span className="mt-0.5 text-sm font-bold text-gray-800">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Membership Level Bar ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700">
            <span className="text-base">🏅</span> Membership Level
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            {/* Progress dots */}
            <div className="flex flex-1 items-center">
              {tiers.map((t, i) => (
                <div key={t} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold transition ${
                      i <= tierIdx
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}>
                      {i <= tierIdx ? "✓" : ""}
                    </div>
                    <span className={`text-[10px] font-semibold ${i <= tierIdx ? "text-brand-700" : "text-gray-400"}`}>{t}</span>
                  </div>
                  {i < tiers.length - 1 && (
                    <div className={`mx-1 h-0.5 flex-1 ${i < tierIdx ? "bg-brand-700" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
            {/* Text + button */}
            <div className="flex items-center gap-4">
              <p className="max-w-xs text-xs text-gray-500">{tierNext[user.tier]}</p>
              <button className="shrink-0 rounded-lg bg-brand-700 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800">
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
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  {m.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-50"
              >
                <span className="text-base">🚪</span> Keluar
              </button>
            </nav>
          </aside>

          {/* Content area */}
          <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* ── Pengaturan Akun ── */}
            {activeTab === "profile" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-gray-900">Pengaturan Akun</h2>
                <div className="mb-6 h-px bg-gray-100" />

                {/* Avatar upload area */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-extrabold text-gray-500 ring-2 ring-gray-300">
                      {initials}
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-[10px] text-white shadow">
                      ✎
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls}>Nama Lengkap</label>
                    <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" />
                  </div>
                  <div>
                    <label className={labelCls}>Nomor Handphone</label>
                    <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+62" />
                    {!form.phone && <p className="mt-1 text-[11px] text-red-400">Belum diverifikasi</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Tanggal Lahir</label>
                    <div className="flex gap-2">
                      <select className={inputCls} value={form.dob_d} onChange={e => setForm(f => ({ ...f, dob_d: e.target.value }))}>
                        <option value="">Date</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select className={inputCls} value={form.dob_m} onChange={e => setForm(f => ({ ...f, dob_m: e.target.value }))}>
                        <option value="">Month</option>
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                          <option key={m} value={i + 1}>{m}</option>
                        ))}
                      </select>
                      <select className={inputCls} value={form.dob_y} onChange={e => setForm(f => ({ ...f, dob_y: e.target.value }))}>
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
                            form.gender === g ? "border-brand-700 bg-brand-50 font-semibold text-brand-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Email Lengkap</label>
                    <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@kamu.com" />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Password</label>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                      <p className="text-xs text-gray-400">Jika ingin mengubah password demi keamanan privasi</p>
                      <button className="ml-3 shrink-0 rounded-lg bg-brand-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-800">
                        Ganti Password ›
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Alamat</label>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                      <p className="text-xs text-gray-400">belum ada alamat profile</p>
                      <button className="ml-3 shrink-0 rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:border-brand-500 hover:text-brand-700">
                        Tambah Alamat ›
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button className="rounded-xl bg-brand-700 px-12 py-3 text-sm font-bold text-white shadow hover:bg-brand-800">
                    Simpan
                  </button>
                </div>
              </div>
            )}

            {/* ── Pesanan Saya ── */}
            {activeTab === "orders" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-gray-900">Pesanan Saya</h2>
                <div className="mb-6 h-px bg-gray-100" />
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-12 text-center">
                  <div className="mb-3 text-4xl">📦</div>
                  <p className="text-sm font-semibold text-gray-700">Belum ada pesanan</p>
                  <p className="mt-1 text-xs text-gray-400">Yuk mulai belanja produk Ginabo favoritmu!</p>
                  <Link href="/shop" className="mt-5 inline-block rounded-xl bg-brand-700 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-800">
                    Belanja Sekarang
                  </Link>
                </div>
              </div>
            )}

            {/* ── Alamat Pengiriman ── */}
            {activeTab === "address" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-gray-900">Alamat Pengiriman</h2>
                <div className="mb-6 h-px bg-gray-100" />
                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                  <p className="text-sm text-gray-400">Belum ada alamat tersimpan</p>
                  <button className="mt-4 rounded-xl border border-brand-500 px-6 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                    + Tambah Alamat
                  </button>
                </div>
              </div>
            )}

            {/* ── Ulasan ── */}
            {activeTab === "reviews" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-gray-900">Ulasan Saya</h2>
                <div className="mb-6 h-px bg-gray-100" />
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-12 text-center">
                  <div className="mb-3 text-4xl">💬</div>
                  <p className="text-sm text-gray-400">Belum ada ulasan</p>
                </div>
              </div>
            )}

            {/* ── Wishlist ── */}
            {activeTab === "wishlist" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-gray-900">Wishlist</h2>
                <div className="mb-6 h-px bg-gray-100" />
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-12 text-center">
                  <div className="mb-3 text-4xl">🤍</div>
                  <p className="text-sm text-gray-400">Wishlist kamu masih kosong</p>
                </div>
              </div>
            )}

            {/* ── Riwayat Poin ── */}
            {activeTab === "points" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-gray-900">Riwayat Poin</h2>
                <div className="mb-6 h-px bg-gray-100" />
                <div className="mb-4 flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 px-5 py-4">
                  <span className="text-sm text-gray-600">Total Poin Kamu</span>
                  <span className="text-2xl font-extrabold text-brand-700">{user.points.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Pendaftaran Member</div>
                      <div className="text-xs text-gray-400">{user.joinedAt}</div>
                    </div>
                    <span className="text-sm font-bold text-green-600">+100 poin</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Kode Referral ── */}
            {activeTab === "referral" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-gray-900">Kode Referral</h2>
                <div className="mb-6 h-px bg-gray-100" />
                <div className="rounded-xl border border-brand-100 bg-brand-50 p-6 text-center">
                  <p className="mb-3 text-xs text-gray-500">Bagikan kode referralmu dan dapatkan 100 poin untuk setiap teman yang mendaftar!</p>
                  <div className="mx-auto w-fit rounded-xl border-2 border-dashed border-brand-300 bg-white px-8 py-4 text-xl font-extrabold tracking-widest text-brand-700">
                    GINABO-{user.id.slice(-6).toUpperCase()}
                  </div>
                  <button className="mt-4 rounded-xl bg-brand-700 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-800">
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
