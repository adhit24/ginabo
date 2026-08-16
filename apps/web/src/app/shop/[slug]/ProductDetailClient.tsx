"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useShopCatalog, ShopProduct } from "@/lib/useShopCatalog";
import { trackCustomerEvent } from "@/lib/analytics/events";

const EASE = [0.25, 1, 0.5, 1] as const;

export type ProductMediaCard = {
  url: string;
  alt: string;
  label: string;
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

function getProductGalleryCards(product: Props["product"]): ProductMediaCard[] {
  const slug = product.slug.toLowerCase();

  if (product.images && product.images.length > 1) {
    return product.images.map((img, idx) => ({
      url: img.url,
      alt: img.alt || `${product.name} - ${idx + 1}`,
      label: img.alt || `Gambar ${idx + 1}`,
    }));
  }

  if (slug.includes("serum") || slug.includes("glowage")) {
    return [
      { url: "/product-serum-1.png", alt: "GlowAge Multi-Active Serum", label: "Kemasan Utama" },
      { url: "/product-serum-2.png", alt: "Brighten & Glow Formula", label: "Brighten & Glow" },
      { url: "/product-serum-3.png", alt: "Kandungan Aktif Niacinamide", label: "Kandungan Aktif" },
      { url: "/product-serum-4.png", alt: "Hasil Uji Klinis", label: "Hasil Klinis" },
      { url: "/BA_serum.jpg", alt: "Before & After Pemakaian", label: "Sebelum & Sesudah" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
      { url: "/ginabo_prods.png", alt: "Rangkaian Produk Ginabo", label: "Rangkaian Perawatan" },
    ];
  }

  if (slug.includes("cream") || slug.includes("bright-care")) {
    return [
      { url: "/product-cream-1.png", alt: "Bright & Care Moisture Cream", label: "Kemasan Utama" },
      { url: "/product-cream-2.png", alt: "Skin Barrier Moisture Lock", label: "Barrier Lock" },
      { url: "/product-cream-3.png", alt: "Deep Hydration Infusion", label: "Deep Hydration" },
      { url: "/product-cream-4.png", alt: "Soothing & Calming Effect", label: "Menenangkan Kulit" },
      { url: "/BA_cream.jpg", alt: "Before & After Pemakaian", label: "Sebelum & Sesudah" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
    ];
  }

  if (slug.includes("dna") || slug.includes("hydra") || slug.includes("gel")) {
    return [
      { url: "/product-dna-1.png", alt: "Hydra Moist Gel Ultimate", label: "Kemasan Utama" },
      { url: "/product-dna-2.png", alt: "Salmon DNA 3-in-1", label: "Salmon DNA 3-in-1" },
      { url: "/product-dna-3.png", alt: "Cooling & Fresh Gel", label: "Cooling & Fresh" },
      { url: "/product-dna-4.png", alt: "Skin Recovery Support", label: "Skin Recovery" },
      { url: "/BA_dna.jpg", alt: "Before & After Pemakaian", label: "Sebelum & Sesudah" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
    ];
  }

  if (slug.includes("bundle") || slug.includes("set") || slug.includes("complete")) {
    const mainImg = product.images[0]?.url || "/essential.png";
    return [
      { url: mainImg, alt: product.name, label: "Paket Lengkap" },
      { url: "/ginabo_bundling_3.png", alt: "Komposisi Produk Bundling", label: "Isi Rangkaian" },
      { url: "/gnb21.png", alt: "21 Days Skin Transformation", label: "21 Days Journey" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
      { url: "/ginabo_prods.png", alt: "Rutinitas Skincare Lengkap", label: "Rutinitas AM/PM" },
    ];
  }

  const fallbackUrl = product.images[0]?.url || "/product-serum-1.png";
  return [
    { url: fallbackUrl, alt: product.name, label: "Kemasan Utama" },
    { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
    { url: "/ginabo_prods.png", alt: "Rangkaian Ginabo", label: "Rangkaian Produk" },
  ];
}

const CERTIFICATIONS = [
  "Hypoallergenic Certified",
  "Dermatologically Tested",
  "Non-Comedogenic Certified",
  "Suitable for Sensitive Skin",
  "BPOM Certified NA18251900160",
  "Halal MUI Certified",
];

const HOW_TO_USE_STEPS = [
  "Bersihkan wajah terlebih dahulu dengan cleanser lembut.",
  "Keluarkan 2–3 tetes atau secukupnya ke telapak tangan yang bersih.",
  "Ratakan ke seluruh wajah dan leher dengan gerakan memijat ke arah atas hingga menyerap sempurna.",
  "Gunakan rutin pagi dan malam hari. Di pagi hari lanjutkan dengan sunscreen, di malam hari dengan moisturizer.",
];

type IngredientItem = {
  name: string;
  desc: string;
};

function getActiveIngredients(slug: string): { items: IngredientItem[]; full: string } {
  const s = slug.toLowerCase();
  if (s.includes("cream") || s.includes("bright-care")) {
    return {
      items: [
        { name: "9x Ceramides Complex", desc: "Mengunci kelembapan mendalam dan memperkuat pertahanan lapisan skin barrier." },
        { name: "Hyaluronates Infusion", desc: "Memberikan kelembapan kenyal tahan lama tanpa rasa lengket di kulit." },
        { name: "Centella Asiatica (Cica)", desc: "Menenangkan kemerahan dan meredakan iritasi pada kulit sensitif." },
        { name: "Niacinamide", desc: "Mencerahkan warna kulit kusam dan menyamarkan noda hitam secara bertahap." },
      ],
      full: "Aqua, Caprylic/Capric Triglyceride, Glycerin, Butylene Glycol, Cetearyl Alcohol, Niacinamide, Ceramide NP, Ceramide NS, Ceramide EOS, Ceramide EOP, Ceramide AP, Centella Asiatica Extract, Sodium Hyaluronate, Tocopheryl Acetate, Allantoin, Panthenol, Dimethicone, Phenoxyethanol, Ethylhexylglycerin.",
    };
  }

  if (s.includes("dna") || s.includes("hydra") || s.includes("gel")) {
    return {
      items: [
        { name: "Salmon DNA 3-in-1", desc: "Nutrisi regeneratif tinggi untuk menjaga elastisitas dan kekenyalan kulit." },
        { name: "Multi-Hyaluronic Acid", desc: "Memberikan hidrasi instan dengan sensasi dingin segar yang menenangkan." },
        { name: "Niacinamide", desc: "Menjaga kulit tetap cerah, segar, dan terlindungi dari stres lingkungan." },
      ],
      full: "Aqua, Glycerin, Butylene Glycol, Niacinamide, Hydrolyzed Salmon DNA, Sodium Hyaluronate, Trehalose, Aloe Barbadensis Leaf Extract, Allantoin, Carbomer, Triethanolamine, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin.",
    };
  }

  // Default to Serum / Active Brightening
  return {
    items: [
      { name: "Niacinamide (5%)", desc: "Mencerahkan noda hitam, meratakan warna kulit, dan menyamarkan pori-pori." },
      { name: "Alpha Arbutin", desc: "Membantu menekan produksi melanin berlebih untuk kulit tampak bercahaya." },
      { name: "Ceramide Complex", desc: "Mengunci kelembapan dan memperkuat lapisan skin barrier." },
      { name: "Salmon DNA / Peptide", desc: "Meremajakan sel kulit, menjaga elastisitas, dan mempercepat regenerasi." },
      { name: "Hyaluronic Acid", desc: "Memberikan hidrasi mendalam hingga ke lapisan kulit terdalam." },
    ],
    full: "Aqua, Niacinamide, Alpha Arbutin, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Hydrolyzed DNA, Glycerin, Ascorbic Acid, Panthenol, Allantoin, Carbomer, Polysorbate 20, Sodium PCA, Xanthan Gum, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin.",
  };
}

export function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const catalog = useShopCatalog();

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "how-to-use">("details");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(true);

  // Zoom magnifier states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const zoomBoxRef = useRef<HTMLDivElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const gallery = useMemo(() => getProductGalleryCards(product), [product]);
  const currentCard = gallery[activeImg] || gallery[0];

  const originalPriceMinor = useMemo(() => {
    return Math.round(product.priceMinor * 1.4);
  }, [product.priceMinor]);

  const discountPercent = 30;

  const subtitle = useMemo(() => {
    const slug = product.slug.toLowerCase();
    if (slug.includes("serum")) return "Brighten & Glow for Normal to Sensitive Skin";
    if (slug.includes("cream")) return "Deep Moisture Barrier & Soothing Recovery Cream";
    if (slug.includes("dna") || slug.includes("hydra")) return "3-in-1 Hydration Gel & Skin Revitalizing";
    if (slug.includes("bundle") || slug.includes("set")) return "Complete Daily Routine for Radiant & Healthy Skin";
    return "Brighten & Glow for Normal to Sensitive Skin";
  }, [product.slug]);

  const activeIngredients = useMemo(() => getActiveIngredients(product.slug), [product.slug]);

  const related = useMemo(
    () => catalog.filter(p => p.slug !== product.slug).slice(0, 4),
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

  function scrollThumbnailsRight() {
    if (!thumbnailScrollRef.current) return;
    thumbnailScrollRef.current.scrollBy({ left: 160, behavior: "smooth" });
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
    setTimeout(() => setAdded(false), 2000);
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
    <div className="min-h-screen bg-white font-sans antialiased text-[#231F20]">
      {/* ── Breadcrumb Bar (Somethinc replica) ── */}
      <div className="bg-white py-3 px-4 md:px-8 border-b border-[#F0F0F0]">
        <div className="mx-auto max-w-[1140px]">
          <nav className="flex items-center flex-wrap gap-1.5 text-[13px] md:text-[14px] text-[#707070]">
            <Link href="/" className="hover:text-[#8E51B8] transition">Home</Link>
            <span className="text-[#A0A0A0]">/</span>
            <Link href="/shop" className="hover:text-[#8E51B8] transition">POPULAR PRODUCTS</Link>
            <span className="text-[#A0A0A0]">/</span>
            <Link href="/shop" className="hover:text-[#8E51B8] transition">Skincare</Link>
            <span className="text-[#A0A0A0]">/</span>
            <span className="text-[#231F20] font-bold truncate max-w-[260px] md:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Product Section ── */}
      <main className="mx-auto max-w-[1140px] px-4 md:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ── Left Column: Main Image Zoom + Horizontal Thumbnails (5 cols) ── */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-3">
            
            {/* 1. Main Zoom Card */}
            <div 
              ref={zoomBoxRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-[8px] bg-white border border-[#E8E8E8] overflow-hidden cursor-crosshair select-none group"
            >
              <div className="relative w-full h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="w-full h-full relative"
                  >
                    <div
                      className="w-full h-full transition-transform duration-100 ease-out"
                      style={{
                        transform: isZoomed ? "scale(2.5)" : "scale(1)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }}
                    >
                      <Image
                        src={currentCard.url}
                        alt={currentCard.alt}
                        fill
                        priority
                        className="object-contain p-6 md:p-8 transition-all"
                        sizes="(max-width: 768px) 100vw, 480px"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Prev / Next Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    aria-label="Foto sebelumnya"
                    className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#707070] hover:text-[#8E51B8] shadow-sm transition opacity-0 group-hover:opacity-100"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    aria-label="Foto selanjutnya"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#707070] hover:text-[#8E51B8] shadow-sm transition opacity-0 group-hover:opacity-100"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </>
              )}

              {/* Pagination Indicator `< 1 / 7 >` */}
              <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center pointer-events-none">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-[#707070] bg-white/90 backdrop-blur-xs px-3 py-0.5 rounded-full shadow-xs border border-[#EBEBEB]">
                  <span className="text-[#A0A0A0]">&lt;</span>
                  <span>{activeImg + 1} / {gallery.length}</span>
                  <span className="text-[#A0A0A0]">&gt;</span>
                </div>
              </div>
            </div>

            {/* 2. Horizontal Thumbnail Gallery */}
            <div className="relative flex items-center">
              <div
                ref={thumbnailScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-none py-1 scroll-smooth w-full select-none"
                style={{ scrollbarWidth: "none" }}
              >
                {gallery.map((card, idx) => {
                  const isActive = activeImg === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative flex-shrink-0 w-[66px] h-[66px] md:w-[74px] md:h-[74px] rounded-[6px] bg-white border transition-all overflow-hidden p-1 ${
                        isActive
                          ? "border-[#8E51B8] ring-2 ring-[#8E51B8]/40 shadow-xs"
                          : "border-[#E0E0E0] hover:border-gray-400 opacity-85 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={card.url}
                        alt={card.alt}
                        fill
                        className="object-contain p-0.5"
                        sizes="74px"
                      />
                    </button>
                  );
                })}
              </div>

              {gallery.length > 4 && (
                <button
                  onClick={scrollThumbnailsRight}
                  aria-label="Scroll kanan"
                  className="flex-shrink-0 ml-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#E0E0E0] text-[#707070] hover:text-[#8E51B8] shadow-xs transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              )}
            </div>

          </div>

          {/* ── Right Column: Title, Price, CTA, Enlarged Details/How to Use (7 cols) ── */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col gap-4">
            
            {/* 1. Header: Product Name + Share */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <h1 className="text-[24px] md:text-[28px] font-bold text-[#231F20] leading-[1.2] tracking-tight">
                  {product.name}
                </h1>
                <p className="text-[14px] md:text-[15px] text-[#707070] font-medium mt-1">
                  {subtitle}
                </p>
              </div>

              {/* Share button with icon */}
              <div className="relative flex-shrink-0" ref={shareRef}>
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  aria-label="Share product"
                  className="flex items-center gap-1.5 text-[14px] font-semibold text-[#707070] hover:text-[#8E51B8] transition pt-1"
                >
                  <span>Share</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-[8px] border border-[#E5E5E5] bg-white p-1.5 shadow-lg text-[13px]"
                    >
                      <button
                        onClick={handleCopyLink}
                        className="flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-[#303030] hover:bg-[#FAF5FC] hover:text-[#8E51B8] transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" /></svg>
                        {copied ? "Tersalin!" : "Salin Tautan"}
                      </button>
                      <button
                        onClick={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${shareUrl()}`)}`)}
                        className="flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-[#303030] hover:bg-[#FAF5FC] hover:text-[#8E51B8] transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-10 4.5-10 10 0 1.77.46 3.44 1.27 4.89L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.5 0 10-4.5 10-10s-4.5-10-10-10Zm0 18.13c-1.64 0-3.16-.48-4.44-1.3l-.32-.19-3.11.82.83-3.03-.2-.31A8.1 8.1 0 0 1 3.93 12c0-4.48 3.64-8.13 8.11-8.13S20.15 7.52 20.15 12s-3.64 8.13-8.11 8.13Z" /></svg>
                        WhatsApp
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 2. Price Line */}
            <div className="flex items-baseline gap-3 pt-0.5">
              <span className="text-[28px] md:text-[32px] font-extrabold text-[#E91E63] tracking-tight">
                {formatPrice(product.priceMinor)}
              </span>
              <span className="text-[14px] md:text-[15.5px] text-[#A0A0A0] line-through font-normal">
                {formatPrice(originalPriceMinor)}
              </span>
              <span className="rounded-[4px] bg-[#FCE4EC] text-[#E91E63] px-2 py-0.5 text-[12px] font-bold">
                -{discountPercent}%
              </span>
            </div>

            {/* 3. Quantity Selector */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[13px] font-medium text-[#707070]">Quantity</span>
              <div className="flex items-center">
                <div className="inline-flex items-center rounded-[6px] border border-[#D5D5D5] bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-8 w-9 items-center justify-center text-[18px] text-[#707070] hover:bg-[#F5F5F5] transition disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                    aria-label="Kurangi"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-[14px] font-bold text-[#231F20] select-none">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-8 w-9 items-center justify-center text-[18px] text-[#707070] hover:bg-[#F5F5F5] transition font-medium"
                    aria-label="Tambah"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Add to Cart Button */}
            <div className="pt-2">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stockQty === 0}
                whileTap={{ scale: 0.99 }}
                className={`relative w-full flex items-center justify-center gap-2.5 rounded-[8px] py-4 text-[15px] md:text-[16px] font-extrabold text-white transition-all shadow-none ${
                  added
                    ? "bg-emerald-600"
                    : product.stockQty === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#8E51B8] hover:bg-[#78257C]"
                }`}
              >
                {added ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>Berhasil Ditambahkan ke Keranjang</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span>{product.stockQty === 0 ? "Stok Habis" : "Add to Cart"}</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* 5. ENLARGED Segmented Pill Tabs: DETAILS & HOW TO USE (Matching attached image) */}
            <div className="pt-3 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`rounded-full px-6 py-2.5 text-[13.5px] md:text-[14px] font-extrabold uppercase tracking-wider transition ${
                    activeTab === "details"
                      ? "bg-[#FAF5FC] text-[#8E51B8] border-2 border-[#8E51B8]"
                      : "bg-transparent text-[#707070] hover:text-[#231F20] font-bold"
                  }`}
                >
                  DETAILS
                </button>
                <button
                  onClick={() => setActiveTab("how-to-use")}
                  className={`rounded-full px-6 py-2.5 text-[13.5px] md:text-[14px] font-extrabold uppercase tracking-wider transition ${
                    activeTab === "how-to-use"
                      ? "bg-[#FAF5FC] text-[#8E51B8] border-2 border-[#8E51B8]"
                      : "bg-transparent text-[#707070] hover:text-[#231F20] font-bold"
                  }`}
                >
                  HOW TO USE
                </button>
              </div>

              {/* Tab Content with Enlarged Font */}
              <div className="pt-1">
                {activeTab === "details" ? (
                  <div className="flex flex-col gap-4">
                    {/* Main Description (Larger text) */}
                    <p className="text-[15px] md:text-[15.5px] leading-[26px] text-[#333333] font-normal">
                      {product.description ||
                        "Gentle Brightening Serum formulated with powerful brighteners, Alpha Arbutin + Niacinamide to reveal a radiant & more even skin tone. Minimizes dark spots, hyperpigmentation & pores. Can be used daily to strengthen the skin barrier for healthier, smoother skin. Suitable for all skin types & sensitive skin."}
                    </p>

                    {/* Certifications Checklist (Enlarged with prominent green checkmarks) */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      {CERTIFICATIONS.map((cert, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-[#231F20] font-semibold text-[14.5px] md:text-[15px]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-emerald-500 text-white flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                          </span>
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>

                    {/* Netto / Berat */}
                    <div className="pt-2 text-[14.5px] md:text-[15px] text-[#444444]">
                      <span>Netto / Berat: </span>
                      <span className="font-extrabold text-[#231F20]">{product.weightGrams ? `${product.weightGrams} gram` : "20 gram"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 text-[14.5px] md:text-[15px] text-[#333333] leading-[25px]">
                    <ol className="flex flex-col gap-2.5 list-decimal list-inside font-medium">
                      {HOW_TO_USE_STEPS.map((step, i) => (
                        <li key={i} className="pl-1">
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Section: KANDUNGAN & BAHAN AKTIF (Enlarged and interactive as in screenshot) */}
            <div className="mt-4 pt-4 border-t border-[#EDEDED]">
              <button
                onClick={() => setIngredientsOpen(!ingredientsOpen)}
                className="w-full flex items-center justify-between py-2 text-left group"
              >
                <h3 className="text-[15px] md:text-[16px] font-extrabold uppercase tracking-wide text-[#231F20] group-hover:text-[#8E51B8] transition">
                  KANDUNGAN & BAHAN AKTIF
                </h3>
                <svg
                  className={`w-5 h-5 text-[#707070] transition-transform duration-300 ${ingredientsOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <AnimatePresence>
                {ingredientsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="overflow-hidden pt-3 flex flex-col gap-4"
                  >
                    {/* 2-column active ingredients cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeIngredients.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-[8px] border border-[#EAE5F5] bg-[#FCFAFE] p-3.5 flex flex-col gap-1"
                        >
                          <h4 className="text-[14.5px] md:text-[15px] font-bold text-[#8E51B8]">
                            {item.name}
                          </h4>
                          <p className="text-[13px] md:text-[13.5px] leading-relaxed text-[#555555]">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Full ingredients snippet */}
                    <div className="rounded-[8px] bg-[#F9F9F9] p-3.5 border border-[#EEEEEE] text-[13px] text-[#555555] leading-relaxed">
                      <span className="font-bold text-[#231F20]">Full Ingredients: </span>
                      <span>{activeIngredients.full}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>

      {/* ── Section: YOU MAY ALSO LIKE ── */}
      {related.length > 0 && (
        <section className="border-t border-[#F0F0F0] bg-white py-12 md:py-16">
          <div className="mx-auto max-w-[1140px] px-4 md:px-6">
            <div className="text-center mb-8">
              <h2 className="text-[20px] md:text-[22px] font-extrabold uppercase tracking-widest text-[#231F20]">
                YOU MAY ALSO LIKE
              </h2>
            </div>

            {/* Horizontal Product Cards Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {related.map((item, idx) => (
                  <div
                    key={item.slug}
                    className="flex flex-col rounded-[8px] border border-[#EDEDED] bg-white p-3 hover:shadow-md transition relative group"
                  >
                    {/* Discount badge */}
                    <span className="absolute top-2.5 right-2.5 z-10 rounded-[3px] bg-[#FCE4EC] text-[#E91E63] px-2 py-0.5 text-[11px] font-bold">
                      {idx === 0 ? "21% Off" : idx === 1 ? "31% Off" : idx === 2 ? "18% Off" : "31% Off"}
                    </span>

                    {/* Best Seller pill */}
                    <span className="absolute top-2.5 left-2.5 z-10 rounded-[3px] bg-[#E0F2FE] text-[#0284C7] px-2 py-0.5 text-[10px] font-bold">
                      Best Seller
                    </span>

                    {/* Product Image */}
                    <Link href={`/shop/${item.slug}`} className="relative aspect-square w-full rounded-[6px] bg-[#FAF8FC] overflow-hidden my-2.5 block">
                      <Image
                        src={item.img || "/product-serum-1.png"}
                        alt={item.name}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        sizes="240px"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1 gap-1">
                      <Link href={`/shop/${item.slug}`} className="line-clamp-2 text-[14px] md:text-[15px] font-bold text-[#231F20] hover:text-[#8E51B8] transition leading-snug">
                        {item.name}
                      </Link>
                      <div className="flex items-baseline gap-2 mt-auto pt-2">
                        <span className="text-[15px] md:text-[16px] font-extrabold text-[#E91E63]">
                          {item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[12px] text-[#A0A0A0] line-through">
                            {item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Add To Cart Button */}
                    <button
                      onClick={() => handleAddRelatedToCart(item)}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-[6px] bg-[#8E51B8] hover:bg-[#78257C] py-2.5 text-[13px] font-bold text-white transition shadow-none"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" />
                      </svg>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Right Chevron arrow */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-700 hover:text-[#8E51B8] cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3-Card Info Strip ── */}
      <section className="bg-[#F4F0FA] border-t border-[#EAE5F5] py-7">
        <div className="mx-auto max-w-[1140px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* 1. Store Locator */}
            <Link href="/stores" className="flex items-center justify-center gap-3 p-3.5 rounded-[8px] hover:bg-white/60 transition group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8E51B8] text-[#8E51B8]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-extrabold text-[#231F20] uppercase tracking-wider">STORE LOCATOR</p>
                <p className="text-[12px] text-[#707070]">Find your nearest online or offline store</p>
              </div>
            </Link>

            {/* 2. Become a Reseller */}
            <Link href="/reseller" className="flex items-center justify-center gap-3 p-3.5 rounded-[8px] hover:bg-white/60 transition group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8E51B8] text-[#8E51B8]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-extrabold text-[#231F20] uppercase tracking-wider">BECOME A RESELLER</p>
                <p className="text-[12px] text-[#707070]">Get full support and earn rewards for every order</p>
              </div>
            </Link>

            {/* 3. FAQ */}
            <Link href="/faq" className="flex items-center justify-center gap-3 p-3.5 rounded-[8px] hover:bg-white/60 transition group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8E51B8] text-[#8E51B8]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-extrabold text-[#231F20] uppercase tracking-wider">FAQ</p>
                <p className="text-[12px] text-[#707070]">Find everything you need to know about Ginabo</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
