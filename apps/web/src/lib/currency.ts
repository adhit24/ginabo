// Static placeholder FX rate — update manually, or replace with a live rate
// API later. Kept as a plain constant rather than a 3rd-party integration
// so the currency switcher works without any external dependency.
export const USD_IDR_RATE = 15800;

/** Converts a whole-Rupiah amount into USD cents (formatMoney's USD minor unit). */
export function convertIdrToUsdMinor(amountIdr: number): number {
  return Math.round((amountIdr / USD_IDR_RATE) * 100);
}
