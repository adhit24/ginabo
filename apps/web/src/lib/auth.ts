import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "ginabo_admin_session";

export function getAdminSessionCookieName() {
  return COOKIE_NAME;
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required");
  return new TextEncoder().encode(secret);
}

export type AdminSessionPayload = {
  sub: string;
  role: "ADMIN";
  email: string;
};

export async function createAdminSessionToken(payload: AdminSessionPayload) {
  const now = Math.floor(Date.now() / 1000);
  const secret = getAuthSecret();
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string) {
  const secret = getAuthSecret();
  // jwtVerify throws on any malformed, expired, or bad-signature token.
  // Every caller treats a null return as "not authenticated" (redirect to
  // login / 401), so an uncaught throw here escapes as an unhandled
  // exception instead — surfacing as a bare 500 with a stack trace for
  // callers (like /api/admin/me and the admin PATCH routes) that don't wrap
  // this call in their own try/catch.
  let payload: Record<string, unknown>;
  try {
    ({ payload } = await jwtVerify(token, secret));
  } catch {
    return null;
  }
  const sub = payload.sub;
  const role = payload.role;
  const email = payload.email;
  if (typeof sub !== "string") return null;
  if (role !== "ADMIN") return null;
  if (typeof email !== "string") return null;
  return { userId: sub, role: "ADMIN" as const, email };
}
