export function formatMoney(amountMinor: number, currency: "IDR" | "USD" = "IDR") {
  const amount = currency === "IDR" ? Math.round(amountMinor) : Math.round(amountMinor) / 100;
  const maximumFractionDigits = currency === "IDR" ? 0 : 2;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits }).format(amount);
}

export function toMinorUnits(amount: number, currency: "IDR" | "USD" = "IDR") {
  return currency === "IDR" ? Math.round(amount) : Math.round(amount * 100);
}
