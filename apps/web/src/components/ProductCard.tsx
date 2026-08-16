"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";

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
  const { addItem } = useCart();

  const isDiscounted = !!product.originalPrice;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    // Parse numeric price from label if possible
    const numPrice = parseInt(product.price.replace(/[^0-9]/g, "")) || 90000;
    
    addItem({
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      priceMinor: numPrice,
      currency: "IDR",
      imageUrl: product.img,
      weightGrams: 20,
    }, 1);
  }

  return (
    <div className="group flex flex-col rounded-[6px] border border-[#EDEDED] bg-white p-3 hover:shadow-md transition relative">
      
      {/* Top Left: Best Seller Tag */}
      <span className="absolute top-2.5 left-2.5 z-10 rounded-[3px] bg-[#E0F2FE] text-[#0284C7] px-1.5 py-0.5 text-[9.5px] font-bold select-none">
        Best Seller
      </span>

      {/* Top Right: Discount Pill */}
      {isDiscounted && (
        <span className="absolute top-2.5 right-2.5 z-10 rounded-[3px] bg-[#FCE4EC] text-[#E91E63] px-1.5 py-0.5 text-[10px] font-bold select-none">
          {product.tag || "30% Off"}
        </span>
      )}

      {/* Product Image */}
      <Link href={`/shop/${product.slug}`} className="relative aspect-square w-full rounded-[4px] bg-[#FAF8FC] overflow-hidden my-2 block">
        {product.img ? (
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 240px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] text-gray-400">
            Belum ada foto
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 gap-1">
        <Link 
          href={`/shop/${product.slug}`} 
          className="line-clamp-2 text-[13.5px] font-bold text-[#231F20] hover:text-[#8E51B8] transition leading-snug"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-[14.5px] font-bold text-[#E91E63]">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[11.5px] text-[#A0A0A0] line-through font-normal">
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Somethinc Signature Full Width Add To Cart Button */}
      <button
        onClick={handleAddToCart}
        className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-[4px] bg-[#8E51B8] hover:bg-[#78257C] py-2 text-[12px] font-bold text-white transition shadow-none"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" />
        </svg>
        <span>Add to Cart</span>
      </button>
    </div>
  );
}
