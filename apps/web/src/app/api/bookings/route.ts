import { jsonError, jsonOk } from "@/lib/http";
import { generateBookingNumber } from "@/lib/ids";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema } from "@/lib/validation";
import { enqueueBookingNotifications } from "@/lib/notifications";

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
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const customerInput = parsed.data.customer;
    const email = normalizeString(customerInput.email ?? undefined);
    const phone = normalizeString(customerInput.phone ?? undefined);
    const notes = normalizeString(parsed.data.notes ?? undefined);

    const result = await prisma
      .$transaction(async (tx) => {
        const slot = await tx.bookingSlot.findUnique({ where: { id: parsed.data.slotId } });
        if (!slot || !slot.isActive) return { ok: false as const, error: "Slot tidak tersedia" };

        const used = await tx.booking.count({ where: { slotId: slot.id, status: "CONFIRMED" } });
        if (used >= slot.capacity) return { ok: false as const, error: "Slot penuh" };

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

        let bookingNumber = generateBookingNumber();
        for (let i = 0; i < 3; i++) {
          const exists = await tx.booking.findUnique({ where: { bookingNumber } });
          if (!exists) break;
          bookingNumber = generateBookingNumber();
        }

        const booking = await tx.booking.create({
          data: {
            bookingNumber,
            status: "CONFIRMED",
            customerId,
            slotId: slot.id,
            notes
          }
        });

        await enqueueBookingNotifications({
          tx,
          bookingNumber: booking.bookingNumber,
          customer: { name: customerInput.name, email, phone },
          startAt: slot.startAt
        });

        return { ok: true as const, booking, slot };
      })
      .catch((e) => {
        if (!isDatabaseUnavailableError(e)) throw e;
        const slotId = parsed.data.slotId;
        const demoStartAt = slotId.startsWith("demo-") ? new Date(slotId.slice(5)) : new Date();
        const startAt = Number.isNaN(demoStartAt.getTime()) ? new Date() : demoStartAt;
        const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);
        return {
          ok: true as const,
          booking: { bookingNumber: generateBookingNumber() },
          slot: { startAt, endAt }
        };
      });

    if (!result.ok) return jsonError(result.error, 400);
    return jsonOk({
      bookingNumber: result.booking.bookingNumber,
      slot: { startAt: result.slot.startAt, endAt: result.slot.endAt }
    });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

