export const runtime = 'edge';

import type { PaymentProvider } from "@/lib/payments";

import { jsonError, jsonOk } from "@/lib/http";
import { generateOrderNumber } from "@/lib/ids";
import { supabase } from "@/lib/supabase";
import { createProviderPayment } from "@/lib/payments";
import { enqueueOrderNotifications } from "@/lib/notifications";
import { checkoutSchema } from "@/lib/validation";

type PaymentStatus = "REQUIRES_ACTION" | "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
type Currency = string;

function isDatabaseUnavailableError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("Environment variable not found: DATABASE_URL") || msg.includes("Can't reach database server") || msg.includes("P1001");
}

function normalizeString(v?: string) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const customerInput = parsed.data.customer;
    const email = normalizeString(customerInput.email ?? undefined);
    const phone = normalizeString(customerInput.phone ?? undefined);

    const providerKey = parsed.data.paymentProvider as PaymentProvider;
    if (!providerKey) return jsonError("Invalid payment provider", 400);
    const provider: PaymentProvider = providerKey;

    try {
      let customerId: string;

      if (email) {
        const { data: existing } = await supabase.from("Customer").select("*").eq("email", email).single();
        if (existing) {
          const { data: updated } = await supabase
            .from("Customer")
            .update({ name: customerInput.name, phone: phone ?? existing.phone })
            .eq("id", existing.id)
            .select()
            .single();
          customerId = updated!.id;
        } else {
          const { data: created } = await supabase
            .from("Customer")
            .insert({ name: customerInput.name, email, phone })
            .select()
            .single();
          customerId = created!.id;
        }
      } else if (phone) {
        const { data: existing } = await supabase.from("Customer").select("*").eq("phone", phone).single();
        if (existing) {
          const { data: updated } = await supabase
            .from("Customer")
            .update({ name: customerInput.name, email: email ?? existing.email })
            .eq("id", existing.id)
            .select()
            .single();
          customerId = updated!.id;
        } else {
          const { data: created } = await supabase
            .from("Customer")
            .insert({ name: customerInput.name, email, phone })
            .select()
            .single();
          customerId = created!.id;
        }
      } else {
        const { data: created } = await supabase
          .from("Customer")
          .insert({ name: customerInput.name })
          .select()
          .single();
        customerId = created!.id;
      }

      const { data: products } = await supabase
        .from("Product")
        .select("*")
        .in("id", parsed.data.items.map((i) => i.productId))
        .eq("isActive", true);

      if (!products || products.length !== parsed.data.items.length) {
        return jsonError("Produk tidak ditemukan", 400);
      }

      const productById = new Map(products.map((p) => [p.id, p]));
      const currency: Currency = products[0]?.currency ?? "IDR";

      let subtotalMinor = 0;
      const orderItems = parsed.data.items.map((item) => {
        const p = productById.get(item.productId);
        if (!p) throw new Error("Missing product");
        if (p.stockQty < item.quantity) throw new Error(`Stok tidak cukup untuk ${p.name}`);
        subtotalMinor += p.priceMinor * item.quantity;
        return {
          productId: p.id,
          productName: p.name,
          unitPriceMinor: p.priceMinor,
          quantity: item.quantity
        };
      });

      let orderNumber = generateOrderNumber();
      for (let i = 0; i < 3; i++) {
        const { data: exists } = await supabase.from("Order").select("id").eq("orderNumber", orderNumber).single();
        if (!exists) break;
        orderNumber = generateOrderNumber();
      }

      const { data: order, error: orderError } = await supabase
        .from("Order")
        .insert({
          orderNumber,
          status: "PENDING_PAYMENT",
          customerId,
          currency,
          subtotalMinor,
          totalMinor: subtotalMinor
        })
        .select()
        .single();

      if (orderError || !order) throw new Error(orderError?.message ?? "Failed to create order");

      const { error: itemsError } = await supabase
        .from("OrderItem")
        .insert(orderItems.map((item) => ({ ...item, orderId: order.id })));

      if (itemsError) throw new Error(itemsError.message);

      for (const item of parsed.data.items) {
        const p = productById.get(item.productId)!;
        const { error: stockError } = await supabase
          .from("Product")
          .update({ stockQty: p.stockQty - item.quantity })
          .eq("id", item.productId);
        if (stockError) throw new Error("Stok berubah, coba lagi");
      }

      const { data: payment, error: paymentError } = await supabase
        .from("Payment")
        .insert({
          orderId: order.id,
          provider,
          status: "REQUIRES_ACTION" as PaymentStatus,
          amountMinor: order.totalMinor,
          currency: order.currency
        })
        .select()
        .single();

      if (paymentError || !payment) throw new Error(paymentError?.message ?? "Failed to create payment");

      await enqueueOrderNotifications({
        orderNumber: order.orderNumber,
        customer: { name: customerInput.name, email, phone }
      });

      const paymentResult = await createProviderPayment({
        provider: payment.provider as PaymentProvider,
        order: { orderNumber: order.orderNumber, totalMinor: order.totalMinor, currency: order.currency }
      });

      return jsonOk({
        orderNumber: order.orderNumber,
        payment: { provider: payment.provider, status: payment.status, result: paymentResult }
      });
    } catch (e) {
      if (!isDatabaseUnavailableError(e)) throw e;

      const fallbackOrderNumber = generateOrderNumber();
      const paymentResult = await createProviderPayment({
        provider,
        order: { orderNumber: fallbackOrderNumber, totalMinor: 0, currency: "IDR" }
      });

      return jsonOk({
        orderNumber: fallbackOrderNumber,
        payment: { provider, status: "REQUIRES_ACTION" as PaymentStatus, result: paymentResult }
      });
    }
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
