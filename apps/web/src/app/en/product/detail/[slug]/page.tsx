export const dynamicParams = false;

import { notFound } from "next/navigation";
import { getProductBySlug, listActiveProducts } from "@/lib/catalog";
import { ProductDetailClient } from "@/app/shop/[slug]/ProductDetailClient";

export async function generateStaticParams() {
  const products = await listActiveProducts();
  const bundles = [
    { slug: "ginabo-complete-skin" },
    { slug: "repair-glow-set" },
    { slug: "daily-barrier-routine-set" },
    { slug: "bright-renewal-set" }
  ];
  return [...products, ...bundles].map((p: { slug: string }) => ({ slug: p.slug }));
}

export default async function ProductDetailPageEn({ params }: { params: { slug: string } }) {
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
        comparePriceMinor: product.comparePriceMinor,
        currency:    product.currency,
        stockQty:    product.stockQty,
        weightGrams: product.weightGrams,
        images:      product.images ?? [],
      }}
    />
  );
}
