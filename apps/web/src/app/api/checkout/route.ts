import { PaymentProvider, PaymentStatus, type Currency } from "@prisma/client";

import { jsonError, jsonOk } from "@/lib/http";
import { generateOrderNumber } from "@/lib/ids";
import { prisma } from "@/lib/prisma";
import { createProviderPayment } from "@/lib/payments";
import { enqueueOrderNotifications } from "@/lib/notifications";
import { checkoutSchema } from "@/lib/validation";

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

    const provider = PaymentProvider[parsed.data.paymentProvider];
    if (!provider) return jsonError("Invalid payment provider", 400);

    const result = await prisma
      .$transaction(async (tx) => {
        let customerId: string;

        if (email) {
          const existing = await tx.customer.findUnique({ where: { email } });
          if (existing) {
            const updated = await tx.customer.update({
              where: { id: existing.id },
              data: { name: customerInput.name, phone: phone ?? existing.phone }
            });
            customerId = updated.id;
          } else {
            const created = await tx.customer.create({ data: { name: customerInput.name, email, phone } });
            customerId = created.id;
          }
        } else if (phone) {
          const existing = await tx.customer.findUnique({ where: { phone } });
          if (existing) {
            const updated = await tx.customer.update({
              where: { id: existing.id },
              data: { name: customerInput.name, email: email ?? existing.email }
            });
            customerId = updated.id;
          } else {
            const created = await tx.customer.create({ data: { name: customerInput.name, email, phone } });
            customerId = created.id;
          }
        } else {
          const created = await tx.customer.create({ data: { name: customerInput.name } });
          customerId = created.id;
        }

        const products = await tx.product.findMany({
          where: { id: { in: parsed.data.items.map((i) => i.productId) }, isActive: true },
          include: { images: { orderBy: { sortOrder: "asc" } } }
        });

        if (products.length !== parsed.data.items.length) return { ok: false as const, error: "Produk tidak ditemukan" };

        const productById = new Map(products.map((p) => [p.id, p]));
        const currency = products[0]?.currency ?? "IDR";

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
          const exists = await tx.order.findUnique({ where: { orderNumber } });
          if (!exists) break;
          orderNumber = generateOrderNumber();
        }

        const order = await tx.order.create({
          data: {
            orderNumber,
            status: "PENDING_PAYMENT",
            customerId,
            currency: currency as Currency,
            subtotalMinor,
            totalMinor: subtotalMinor,
            items: { create: orderItems }
          }
        });

        for (const item of parsed.data.items) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stockQty: { gte: item.quantity } },
            data: { stockQty: { decrement: item.quantity } }
          });
          if (updated.count !== 1) throw new Error("Stok berubah, coba lagi");
        }

        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            provider,
            status: PaymentStatus.REQUIRES_ACTION,
            amountMinor: order.totalMinor,
            currency: order.currency
          }
        });

        await enqueueOrderNotifications({
          tx,
          orderNumber: order.orderNumber,
          customer: { name: customerInput.name, email, phone }
        });

        return { ok: true as const, order, payment };
      })
      .catch((e) => {
        if (!isDatabaseUnavailableError(e)) throw e;
        return {
          ok: true as const,
          order: { orderNumber: generateOrderNumber(), totalMinor: 0, currency: "IDR" as Currency },
          payment: { provider, status: PaymentStatus.REQUIRES_ACTION }
        };
      });

    if (!result.ok) return jsonError(result.error, 400);

    const paymentResult = await createProviderPayment({
      provider: result.payment.provider,
      order: { orderNumber: result.order.orderNumber, totalMinor: result.order.totalMinor, currency: result.order.currency }
    });

    return jsonOk({
      orderNumber: result.order.orderNumber,
      payment: { provider: result.payment.provider, status: result.payment.status, result: paymentResult }
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}
