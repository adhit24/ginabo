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

      {/* Somethinc Signature Full Width Add To Cart Button */}
      <button
        onClick={handleAddToCart}
        className="gnb-cart-btn mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12px] font-bold text-white"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
          <path d="M3 6h18"></path>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span>Add to Cart</span>
      </button>
    </div>
  );
}
