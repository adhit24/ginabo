"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { Reveal } from "@/components/ui/Reveal";
import { useShopCatalog, ShopProduct } from "@/lib/useShopCatalog";
import { trackCustomerEvent } from "@/lib/analytics/events";

const EASE = [0.25, 1, 0.5, 1] as const;

export type ProductMediaCard = {
  url: string;
  alt: string;
  label: string;
  badge?: string;
};

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    priceMinor: number;
    currency: string;
    stockQty: number;
    weightGrams: number | null;
    images: Array<{ url: string; alt: string | null; sortOrder: number }>;
  };
};

// Generates rich gallery cards with descriptive captions & features for each product
function getProductGalleryCards(product: Props["product"]): ProductMediaCard[] {
  const slug = product.slug.toLowerCase();

  // If user provided multiple images in Supabase, use them with sensible labels
  if (product.images && product.images.length > 1) {
    const defaultLabels = [
      "Kemasan Utama",
      "Kandungan Aktif",
      "Tekstur & Formula",
      "Hasil Klinis",
      "Sebelum & Sesudah",
      "Sertifikasi BPOM",
    ];
    return product.images.map((img, idx) => ({
      url: img.url,
      alt: img.alt || `${product.name} - Gambar ${idx + 1}`,
      label: img.alt || defaultLabels[idx % defaultLabels.length],
      badge: idx === 0 ? "Utama" : undefined,
    }));
  }

  // Rich preset galleries based on product category/slug
  if (slug.includes("serum") || slug.includes("glowage")) {
    return [
      { url: "/product-serum-1.png", alt: "GlowAge Serum Botol Utama", label: "Kemasan Utama", badge: "Utama" },
      { url: "/product-serum-2.png", alt: "Brighten & Glow Formula", label: "Brighten & Glow", badge: "Formula" },
      { url: "/product-serum-3.png", alt: "Multi-Active Niacinamide & Alpha Arbutin", label: "Kandungan Aktif", badge: "9x Actives" },
      { url: "/product-serum-4.png", alt: "Hasil Uji Klinis Mencerahkan", label: "Hasil Klinis", badge: "Uji Nyata" },
      { url: "/BA_serum.jpg", alt: "Before & After Pemakaian 14 Hari", label: "Sebelum & Sesudah", badge: "Real Result" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal MUI", label: "Sertifikasi Resmi", badge: "BPOM & Halal" },
      { url: "/ginabo_prods.png", alt: "Rangkaian Ginabo Routine", label: "Rangkaian Perawatan", badge: "Daily Care" },
    ];
  }

  if (slug.includes("cream") || slug.includes("bright-care")) {
    return [
      { url: "/product-cream-1.png", alt: "Bright & Care Cream Utama", label: "Kemasan Utama", badge: "Utama" },
      { url: "/product-cream-2.png", alt: "Skin Barrier Moisture Lock", label: "Barrier Lock", badge: "Tekstur" },
      { url: "/product-cream-3.png", alt: "Deep Hydration Infusion", label: "Deep Hydration", badge: "Manfaat" },
      { url: "/product-cream-4.png", alt: "Soothing & Calming Effect", label: "Menenangkan Kulit", badge: "Soothing" },
      { url: "/BA_cream.jpg", alt: "Before & After Pemakaian Cream", label: "Sebelum & Sesudah", badge: "Real Result" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal MUI", label: "Sertifikasi Resmi", badge: "BPOM & Halal" },
    ];
  }

  if (slug.includes("dna") || slug.includes("hydra") || slug.includes("gel")) {
    return [
      { url: "/product-dna-1.png", alt: "Hydra Moist Gel Utama", label: "Kemasan Utama", badge: "Utama" },
      { url: "/product-dna-2.png", alt: "Salmon DNA 3-in-1 Hydration", label: "Salmon DNA 3-in-1", badge: "Premium Actives" },
      { url: "/product-dna-3.png", alt: "Instant Cooling & Calming Gel", label: "Cooling & Fresh", badge: "Tekstur Gel" },
      { url: "/product-dna-4.png", alt: "Skin Recovery Support", label: "Skin Recovery", badge: "Hasil Nyata" },
      { url: "/BA_dna.jpg", alt: "Before & After Pemakaian Hydra Gel", label: "Sebelum & Sesudah", badge: "Real Result" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal MUI", label: "Sertifikasi Resmi", badge: "BPOM & Halal" },
    ];
  }

  if (slug.includes("bundle") || slug.includes("set") || slug.includes("complete") || slug.includes("routine")) {
    const mainImg = product.images[0]?.url || "/essential.png";
    return [
      { url: mainImg, alt: product.name, label: "Paket Lengkap", badge: "Hemat 50%" },
      { url: "/ginabo_bundling_3.png", alt: "Komposisi Produk Bundling", label: "Isi Rangkaian", badge: "3-in-1 Set" },
      { url: "/gnb21.png", alt: "21 Days Skin Transformation", label: "21 Days Journey", badge: "Panduan" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal MUI", label: "Sertifikasi Resmi", badge: "BPOM & Halal" },
      { url: "/ginabo_prods.png", alt: "Rutinitas Skincare Lengkap", label: "Rutinitas AM/PM", badge: "Daily Routine" },
    ];
  }

  // Fallback single image
  const fallbackUrl = product.images[0]?.url || "/product-serum-1.png";
  return [
    { url: fallbackUrl, alt: product.name, label: "Kemasan Utama", badge: "Utama" },
    { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal MUI", label: "Sertifikasi Resmi", badge: "BPOM & Halal" },
    { url: "/ginabo_prods.png", alt: "Rangkaian Ginabo", label: "Rangkaian Produk", badge: "Ginabo" },
  ];
}

// Product certifications checklist
const CERTIFICATIONS = [
  "Hypoallergenic Certified",
  "Dermatologically Tested",
  "Non-Comedogenic Certified",
  "Suitable for Sensitive Skin",
  "BPOM Certified NA18251900160",
  "Halal MUI Certified",
];

const HOW_TO_USE_STEPS = [
  { step: 1, title: "Bersihkan Wajah", desc: "Bersihkan wajah terlebih dahulu dengan facial wash atau cleanser lembut, lalu keringkan perlahan." },
  { step: 2, title: "Aplikasikan Produk", desc: "Keluarkan 2–3 tetes atau secukupnya ke telapak tangan yang bersih atau langsung ke area wajah." },
  { step: 3, title: "Ratakan & Pijat Lembut", desc: "Ratakan ke seluruh wajah dan leher dengan gerakan memijat ke arah atas hingga menyerap sempurna." },
  { step: 4, title: "Lanjutkan Perawatan", desc: "Gunakan rutin pagi dan malam. Di pagi hari lanjutkan dengan sunscreen, di malam hari dengan moisturizer." },
];

const ACTIVE_INGREDIENTS = [
  { name: "Niacinamide (5%)", desc: "Mencerahkan noda hitam, meratakan warna kulit, dan menyamarkan pori-pori." },
  { name: "Alpha Arbutin", desc: "Membantu menekan produksi melanin berlebih untuk kulit tampak bercahaya." },
  { name: "Ceramide Complex", desc: "Mengunci kelembapan dan memperkuat lapisan skin barrier." },
  { name: "Salmon DNA / Peptide", desc: "Meremajakan sel kulit, menjaga elastisitas, dan mempercepat regenerasi." },
  { name: "Hyaluronic Acid", desc: "Memberikan hidrasi mendalam hingga ke lapisan kulit terdalam." },
];

const FULL_INGREDIENTS =
  "Aqua, Niacinamide, Alpha Arbutin, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Hydrolyzed DNA, Glycerin, Ascorbic Acid, Panthenol, Allantoin, Carbomer, Polysorbate 20, Sodium PCA, Xanthan Gum, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin.";

const FAQS = [
  { q: "Apakah produk ini cocok untuk kulit sensitif?", a: "Ya, seluruh produk Ginabo diformulasikan secara dermatologis (hypoallergenic & non-comedogenic) sehingga aman dan nyaman digunakan untuk kulit sensitif maupun berjerawat." },
  { q: "Bolehkah digunakan untuk ibu hamil dan menyusui?", a: "Formula Ginabo bebas dari paraben, alkohol keras, dan bahan berbahaya. Namun kami tetap menyarankan konsultasi dengan dokter kandungan terlebih dahulu." },
  { q: "Kapan waktu terbaik menggunakannya?", a: "Dapat digunakan setiap hari pada rutinitas pagi (AM) sebelum sunscreen dan malam (PM) sebelum tidur untuk hasil maksimal." },
  { q: "Berapa lama produk bertahan setelah dibuka?", a: "Produk bertahan hingga 12 bulan setelah dibuka (PAO 12M). Simpan di tempat sejuk dan terhindar dari paparan sinar matahari langsung." },
];

export function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const catalog = useShopCatalog();

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "how-to-use">("details");
  const [activeAccordion, setActiveAccordion] = useState<string | null>("ingredients");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Zoom magnifier states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const zoomBoxRef = useRef<HTMLDivElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const gallery = useMemo(() => getProductGalleryCards(product), [product]);
  const currentCard = gallery[activeImg] || gallery[0];

  // Original price & discount calculation
  const originalPriceMinor = useMemo(() => {
    return Math.round(product.priceMinor * 1.4); // 30% discount display
  }, [product.priceMinor]);

  const discountPercent = 30;

  // Tagline/Subtitle
  const subtitle = useMemo(() => {
    const slug = product.slug.toLowerCase();
    if (slug.includes("serum")) return "Brighten & Glow for Normal to Sensitive Skin";
    if (slug.includes("cream")) return "Deep Moisture Barrier & Soothing Recovery Cream";
    if (slug.includes("dna") || slug.includes("hydra")) return "3-in-1 Hydration Gel & Skin Revitalizing";
    if (slug.includes("bundle") || slug.includes("set")) return "Complete Daily Routine for Radiant & Healthy Skin";
    return "Dermatologically Tested Gentle Skincare";
  }, [product.slug]);

  // Related products
  const related = useMemo(
    () => catalog.filter(p => p.slug !== product.slug).slice(0, 8),
    [catalog, product.slug]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    trackCustomerEvent({ event_name: "product_viewed", product_id: product.id, metadata: { slug: product.slug } });
  }, [product.id, product.slug]);

  // Handle zoom cursor movement
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomBoxRef.current) return;
    const rect = zoomBoxRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  }

  function handlePrevImage() {
    setActiveImg((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  }

  function handleNextImage() {
    setActiveImg((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  }

  function scrollThumbnails(direction: "left" | "right") {
    if (!thumbnailScrollRef.current) return;
    const offset = direction === "left" ? -180 : 180;
    thumbnailScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  }

  function handleAddToCart() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceMinor: product.priceMinor,
      currency: (product.currency as "IDR" | "USD") ?? "IDR",
      imageUrl: gallery[0]?.url ?? null,
      weightGrams: product.weightGrams,
    }, qty);
    trackCustomerEvent({ event_name: "add_to_cart", product_id: product.id, metadata: { quantity: qty } });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  function handleAddRelatedToCart(item: ShopProduct) {
    addItem({
      productId: item.slug,
      slug: item.slug,
      name: item.name,
      priceMinor: item.priceMinor,
      currency: "IDR",
      imageUrl: item.img,
      weightGrams: 20,
    }, 1);
  }

  function shareUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShareOpen(false);
    } catch {}
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-[#303030]">
      {/* ── Top Announcement / Breadcrumb Bar ── */}
      <div className="border-b border-[#EAEAEA] bg-white py-3 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center flex-wrap gap-1.5 text-[12px] text-[#808080]">
            <Link href="/" className="hover:text-[#78257C] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#78257C] transition-colors">POPULAR PRODUCTS</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#78257C] transition-colors">Skincare</Link>
            <span>/</span>
            <span className="text-[#303030] font-medium truncate max-w-[240px] md:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Product Stage ── */}
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ── Left Column: Interactive Zoom & Swipeable Cards (5 cols on lg) ── */}
          <div className="lg:col-span-5 flex flex-col gap-4 sticky top-24">
            
            {/* 1. Main Zoom Card */}
            <div 
              ref={zoomBoxRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-[14px] bg-white border border-[#E5E5E5] shadow-sm overflow-hidden cursor-crosshair select-none group"
            >
              {/* Image Container with Dynamic Zoom */}
              <div className="relative w-full h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="w-full h-full relative"
                  >
                    <div
                      className="w-full h-full transition-transform duration-100 ease-out"
                      style={{
                        transform: isZoomed ? "scale(2.2)" : "scale(1)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }}
                    >
                      <Image
                        src={currentCard.url}
                        alt={currentCard.alt}
                        fill
                        priority
                        className="object-contain p-4 md:p-6 transition-all"
                        sizes="(max-width: 768px) 100vw, 45vw"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Zoom Hover Indicator Badge */}
              <div 
                className={`absolute top-3 left-3 pointer-events-none transition-opacity duration-200 ${
                  isZoomed ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white shadow-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  Hover untuk Zoom
                </span>
              </div>

              {/* Navigation Arrows for Main Image */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    aria-label="Foto sebelumnya"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-[#303030] hover:bg-white hover:text-[#78257C] transition-all opacity-80 hover:opacity-100 focus:outline-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    aria-label="Foto selanjutnya"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-[#303030] hover:bg-white hover:text-[#78257C] transition-all opacity-80 hover:opacity-100 focus:outline-none"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}

              {/* Centered Pagination Indicator `< 1 / 7 >` matching Somethinc */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center items-center pointer-events-none">
                <div className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-[12px] font-semibold text-[#303030] shadow-sm border border-[#EBEBEB]">
                  <span className="text-[#808080] font-normal">&lt;</span>
                  <span>{activeImg + 1} / {gallery.length}</span>
                  <span className="text-[#808080] font-normal">&gt;</span>
                </div>
              </div>
            </div>

            {/* 2. Swipable Thumbnail & Feature Info Cards */}
            <div className="relative">
              {/* Left Scroll Chevron */}
              <button
                onClick={() => scrollThumbnails("left")}
                aria-label="Geser kiri"
                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-[#78257C] hover:scale-105 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              {/* Cards Container with Touch Swipe / Drag */}
              <div
                ref={thumbnailScrollRef}
                className="flex gap-2.5 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth snap-x select-none"
                style={{ scrollbarWidth: "none" }}
              >
                {gallery.map((card, idx) => {
                  const isActive = activeImg === idx;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex-shrink-0 w-[76px] md:w-[84px] h-[92px] md:h-[100px] rounded-[10px] bg-white border transition-all flex flex-col items-center justify-between p-1.5 snap-start text-left overflow-hidden ${
                        isActive
                          ? "border-[#78257C] ring-2 ring-[#78257C]/20 shadow-md"
                          : "border-[#E5E5E5] hover:border-gray-300 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* Badge if present */}
                      {card.badge && (
                        <span className="absolute top-1 left-1 z-10 rounded-[3px] bg-[#78257C] px-1 py-0.2 text-[8px] font-bold text-white uppercase tracking-tight">
                          {card.badge}
                        </span>
                      )}

                      {/* Thumbnail Image */}
                      <div className="relative w-full flex-1 my-0.5">
                        <Image
                          src={card.url}
                          alt={card.alt}
                          fill
                          className="object-contain"
                          sizes="84px"
                        />
                      </div>

                      {/* Card Feature/Keterangan Label */}
                      <div className="w-full bg-[#F7F7F7] rounded-[4px] py-0.5 px-1 text-center">
                        <p className="truncate text-[9px] font-semibold text-[#404040]">
                          {card.label}
                        </p>
                      </div>

                      {/* Active Indicator Bar */}
                      {isActive && (
                        <motion.span
                          layoutId="active-thumb-bar"
                          className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#78257C]"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Right Scroll Chevron */}
              <button
                onClick={() => scrollThumbnails("right")}
                aria-label="Geser kanan"
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-[#78257C] hover:scale-105 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>

          {/* ── Right Column: Somethinc Replica Product Details (7 cols on lg) ── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Header: Title & Share Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-[22px] md:text-[28px] font-bold text-[#2A2A2A] leading-tight tracking-tight">
                  {product.name}
                </h1>
                <p className="text-[13px] md:text-[14px] text-[#707070] font-medium">
                  {subtitle}
                </p>
              </div>

              {/* Share Icon with Dropdown */}
              <div className="relative flex-shrink-0" ref={shareRef}>
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  aria-label="Share product"
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-[#666666] hover:text-[#78257C] px-3 py-1.5 rounded-full border border-[#E0E0E0] hover:border-[#78257C] transition bg-white shadow-xs"
                >
                  <span>Share</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>

                <AnimatePresence>
                  {shareOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: EASE }}
                      className="absolute right-0 top-full mt-2 z-30 w-52 rounded-[10px] border border-[#E5E5E5] bg-white p-1.5 shadow-xl"
                    >
                      <button
                        onClick={handleCopyLink}
                        className="flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-[12px] font-medium text-[#303030] hover:bg-[#F6EDF8] hover:text-[#78257C] transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" /></svg>
                        {copied ? "Tersalin!" : "Salin Tautan"}
                      </button>
                      <button
                        onClick={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${shareUrl()}`)}`)}
                        className="flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-[12px] font-medium text-[#303030] hover:bg-[#F6EDF8] hover:text-[#78257C] transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-10 4.5-10 10 0 1.77.46 3.44 1.27 4.89L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.5 0 10-4.5 10-10s-4.5-10-10-10Zm0 18.13c-1.64 0-3.16-.48-4.44-1.3l-.32-.19-3.11.82.83-3.03-.2-.31A8.1 8.1 0 0 1 3.93 12c0-4.48 3.64-8.13 8.11-8.13S20.15 7.52 20.15 12s-3.64 8.13-8.11 8.13Z" /></svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`)}
                        className="flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-[12px] font-medium text-[#303030] hover:bg-[#F6EDF8] hover:text-[#78257C] transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></svg>
                        Facebook
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Price Section matching Somethinc */}
            <div className="flex items-center flex-wrap gap-3 pt-1">
              <span className="text-[26px] md:text-[30px] font-extrabold text-[#78257C] tracking-tight">
                {formatPrice(product.priceMinor)}
              </span>
              <span className="text-[14px] md:text-[16px] text-gray-400 line-through font-normal">
                {formatPrice(originalPriceMinor)}
              </span>
              <span className="rounded-[4px] bg-[#FCE7F3] text-[#DB2777] px-2 py-0.5 text-[12px] font-bold">
                -{discountPercent}%
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[12px] font-semibold text-[#505050]">Quantity</span>
              <div className="flex items-center">
                <div className="inline-flex items-center rounded-full border border-[#D5D5D5] bg-white px-1 py-1 shadow-xs">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[16px] text-[#404040] hover:bg-[#F3F3F3] active:scale-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Kurangi jumlah"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-[14px] font-bold text-[#303030] select-none">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[16px] text-[#404040] hover:bg-[#F3F3F3] active:scale-90 transition"
                    aria-label="Tambah jumlah"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Large Primary Action: Add to Cart Button matching Somethinc purple button */}
            <div className="pt-2">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stockQty === 0}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`relative w-full flex items-center justify-center gap-2.5 rounded-[8px] py-4 text-[14px] font-bold text-white shadow-md transition-all ${
                  added
                    ? "bg-emerald-600 shadow-emerald-200"
                    : product.stockQty === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#78257C] hover:bg-[#681f6c] shadow-[#78257C]/20"
                }`}
              >
                {added ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Berhasil Ditambahkan ke Keranjang</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span>{product.stockQty === 0 ? "Stok Habis" : "Add to Cart"}</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* ── Segmented Pill Tabs: DETAILS & HOW TO USE (Somethinc Layout) ── */}
            <div className="mt-4 pt-4 border-t border-[#EAEAEA] flex flex-col gap-4">
              {/* Pill Tabs Switch */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`relative rounded-full px-5 py-2 text-[12px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === "details"
                      ? "bg-[#78257C]/10 text-[#78257C] border border-[#78257C]/30 shadow-xs"
                      : "bg-transparent text-[#707070] hover:text-[#303030] border border-transparent"
                  }`}
                >
                  DETAILS
                </button>
                <button
                  onClick={() => setActiveTab("how-to-use")}
                  className={`relative rounded-full px-5 py-2 text-[12px] font-bold uppercase tracking-wider transition-all ${
                    activeTab === "how-to-use"
                      ? "bg-[#78257C]/10 text-[#78257C] border border-[#78257C]/30 shadow-xs"
                      : "bg-transparent text-[#707070] hover:text-[#303030] border border-transparent"
                  }`}
                >
                  HOW TO USE
                </button>
              </div>

              {/* Pill Tab Content */}
              <div className="min-h-[160px]">
                <AnimatePresence mode="wait">
                  {activeTab === "details" ? (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="flex flex-col gap-3.5 text-[13px] leading-relaxed text-[#505050]"
                    >
                      {/* Product Description */}
                      <p>
                        {product.description ||
                          "Gentle Brightening Serum formulated with powerful brighteners, Alpha Arbutin + Niacinamide to reveal a radiant & more even skin tone. Minimizes dark spots, hyperpigmentation & pores. Can be used daily to strengthen the skin barrier for healthier, smoother skin. Suitable for all skin types & sensitive skin."}
                      </p>

                      {/* Checklist Certifications with Green Checkmarks matching Somethinc */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        {CERTIFICATIONS.map((cert, i) => (
                          <div key={i} className="flex items-center gap-2 text-[#303030] font-medium text-[12.5px]">
                            <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-emerald-50 text-emerald-600">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>

                      {product.weightGrams !== null && (
                        <p className="text-[12px] text-[#707070] pt-1">
                          Netto / Berat: <span className="font-semibold text-[#303030]">{product.weightGrams} gram</span>
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="how-to-use"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="flex flex-col gap-3"
                    >
                      <p className="text-[12.5px] text-[#606060] font-medium">
                        Langkah Penggunaan Rutin (AM / PM):
                      </p>
                      <div className="flex flex-col gap-3">
                        {HOW_TO_USE_STEPS.map((item) => (
                          <div key={item.step} className="flex items-start gap-3 text-[13px]">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#78257C] text-[11px] font-bold text-white">
                              {item.step}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#303030] text-[13px]">{item.title}</span>
                              <span className="text-[#666666] text-[12.5px] leading-relaxed">{item.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Accordion Sections: Ingredients & FAQ ── */}
            <div className="border-t border-[#EAEAEA] flex flex-col divide-y divide-[#EAEAEA]">
              {/* Ingredients Accordion */}
              <div className="py-3">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "ingredients" ? null : "ingredients")}
                  className="flex w-full items-center justify-between py-1 text-left text-[13px] font-bold text-[#303030] hover:text-[#78257C] transition"
                >
                  <span>KANDUNGAN &amp; BAHAN AKTIF</span>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`transition-transform duration-200 ${activeAccordion === "ingredients" ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <AnimatePresence>
                  {activeAccordion === "ingredients" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden pt-3 flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ACTIVE_INGREDIENTS.map((ing, i) => (
                          <div key={i} className="rounded-[8px] bg-[#F9F8FC] border border-[#EAE5F5] p-2.5">
                            <p className="text-[12px] font-bold text-[#78257C]">{ing.name}</p>
                            <p className="text-[11px] text-[#606060] leading-snug">{ing.desc}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#808080] leading-relaxed pt-1">
                        <span className="font-semibold text-[#505050]">Full Ingredients:</span> {FULL_INGREDIENTS}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* FAQ Accordion */}
              <div className="py-3">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "faq" ? null : "faq")}
                  className="flex w-full items-center justify-between py-1 text-left text-[13px] font-bold text-[#303030] hover:text-[#78257C] transition"
                >
                  <span>TANYA JAWAB (FAQ)</span>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`transition-transform duration-200 ${activeAccordion === "faq" ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <AnimatePresence>
                  {activeAccordion === "faq" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden pt-3 flex flex-col gap-2.5"
                    >
                      {FAQS.map((faq, i) => (
                        <div key={i} className="rounded-[8px] bg-white border border-[#EAEAEA] p-3 text-[12.5px]">
                          <p className="font-semibold text-[#303030] mb-1">{faq.q}</p>
                          <p className="text-[#606060] leading-relaxed">{faq.a}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Section: YOU MAY ALSO LIKE matching Somethinc ── */}
      {related.length > 0 && (
        <section className="border-t border-[#EAEAEA] bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-[18px] md:text-[22px] font-extrabold uppercase tracking-widest text-[#2A2A2A]">
                YOU MAY ALSO LIKE
              </h2>
              <p className="text-[13px] text-[#707070] mt-1">
                Kombinasi produk terbaik untuk hasil kulit maksimal
              </p>
            </div>

            {/* Horizontal Product Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.slice(0, 4).map((item) => (
                <div
                  key={item.slug}
                  className="group flex flex-col rounded-[12px] border border-[#EBEBEB] bg-white p-3 shadow-xs hover:shadow-md transition-all hover:border-[#78257C]/40 relative"
                >
                  {/* Discount badge */}
                  <span className="absolute top-3 right-3 z-10 rounded-[4px] bg-[#FCE7F3] text-[#DB2777] px-1.5 py-0.5 text-[10px] font-bold">
                    -30%
                  </span>

                  {/* Best Seller Tag */}
                  <span className="absolute top-3 left-3 z-10 rounded-[3px] bg-[#F5F5F5] border border-[#E0E0E0] text-[#606060] px-1.5 py-0.5 text-[9px] font-semibold">
                    Best Seller
                  </span>

                  {/* Product Image */}
                  <Link href={`/shop/${item.slug}`} className="relative aspect-square w-full rounded-[8px] bg-[#FAF8FC] overflow-hidden my-3 block">
                    <Image
                      src={item.img || "/product-serum-1.png"}
                      alt={item.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      sizes="220px"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex flex-col flex-1 gap-1">
                    <Link href={`/shop/${item.slug}`} className="line-clamp-2 text-[13px] font-semibold text-[#303030] group-hover:text-[#78257C] transition leading-snug">
                      {item.name}
                    </Link>
                    <div className="flex items-baseline gap-2 mt-auto pt-2">
                      <span className="text-[14px] font-bold text-[#78257C]">
                        {item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                          {item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Add To Cart Button */}
                  <button
                    onClick={() => handleAddRelatedToCart(item)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-[6px] bg-[#78257C] py-2 text-[12px] font-bold text-white hover:bg-[#681f6c] transition active:scale-95 shadow-xs"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" />
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3-Card Info Strip matching Somethinc ── */}
      <section className="border-t border-[#EAEAEA] bg-[#F7F5FA] py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {/* 1. Store Locator */}
            <Link href="/stores" className="flex items-center gap-4 p-4 rounded-[10px] bg-white border border-[#EBEBEB] hover:border-[#78257C]/40 transition group">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#78257C]/10 text-[#78257C] group-hover:scale-110 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#303030] uppercase tracking-wide">STORE LOCATOR</p>
                <p className="text-[11.5px] text-[#707070]">Temukan toko resmi online &amp; offline terdekat</p>
              </div>
            </Link>

            {/* 2. Become a Reseller */}
            <Link href="/reseller" className="flex items-center gap-4 p-4 rounded-[10px] bg-white border border-[#EBEBEB] hover:border-[#78257C]/40 transition group">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#78257C]/10 text-[#78257C] group-hover:scale-110 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#303030] uppercase tracking-wide">BECOME A RESELLER</p>
                <p className="text-[11.5px] text-[#707070]">Dapatkan komisi tinggi &amp; reward eksklusif</p>
              </div>
            </Link>

            {/* 3. FAQ */}
            <Link href="/faq" className="flex items-center gap-4 p-4 rounded-[10px] bg-white border border-[#EBEBEB] hover:border-[#78257C]/40 transition group">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#78257C]/10 text-[#78257C] group-hover:scale-110 transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#303030] uppercase tracking-wide">FAQ &amp; BANTUAN</p>
                <p className="text-[11.5px] text-[#707070]">Panduan lengkap seputar pesanan &amp; produk</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
