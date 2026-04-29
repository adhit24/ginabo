import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as { status?: string; paymentStatus?: string };
    const status = typeof body.status === "string" ? body.status : undefined;
    const paymentStatus = typeof body.paymentStatus === "string" ? body.paymentStatus : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: params.id } });
      if (!order) return null;

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: status ? { status: status as any } : {}
      });

      if (paymentStatus) {
        const payment = await tx.payment.findFirst({ where: { orderId: order.id }, orderBy: { createdAt: "desc" } });
        if (payment) {
          await tx.payment.update({ where: { id: payment.id }, data: { status: paymentStatus as any } });
        }
      }

      return updatedOrder;
    });

    if (!updated) return jsonError("Not found", 404);
    return jsonOk({ id: updated.id, status: updated.status });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

