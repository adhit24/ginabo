import type { OrderStatus, PaymentStatus } from "@/types/database";

export function parsePaymentAmount(value: string | number): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("Nominal pembayaran tidak valid");
  return amount;
}

export function amountsMatch(expected: number, received: number): boolean {
  return Number.isSafeInteger(expected) && Number.isSafeInteger(received) && expected === received;
}

export function resolvePaymentTransition(
  transactionStatus: string,
  fraudStatus?: string,
): { orderStatus: OrderStatus | null; paymentStatus: PaymentStatus } {
  const status = transactionStatus.toLowerCase().trim();

  // DOKU payment success states
  if (
    ["success", "paid", "settled", "settlement"].includes(status) ||
    (status === "capture" && (fraudStatus === "accept" || !fraudStatus))
  ) {
    return { orderStatus: "paid", paymentStatus: "success" };
  }

  if (status === "capture" && fraudStatus === "challenge") {
    return { orderStatus: null, paymentStatus: "challenge" };
  }

  if (status === "pending") {
    return { orderStatus: "pending", paymentStatus: "pending" };
  }

  if (["deny", "failure", "failed"].includes(status)) {
    return { orderStatus: "cancelled", paymentStatus: "failed" };
  }

  if (["cancel", "cancelled", "expire", "expired"].includes(status)) {
    return { orderStatus: "cancelled", paymentStatus: "expired" };
  }

  return { orderStatus: null, paymentStatus: "pending" };
}

export function shouldFulfill(orderStatus: OrderStatus, nextOrderStatus: OrderStatus | null): boolean {
  return orderStatus !== "paid" && orderStatus !== "processing" && orderStatus !== "shipped" && orderStatus !== "delivered" && nextOrderStatus === "paid";
}

export function shouldUpdateOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return false;
  if (["processing", "shipped", "delivered", "completed"].includes(current)) return false;
  if (current === "paid" && next !== "processing") return false;
  if (current === "cancelled" && next !== "cancelled") return false;
  return true;
}
