import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { bookingRuleSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = bookingRuleSchema.partial().safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const updated = await prisma.bookingAvailabilityRule.update({ where: { id: params.id }, data: parsed.data });
    return jsonOk({ id: updated.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.bookingAvailabilityRule.delete({ where: { id: params.id } });
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

