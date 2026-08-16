"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/adminStore";
import { listActiveProducts } from "@/lib/catalog";

export type ShopProduct = {
  slug: string;
  name: string;
  category: string;
  tag: string;
  rating: string;
  reviews: string;
  price: string;
  priceMinor: number;
  img: string;
  originalPrice?: string;
};

export const STATIC_BUNDLES: ShopProduct[] = [
  {
    slug: "ginabo-complete-skin", name: "Ginabo Complete Skin Nutrition Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "127",
    price: "Rp 287.999", priceMinor: 287999, originalPrice: "Rp 575.999", img: "/essential.png",
  },
  {
    slug: "repair-glow-set", name: "Repair & Glow Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "89",
    price: "Rp 207.999", priceMinor: 207999, originalPrice: "Rp 415.999", img: "/repair_glow.png",
  },
  {
    slug: "daily-barrier-routine-set", name: "Daily Skin Barrier Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "76",
    price: "Rp 197.999", priceMinor: 197999, originalPrice: "Rp 395.999", img: "/skin_barrier.png",
  },
  {
    slug: "bright-renewal-set", name: "Bright Renewal Set",
    category: "bundling", tag: "50% OFF", rating: "5.0", reviews: "63",
    price: "Rp 169.999", priceMinor: 169999, originalPrice: "Rp 339.999", img: "/bright_renewal.png",
  },
];

/**
 * Shared client-side product catalog: live products from Supabase (source of
 * truth for /shop/[slug] and checkout) merged with the still-localStorage
 * bundle catalog, deduped by slug, so the shop page and header search read
 * the same list. Products are no longer read from adminStore — editing them
 * happens in /admin/products, which now writes to Supabase directly.
 */
export function useShopCatalog(): ShopProduct[] {
  const [allProducts, setAllProducts] = useState<ShopProduct[]>(STATIC_BUNDLES);

  useEffect(() => {
    let cancelled = false;

    listActiveProducts()
      .then((products) => {
        if (cancelled) return;
        const liveProducts: ShopProduct[] = products.map((p) => ({
          slug: p.slug, name: p.name, category: "skincare",
          tag: p.averageRating != null ? "Best Seller" : "",
          rating: p.averageRating != null ? p.averageRating.toFixed(1) : "5.0",
          reviews: String(p.reviewCount),
          price: `Rp ${p.priceMinor.toLocaleString("id-ID")}`,
          priceMinor: p.priceMinor,
          img: p.images[0]?.url ?? "",
        }));

        const storeBundles = store.getBundles().map(p => ({
          slug: p.slug || p.id, name: p.name, category: "bundling",
          tag: "Bundling", rating: p.rating, reviews: p.reviews,
          price: p.priceVal, priceMinor: p.priceMinor, img: p.img ?? "",
          originalPrice: p.originalPrice,
        }));
        const existingBundleSlugs = new Set(STATIC_BUNDLES.map(p => p.slug));
        const newBundles = storeBundles.filter(p => !existingBundleSlugs.has(p.slug));

        setAllProducts([...liveProducts, ...STATIC_BUNDLES, ...newBundles]);
      })
      .catch(() => {
        // Live catalog unavailable — fall back to bundles only rather than crashing the page.
        if (!cancelled) setAllProducts(STATIC_BUNDLES);
      });

    return () => { cancelled = true; };
  }, []);

  return allProducts;
}
