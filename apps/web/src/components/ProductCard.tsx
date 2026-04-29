import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/lib/money";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: "IDR" | "USD";
  imageUrl: string | null;
  discountPct?: number;
  rating?: number;
};

function StarRating({ rating = 0 }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-[10px] text-gray-400">{rating > 0 ? rating.toFixed(1) : "0"}</span>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = product.discountPct ?? 0;
  const originalMinor = discount > 0 ? Math.round(product.priceMinor / (1 - discount / 100)) : 0;
  const rating = product.rating ?? 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        {discount > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-400 px-1.5 py-0.5 text-[11px] font-extrabold text-white">
            {discount}%
          </span>
        )}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-gray-400">No image</div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/shop/${product.slug}`}>
          <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-800 hover:text-brand-700">
            {product.name}
          </p>
        </Link>

        {/* Price */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-brand-700">
            {formatMoney(product.priceMinor, product.currency)}
          </span>
          {discount > 0 && (
            <span className="text-[11px] text-gray-400 line-through">
              {formatMoney(originalMinor, product.currency)}
            </span>
          )}
        </div>

        {/* Rating */}
        <StarRating rating={rating} />

        {/* Buttons */}
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceMinor: product.priceMinor,
              currency: product.currency,
              imageUrl: product.imageUrl
            }}
          />
          <Link
            href={`/shop/${product.slug}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-300 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Beli Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

