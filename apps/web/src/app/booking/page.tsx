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
    return () => {
      cancelled = true;
    };
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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid gap-4">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">Booking</h1>
          <p className="text-sm text-gray-600">Pilih slot konsultasi. Slot otomatis tertutup saat penuh.</p>
        </div>

        <div className="grid gap-3 rounded-3xl border border-gray-100 bg-white p-6">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-gray-900">Tanggal</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
            />
          </label>

          <div className="grid gap-2">
            <div className="text-sm font-semibold text-gray-900">Slot tersedia</div>
            <div className="text-sm text-gray-600">{selectedDayLabel}</div>
            <div className="grid gap-2">
              {state.status === "loading" ? (
                <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">Memuat slot...</div>
              ) : slots.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">Belum ada slot untuk tanggal ini.</div>
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
                      className={[
                        "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm",
                        disabled ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400" : "border-gray-200 bg-white hover:border-gray-300",
                        active ? "border-brand-400 bg-brand-50" : ""
                      ].join(" ")}
                    >
                      <span className="font-semibold">{label}</span>
                      <span className="text-xs">{disabled ? "Penuh" : `${s.remaining} slot`}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Data Customer</div>
          <p className="mt-1 text-sm text-gray-600">Data ini otomatis masuk ke database (CRM light).</p>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-gray-900">Nama</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                placeholder="Nama lengkap"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-gray-900">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                placeholder="email@contoh.com"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-gray-900">Phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                placeholder="+62..."
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-gray-900">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                placeholder="Ceritakan kondisi kulit / tujuan..."
              />
            </label>
          </div>

          {selectedSlot ? (
            <div className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm text-gray-700">
              Slot dipilih:{" "}
              <span className="font-semibold">
                {format(new Date(selectedSlot.startAt), "HH:mm")}–{format(new Date(selectedSlot.endAt), "HH:mm")}
              </span>
            </div>
          ) : null}

          {state.status === "error" ? <div className="mt-4 text-sm font-semibold text-red-600">{state.message}</div> : null}
          {state.status === "success" ? (
            <div className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm text-gray-700">
              Booking berhasil. ID: <span className="font-semibold">{state.bookingNumber}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={!selectedSlotId || state.status === "submitting" || state.status === "loading"}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          >
            {state.status === "submitting" ? "Memproses..." : "Konfirmasi Booking"}
          </button>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Notifikasi</div>
          <p className="mt-1 text-sm text-gray-600">
            Sistem menyiapkan job notifikasi Email dan WhatsApp untuk booking confirmed dan reminder H-1 (API-ready).
          </p>
        </div>
      </div>
    </div>
  );
}
