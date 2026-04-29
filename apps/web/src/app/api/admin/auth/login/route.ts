import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createAdminSessionToken, getAdminSessionCookieName } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid input", 400, parsed.error.flatten());

    const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (!user) return jsonError("Email atau password salah", 401);

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return jsonError("Email atau password salah", 401);

    const token = await createAdminSessionToken({ sub: user.id, role: "ADMIN", email: user.email });
    const cookieStore = await cookies();
    cookieStore.set(getAdminSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return jsonOk({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    return jsonError("Server error", 500, e instanceof Error ? e.message : String(e));
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: { message: "Method not allowed" } }, { status: 405 });
}
