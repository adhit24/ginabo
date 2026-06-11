import { NextResponse, type NextRequest } from "next/server";

import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";

const adminPaths = ["/admin", "/api/admin"];
const publicAdminPaths = ["/admin/login", "/api/admin/auth/login", "/api/admin/auth/simple-login", "/api/admin/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/shop/")) {
    const res = NextResponse.next();
    res.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=3600");
    res.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res;
  }

  const isAdminArea = adminPaths.some((p) => pathname.startsWith(p));
  if (!isAdminArea) return NextResponse.next();

  const isPublic = publicAdminPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPublic) return NextResponse.next();

  const token = req.cookies.get(getAdminSessionCookieName())?.value;
  if (!token) return redirectToLogin(req);

  const session = await verifyAdminSessionToken(token);
  if (!session) return redirectToLogin(req);

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/shop/:path+"]
};
