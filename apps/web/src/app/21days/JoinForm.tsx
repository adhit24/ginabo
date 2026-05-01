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
      <div className="rounded-3xl bg-white p-7 text-center shadow-sm" style={{ border: "1.5px solid #efe6fb" }}>
        <div className="mx-auto grid max-w-md gap-3">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Berhasil</div>
          <div className="text-xl font-extrabold text-brand-900">Pendaftaran kamu sudah terkirim</div>
          <p className="text-sm leading-relaxed text-brand-600">
            Tim Ginabo akan menghubungi kamu untuk informasi jadwal, panduan, dan langkah berikutnya.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-7 shadow-sm" style={{ border: "1.5px solid #efe6fb" }}>
      <div className="grid gap-5">
        {state.status === "error" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-900">Nama</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="Contoh: Nadia Putri"
              autoComplete="name"
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-gray-900">Nomor WhatsApp</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="Contoh: 08xxxxxxxxxx"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm">
          <span className="font-semibold text-gray-900">Email (opsional)</span>
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="Contoh: nama@email.com"
            inputMode="email"
            autoComplete="email"
            type="email"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-8 py-3 text-sm font-extrabold text-white shadow-brand transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "submitting" ? "Mengirim..." : "Ikuti Program →"}
        </button>

        <div className="text-center text-xs text-gray-500">
          Dengan mendaftar, kamu setuju untuk dihubungi oleh tim Ginabo terkait program ini.
        </div>
      </div>
    </form>
  );
}
