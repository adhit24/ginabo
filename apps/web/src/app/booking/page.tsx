"use client";

import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import { useEffect, useMemo, useState } from "react";

type Slot = {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  used: number;
  remaining: number;
  isAvailable: boolean;
};

type BookingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "submitting" }
  | { status: "error"; message: string }
  | { status: "success"; bookingNumber: string };

export default function BookingPage() {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [state, setState] = useState<BookingState>({ status: "idle" });

  const selectedSlot = useMemo(() => slots.find((s) => s.id === selectedSlotId) ?? null, [slots, selectedSlotId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch(`/api/bookings/slots?start=${date}&end=${date}`);
        const json = (await res.json()) as { ok: boolean; data?: Slot[]; error?: { message: string } };
        if (!json.ok || !json.data) {
          if (!cancelled) setState({ status: "error", message: json.error?.message ?? "Gagal memuat slot" });
          return;
        }
        const slotData = json.data;
        if (!cancelled) {
          setSlots(slotData);
          const firstAvailable = slotData.find((s) => s.isAvailable)?.id ?? null;
          setSelectedSlotId((prev) => (prev && slotData.some((s) => s.id === prev) ? prev : firstAvailable));
          setState({ status: "idle" });
        }
      } catch (e) {
        if (!cancelled) setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [date]);

  async function submit() {
    if (!selectedSlotId) return;
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customer: { name, email, phone }, slotId: selectedSlotId, notes })
      });
      const json = (await res.json()) as { ok: boolean; data?: { bookingNumber: string }; error?: { message: string } };
      if (!json.ok || !json.data) {
        setState({ status: "error", message: json.error?.message ?? "Booking gagal" });
        return;
      }
      setState({ status: "success", bookingNumber: json.data.bookingNumber });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  const selectedDayLabel = useMemo(() => {
    const d = parseISO(date);
    if (Number.isNaN(d.getTime())) return date;
    return format(d, "EEEE, d MMM yyyy", { locale: idLocale });
  }, [date]);

  return (
    <div className="bg-white text-[#2a2a2a]">

      {/* ── HERO + BOOKING FORM ── */}
      <section className="relative overflow-hidden pb-10 pt-14 md:pb-16 md:pt-20" style={{ background: "#ffffff" }}>

        {/* Header */}
        <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-6 pb-10 text-center">
          <span
            className="mb-4 inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white"
            style={{ background: "linear-gradient(135deg, #9333EA, #7C3AED)" }}
          >
            Konsultasi Kulit
          </span>
          <h1 className="mb-3 text-3xl font-extrabold leading-tight md:text-4xl" style={{ color: "#4A1A5E" }}>
            Booking{" "}
            <span className="text-[#9333EA]">Konsultasi</span>
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-[#5a4a6a]">
            Pilih slot konsultasi gratis bersama skin expert kami. Slot otomatis tertutup saat penuh.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Left: Date + Slots */}
            <div className="grid gap-4">
              <div
                className="grid gap-4 rounded-2xl p-7"
                style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}
              >
                <div className="grid gap-1">
                  <h2 className="text-lg font-bold text-white">Pilih Jadwal</h2>
                  <p className="text-sm text-white/50">Slot tersedia ditampilkan berdasarkan tanggal pilihan.</p>
                </div>

                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold text-white">Tanggal</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="min-h-11 rounded-lg border px-3 py-2.5 text-[16px] text-white outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40 md:text-sm"
                    style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
                  />
                </label>

                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-white">Slot Tersedia</div>
                  <div className="text-xs font-medium text-[#c084fc]">{selectedDayLabel}</div>
                  <div className="grid gap-2">
                    {state.status === "loading" ? (
                      <div className="rounded-lg p-4 text-sm text-white/40" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>Memuat slot...</div>
                    ) : slots.length === 0 ? (
                      <div className="rounded-lg p-4 text-sm text-white/40" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>Belum ada slot untuk tanggal ini.</div>
                    ) : (
                      slots.map((s) => {
                        const start = new Date(s.startAt);
                        const end = new Date(s.endAt);
                        const label = `${format(start, "HH:mm")}–${format(end, "HH:mm")}`;
                        const disabled = !s.isAvailable;
                        const active = selectedSlotId === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSlotId(s.id)}
                            disabled={disabled}
                            className="flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition"
                            style={{
                              border: active ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(139,92,246,0.2)",
                              background: active ? "rgba(139,92,246,0.15)" : disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.06)",
                              color: disabled ? "rgba(255,255,255,0.25)" : "white",
                              cursor: disabled ? "not-allowed" : "pointer",
                              boxShadow: active ? "0 0 16px rgba(139,92,246,0.2)" : "none",
                            }}
                          >
                            <span className="font-semibold">{label}</span>
                            <span className="text-xs" style={{ color: disabled ? "rgba(255,255,255,0.25)" : "#c084fc" }}>
                              {disabled ? "Penuh" : `${s.remaining} slot`}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Benefits strip */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}
              >
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#c084fc]">Kenapa Konsultasi?</div>
                <ul className="flex flex-col gap-1.5">
                  {[
                    "Gratis, tidak ada biaya apapun",
                    "Rekomendasi produk sesuai jenis kulit",
                    "Rutinitas AM/PM yang tepat untukmu",
                    "Dipandu skin expert berpengalaman",
                  ].map(b => (
                    <li key={b} className="flex items-center gap-2 text-xs text-[#5a4a6a]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c084fc]" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Form */}
            <div className="grid content-start gap-4">
              <div
                className="rounded-2xl p-7"
                style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 32px rgba(20,15,50,0.25)" }}
              >
                <div className="grid gap-1 mb-5">
                  <h2 className="text-lg font-bold text-white">Data Kamu</h2>
                  <p className="text-sm text-white/50">Isi data dengan benar agar kami bisa menghubungimu.</p>
                </div>

                <div className="grid gap-4">
                  {[
                    { label: "Nama", value: name, onChange: (v: string) => setName(v), placeholder: "Contoh: Nadia Putri", type: "text" },
                    { label: "Email", value: email, onChange: (v: string) => setEmail(v), placeholder: "Contoh: nama@email.com", type: "email" },
                    { label: "Nomor WhatsApp", value: phone, onChange: (v: string) => setPhone(v), placeholder: "Contoh: 08xxxxxxxxxx", type: "tel" },
                  ].map(f => (
                    <label key={f.label} className="grid gap-1.5 text-sm">
                      <span className="font-semibold text-white">{f.label}</span>
                      <input
                        type={f.type}
                        value={f.value}
                        onChange={(e) => f.onChange(e.target.value)}
                        className="min-h-11 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
                        style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
                        placeholder={f.placeholder}
                      />
                    </label>
                  ))}
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-semibold text-white">Catatan (opsional)</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-24 rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40"
                      style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" }}
                      placeholder="Ceritakan kondisi kulit / tujuan..."
                    />
                  </label>
                </div>

                {selectedSlot && (
                  <div className="mt-4 rounded-lg p-4 text-sm text-white/70" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    Slot dipilih:{" "}
                    <span className="font-semibold text-[#c084fc]">
                      {format(new Date(selectedSlot.startAt), "HH:mm")}–{format(new Date(selectedSlot.endAt), "HH:mm")}
                    </span>
                    {" · "}{selectedDayLabel}
                  </div>
                )}

                {state.status === "error" && (
                  <div className="mt-4 rounded-lg px-4 py-3 text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{state.message}</div>
                )}
                {state.status === "success" && (
                  <div className="mt-4 rounded-lg p-4 text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>
                    Booking berhasil! ID: <span className="font-bold">{state.bookingNumber}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={!selectedSlotId || state.status === "submitting" || state.status === "loading"}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg px-8 py-3 text-sm font-extrabold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}
                >
                  {state.status === "submitting" ? "Memproses..." : "Konfirmasi Booking"}
                </button>

                <div className="mt-4 text-center text-xs text-white/40">
                  Konfirmasi Email & WhatsApp dikirim setelah booking berhasil, dan reminder H-1 sebelum jadwal.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
