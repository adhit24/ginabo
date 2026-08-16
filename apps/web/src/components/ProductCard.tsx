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
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-[13px] font-medium text-[#7C7C7C]">{rating}</span>
    </div>
  );
}

// Single shared product card mimicking Somethinc clean typography
export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-[#EBEBEB] bg-white transition-all hover:shadow-[0_8px_24px_rgba(120,37,124,0.12)] hover:border-[#78257C]/40"
    >
      <div className="relative aspect-square overflow-hidden bg-[#FAF8FC]">
        {product.img ? (
          <img
            src={product.img}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={`flex h-full w-full items-center justify-center text-[13px] text-gray-400 ${product.img ? "hidden" : ""}`}>
          Belum ada foto
        </div>
        {product.tag && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-[4px] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs ${
              product.tag.includes("OFF") || product.tag.includes("%")
                ? "bg-[#DB2777]"
                : "bg-[#78257C]"
            }`}
          >
            {product.tag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-[12px] font-bold uppercase tracking-wider text-[#7C7C7C]">Ginabo</p>
        <p className="line-clamp-2 text-[15px] font-bold leading-snug text-[#292929] group-hover:text-[#78257C] transition">
          {product.name}
        </p>
        <StarRating rating={product.rating} />
        <div className="mt-auto pt-2 flex flex-col">
          {product.originalPrice && (
            <p className="text-[12.5px] text-[#A0A0A0] line-through font-normal leading-tight">{product.originalPrice}</p>
          )}
          <p className="text-[16px] font-extrabold text-[#78257C] leading-snug">{product.price}</p>
        </div>
      </div>
    </Link>
  );
}
