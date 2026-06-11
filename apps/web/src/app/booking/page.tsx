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
    <div className="bg-[#FDFAFF] text-[#2a2a2a]">

      {/* ── HERO + BOOKING FORM ── */}
      <section
        className="relative overflow-hidden pb-10 md:pb-16"
        style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1e0a38 50%,#2a1040 100%)" }}
      >
        {/* Glow blobs */}
        <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/3 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#e879f9,transparent 70%)" }} />

        {/* Header */}
        <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-6 pt-14 pb-10 text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
          >
            Konsultasi Kulit
          </span>
          <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">
            Booking{" "}
            <span
              className="font-light italic"
              style={{ background: "linear-gradient(135deg,#c084fc,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              Konsultasi
            </span>
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            Pilih slot konsultasi gratis bersama skin expert kami. Slot otomatis tertutup saat penuh.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-4xl px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Left: Date + Slots */}
            <div className="grid gap-4">
              <div className="grid gap-1">
                <h2 className="text-lg font-bold text-white">Pilih Jadwal</h2>
                <p className="text-sm text-white/40">Slot tersedia ditampilkan berdasarkan tanggal pilihan.</p>
              </div>

              <div
                className="grid gap-3 rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-white/70">Tanggal</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl px-4 py-3 text-[16px] text-white placeholder-white/30 outline-none transition md:text-sm"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,85,247,0.7)"; }}
                    onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)"; }}
                  />
                </label>

                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-white/70">Slot Tersedia</div>
                  <div className="text-xs" style={{ color: "#c084fc" }}>{selectedDayLabel}</div>
                  <div className="grid gap-2">
                    {state.status === "loading" ? (
                      <div className="rounded-xl p-4 text-sm text-white/40" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>Memuat slot...</div>
                    ) : slots.length === 0 ? (
                      <div className="rounded-xl p-4 text-sm text-white/40" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>Belum ada slot untuk tanggal ini.</div>
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
                            className="flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition"
                            style={{
                              border: active ? "1px solid rgba(168,85,247,0.7)" : "1px solid rgba(255,255,255,0.1)",
                              background: active ? "rgba(139,92,246,0.15)" : disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
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
                <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#c084fc" }}>Kenapa Konsultasi?</div>
                <ul className="flex flex-col gap-1.5">
                  {[
                    "Gratis — tidak ada biaya apapun",
                    "Rekomendasi produk sesuai jenis kulit",
                    "Rutinitas AM/PM yang tepat untukmu",
                    "Dipandu skin expert berpengalaman",
                  ].map(b => (
                    <li key={b} className="flex items-center gap-2 text-xs text-white/60">
                      <span style={{ color: "#c084fc" }}>✦</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Form */}
            <div className="grid content-start gap-4">
              <div className="grid gap-1">
                <h2 className="text-lg font-bold text-white">Data Kamu</h2>
                <p className="text-sm text-white/40">Isi data dengan benar agar kami bisa menghubungimu.</p>
              </div>

              <div
                className="rounded-3xl p-6"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div className="grid gap-3">
                  {[
                    { label: "Nama", value: name, onChange: (v: string) => setName(v), placeholder: "Nama lengkap", type: "text" },
                    { label: "Email", value: email, onChange: (v: string) => setEmail(v), placeholder: "email@contoh.com", type: "email" },
                    { label: "Phone", value: phone, onChange: (v: string) => setPhone(v), placeholder: "+62...", type: "tel" },
                  ].map(f => (
                    <label key={f.label} className="grid gap-1.5 text-sm">
                      <span className="text-xs font-bold uppercase tracking-widest text-white/50">{f.label}</span>
                      <input
                        type={f.type}
                        value={f.value}
                        onChange={(e) => f.onChange(e.target.value)}
                        className="rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                        onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,85,247,0.7)"; }}
                        onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)"; }}
                        placeholder={f.placeholder}
                      />
                    </label>
                  ))}
                  <label className="grid gap-1.5 text-sm">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/50">Catatan</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-24 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                      onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,85,247,0.7)"; }}
                      onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)"; }}
                      placeholder="Ceritakan kondisi kulit / tujuan..."
                    />
                  </label>
                </div>

                {selectedSlot && (
                  <div className="mt-4 rounded-xl p-4 text-sm text-white/70" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    Slot dipilih:{" "}
                    <span className="font-semibold" style={{ color: "#c084fc" }}>
                      {format(new Date(selectedSlot.startAt), "HH:mm")}–{format(new Date(selectedSlot.endAt), "HH:mm")}
                    </span>
                    {" · "}{selectedDayLabel}
                  </div>
                )}

                {state.status === "error" && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">{state.message}</div>
                )}
                {state.status === "success" && (
                  <div className="mt-4 rounded-xl p-4 text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>
                    ✅ Booking berhasil! ID: <span className="font-bold">{state.bookingNumber}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={!selectedSlotId || state.status === "submitting" || state.status === "loading"}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }}
                >
                  {state.status === "submitting" ? "Memproses..." : "Konfirmasi Booking"}
                </button>
              </div>

              {/* Notification note */}
              <div
                className="rounded-2xl p-4 text-xs text-white/60"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}
              >
                <span className="font-bold text-white/80">Notifikasi otomatis</span> — konfirmasi Email & WhatsApp dikirim setelah booking berhasil, dan reminder H-1 sebelum jadwal.
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
