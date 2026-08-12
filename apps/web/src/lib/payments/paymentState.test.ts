import { describe, expect, it } from "vitest";

import { amountsMatch, parseMidtransAmount, resolvePaymentTransition, shouldFulfill, shouldUpdateOrderStatus } from "./paymentState";

describe("payment state", () => {
  it("accepts only exact integer gross amount", () => {
    expect(parseMidtransAmount("218000")).toBe(218000);
    expect(amountsMatch(218000, 218000)).toBe(true);
    expect(amountsMatch(218000, 217999)).toBe(false);
  });

  it("maps provider statuses and fulfills only once", () => {
    expect(resolvePaymentTransition("settlement")).toEqual({ orderStatus: "paid", paymentStatus: "success" });
    expect(resolvePaymentTransition("expire")).toEqual({ orderStatus: "cancelled", paymentStatus: "expired" });
    expect(shouldFulfill("pending", "paid")).toBe(true);
    expect(shouldFulfill("paid", "paid")).toBe(false);
    expect(shouldUpdateOrderStatus("paid", "pending")).toBe(false);
    expect(shouldUpdateOrderStatus("processing", "paid")).toBe(false);
  });
});
