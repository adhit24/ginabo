import { format } from "date-fns";

function randomBlock(len: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function generateOrderNumber(now = new Date()) {
  return `ORD-${format(now, "yyyyMMdd")}-${randomBlock(6)}`;
}

export function generateBookingNumber(now = new Date()) {
  return `BKG-${format(now, "yyyyMMdd")}-${randomBlock(6)}`;
}
