"use client";

import Link from "next/link";

export type ProductCardData = {
  slug: string;
  name: string;
  price: string;
  originalPrice?: string;
  img: string;
  rating?: string;
  tag?: string;
};

function StarRating({ rating }: { rating?: string }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-[12px] text-gray-400">{rating}</span>
    </div>
  );
}

// Single shared product card — the whole card is a link to the product
// detail page (no add-to-cart button), matching the Somethinc pattern the
// redesign is based on. Used by both the shop grid and the homepage catalog.
export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-brand-100 bg-white transition-shadow hover:shadow-[0_4px_20px_rgba(91,75,138,0.10)]"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        <img
          src={product.img}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.tag && (
          <span
            className={`absolute left-2 top-2 rounded-[3px] px-2 py-0.5 text-[10px] font-bold text-white ${
              product.tag.includes("OFF") ? "bg-red-500" : "bg-brand-700"
            }`}
          >
            {product.tag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-[11px] text-gray-400">Ginabo</p>
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-brand-900">{product.name}</p>
        <StarRating rating={product.rating} />
        <div className="mt-auto pt-1">
          {product.originalPrice && (
            <p className="text-[11px] text-gray-400 line-through">{product.originalPrice}</p>
          )}
          <p className="text-[14px] font-bold text-brand-700">{product.price}</p>
        </div>
      </div>
    </Link>
  );
}
