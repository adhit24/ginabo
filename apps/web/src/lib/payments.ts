import type { PaymentProvider } from "@prisma/client";

export type PaymentCreateResult =
  | { type: "manual"; instructions: string }
  | { type: "redirect"; url: string; providerRef?: string };

export async function createProviderPayment(opts: {
  provider: PaymentProvider;
  order: { orderNumber: string; totalMinor: number; currency: "IDR" | "USD" };
}) : Promise<PaymentCreateResult> {
  if (opts.provider === "MANUAL") {
    return {
      type: "manual",
      instructions: `Pembayaran manual untuk order ${opts.order.orderNumber}. Admin akan menghubungi untuk konfirmasi.`
    };
  }

  return {
    type: "manual",
    instructions: `Provider ${opts.provider} belum dikonfigurasi. Sistem sudah siap untuk integrasi gateway (Midtrans/Xendit/Stripe).`
  };
}

