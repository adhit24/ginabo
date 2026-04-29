import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { bookingRuleSchema } from "@/lib/validation";

export async function GET() {
  try {
    const rules = await prisma.bookingAvailabilityRule.findMany({ orderBy: { createdAt: "desc" } });
    return jsonOk(rules);
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookingRuleSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const created = await prisma.bookingAvailabilityRule.create({ data: parsed.data });
    return jsonOk({ id: created.id });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

