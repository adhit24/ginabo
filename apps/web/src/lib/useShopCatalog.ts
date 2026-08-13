"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/adminStore";

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

export const STATIC_PRODUCTS: ShopProduct[] = [
  {
    slug: "hydra-moist-gel", name: "Hydra Moist Gel",
    category: "skincare", tag: "Multifungsi", rating: "4.9", reviews: "178",
    price: "Rp 89.000", priceMinor: 89000, img: "/salmonfix.png",
  },
  {
    slug: "bright-care-moisture-cream", name: "Bright & Care Moisture Cream",
    category: "skincare", tag: "Barrier Care", rating: "4.9", reviews: "257",
    price: "Rp 79.999", priceMinor: 79999, img: "/moistfix.png",
  },
  {
    slug: "glowage-multi-active-serum", name: "GlowAge Multi-Active Serum",
    category: "skincare", tag: "Best Seller", rating: "4.9", reviews: "387",
    price: "Rp 89.999", priceMinor: 89999, img: "/serumfix.png",
  },
];

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

const BASE_CATALOG: ShopProduct[] = [...STATIC_PRODUCTS, ...STATIC_BUNDLES];

/**
 * Shared client-side product catalog (STATIC_PRODUCTS/STATIC_BUNDLES merged
 * with anything the admin store adds, deduped by slug) so the shop page and
 * the header search both read the exact same list.
 */
export function useShopCatalog(): ShopProduct[] {
  const [allProducts, setAllProducts] = useState<ShopProduct[]>(BASE_CATALOG);

  useEffect(() => {
    const storeProds = store.getProducts().map(p => ({
      slug: p.slug || p.id, name: p.name, category: "skincare",
      tag: p.tag || "", rating: p.rating, reviews: p.reviews,
      price: p.priceLabel ? `${p.priceLabel} ${p.priceVal}` : p.priceVal,
      priceMinor: p.priceMinor, img: p.img ?? "",
    }));
    const storeBundles = store.getBundles().map(p => ({
      slug: p.slug || p.id, name: p.name, category: "bundling",
      tag: "Bundling", rating: p.rating, reviews: p.reviews,
      price: p.priceVal, priceMinor: p.priceMinor, img: p.img ?? "",
      originalPrice: p.originalPrice,
    }));
    const existingSlugs = new Set(BASE_CATALOG.map(p => p.slug));
    const newProds = [...storeProds, ...storeBundles].filter(p => !existingSlugs.has(p.slug));
    if (newProds.length > 0) setAllProducts(prev => [...prev, ...newProds]);
  }, []);

  return allProducts;
}
