import { describe, expect, it } from "vitest";

import { amountsMatch, parsePaymentAmount, resolvePaymentTransition, shouldFulfill, shouldUpdateOrderStatus } from "./paymentState";

describe("payment state", () => {
  it("accepts only exact integer gross amount", () => {
    expect(parsePaymentAmount("218000")).toBe(218000);
    expect(amountsMatch(218000, 218000)).toBe(true);
    expect(amountsMatch(218000, 217999)).toBe(false);
  });

  it("maps DOKU and Midtrans provider statuses correctly", () => {
    expect(resolvePaymentTransition("SUCCESS")).toEqual({ orderStatus: "paid", paymentStatus: "success" });
    expect(resolvePaymentTransition("PAID")).toEqual({ orderStatus: "paid", paymentStatus: "success" });
    expect(resolvePaymentTransition("settlement")).toEqual({ orderStatus: "paid", paymentStatus: "success" });
    expect(resolvePaymentTransition("FAILED")).toEqual({ orderStatus: "cancelled", paymentStatus: "failed" });
    expect(resolvePaymentTransition("EXPIRED")).toEqual({ orderStatus: "cancelled", paymentStatus: "expired" });
    expect(resolvePaymentTransition("CANCELLED")).toEqual({ orderStatus: "cancelled", paymentStatus: "expired" });
    expect(shouldFulfill("pending", "paid")).toBe(true);
    expect(shouldFulfill("paid", "paid")).toBe(false);
    expect(shouldUpdateOrderStatus("paid", "pending")).toBe(false);
    expect(shouldUpdateOrderStatus("processing", "paid")).toBe(false);
  });
});
