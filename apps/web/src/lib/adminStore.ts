export interface GProduct {
  id: string;
  name: string;
  priceVal: string;
  priceMinor: number;
  priceLabel?: string;
  originalPrice?: string;
  img: string;
  rating: string;
  reviews: string;
  tag?: string;
  slug?: string;
  role?: string;
  benefits?: string[];
  ingredients?: string[];
}

export interface GFlashItem {
  id: string;
  name: string;
  type: string;
  salePrice: string;
  salePriceMinor: number;
  original: string;
  discount: string;
  img: string;
}

// Credentials live in env vars (server-side only — never exposed to browser bundle)
// Set ADMIN_USERNAME and ADMIN_PASSWORD in Vercel environment variables
export const ADMIN_CREDS = {
  username: typeof process !== "undefined" ? (process.env.ADMIN_USERNAME ?? "ginabo_admin") : "ginabo_admin",
  password: typeof process !== "undefined" ? (process.env.ADMIN_PASSWORD ?? "") : "",
};

export const DEFAULT_PRODUCTS: GProduct[] = [
  { id: "p1", name: "Hydra Moist\nGel Ultimate",      priceVal: " 120K", priceMinor: 120000, priceLabel: "IDR", img: "/gel.png",         rating: "5.0", reviews: "127", tag: "DNA Salmon · 30ml" },
  { id: "p2", name: "Bright & Care\nMoisture Cream",  priceVal: " 75K",  priceMinor: 75000,  priceLabel: "IDR", img: "/bright_care.png", rating: "5.0", reviews: "127", tag: "Moisturizer · 10g"  },
  { id: "p3", name: "GlowAge Multi-\nActive Serum",   priceVal: " 90K",  priceMinor: 90000,  priceLabel: "IDR", img: "/serum.png",       rating: "5.0", reviews: "127", tag: "Serum · 30ml"       },
];

export const DEFAULT_BUNDLES: GProduct[] = [
  { id: "b1", name: "Ginabo Complete\nSkin Nutrition Set", priceVal: "Rp 287.999", priceMinor: 287999, originalPrice: "Rp 575.999", img: "/ginabo_bundling_3.png",          rating: "5.0", reviews: "127" },
  { id: "b2", name: "Repair &\nGlow Set",                  priceVal: "Rp 207.999", priceMinor: 207999, originalPrice: "Rp 415.999", img: "/bundling_repair_and_glow.png",   rating: "5.0", reviews: "127" },
  { id: "b3", name: "Daily Skin\nBarrier Set",              priceVal: "Rp 197.999", priceMinor: 197999, originalPrice: "Rp 395.999", img: "/bundling_daily_skin_barrier.png", rating: "5.0", reviews: "127" },
  { id: "b4", name: "Bright\nRenewal Set",                  priceVal: "Rp 169.999", priceMinor: 169999, originalPrice: "Rp 339.999", img: "/bundling_bright_renewal.png",    rating: "5.0", reviews: "127" },
];

export const DEFAULT_FLASH: GFlashItem[] = [
  { id: "p3", name: "GlowAge Multi-Active Serum",   type: "Serum · 30ml",      salePrice: "Rp 228.000", salePriceMinor: 228000, original: "Rp 285.000", discount: "20%", img: "/serum.png"       },
  { id: "p2", name: "Bright & Care Moisture Cream", type: "Moisturizer · 10g", salePrice: "Rp 146.000", salePriceMinor: 146000, original: "Rp 195.000", discount: "25%", img: "/bright_care.png" },
  { id: "p1", name: "Hydra Moist Gel Ultimate",     type: "DNA Salmon · 30ml", salePrice: "Rp 150.000", salePriceMinor: 150000, original: "Rp 215.000", discount: "30%", img: "/gel.png"         },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (!parsed) return fallback;
    return parsed;
  } catch { return fallback; }
}

function write<T>(key: string, value: T) {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); } catch {}
}

export const store = {
  getProducts:      ()              => read<GProduct[]>  ("ginabo_products",       DEFAULT_PRODUCTS),
  setProducts:      (p: GProduct[]) => write("ginabo_products", p),
  getBundles:       ()              => read<GProduct[]>  ("ginabo_bundles",        DEFAULT_BUNDLES),
  setBundles:       (b: GProduct[]) => write("ginabo_bundles",  b),
  getFlash:         ()              => read<GFlashItem[]>("ginabo_flashsale",       DEFAULT_FLASH),
  setFlash:         (f: GFlashItem[]) => write("ginabo_flashsale", f),
  isAdminLoggedIn:  ()              => read<boolean>     ("ginabo_admin_session",   false),
  setAdminSession:  (v: boolean)    => write("ginabo_admin_session", v),
};

export function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
