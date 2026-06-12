import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const BASE_URL = "https://ginabo.id";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/shop", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/booking", priority: "0.8", changefreq: "weekly" },
  { path: "/reseller", priority: "0.7", changefreq: "monthly" },
  { path: "/21days", priority: "0.8", changefreq: "weekly" },
  { path: "/campaign", priority: "0.7", changefreq: "weekly" },
];

export async function GET() {
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const productUrls = (products ?? []).map(
    (p) => `
  <url>
    <loc>${BASE_URL}/shop/${p.slug}</loc>
    <lastmod>${p.updated_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  );

  const staticUrls = STATIC_PAGES.map(
    (p) => `
  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("")}
${productUrls.join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
