"use client";

import { useMemo, useState } from "react";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function JoinForm() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 2 && form.phone.trim().length >= 8 && state.status !== "submitting" && state.status !== "success";
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

  if (state.status === "success") {
    return (
      <div className="rounded-2xl p-7 text-center" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
        <div className="mx-auto grid max-w-md gap-3">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#c084fc]">Berhasil</div>
          <div className="text-xl font-extrabold text-white">Pendaftaran kamu sudah terkirim</div>
          <p className="text-sm leading-relaxed text-white/60">
            Tim Ginabo akan menghubungi kamu untuk informasi jadwal, panduan, dan langkah berikutnya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl p-7" style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}>
      <div className="grid gap-5">
        {state.status === "error" ? (
          <div className="rounded-xl px-4 py-3 text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }} role="alert">
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-white">Nama</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="min-h-11 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
              placeholder="Contoh: Nadia Putri"
              autoComplete="name"
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-white">Nomor WhatsApp</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="min-h-11 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
              placeholder="Contoh: 08xxxxxxxxxx"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-white">Email (opsional)</span>
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="min-h-11 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
            style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
            placeholder="Contoh: nama@email.com"
            inputMode="email"
            autoComplete="email"
            type="email"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-11 items-center justify-center rounded-lg px-8 py-3 text-sm font-extrabold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}
        >
          {state.status === "submitting" ? "Mengirim..." : "Ikuti Program"}
        </button>

        <div className="text-center text-xs text-white/40">
          Dengan mendaftar, kamu setuju untuk dihubungi oleh tim Ginabo terkait program ini.
        </div>
      </div>
    </form>
  );
}
