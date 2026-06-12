import { NextResponse } from "next/server";

export function GET() {
  const body = `User-agent: *
Allow: /

# Block admin and member areas
Disallow: /admin/
Disallow: /member/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/
Disallow: /order/
Disallow: /auth/

# Allow static assets
Allow: /_next/static/
Allow: /images/
Allow: /fonts/

Sitemap: https://ginabo.id/sitemap.xml`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
