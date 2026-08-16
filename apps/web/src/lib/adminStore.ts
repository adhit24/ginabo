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

// Credentials live in env vars only (server-side, never exposed to the browser
// bundle or committed to source). Set ADMIN_USERNAME and ADMIN_PASSWORD in
// Vercel environment variables — there is no fallback, so login fails closed
// if they're unset rather than accepting a guessable default.
export function getAdminCreds() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required");
  }
  return { username, password };
}

export const DEFAULT_PRODUCTS: GProduct[] = [
  { id: "p1", slug: "hydra-moist-gel",            name: "Hydra Moist\nGel Ultimate",       priceVal: "Rp 120.000", priceMinor: 120000, img: "/Hydra Moist Gel Ultimate.png", rating: "5.0", reviews: "127", tag: "DNA Salmon · 30ml" },
  { id: "p2", slug: "bright-care-moisture-cream", name: "Bright & Care\nMoisture Cream",  priceVal: "Rp 75.000",  priceMinor: 75000,  img: "/Bright & Care Moisture Cream.png",  rating: "5.0", reviews: "127", tag: "Moisturizer · 10g"  },
  { id: "p3", slug: "glowage-multi-active-serum", name: "GlowAge Multi-\nActive Serum",   priceVal: "Rp 90.000",  priceMinor: 90000,  img: "/GlowAge Multi Active Serum.png",  rating: "5.0", reviews: "127", tag: "Serum · 30ml"       },
];

export const DEFAULT_BUNDLES: GProduct[] = [
  { id: "b2", slug: "repair-glow-set",            name: "Repair &\nGlow Set",                  priceVal: "Rp 207.999", priceMinor: 207999, originalPrice: "Rp 415.999", img: "/Hydra_Moist_Gel_Ultimate_GlowAge_Multi_Active_Serum.png",  rating: "5.0", reviews: "127" },
  { id: "b3", slug: "daily-barrier-routine-set",  name: "Daily Skin\nBarrier Set",              priceVal: "Rp 197.999", priceMinor: 197999, originalPrice: "Rp 395.999", img: "/Hydra_Moist_Gel_Ultimate&Bright_Care_Moisture_Cream.png", rating: "5.0", reviews: "127" },
  { id: "b4", slug: "bright-renewal-set",         name: "Bright\nRenewal Set",                  priceVal: "Rp 169.999", priceMinor: 169999, originalPrice: "Rp 339.999", img: "/GlowAge_Multi_Active_Serum&Bright_Care_Moisture_Cream.png", rating: "5.0", reviews: "127" },
  { id: "b1", slug: "ginabo-complete-skin",       name: "Ginabo Complete\nSkin Nutrition Set", priceVal: "Rp 287.999", priceMinor: 287999, originalPrice: "Rp 575.999", img: "/Hydra_Moist_Gel_Ultimate_GlowAge_Multi_Active_Serum_Bright_Care_Moisture_Cream.png",    rating: "5.0", reviews: "127" },
];

export const DEFAULT_FLASH: GFlashItem[] = [
  { id: "p3", name: "GlowAge Multi-Active Serum",   type: "Serum · 30ml",      salePrice: "Rp 228.000", salePriceMinor: 228000, original: "Rp 285.000", discount: "20%", img: "/GlowAge Multi Active Serum.png"  },
  { id: "p2", name: "Bright & Care Moisture Cream", type: "Moisturizer · 10g", salePrice: "Rp 146.000", salePriceMinor: 146000, original: "Rp 195.000", discount: "25%", img: "/Bright & Care Moisture Cream.png"  },
  { id: "p1", name: "Hydra Moist Gel Ultimate",     type: "DNA Salmon · 30ml", salePrice: "Rp 150.000", salePriceMinor: 150000, original: "Rp 215.000", discount: "30%", img: "/Hydra Moist Gel Ultimate.png" },
];

type GStorageType = GProduct[] | GFlashItem[] | boolean;

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
  getBundles:       ()              => {
    const cached = read<GProduct[]>("ginabo_bundles", DEFAULT_BUNDLES);
    if (cached && cached.length > 0 && cached[0].id === "b1") {
      write("ginabo_bundles", DEFAULT_BUNDLES);
      return DEFAULT_BUNDLES;
    }
    return cached;
  },
  setBundles:       (b: GProduct[]) => write("ginabo_bundles",  b),
  getFlash:         ()              => read<GFlashItem[]>("ginabo_flashsale",       DEFAULT_FLASH),
  setFlash:         (f: GFlashItem[]) => write("ginabo_flashsale", f),
  isAdminLoggedIn:  ()              => read<boolean>     ("ginabo_admin_session",   false),
  setAdminSession:  (v: boolean)    => write("ginabo_admin_session", v),
};

export function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
