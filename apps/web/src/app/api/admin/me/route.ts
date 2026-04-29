import { cookies } from "next/headers";

import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) return jsonError("Unauthorized", 401);

  const session = await verifyAdminSessionToken(token);
  if (!session) return jsonError("Unauthorized", 401);

  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) return jsonError("Unauthorized", 401);

  return jsonOk({ user: { id: user.id, email: user.email, role: user.role } });
}
