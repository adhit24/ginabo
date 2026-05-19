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

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2a1635 0%, #78257C 55%, #CF99B4 100%)",
          minHeight: 220,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 55%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div className="relative mx-auto flex min-h-[220px] max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
          <span className="mb-3 inline-block rounded-full border border-white/30 bg-white/15 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
            Konsultasi Kulit
          </span>
          <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">
            Booking{" "}
            <span className="font-light italic">Konsultasi</span>
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/80">
            Pilih slot konsultasi gratis bersama skin expert kami. Slot otomatis tertutup saat penuh.
          </p>
        </div>
      </section>

      {/* ── BOOKING FORM ── */}
      <section className="py-10 md:py-16">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Left: Date + Slots */}
            <div className="grid gap-4">
              <div className="grid gap-1">
                <h2 className="text-lg font-bold text-[#2a2a2a]">Pilih Jadwal</h2>
                <p className="text-sm" style={{ color: "#888" }}>Slot tersedia ditampilkan berdasarkan tanggal pilihan.</p>
              </div>

              <div className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm" style={{ border: "1.5px solid #f0d8eb" }}>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-[#2a2a2a]">Tanggal</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-2xl border px-4 py-3 text-[16px] outline-none transition md:text-sm"
                    style={{ borderColor: "#f0d8eb" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#78257C"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#f0d8eb"; }}
                  />
                </label>

                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-[#2a2a2a]">Slot Tersedia</div>
                  <div className="text-xs" style={{ color: "#CF99B4" }}>{selectedDayLabel}</div>
                  <div className="grid gap-2">
                    {state.status === "loading" ? (
                      <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: "#f0d8eb", color: "#888" }}>Memuat slot...</div>
                    ) : slots.length === 0 ? (
                      <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: "#f0d8eb", color: "#888" }}>Belum ada slot untuk tanggal ini.</div>
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
                            className="flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition"
                            style={{
                              borderColor: active ? "#78257C" : disabled ? "#f0d8eb" : "#f0d8eb",
                              background: active ? "#FBF0F8" : disabled ? "#fafafa" : "white",
                              color: disabled ? "#bbb" : "#2a2a2a",
                              cursor: disabled ? "not-allowed" : "pointer",
                            }}
                          >
                            <span className="font-semibold">{label}</span>
                            <span className="text-xs" style={{ color: disabled ? "#bbb" : "#CF99B4" }}>
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
              <div className="rounded-2xl p-4" style={{ background: "#FBF0F8", border: "1px solid #f0d8eb" }}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#78257C" }}>Kenapa Konsultasi?</div>
                <ul className="flex flex-col gap-1.5">
                  {[
                    "Gratis — tidak ada biaya apapun",
                    "Rekomendasi produk sesuai jenis kulit",
                    "Rutinitas AM/PM yang tepat untukmu",
                    "Dipandu skin expert berpengalaman",
                  ].map(b => (
                    <li key={b} className="flex items-center gap-2 text-xs" style={{ color: "#555" }}>
                      <span style={{ color: "#CF99B4" }}>✦</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Form */}
            <div className="grid content-start gap-4">
              <div className="grid gap-1">
                <h2 className="text-lg font-bold text-[#2a2a2a]">Data Kamu</h2>
                <p className="text-sm" style={{ color: "#888" }}>Isi data dengan benar agar kami bisa menghubungimu.</p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm" style={{ border: "1.5px solid #f0d8eb" }}>
                <div className="grid gap-3">
                  {[
                    { label: "Nama", value: name, onChange: (v: string) => setName(v), placeholder: "Nama lengkap", type: "text" },
                    { label: "Email", value: email, onChange: (v: string) => setEmail(v), placeholder: "email@contoh.com", type: "email" },
                    { label: "Phone", value: phone, onChange: (v: string) => setPhone(v), placeholder: "+62...", type: "tel" },
                  ].map(f => (
                    <label key={f.label} className="grid gap-1 text-sm">
                      <span className="font-semibold text-[#2a2a2a]">{f.label}</span>
                      <input
                        type={f.type}
                        value={f.value}
                        onChange={(e) => f.onChange(e.target.value)}
                        className="rounded-2xl border px-4 py-3 text-[16px] outline-none transition md:text-sm"
                        style={{ borderColor: "#f0d8eb" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#78257C"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#f0d8eb"; }}
                        placeholder={f.placeholder}
                      />
                    </label>
                  ))}
                  <label className="grid gap-1 text-sm">
                    <span className="font-semibold text-[#2a2a2a]">Catatan</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-24 rounded-2xl border px-4 py-3 text-[16px] outline-none transition md:text-sm"
                      style={{ borderColor: "#f0d8eb" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#78257C"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#f0d8eb"; }}
                      placeholder="Ceritakan kondisi kulit / tujuan..."
                    />
                  </label>
                </div>

                {selectedSlot && (
                  <div className="mt-4 rounded-2xl p-4 text-sm" style={{ background: "#FBF0F8", color: "#555" }}>
                    Slot dipilih:{" "}
                    <span className="font-semibold" style={{ color: "#78257C" }}>
                      {format(new Date(selectedSlot.startAt), "HH:mm")}–{format(new Date(selectedSlot.endAt), "HH:mm")}
                    </span>
                    {" · "}{selectedDayLabel}
                  </div>
                )}

                {state.status === "error" && (
                  <div className="mt-4 text-sm font-semibold text-red-600">{state.message}</div>
                )}
                {state.status === "success" && (
                  <div className="mt-4 rounded-2xl p-4 text-sm" style={{ background: "#f0fdf4", color: "#166534" }}>
                    ✅ Booking berhasil! ID: <span className="font-bold">{state.bookingNumber}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={!selectedSlotId || state.status === "submitting" || state.status === "loading"}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #665dac, #78257C)" }}
                >
                  {state.status === "submitting" ? "Memproses..." : "Konfirmasi Booking →"}
                </button>
              </div>

              {/* Notification note */}
              <div className="rounded-2xl p-4 text-xs" style={{ background: "#F0EBFA", color: "#665dac", border: "1px solid #ddd6fe" }}>
                <span className="font-bold">Notifikasi otomatis</span> — konfirmasi Email & WhatsApp dikirim setelah booking berhasil, dan reminder H-1 sebelum jadwal.
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
