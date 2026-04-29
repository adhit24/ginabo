import { addMinutes, isAfter, parse } from "date-fns";

export function generateSlotsForDay(opts: {
  date: Date;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}) {
  const start = parse(opts.startTime, "HH:mm", opts.date);
  const end = parse(opts.endTime, "HH:mm", opts.date);
  const slots: { startAt: Date; endAt: Date }[] = [];
  if (isAfter(start, end)) return slots;

  let cursor = start;
  while (true) {
    const next = addMinutes(cursor, opts.slotDurationMinutes);
    if (isAfter(next, end) || +next === +cursor) break;
    slots.push({ startAt: cursor, endAt: next });
    cursor = next;
  }
  return slots;
}

