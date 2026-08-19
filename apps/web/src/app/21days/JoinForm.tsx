"use client";

import { useMemo, useState } from "react";
import { FlowButton } from "@/components/ui/flow-button";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function JoinForm() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [form, setForm] = useState({ name: "", phone: "", email: "", skinConcern: "" });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.phone.trim().length >= 8 &&
      state.status !== "submitting" &&
      state.status !== "success"
    );
  }, [form.name, form.phone, state.status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/21days/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
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

  const waLink = () => {
    const text = `Halo Ginabo, saya ${form.name || "peserta"}. Saya tertarik bergabung dengan program 21 Days Journey.${form.skinConcern ? ` Concern kulit saya: ${form.skinConcern}.` : ""} Boleh info langkah pendaftaran berikutnya?`;
    return `https://wa.me/6285199264835?text=${encodeURIComponent(text)}`;
  };

  if (state.status === "success") {
    return (
      <div 
        className="rounded-2xl p-8 text-center bg-white border border-purple-100 shadow-sm"
        style={{ boxShadow: "0 10px 30px rgba(58, 16, 120, 0.04)" }}
      >
        <div className="mx-auto grid max-w-md gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Berhasil</div>
          <div className="text-xl font-bold text-[#3a1078]">Pendaftaran Terkirim</div>
          <p className="text-sm leading-relaxed text-[#71717a]">
            Terima kasih sudah mendaftar program **21 Days Journey**. Tim Ginabo akan segera menghubungi Anda melalui WhatsApp untuk panduan dan langkah selanjutnya.
          </p>
          <a
            href={waLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition shadow-sm"
          >
            Konfirmasi via WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form 
      onSubmit={submit} 
      className="rounded-2xl p-8 bg-white border border-[#7b7482]/15 shadow-sm space-y-5"
      style={{ boxShadow: "0 10px 30px rgba(58, 16, 120, 0.04)" }}
    >
      <h3 className="text-title-lg font-bold text-[#3a1078]">Gabung Program</h3>
      <p className="text-xs text-[#71717a] -mt-2">Lengkapi data diri Anda di bawah ini untuk memulai.</p>
      
      {state.status === "error" ? (
        <div className="rounded-xl px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-4">
        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-[#3a1078]">Nama Lengkap</span>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="min-h-11 rounded-lg border border-[#7b7482]/20 px-3 py-2 text-sm text-[#1c1b1b] placeholder-[#7b7482]/50 outline-none transition focus:border-[#3a1078] focus:ring-2 focus:ring-[#3a1078]/10"
            placeholder="Contoh: Anisa Putri"
            autoComplete="name"
            required
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-[#3a1078]">WhatsApp</span>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="min-h-11 rounded-lg border border-[#7b7482]/20 px-3 py-2 text-sm text-[#1c1b1b] placeholder-[#7b7482]/50 outline-none transition focus:border-[#3a1078] focus:ring-2 focus:ring-[#3a1078]/10"
            placeholder="08xxxxxxxxxx"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-[#3a1078]">Skin Concern Utama</span>
          <select
            value={form.skinConcern}
            onChange={(e) => setForm((f) => ({ ...f, skinConcern: e.target.value }))}
            className="min-h-11 rounded-lg border border-[#7b7482]/20 px-3 py-2 text-sm text-[#1c1b1b] bg-white outline-none transition focus:border-[#3a1078] focus:ring-2 focus:ring-[#3a1078]/10"
            required
          >
            <option value="" disabled>Pilih concern</option>
            <option value="Jerawat / Bruntusan">Jerawat / Bruntusan</option>
            <option value="Kusam / Noda Hitam">Kusam / Noda Hitam</option>
            <option value="Kering / Dehidrasi">Kering / Dehidrasi</option>
            <option value="Kemerahan / Sensitif">Kemerahan / Sensitif</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-[#3a1078]">Email (opsional)</span>
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="min-h-11 rounded-lg border border-[#7b7482]/20 px-3 py-2 text-sm text-[#1c1b1b] placeholder-[#7b7482]/50 outline-none transition focus:border-[#3a1078] focus:ring-2 focus:ring-[#3a1078]/10"
            placeholder="Contoh: nama@email.com"
            inputMode="email"
            autoComplete="email"
            type="email"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <FlowButton
          type="submit"
          disabled={!canSubmit}
          text={state.status === "submitting" ? "Mengirim..." : "Gabung Program"}
        />

        <a
          href={waLink()}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#3a1078] hover:bg-[#3a1078]/5 px-6 py-2.5 text-sm font-bold text-[#3a1078] transition"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.478 2 12c0 1.88.516 3.637 1.41 5.142L2 22l4.978-1.388A9.945 9.945 0 0 0 12 22c5.522 0 10-4.478 10-10S17.522 2 12 2zm.003 18a7.965 7.965 0 0 1-4.075-1.114l-.292-.173-3.03.845.852-3.042-.19-.305A7.965 7.965 0 0 1 4 12C4 7.582 7.582 4 12 4s8 4.582 8 8-3.582 8-8 8z" />
          </svg>
          Chat WhatsApp
        </a>
      </div>

      <div className="text-center text-[10px] text-[#71717a]">
        Dengan bergabung, data Anda aman & tidak akan disalahgunakan.
      </div>
    </form>
  );
}
