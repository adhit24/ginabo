"use client";

import Link from "next/link";
import Image from "next/image";

export type ProductCardData = {
  slug: string;
  name: string;
  price: string;
  originalPrice?: string;
  img: string;
  rating?: string;
  tag?: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const isDiscounted = !!product.originalPrice;

  return (
    <div className="gnb-flat-card group flex flex-col relative">
      
      {/* Top Right: Discount Pill */}
      {isDiscounted && (
        <span className="absolute top-2.5 right-2.5 z-10 gnb-discount-badge text-[10px] font-bold text-white shadow-xs select-none">
          {product.tag ? product.tag.replace("-", "").replace("%", "").trim() + "% Off" : "50% Off"}
        </span>
      )}

      {/* Product Image */}
      <Link href={`/shop/${product.slug}`} className="gnb-img-wrap relative aspect-square w-full bg-transparent block">
        {product.img ? (
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-gray-400">
            Belum ada foto
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 gap-1 pt-3">
        <span className="gnb-best-seller-badge">Best Seller</span>
        <Link 
          href={`/shop/${product.slug}`} 
          className="line-clamp-2 text-[13.5px] font-bold text-[#231F20] hover:text-[#8E51B8] transition leading-snug"
        >
          {product.name}
        </Link>
        <div className="gnb-price-row mt-auto pt-2">
          <span className="gnb-price-now">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="gnb-price-old">
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
