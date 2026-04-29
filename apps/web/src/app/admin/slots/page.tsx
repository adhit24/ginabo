"use client";

import { addDays, format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

type Rule = {
  id: string;
  title: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  capacity: number;
  timezone: string;
  isActive: boolean;
};

type Slot = {
  id: string;
  ruleId: string | null;
  startAt: string;
  endAt: string;
  capacity: number;
  isActive: boolean;
};

type State = { status: "loading" } | { status: "idle" } | { status: "error"; message: string };

export default function AdminSlotsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [state, setState] = useState<State>({ status: "loading" });

  const [rangeStart, setRangeStart] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [rangeEnd, setRangeEnd] = useState(() => format(addDays(new Date(), 14), "yyyy-MM-dd"));
  const [selectedRuleId, setSelectedRuleId] = useState<string>("");

  const [ruleTitle, setRuleTitle] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("18:00");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [capacity, setCapacity] = useState(1);

  const ruleById = useMemo(() => new Map(rules.map((r) => [r.id, r])), [rules]);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const [rulesRes, slotsRes] = await Promise.all([
        fetch("/api/admin/booking-rules"),
        fetch(`/api/admin/booking-slots?start=${rangeStart}&end=${rangeEnd}`)
      ]);
      const rulesJson = (await rulesRes.json()) as { ok: boolean; data?: Rule[]; error?: { message: string } };
      const slotsJson = (await slotsRes.json()) as { ok: boolean; data?: Slot[]; error?: { message: string } };
      if (!rulesJson.ok || !rulesJson.data) throw new Error(rulesJson.error?.message ?? "Failed to load rules");
      if (!slotsJson.ok || !slotsJson.data) throw new Error(slotsJson.error?.message ?? "Failed to load slots");
      const ruleList = rulesJson.data;
      const slotList = slotsJson.data;
      setRules(ruleList);
      setSlots(slotList);
      const firstRuleId = ruleList[0]?.id ?? "";
      setSelectedRuleId((prev) => prev || firstRuleId);
      setState({ status: "idle" });
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }, [rangeEnd, rangeStart]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createRule() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/admin/booking-rules", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: ruleTitle, weekday, startTime, endTime, slotDurationMinutes, capacity, timezone: "Asia/Jakarta", isActive: true })
      });
      const json = (await res.json()) as { ok: boolean; data?: { id: string }; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Create rule failed");
      setRuleTitle("");
      await load();
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  async function generateSlots() {
    if (!selectedRuleId) return;
    setState({ status: "loading" });
    try {
      const res = await fetch(
        `/api/admin/booking-slots?generateFromRuleId=${encodeURIComponent(selectedRuleId)}&generateStart=${encodeURIComponent(rangeStart)}&generateDays=30`,
        { method: "POST" }
      );
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) throw new Error(json.error?.message ?? "Generate failed");
      await load();
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">Slots</h1>
        <p className="text-sm text-gray-600">Manage availability rules, generate slot, dan lihat kalender slot.</p>
      </div>

      {state.status === "error" ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{state.message}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Availability Rules</div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-gray-900">Title</span>
              <input
                value={ruleTitle}
                onChange={(e) => setRuleTitle(e.target.value)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                placeholder="Konsultasi skin barrier"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-gray-900">Weekday</span>
                <select
                  value={weekday}
                  onChange={(e) => setWeekday(Number(e.target.value))}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-300"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-gray-900">Capacity</span>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                  min={1}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-gray-900">Start</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-gray-900">End</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-gray-900">Duration (minutes)</span>
              <input
                type="number"
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                min={10}
                max={240}
              />
            </label>

            <button
              type="button"
              onClick={createRule}
              disabled={state.status === "loading" || ruleTitle.trim().length < 2}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
            >
              Create Rule
            </button>

            <div className="mt-4 grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Existing Rules</div>
              <select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-300"
              >
                <option value="">Select rule</option>
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={generateSlots}
                disabled={state.status === "loading" || !selectedRuleId}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:border-gray-300 disabled:opacity-60"
              >
                Generate slots (30 days)
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Slot Calendar</div>
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-gray-900">Start</span>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-gray-900">End</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
                />
              </label>
            </div>
            <div className="grid max-h-[520px] gap-2 overflow-auto pr-1">
              {state.status === "loading" ? (
                <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">Memuat slots...</div>
              ) : slots.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">Belum ada slots di range ini.</div>
              ) : (
                slots.map((s) => {
                  const rule = s.ruleId ? ruleById.get(s.ruleId) : null;
                  const startLabel = format(new Date(s.startAt), "yyyy-MM-dd HH:mm");
                  const endLabel = format(new Date(s.endAt), "HH:mm");
                  return (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 p-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">
                          {startLabel}–{endLabel}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">{rule ? rule.title : "Manual slot"}</div>
                      </div>
                      <div className="text-sm text-gray-700">Cap: {s.capacity}</div>
                      <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">{s.isActive ? "ACTIVE" : "OFF"}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
