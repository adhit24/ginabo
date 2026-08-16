import type { OrderStatus, PaymentStatus } from "@/types/database";

export function parseMidtransAmount(value: string): number {
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("gross_amount tidak valid");
  return amount;
}

export function amountsMatch(expected: number, received: number): boolean {
  return Number.isSafeInteger(expected) && Number.isSafeInteger(received) && expected === received;
}

export function resolvePaymentTransition(transactionStatus: string, fraudStatus?: string): { orderStatus: OrderStatus | null; paymentStatus: PaymentStatus } {
  if (transactionStatus === "settlement" || (transactionStatus === "capture" && (fraudStatus === "accept" || !fraudStatus))) {
    return { orderStatus: "paid", paymentStatus: "success" };
  }
  if (transactionStatus === "capture" && fraudStatus === "challenge") return { orderStatus: null, paymentStatus: "challenge" };
  if (transactionStatus === "pending") return { orderStatus: "pending", paymentStatus: "pending" };
  if (["deny", "failure"].includes(transactionStatus)) return { orderStatus: "cancelled", paymentStatus: "failed" };
  if (["cancel", "expire"].includes(transactionStatus)) return { orderStatus: "cancelled", paymentStatus: "expired" };
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
