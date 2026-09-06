"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { ProductQuickViewModal, type QuickViewProduct } from "@/components/product/ProductQuickViewModal";
import { AddedToCartModal, type AddedCartItem } from "@/components/cart/AddedToCartModal";
import { FlowButton } from "@/components/ui/flow-button";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: string;
  priceMinor?: number;
  originalPrice?: string;
  originalPriceMinor?: number;
  img: string;
  rating?: string;
  tag?: string;
  stockQty?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const isDiscounted = !!product.originalPrice;
  // stockQty is only populated for real DB-backed products; bundles/undefined
  // are treated as available since their stock isn't tracked in `products`.
  const isOutOfStock = product.stockQty === 0;
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addedItem, setAddedItem] = useState<AddedCartItem | null>(null);

  const quickViewProduct: QuickViewProduct = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    priceMinor: product.priceMinor ?? 0,
    originalPriceMinor:
      product.originalPriceMinor ?? (product.originalPrice ? Number(product.originalPrice.replace(/\D/g, "")) || undefined : undefined),
    currency: "IDR",
    imageUrl: product.img || null,
  };

  function handleAddToCart(item: QuickViewProduct, quantity: number) {
    addItem(
      { productId: item.productId, slug: item.slug, name: item.name, priceMinor: item.priceMinor, currency: item.currency, imageUrl: item.imageUrl },
      quantity
    );
    setQuickViewOpen(false);
    setAddedItem({ ...item, quantity });
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

        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="mt-2.5 w-full cursor-not-allowed rounded-full bg-gray-200 py-2 text-[13px] font-semibold text-gray-500"
          >
            Stok Habis
          </button>
        ) : (
          <FlowButton
            type="button"
            onClick={() => setQuickViewOpen(true)}
            text="Add to Cart"
            size="compact"
            className="mt-2.5 w-full"
          />
        )}
      </div>

      <ProductQuickViewModal
        open={quickViewOpen}
        product={quickViewProduct}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        formatPrice={formatPrice}
      />
      <AddedToCartModal open={!!addedItem} item={addedItem} onClose={() => setAddedItem(null)} formatPrice={formatPrice} />
    </div>
  );
}
