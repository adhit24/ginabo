import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.isActive) notFound();

  const imageUrl = product.images[0]?.url ?? null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-brand-50">
        <div className="relative aspect-[4/3]">
          {imageUrl ? (
            <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-gray-500">No image</div>
          )}
        </div>
      </div>

      <div className="grid content-start gap-4">
        <div className="grid gap-2">
          <Link href="/shop" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            ← Kembali ke Shop
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">{product.name}</h1>
          <div className="text-lg font-semibold text-gray-900">{formatMoney(product.priceMinor, product.currency)}</div>
        </div>

        <p className="text-sm leading-relaxed text-gray-700">{product.description}</p>

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">{product.stockQty > 0 ? `${product.stockQty} tersedia` : "Habis"}</div>
        </div>

        <AddToCartButton
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceMinor: product.priceMinor,
            currency: product.currency,
            imageUrl
          }}
        />
      </div>
    </div>
  );
}

