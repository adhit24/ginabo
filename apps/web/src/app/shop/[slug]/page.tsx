export const dynamicParams = false;

import { notFound } from "next/navigation";
import { getProductBySlug, listActiveProducts } from "@/lib/catalog";
import { ProductDetailClient } from "./ProductDetailClient";

export async function generateStaticParams() {
  const products = await listActiveProducts();
  return products.map((p: { slug: string }) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.isActive) notFound();

  return (
    <ProductDetailClient
      product={{
        id:          product.id,
        slug:        product.slug,
        name:        product.name,
        description: product.description ?? null,
        priceMinor:  product.priceMinor,
        currency:    product.currency,
        stockQty:    product.stockQty,
        images:      product.images ?? [],
      }}
    />
  );
}
