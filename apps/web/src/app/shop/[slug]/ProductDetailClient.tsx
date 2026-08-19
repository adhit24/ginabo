"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { useShopCatalog, ShopProduct } from "@/lib/useShopCatalog";
import { ProductCard } from "@/components/ProductCard";
import { FlowButton } from "@/components/ui/flow-button";
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

  const mainImg = product.images[0]?.url;

  if (slug.includes("serum") || slug.includes("glowage")) {
    return [
      { url: mainImg || "/GlowAge Multi Active Serum.png", alt: "GlowAge Multi-Active Serum", label: "Kemasan Utama" },
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
      { url: mainImg || "/Bright & Care Moisture Cream.png", alt: "Bright & Care Moisture Cream", label: "Kemasan Utama" },
      { url: "/product-cream-2.png", alt: "Skin Barrier Moisture Lock", label: "Barrier Lock" },
      { url: "/product-cream-3.png", alt: "Deep Hydration Infusion", label: "Deep Hydration" },
      { url: "/product-cream-4.png", alt: "Soothing & Calming Effect", label: "Menenangkan Kulit" },
      { url: "/BA_cream.jpg", alt: "Before & After Pemakaian", label: "Sebelum & Sesudah" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
    ];
  }

  if (slug.includes("dna") || slug.includes("hydra") || slug.includes("gel")) {
    return [
      { url: mainImg || "/Hydra Moist Gel Ultimate.png", alt: "Hydra Moist Gel Ultimate", label: "Kemasan Utama" },
      { url: "/product-dna-2.png", alt: "Salmon DNA 3-in-1", label: "Salmon DNA 3-in-1" },
      { url: "/product-dna-3.png", alt: "Cooling & Fresh Gel", label: "Cooling & Fresh" },
      { url: "/product-dna-4.png", alt: "Skin Recovery Support", label: "Skin Recovery" },
      { url: "/BA_dna.jpg", alt: "Before & After Pemakaian", label: "Sebelum & Sesudah" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
    ];
  }

  if (slug.includes("bundle") || slug.includes("set") || slug.includes("complete")) {
    const fallbackBundle = "/Hydra_Moist_Gel_Ultimate_GlowAge_Multi_Active_Serum_Bright_Care_Moisture_Cream.png";
    return [
      { url: mainImg || fallbackBundle, alt: product.name, label: "Paket Lengkap" },
      { url: "/ginabo_bundling_3.png", alt: "Komposisi Produk Bundling", label: "Isi Rangkaian" },
      { url: "/gnb21.png", alt: "21 Days Skin Transformation", label: "21 Days Journey" },
      { url: "/halal_card.png", alt: "Sertifikasi BPOM & Halal", label: "Sertifikasi Resmi" },
      { url: "/ginabo_prods.png", alt: "Rutinitas Skincare Lengkap", label: "Rutinitas AM/PM" },
    ];
  }

  const fallbackUrl = mainImg || "/Hydra_Moist_Gel_Ultimate&Bright_Care_Moisture_Cream.png";
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

const DETAILED_USAGE_STEPS = [
  {
    title: "Bersihkan Wajah",
    desc: "Bersihkan wajah terlebih dahulu dengan facial wash atau cleanser lembut, lalu keringkan perlahan.",
  },
  {
    title: "Aplikasikan Produk",
    desc: "Keluarkan 2–3 tetes atau secukupnya ke telapak tangan yang bersih atau langsung ke area wajah.",
  },
  {
    title: "Ratakan & Pijat Lembut",
    desc: "Ratakan ke seluruh wajah dan leher dengan gerakan memijat ke arah atas hingga menyerap sempurna.",
  },
  {
    title: "Lanjutkan Perawatan",
    desc: "Gunakan rutin pagi dan malam. Di pagi hari lanjutkan dengan sunscreen, di malam hari dengan moisturizer.",
  },
];

const PRODUCT_FAQS = [
  {
    q: "Apakah produk ini aman untuk ibu hamil dan menyusui?",
    a: "Ya, seluruh rangkaian produk Ginabo diformulasikan secara khusus menggunakan bahan aktif yang lembut, hypoallergenic, dan ramah terhadap kulit sensitif, sehingga aman digunakan oleh ibu hamil maupun menyusui. Jika Anda ragu, konsultasikan dengan dokter kandungan Anda.",
  },
  {
    q: "Berapa lama hasil pemakaian mulai terlihat?",
    a: "Kelembapan ekstra dan sensasi menenangkan kulit dapat dirasakan sejak pemakaian pertama. Untuk hasil mencerahkan dan menyamarkan noda hitam secara maksimal, disarankan menggunakan rutin pagi & malam selama 21 hari.",
  },
  {
    q: "Bagaimana cara menggabungkan produk ini dengan produk eksfoliasi?",
    a: "Formula pelembap dan serum kami bekerja sangat baik dengan bahan aktif eksfoliasi (seperti AHA/BHA). Gunakan pelembap Ginabo setelah produk eksfoliasi untuk menenangkan kulit dan mengunci kelembapan barrier.",
  },
  {
    q: "Apakah produk ini sudah tersertifikasi resmi?",
    a: "Benar. Seluruh produk Ginabo sudah teruji klinis secara dermatologis, non-comedogenic (tidak menyumbat pori-pori), berizin resmi BPOM (BPOM Certified NA18251900160), serta tersertifikasi Halal MUI.",
  },
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
  const [activeTab, setActiveTab] = useState<"details" | "how-to-use" | "ingredients" | "faq">("details");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
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
    thumbnailScrollRef.current.scrollBy({ left: 180, behavior: "smooth" });
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
      productId: item.id,
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
    <div className="min-h-screen bg-white font-sans antialiased text-[#1a1a1a]">
      {/* ── Breadcrumb Bar ── */}
      <div className="bg-white py-3.5 px-4 md:px-8 border-b border-[#EAEAEA]">
        <div className="mx-auto max-w-[1240px]">
          <nav className="flex items-center flex-wrap gap-2 text-[13px] lg:text-[14px] text-[#666666]">
            <Link href="/" className="hover:text-[#8E51B8] transition font-medium">Home</Link>
            <span className="text-[#B0B0B0]">/</span>
            <Link href="/shop" className="hover:text-[#8E51B8] transition font-medium">POPULAR PRODUCTS</Link>
            <span className="text-[#B0B0B0]">/</span>
            <Link href="/shop" className="hover:text-[#8E51B8] transition font-medium">Skincare</Link>
            <span className="text-[#B0B0B0]">/</span>
            <span className="text-[#1a1a1a] font-bold truncate max-w-[240px] lg:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Product Section ── */}
      <main className="mx-auto max-w-[1240px] px-4 md:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ── Left Column: Main Image Zoom + Horizontal Thumbnails (5 cols) ── */}
          {/* FIX POINT 7: Use lg:sticky lg:top-24 so sticky is only active on desktop, preventing mobile overlap */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
            
            {/* 1. Main Zoom Card */}
            <div 
              ref={zoomBoxRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-[10px] bg-white border border-[#E0E0E0] overflow-hidden cursor-crosshair select-none group shadow-xs"
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
                        sizes="(max-width: 1024px) 100vw, 520px"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#555555] hover:text-[#8E51B8] shadow-md transition opacity-0 group-hover:opacity-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    aria-label="Foto selanjutnya"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#555555] hover:text-[#8E51B8] shadow-md transition opacity-0 group-hover:opacity-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </>
              )}

              {/* Pagination Indicator `< 1 / 7 >` */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center items-center pointer-events-none">
                <div className="flex items-center gap-2.5 text-[13px] font-bold text-[#555555] bg-white/95 backdrop-blur-xs px-3.5 py-1 rounded-full shadow-xs border border-[#E0E0E0]">
                  <span className="text-[#999999]">&lt;</span>
                  <span>{activeImg + 1} / {gallery.length}</span>
                  <span className="text-[#999999]">&gt;</span>
                </div>
              </div>
            </div>

            {/* 2. Horizontal Thumbnail Gallery */}
            <div className="relative flex items-center">
              <div
                ref={thumbnailScrollRef}
                className="flex gap-2.5 overflow-x-auto scrollbar-none py-1 scroll-smooth w-full select-none"
                style={{ scrollbarWidth: "none" }}
              >
                {gallery.map((card, idx) => {
                  const isActive = activeImg === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative flex-shrink-0 w-[68px] h-[68px] lg:w-[80px] lg:h-[80px] rounded-[8px] bg-white border transition-all overflow-hidden p-1.5 ${
                        isActive
                          ? "border-[#8E51B8] ring-2 ring-[#8E51B8]/50 shadow-sm"
                          : "border-[#D8D8D8] hover:border-gray-500 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={card.url}
                        alt={card.alt}
                        fill
                        className="object-contain p-0.5"
                        sizes="80px"
                      />
                    </button>
                  );
                })}
              </div>

              {gallery.length > 4 && (
                <button
                  onClick={scrollThumbnailsRight}
                  aria-label="Scroll kanan"
                  className="flex-shrink-0 ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#D8D8D8] text-[#555555] hover:text-[#8E51B8] shadow-xs transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              )}
            </div>

          </div>

          {/* ── Right Column: Info Produk (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* ── 1. Header Produk ── */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                {/* Judul produk: 20px di mobile, 28px di desktop */}
                <h1 className="text-[20px] lg:text-[28px] font-extrabold text-[#1a1a1a] leading-[1.25] tracking-tight">
                  {product.name}
                </h1>
                {/* Subjudul: 13px di mobile, 16px di desktop */}
                <p className="text-[13px] lg:text-[16px] font-normal text-[#606060] mt-1 leading-snug">
                  {subtitle}
                </p>
              </div>

              {/* Tombol Share: 13px di mobile, 15px di desktop */}
              <div className="relative flex-shrink-0" ref={shareRef}>
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  aria-label="Share product"
                  className="flex items-center gap-1.5 text-[13px] lg:text-[15px] font-semibold text-[#7C6FEF] hover:text-[#6859e0] transition pt-1"
                >
                  <span>Share</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      className="absolute right-0 top-full mt-2 z-30 w-52 rounded-[10px] border border-[#E0E0E0] bg-white p-2 shadow-xl text-[14px]"
                    >
                      <button
                        onClick={handleCopyLink}
                        className="flex w-full items-center gap-2.5 rounded-[6px] px-3.5 py-2.5 text-[#303030] hover:bg-[#FAF5FC] hover:text-[#8E51B8] font-medium transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" /></svg>
                        {copied ? "Tersalin!" : "Salin Tautan"}
                      </button>
                      <button
                        onClick={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${shareUrl()}`)}`)}
                        className="flex w-full items-center gap-2.5 rounded-[6px] px-3.5 py-2.5 text-[#303030] hover:bg-[#FAF5FC] hover:text-[#8E51B8] font-medium transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-10 4.5-10 10 0 1.77.46 3.44 1.27 4.89L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.5 0 10-4.5 10-10s-4.5-10-10-10Zm0 18.13c-1.64 0-3.16-.48-4.44-1.3l-.32-.19-3.11.82.83-3.03-.2-.31A8.1 8.1 0 0 1 3.93 12c0-4.48 3.64-8.13 8.11-8.13S20.15 7.52 20.15 12s-3.64 8.13-8.11 8.13Z" /></svg>
                        WhatsApp
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Harga: 24px di mobile, 34px di desktop | Harga Coret: 14px di mobile, 18px di desktop | Badge: 11px / 14px pill */}
            <div className="flex items-baseline gap-3 pt-0.5">
              <span className="text-[24px] lg:text-[34px] font-extrabold text-[#E01E2B] tracking-tight leading-none">
                {formatPrice(product.priceMinor)}
              </span>
              <span className="text-[14px] lg:text-[18px] text-[#9CA3AF] line-through font-normal">
                {formatPrice(originalPriceMinor)}
              </span>
              <span className="rounded-full bg-[#FBD9E9] text-[#DB2777] px-2 lg:px-2.5 py-0.5 text-[11px] lg:text-[14px] font-semibold">
                -{discountPercent}%
              </span>
            </div>

            {/* Label Quantity: 12px di mobile, 14px di desktop */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[12px] lg:text-[14px] font-semibold text-[#505050]">Quantity</span>
              <div className="flex items-center">
                <div className="inline-flex items-center rounded-[8px] border border-[#CCCCCC] bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-8 w-9 lg:h-9 lg:w-10 items-center justify-center text-[18px] text-[#505050] hover:bg-[#F5F5F5] transition disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                    aria-label="Kurangi"
                  >
                    −
                  </button>
                  <span className="w-9 lg:w-10 text-center text-[15px] lg:text-[16px] font-bold text-[#1a1a1a] select-none">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-8 w-9 lg:h-9 lg:w-10 items-center justify-center text-[18px] text-[#505050] hover:bg-[#F5F5F5] transition font-medium"
                    aria-label="Tambah"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ── 2. Tombol Add to Cart: w-full lg:w-[480px] max-w-full ── */}
            <div className="pt-2">
              {added ? (
                <div className="flex w-full items-center justify-center gap-2.5 rounded-[10px] bg-emerald-600 py-3 px-4 text-[14px] font-bold text-white shadow-md lg:w-[480px] lg:py-3.5 lg:text-[16px]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Berhasil Ditambahkan ke Keranjang</span>
                </div>
              ) : product.stockQty === 0 ? (
                <div className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-[10px] bg-gray-400 py-3 px-4 text-[14px] font-bold text-white shadow-md lg:w-[480px] lg:py-3.5 lg:text-[16px]">
                  <span>Stok Habis</span>
                </div>
              ) : (
                <FlowButton type="button" onClick={handleAddToCart} text="Add to Cart" className="w-full lg:w-[480px]" />
              )}
            </div>

            {/* ── 3. Tab DETAILS / HOW TO USE / INGREDIENTS / FAQ (13px mobile, 16px desktop, 10px 20px / 14px 34px padding) ── */}
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab("details")}
                  style={activeTab === "details" ? {
                    background: "linear-gradient(90deg, #78257C 0%, #A445B2 100%)",
                    boxShadow: "0 4px 14px rgba(120,37,124,0.35)",
                  } : {}}
                  className={`rounded-full px-4 py-2 lg:px-[26px] lg:py-[12px] text-[12.5px] lg:text-[15px] font-bold uppercase tracking-wider transition ${
                    activeTab === "details"
                      ? "text-white border-0"
                      : "bg-transparent text-[#707070] hover:text-[#1a1a1a]"
                  }`}
                >
                  DETAILS
                </button>
                <button
                  onClick={() => setActiveTab("how-to-use")}
                  style={activeTab === "how-to-use" ? {
                    background: "linear-gradient(90deg, #78257C 0%, #A445B2 100%)",
                    boxShadow: "0 4px 14px rgba(120,37,124,0.35)",
                  } : {}}
                  className={`rounded-full px-4 py-2 lg:px-[26px] lg:py-[12px] text-[12.5px] lg:text-[15px] font-bold uppercase tracking-wider transition ${
                    activeTab === "how-to-use"
                      ? "text-white border-0"
                      : "bg-transparent text-[#707070] hover:text-[#1a1a1a]"
                  }`}
                >
                  CARA PAKAI
                </button>
                <button
                  onClick={() => setActiveTab("ingredients")}
                  style={activeTab === "ingredients" ? {
                    background: "linear-gradient(90deg, #78257C 0%, #A445B2 100%)",
                    boxShadow: "0 4px 14px rgba(120,37,124,0.35)",
                  } : {}}
                  className={`rounded-full px-4 py-2 lg:px-[26px] lg:py-[12px] text-[12.5px] lg:text-[15px] font-bold uppercase tracking-wider transition ${
                    activeTab === "ingredients"
                      ? "text-white border-0"
                      : "bg-transparent text-[#707070] hover:text-[#1a1a1a]"
                  }`}
                >
                  KANDUNGAN
                </button>
                <button
                  onClick={() => setActiveTab("faq")}
                  style={activeTab === "faq" ? {
                    background: "linear-gradient(90deg, #78257C 0%, #A445B2 100%)",
                    boxShadow: "0 4px 14px rgba(120,37,124,0.35)",
                  } : {}}
                  className={`rounded-full px-4 py-2 lg:px-[26px] lg:py-[12px] text-[12.5px] lg:text-[15px] font-bold uppercase tracking-wider transition ${
                    activeTab === "faq"
                      ? "text-white border-0"
                      : "bg-transparent text-[#707070] hover:text-[#1a1a1a]"
                  }`}
                >
                  TANYA JAWAB
                </button>
              </div>

              {/* ── 4. Isi Tab DETAILS / CARA PAKAI / KANDUNGAN / TANYA JAWAB ── */}
              <div className="pt-2">
                {activeTab === "details" && (
                  <div className="flex flex-col gap-4">
                    {/* Paragraf Deskripsi: font-size:24px; line-height:1.6 (desktop) / 14px (mobile) */}
                    <p className="text-[14px] lg:text-[24px] lg:leading-[1.6] text-[#505050] font-normal">
                      {product.description ||
                        "Gentle Brightening Serum formulated with powerful brighteners, Alpha Arbutin + Niacinamide to reveal a radiant & more even skin tone. Minimizes dark spots, hyperpigmentation & pores. Can be used daily to strengthen the skin barrier for healthier, smoother skin. Suitable for all skin types & sensitive skin."}
                    </p>

                    {/* Tiap item checklist: font-size:20px (desktop) / 13.5px (mobile) */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      {CERTIFICATIONS.map((cert, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-[#303030] font-medium text-[13.5px] lg:text-[20px]">
                          <span className="flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-[4px] bg-emerald-500 text-white flex-shrink-0 shadow-xs">
                            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                          </span>
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>

                    {/* Netto / Berat */}
                    <div className="pt-2 text-[13.5px] lg:text-[20px] text-[#444444]">
                      <span>Netto / Berat: </span>
                      <span className="font-bold text-[#1a1a1a]">{product.weightGrams ? `${product.weightGrams} gram` : "20 gram"}</span>
                    </div>
                  </div>
                )}

                {activeTab === "how-to-use" && (
                  <div className="flex flex-col gap-4 text-[#505050]">
                    <h3 className="text-[16px] lg:text-[22px] font-bold text-[#1a1a1a]">
                      Langkah Penggunaan Rutin (AM / PM):
                    </h3>
                    <div className="flex flex-col gap-3.5">
                      {DETAILED_USAGE_STEPS.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-[#8E51B8] text-white font-bold text-[13px] lg:text-[15px] flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <h4 className="text-[14px] lg:text-[18px] font-bold text-[#1a1a1a]">
                              {step.title}
                            </h4>
                            <p className="text-[13px] lg:text-[16px] leading-relaxed text-[#505050]">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "ingredients" && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeIngredients.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-[8px] border border-[#EAE5F5] bg-[#FCFAFE] p-3.5 flex flex-col gap-1 shadow-2xs"
                        >
                          <h4 className="text-[14px] lg:text-[18px] font-bold text-[#78257C]">
                            {item.name}
                          </h4>
                          <p className="text-[12px] lg:text-[15px] leading-snug text-[#606060]">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[8px] bg-[#F9F9F9] p-3.5 border border-[#EEEEEE] text-[12px] lg:text-[15px] text-[#808080] leading-relaxed pt-1">
                      <span className="font-bold text-[#303030]">Full Ingredients: </span>
                      <span>{activeIngredients.full}</span>
                    </div>
                  </div>
                )}

                {activeTab === "faq" && (
                  <div className="flex flex-col gap-4 text-[#505050]">
                    <h3 className="text-[16px] lg:text-[22px] font-bold text-[#1a1a1a]">
                      Tanya Jawab Terkait Produk:
                    </h3>
                    <div className="flex flex-col gap-4">
                      {PRODUCT_FAQS.map((faq, i) => (
                        <div key={i} className="border-b border-[#F0F0F0] pb-3.5 last:border-b-0">
                          <h4 className="text-[14px] lg:text-[17px] font-bold text-[#78257C] flex items-start gap-2">
                            <span className="text-[#A855F7] font-extrabold">Q:</span>
                            <span>{faq.q}</span>
                          </h4>
                          <p className="text-[13px] lg:text-[15px] text-[#505050] leading-relaxed mt-1.5 pl-5">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── 6. Section YOU MAY ALSO LIKE (Heading 20px/32px, Subteks 13px/18px) ── */}
      {related.length > 0 && (
        <section className="border-t border-[#EAEAEA] bg-white py-12 lg:py-16">
          <div className="mx-auto max-w-[1240px] px-4 md:px-8">
            <div className="text-center mb-8">
              <h2 className="text-[20px] lg:text-[32px] font-extrabold uppercase tracking-widest text-[#2A2A2A]">
                YOU MAY ALSO LIKE
              </h2>
              <p className="text-[13px] lg:text-[18px] text-[#707070] mt-1 font-medium">
                Kombinasi produk terbaik untuk hasil kulit maksimal
              </p>
            </div>

            {/* Horizontal Product Cards Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {related.map((item, idx) => {
                  const tag = idx === 0 ? "21% Off" : idx === 1 ? "31% Off" : idx === 2 ? "18% Off" : "31% Off";
                  const productWithTag = {
                    ...item,
                    tag,
                  };
                  return (
                    <ProductCard key={item.slug} product={productWithTag} />
                  );
                })}
              </div>

              {/* Right Chevron arrow */}
              <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-gray-700 hover:text-[#8E51B8] cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3-Card Info Strip ── */}
      <section className="bg-[#F4F0FA] border-t border-[#EAE5F5] py-8">
        <div className="mx-auto max-w-[1240px] px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
            {/* 1. Store Locator */}
            <Link href="/stores" className="flex items-center justify-center gap-3.5 p-4 rounded-[10px] hover:bg-white/60 transition group">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8E51B8] text-[#8E51B8]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[14.5px] font-bold text-[#1a1a1a] uppercase tracking-wider">STORE LOCATOR</p>
                <p className="text-[13px] text-[#666666]">Find your nearest online or offline store</p>
              </div>
            </Link>

            {/* 2. Become a Reseller */}
            <Link href="/reseller" className="flex items-center justify-center gap-3.5 p-4 rounded-[10px] hover:bg-white/60 transition group">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8E51B8] text-[#8E51B8]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[14.5px] font-bold text-[#1a1a1a] uppercase tracking-wider">BECOME A RESELLER</p>
                <p className="text-[13px] text-[#666666]">Get full support and earn rewards for every order</p>
              </div>
            </Link>

            {/* 3. FAQ */}
            <Link href="/faq" className="flex items-center justify-center gap-3.5 p-4 rounded-[10px] hover:bg-white/60 transition group">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8E51B8] text-[#8E51B8]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[14.5px] font-bold text-[#1a1a1a] uppercase tracking-wider">FAQ</p>
                <p className="text-[13px] text-[#666666]">Find everything you need to know about Ginabo</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
