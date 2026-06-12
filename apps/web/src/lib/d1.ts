// @ts-nocheck — legacy Cloudflare D1 client, no longer used (replaced by Supabase)
import { getRequestContext } from "@cloudflare/next-on-pages";

type D1Row = Record<string, unknown>;

export function getD1Db(): D1Database | null {
  try {
    const { env } = getRequestContext();
    return (env as Record<string, unknown>).my_database as D1Database ?? null;
  } catch {
    return null;
  }
}

export async function d1ListActiveProducts(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT p.id, p.slug, p.name, p.description, p.priceMinor, p.currency, p.stockQty, p.isActive,
              i.url as imgUrl, i.alt as imgAlt, i.sortOrder as imgSortOrder
       FROM Product p
       LEFT JOIN ProductImage i ON i.productId = p.id AND i.sortOrder = 0
       WHERE p.isActive = 1
       ORDER BY p.rowid ASC`
    )
    .all<D1Row>();

  return results.map(r => ({
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    description: r.description as string,
    priceMinor: r.priceMinor as number,
    currency: r.currency as "IDR" | "USD",
    stockQty: r.stockQty as number,
    isActive: Boolean(r.isActive),
    images: r.imgUrl ? [{ url: r.imgUrl as string, alt: r.imgAlt as string | null, sortOrder: r.imgSortOrder as number }] : [],
  }));
}

export async function d1GetProductBySlug(db: D1Database, slug: string) {
  const product = await db
    .prepare("SELECT * FROM Product WHERE slug = ? AND isActive = 1 LIMIT 1")
    .bind(slug)
    .first<D1Row>();

  if (!product) return null;

  const { results: images } = await db
    .prepare("SELECT url, alt, sortOrder FROM ProductImage WHERE productId = ? ORDER BY sortOrder ASC")
    .bind(product.id)
    .all<{ url: string; alt: string | null; sortOrder: number }>();

  return {
    id: product.id as string,
    slug: product.slug as string,
    name: product.name as string,
    description: product.description as string,
    priceMinor: product.priceMinor as number,
    currency: product.currency as "IDR" | "USD",
    stockQty: product.stockQty as number,
    isActive: Boolean(product.isActive),
    images,
  };
}
