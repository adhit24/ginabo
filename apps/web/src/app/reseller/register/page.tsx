"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TIER_ORDER, TIERS, useResellerTier } from "@/components/reseller/ResellerTierProvider";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

function waLink() {
  const text = "Halo Ginabo, saya tertarik bergabung sebagai partner reseller. Boleh info lebih lanjut?";
  return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
}

export default function ResellerRegisterPage() {
  const { tier, setTier, picked } = useResellerTier();
  const [state, setState] = useState<State>({ status: "idle" });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    instagram: "",
    experience: "NEW",
    message: "",
    agree: false,
  });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.phone.trim().length >= 8 &&
      form.agree &&
      state.status !== "submitting" &&
      state.status !== "success"
    );
  }, [form.name, form.phone, form.agree, state.status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/reseller/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, tier }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json?.ok) {
        setState({ status: "error", message: json?.error?.message ?? "Gagal mengirim pendaftaran." });
        return;
      }
      setState({ status: "success" });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Gagal mengirim pendaftaran." });
    }
  };

  return (
    <div className="text-[#2a2a2a]" style={{ background: "linear-gradient(180deg,#FBFAFE,#F6F2FD)" }}>
      <section className="px-[34px] pb-2.5 pt-9">
        <div className="mx-auto max-w-[1080px]">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#9d8ab8]">Pendaftaran partner</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.2] tracking-[-.02em]" style={{ color: "#241338" }}>
            Isi data kamu, kami verifikasi 1×24 jam.
          </h1>
          <p className="mt-3 max-w-[520px] text-[14px] leading-[1.7] text-[#6b5c80]">
            Gratis, tanpa biaya pendaftaran. Setelah disetujui kamu langsung dapat akses harga partner dan materi promosi.
          </p>

          {state.status === "success" ? (
            <div className="mx-auto mt-7 max-w-[560px] rounded-3xl bg-white p-8 text-center" style={{ border: "1px solid #F1ECF9" }}>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "#7C3AED" }}>Berhasil</div>
              <div className="mt-2 text-xl font-extrabold" style={{ color: "#241338" }}>Pendaftaran kamu sudah terkirim</div>
              <p className="mt-2 text-sm leading-relaxed text-[#6b5c80]">
                Tim Ginabo akan menghubungi kamu melalui WhatsApp atau email untuk langkah berikutnya.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-xl px-7 py-3 text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg,#6D28D9,#9333EA)" }}>
                  Lihat Produk
                </Link>
                <Link href="/reseller" className="inline-flex min-h-11 items-center justify-center rounded-xl border px-7 py-3 text-sm font-bold" style={{ borderColor: "#7C3AED", color: "#7C3AED" }}>
                  Kembali ke Info Program
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[12.5px] font-bold text-white" style={{ background: "#7C3AED" }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]" style={{ background: "rgba(255,255,255,.24)" }}>1</span>
                  Data diri
                </span>
                <span className="h-px min-w-[20px] flex-1" style={{ background: "#E3DAF3" }} />
                <span className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-[#9d8ab8]" style={{ border: "1px solid #E3DAF3", background: "#fff" }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]" style={{ background: "#F4EEFD" }}>2</span>
                  Pilih tier
                </span>
                <span className="h-px min-w-[20px] flex-1" style={{ background: "#E3DAF3" }} />
                <span className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[12.5px] font-semibold text-[#9d8ab8]" style={{ border: "1px solid #E3DAF3", background: "#fff" }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px]" style={{ background: "#F4EEFD" }}>3</span>
                  Verifikasi
                </span>
              </div>

              <form onSubmit={submit} className="mt-6 flex flex-wrap items-start gap-5">
                <div className="min-w-0 flex-[2_1_420px] rounded-[20px] bg-white p-7.5" style={{ border: "1px solid #F1ECF9" }}>
                  {state.status === "error" && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                      {state.message}
                    </div>
                  )}

                  <h2 className="text-[17px] font-extrabold" style={{ color: "#241338" }}>Data diri</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Nama lengkap" placeholder="Nama sesuai KTP" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} autoComplete="name" required />
                    <Field label="Nomor WhatsApp" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} type="tel" autoComplete="tel" required />
                    <Field label="Email" placeholder="nama@email.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" autoComplete="email" />
                    <Field label="Kota domisili" placeholder="mis. Bandung" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} autoComplete="address-level2" />
                  </div>

                  <h2 className="mt-7.5 text-[17px] font-extrabold" style={{ color: "#241338" }}>Profil penjualan</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Instagram (opsional)" placeholder="@namakamu" value={form.instagram} onChange={(v) => setForm((f) => ({ ...f, instagram: v }))} />
                    <label className="flex flex-col gap-1.5 text-[12px] font-semibold" style={{ color: "#4a3b60" }}>
                      Pengalaman jualan
                      <select
                        value={form.experience}
                        onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                        className="h-11 rounded-[11px] px-3 text-[13px] outline-none"
                        style={{ border: "1px solid #E7DFF5", background: "#FCFBFE", color: "#241338" }}
                      >
                        <option value="NEW">Belum pernah</option>
                        <option value="SELLER">Kurang dari 1 tahun</option>
                        <option value="SELLER">1–3 tahun</option>
                        <option value="STORE">Lebih dari 3 tahun</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-5 flex flex-col gap-1.5 text-[12px] font-semibold" style={{ color: "#4a3b60" }}>
                    Catatan (opsional)
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value.slice(0, 500) }))}
                      placeholder="Contoh: Aku mau fokus jualan di komunitas olahraga / kantor."
                      className="min-h-[100px] resize-none rounded-[11px] px-3 py-2.5 text-[13px] outline-none"
                      style={{ border: "1px solid #E7DFF5", background: "#FCFBFE", color: "#241338" }}
                    />
                  </label>

                  <h2 className="mt-7.5 text-[17px] font-extrabold" style={{ color: "#241338" }}>Pilih tier</h2>
                  <div className="mt-4.5 grid gap-3 sm:grid-cols-3">
                    {TIER_ORDER.map((key) => {
                      const t = TIERS[key];
                      const active = tier === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setTier(key)}
                          className="rounded-[14px] p-4.5 text-left transition"
                          style={active ? { border: "2px solid #7C3AED", background: "#F7F3FE" } : { border: "1px solid #E7DFF5", background: "#fff" }}
                        >
                          <b className="block text-[14px] font-extrabold" style={{ color: "#241338" }}>{t.short}</b>
                          <span className="mt-1.5 block text-[20px] font-extrabold" style={{ color: "#7C3AED" }}>{t.modal}</span>
                          <span className="mt-1.5 block text-[12px] font-medium text-[#8b7aa8]">{t.margin}</span>
                        </button>
                      );
                    })}
                  </div>

                  <label className="mt-6 flex gap-2.5 text-[12.5px] leading-[1.6] text-[#7b6b90]">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 accent-[#7C3AED]"
                    />
                    <span>Saya menyetujui syarat &amp; ketentuan program serta kebijakan privasi Ginabo Partner Program.</span>
                  </label>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-5.5 h-[50px] w-full rounded-[13px] text-[14px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#6D28D9,#9333EA)", boxShadow: "0 12px 28px rgba(109,40,217,.3)" }}
                  >
                    {state.status === "submitting" ? "Mengirim..." : "Kirim pendaftaran"}
                  </button>
                </div>

                <aside className="flex min-w-0 flex-[1_1_260px] flex-col gap-3.5 rounded-[20px] bg-white p-6.5" style={{ border: "1px solid #F1ECF9" }}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9d8ab8]">Ringkasan pilihan</p>
                  <div className="rounded-2xl p-4.5" style={{ background: "linear-gradient(160deg,#7C3AED,#6D28D9)" }}>
                    <span className="text-[11.5px] font-semibold text-white/70">Tier dipilih</span>
                    <b className="mt-1.5 block text-[20px] font-extrabold text-white">{picked.name}</b>
                    <span className="mt-2.5 block text-[12.5px] font-medium text-white/80">
                      Starter order {picked.modal} · {picked.margin}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12.5px] font-medium text-[#6b5c80]">
                    <span>Biaya pendaftaran</span>
                    <b style={{ color: "#241338" }}>Rp0</b>
                  </div>
                  <div className="flex justify-between text-[12.5px] font-medium text-[#6b5c80]">
                    <span>Waktu verifikasi</span>
                    <b style={{ color: "#241338" }}>1×24 jam</b>
                  </div>
                  <div className="flex justify-between text-[12.5px] font-medium text-[#6b5c80]">
                    <span>Estimasi profit</span>
                    <b style={{ color: "#7C3AED" }}>{picked.profit} / bln</b>
                  </div>
                  <div className="h-px" style={{ background: "#F1ECF9" }} />
                  <p className="text-[12px] leading-relaxed text-[#8b7aa8]">
                    Butuh bantuan sebelum daftar? Tim partner kami siap menjawab lewat WhatsApp.
                  </p>
                  <a
                    href={waLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center justify-center gap-2.5 rounded-xl text-[13px] font-bold"
                    style={{ border: "1px solid #E3DAF3", color: "#4A1A5E" }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.4c1.5.8 3.2 1.4 5 1.4 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .9.8-3-.2-.3A8 8 0 1 1 12 20z" />
                    </svg>
                    Tanya dulu via WhatsApp
                  </a>
                </aside>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[12px] font-semibold" style={{ color: "#4a3b60" }}>
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-11 rounded-[11px] px-3.5 text-[13px] outline-none"
        style={{ border: "1px solid #E7DFF5", background: "#FCFBFE", color: "#241338" }}
      />
    </label>
  );
}
