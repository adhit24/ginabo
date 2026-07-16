import { NextResponse, type NextRequest } from "next/server";

import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth";
import { MAINTENANCE_HTML } from "@/lib/maintenancePage";

// ─── Maintenance mode ─────────────────────────────────────────────────────────

/**
 * Storefront-wide kill switch. Flip to `false` and push to reopen — this is
 * a code constant (not an env var) so a single commit is enough to take the
 * site down or bring it back up, with no dashboard step required.
 */
const MAINTENANCE_MODE = true;

/** Paths that stay reachable even while the site is under maintenance. */
const MAINTENANCE_ALLOWLIST = ["/admin", "/api/admin", "/api/payment/webhook"] as const;

// ─── Route classification ────────────────────────────────────────────────────

/** Admin pages and API routes that require an admin session cookie. */
const ADMIN_PATHS = ["/admin", "/api/admin"] as const;

/** Admin paths that are always public (login flow, logout). */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/api/admin/auth/login",
  "/api/admin/auth/simple-login",
  "/api/admin/auth/logout",
] as const;

/**
 * Member / customer routes that require a Supabase auth session.
 * /cart and /checkout are transient — redirect to login preserving intent.
 */
const MEMBER_PATHS = ["/member", "/cart", "/checkout"] as const;

/**
 * API routes that must stay completely public even though they live inside
 * a normally-protected segment (e.g. payment webhooks).
 */
const PUBLIC_API_ALLOWLIST = ["/api/payment/webhook"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function startsWith(pathname: string, paths: readonly string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function redirectTo(req: NextRequest, pathname: string, preserveNext = true) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  if (preserveNext) url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// ─── Supabase session detection (cookie-based, no @supabase/ssr required) ───

/**
 * Returns true when the auth status flag cookie is present.
 * Set by AuthProvider on login, cleared on logout.
 */
function hasSupabaseSession(req: NextRequest): boolean {
  return !!req.cookies.get("ginabo-auth-status")?.value;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0. Maintenance mode — short-circuit everything except the allowlist.
  if (MAINTENANCE_MODE && !startsWith(pathname, MAINTENANCE_ALLOWLIST)) {
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "Retry-After": "3600",
        "X-Robots-Tag": "noindex",
        "Cache-Control": "no-store",
      },
    });
  }

  // 1. Always allow explicitly public API routes (webhooks, etc.)
  if (startsWith(pathname, PUBLIC_API_ALLOWLIST)) {
    return NextResponse.next();
  }

  // 2. Cloudflare CDN cache hints for product pages
  if (pathname.startsWith("/shop/")) {
    const res = NextResponse.next();
    res.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=3600");
    res.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res;
  }

  // 3. Admin area — JWT session cookie check
  if (startsWith(pathname, ADMIN_PATHS)) {
    if (startsWith(pathname, PUBLIC_ADMIN_PATHS)) return NextResponse.next();

    const token = req.cookies.get(getAdminSessionCookieName())?.value;
    if (!token) return redirectTo(req, "/admin/login");

    const session = await verifyAdminSessionToken(token);
    if (!session) return redirectTo(req, "/admin/login");

    return NextResponse.next();
  }

  // 4. Member / customer area — Supabase session check
  if (startsWith(pathname, MEMBER_PATHS)) {
    if (!hasSupabaseSession(req)) {
      return redirectTo(req, "/auth/login");
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Catch-all for maintenance mode (skips Next internals and static files).
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    // Admin pages and API
    "/admin/:path*",
    "/api/admin/:path*",
    // Member / checkout / cart
    "/member/:path*",
    "/checkout/:path*",
    "/cart/:path*",
    // Product pages (cache headers)
    "/shop/:path+",
    // Payment webhooks (allowlisted above, matcher needed to reach middleware)
    "/api/payment/:path*",
  ],
};
