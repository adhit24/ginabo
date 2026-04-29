import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { bookingSlotSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = bookingSlotSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const updated = await prisma.bookingSlot.update({
      where: { id: params.id },
      data: {
        startAt: parsed.data.startAt ? new Date(parsed.data.startAt) : undefined,
        endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : undefined,
        capacity: parsed.data.capacity,
        isActive: parsed.data.isActive
      }
    });
    return jsonOk({ id: updated.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.bookingSlot.delete({ where: { id: params.id } });
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

