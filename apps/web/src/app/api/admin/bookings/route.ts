import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema } from "@/lib/validation";
import { generateBookingNumber } from "@/lib/ids";

function normalizeString(v?: string) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status")?.trim();

    const bookings = await prisma.booking.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(q
          ? {
              OR: [
                { bookingNumber: { contains: q, mode: "insensitive" } },
                { customer: { name: { contains: q, mode: "insensitive" } } },
                { customer: { email: { contains: q, mode: "insensitive" } } },
                { customer: { phone: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {})
      },
      include: { customer: true, slot: true },
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return jsonOk(
      bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        status: b.status,
        createdAt: b.createdAt,
        notes: b.notes,
        slot: { id: b.slotId, startAt: b.slot.startAt, endAt: b.slot.endAt, capacity: b.slot.capacity, isActive: b.slot.isActive },
        customer: { id: b.customerId, name: b.customer.name, email: b.customer.email, phone: b.customer.phone }
      }))
    );
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
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

    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.bookingSlot.findUnique({ where: { id: parsed.data.slotId } });
      if (!slot || !slot.isActive) return { ok: false as const, error: "Slot tidak tersedia" };

      const used = await tx.booking.count({ where: { slotId: slot.id, status: "CONFIRMED" } });
      if (used >= slot.capacity) return { ok: false as const, error: "Slot penuh" };

      let customerId: string;
      if (email) {
        const existing = await tx.customer.findUnique({ where: { email } });
        customerId = existing
          ? (
              await tx.customer.update({
                where: { id: existing.id },
                data: { name: customerInput.name, phone: phone ?? existing.phone }
              })
            ).id
          : (await tx.customer.create({ data: { name: customerInput.name, email, phone } })).id;
      } else if (phone) {
        const existing = await tx.customer.findUnique({ where: { phone } });
        customerId = existing
          ? (
              await tx.customer.update({
                where: { id: existing.id },
                data: { name: customerInput.name, email: email ?? existing.email }
              })
            ).id
          : (await tx.customer.create({ data: { name: customerInput.name, email, phone } })).id;
      } else {
        customerId = (await tx.customer.create({ data: { name: customerInput.name } })).id;
      }

      let bookingNumber = generateBookingNumber();
      for (let i = 0; i < 3; i++) {
        const exists = await tx.booking.findUnique({ where: { bookingNumber } });
        if (!exists) break;
        bookingNumber = generateBookingNumber();
      }

      const booking = await tx.booking.create({
        data: { bookingNumber, status: "CONFIRMED", customerId, slotId: slot.id, notes }
      });

      return { ok: true as const, booking };
    });

    if (!result.ok) return jsonError(result.error, 400);
    return jsonOk({ bookingNumber: result.booking.bookingNumber, id: result.booking.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

