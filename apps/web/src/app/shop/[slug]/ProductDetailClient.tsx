"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart/CartProvider";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { useShopCatalog } from "@/lib/useShopCatalog";
import { trackCustomerEvent } from "@/lib/analytics/events";

const EASE = [0.25, 1, 0.5, 1] as const;

type ProductImage = { url: string; alt: string | null; sortOrder: number };

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
    images: ProductImage[];
  };
};

const TABS = ["Detail", "Cara Pakai", "Kandungan", "Tanya Jawab"];

const HOW_TO_USE_STEPS = [
  "Bersihkan wajah terlebih dahulu dengan cleanser.",
  "Aplikasikan produk secukupnya pada wajah yang bersih.",
  "Ratakan dengan gerakan memijat lembut hingga menyerap.",
  "Lanjutkan dengan SPF di pagi hari.",
];

const ACTIVE_INGREDIENTS = ["Niacinamide", "Ceramide", "Hyaluronic Acid", "Vitamin C", "Peptide"];

const FULL_INGREDIENTS =
  "Aqua, Niacinamide, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Glycerin, Ascorbic Acid, Panthenol, Allantoin, Carbomer, Polysorbate 20, Sodium PCA, Xanthan Gum, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin.";

const FAQS = [
  { q: "Apakah produk ini cocok untuk kulit sensitif?", a: "Ya, produk Ginabo diformulasikan khusus untuk semua jenis kulit termasuk kulit sensitif. Menggunakan bahan-bahan gentle yang telah diuji dermatologis." },
  { q: "Bolehkah digunakan saat hamil atau menyusui?", a: "Sebaiknya konsultasikan terlebih dahulu dengan dokter sebelum menggunakan skincare baru saat hamil atau menyusui." },
  { q: "Berapa lama produk bisa bertahan setelah dibuka?", a: "Produk dapat digunakan hingga 12 bulan setelah dibuka (PAO: 12M), simpan di tempat sejuk dan terhindar dari sinar matahari langsung." },
];

// Small decorative line-icon set for the ingredient cards — abstract shapes,
// not tied to any specific ingredient photo.
function IngredientGlyph({ index }: { index: number }) {
  const paths = [
    <path key="a" d="M12 2c3 4 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 3-7 6-11Z" />,
    <path key="b" d="M4 13c4-6 12-9 16-7-1 5-6 11-16 9-1-.5-1-1.5 0-2Z" />,
    <path key="c" d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />,
    <path key="d" d="M12 3v3M12 18v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1M3 12h3M18 12h3" />,
    <path key="e" d="M7 10a5 5 0 0 1 10 0c0 3-2 3.5-2 6a3 3 0 0 1-6 0c0-2.5-2-3-2-6Z" />,
  ];
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[index % paths.length]}
    </svg>
  );
}

function useIsInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const catalog = useShopCatalog();

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const images = product.images.length > 0
    ? product.images.sort((a, b) => a.sortOrder - b.sortOrder)
    : [{ url: "/placeholder.png", alt: product.name, sortOrder: 0 }];

  const mainImage = images[activeImg];

  const related = useMemo(
    () => catalog.filter(p => p.slug !== product.slug).slice(0, 8),
    [catalog, product.slug]
  );

  const { ref: ctaRef, inView: ctaInView } = useIsInView<HTMLDivElement>();

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

  function handleAddToCart() {
    addItem({
      productId:  product.id,
      slug:       product.slug,
      name:       product.name,
      priceMinor: product.priceMinor,
      currency:   (product.currency as "IDR" | "USD") ?? "IDR",
      imageUrl:   images[0]?.url ?? null,
      weightGrams: product.weightGrams,
    }, qty);
    trackCustomerEvent({ event_name: "add_to_cart", product_id: product.id, metadata: { quantity: qty } });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function shareUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setShareOpen(false);
    } catch {}
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    setShareOpen(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-brand-100 py-3 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-1.5 text-[12px] text-gray-400">
            <Link href="/" className="hover:text-brand-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-brand-700 transition-colors">Produk</Link>
            <span>/</span>
            <span className="text-brand-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main product section ── */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Left: Image Gallery ── */}
          <Reveal direction="left">
            <div className="flex flex-col gap-3 md:sticky md:top-24">
              <div className="relative aspect-square overflow-hidden rounded-[10px] bg-brand-50 border border-brand-100">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeImg}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0"
                  >
                    {mainImage.url && mainImage.url !== "/placeholder.png" ? (
                      <Image
                        src={mainImage.url}
                        alt={mainImage.alt || product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300 text-sm">
                        Belum ada foto
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {images.length > 1 && (
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                    {activeImg + 1} / {images.length}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      whileTap={{ scale: 0.94 }}
                      className="relative flex-shrink-0 w-16 h-16 rounded-[6px] overflow-hidden border border-brand-100"
                    >
                      <Image src={img.url} alt={img.alt || ""} fill className="object-cover" sizes="64px" />
                      {activeImg === idx && (
                        <motion.span
                          layoutId="pdp-thumb-active"
                          className="absolute inset-0 rounded-[6px] border-2 border-brand-700"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* ── Right: Product Info ── */}
          <Reveal direction="right" delay={0.06}>
            <div className="flex flex-col gap-4">
              {/* Brand */}
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Ginabo</p>

              {/* Name */}
              <h1 className="text-[24px] md:text-[30px] font-bold text-brand-900 leading-[1.15] tracking-tight">{product.name}</h1>

              {/* Badges: BPOM + Halal */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-[4px] border border-brand-200 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  BPOM Terdaftar
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  Halal MUI
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-[28px] font-bold text-brand-700 tabular-nums">
                  {formatPrice(product.priceMinor)}
                </span>
              </div>

              {/* Short description */}
              {product.description && (
                <p className="text-[14px] leading-relaxed text-gray-500 max-w-[60ch]">
                  {product.description}
                </p>
              )}
              {product.weightGrams !== null && (
                <p className="text-[13px] font-medium text-brand-900">
                  Berat produk: <span className="text-brand-700">{product.weightGrams} gram</span>
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-brand-100" />

              {/* Stock */}
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-gray-400">Stok:</span>
                {product.stockQty > 0 ? (
                  <span className="text-emerald-600 font-semibold">{product.stockQty} tersedia</span>
                ) : (
                  <span className="text-red-500 font-semibold">Habis</span>
                )}
              </div>

              {/* Qty selector */}
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-400">Jumlah:</span>
                <div className="flex items-center border border-brand-200 rounded-[6px] overflow-hidden">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-brand-900 hover:bg-brand-50 transition-colors text-[16px]"
                  >−</motion.button>
                  <span className="relative flex w-10 items-center justify-center overflow-hidden py-1.5 text-[14px] font-semibold text-brand-900 border-x border-brand-100">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={qty}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.16, ease: EASE }}
                      >
                        {qty}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQty(q => q + 1)}
                    className="px-3 py-1.5 text-brand-900 hover:bg-brand-50 transition-colors text-[16px]"
                  >+</motion.button>
                </div>
              </div>

              {/* Add to Cart + Share */}
              <div ref={ctaRef} className="flex items-center gap-2">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={product.stockQty === 0}
                  whileTap={product.stockQty > 0 ? { scale: 0.98 } : undefined}
                  className={`relative flex-1 overflow-hidden rounded-[6px] py-3.5 text-[14px] font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    added ? "bg-emerald-600" : "bg-brand-700 hover:bg-brand-800"
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={added ? "added" : product.stockQty === 0 ? "empty" : "idle"}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="inline-flex items-center justify-center gap-1.5"
                    >
                      {added ? (
                        <>Ditambahkan ke Keranjang
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </>
                      ) : product.stockQty === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                {/* Share */}
                <div className="relative" ref={shareRef}>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setShareOpen(v => !v)}
                    aria-label="Bagikan produk"
                    className="flex h-[50px] w-[50px] items-center justify-center rounded-[6px] border border-brand-200 text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                      <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {shareOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: EASE }}
                        className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-[10px] border border-brand-100 bg-white shadow-[0_16px_40px_rgba(91,75,138,0.16)]"
                      >
                        <button onClick={handleCopyLink} className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-brand-900 transition hover:bg-brand-50">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" /></svg>
                          Salin Tautan
                        </button>
                        <button onClick={() => openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${product.name} - ${shareUrl()}`)}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-brand-900 transition hover:bg-brand-50">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-10 4.5-10 10 0 1.77.46 3.44 1.27 4.89L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.5 0 10-4.5 10-10s-4.5-10-10-10Zm0 18.13c-1.64 0-3.16-.48-4.44-1.3l-.32-.19-3.11.82.83-3.03-.2-.31A8.1 8.1 0 0 1 3.93 12c0-4.48 3.64-8.13 8.11-8.13S20.15 7.52 20.15 12s-3.64 8.13-8.11 8.13Z" /></svg>
                          WhatsApp
                        </button>
                        <button onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-brand-900 transition hover:bg-brand-50">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></svg>
                          Facebook
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Trust line */}
              <p className="text-center text-[11px] text-gray-400">
                Pengiriman ke seluruh Indonesia · Kemasan aman &amp; terlindungi
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Tab Section ── */}
      <Reveal>
        <div className="border-t border-brand-100 mt-4">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            {/* Tab headers */}
            <div className="relative flex border-b border-brand-100 overflow-x-auto">
              {TABS.map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(idx)}
                  className={`relative px-5 py-4 text-[13px] font-semibold flex-shrink-0 transition-colors ${
                    activeTab === idx ? "text-brand-700" : "text-gray-400 hover:text-brand-900"
                  }`}
                >
                  {tab}
                  {activeTab === idx && (
                    <motion.span
                      layoutId="pdp-tab-underline"
                      className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-brand-700"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="py-8 max-w-3xl min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  {activeTab === 0 && (
                    <div className="text-[14px] leading-relaxed text-gray-500">
                      {product.description || product.weightGrams !== null ? (
                        <div className="flex flex-col gap-2">
                          {product.description && <p>{product.description}</p>}
                          {product.weightGrams !== null && <p className="font-medium text-brand-900">Berat produk: {product.weightGrams} gram</p>}
                        </div>
                      ) : (
                        <p className="text-gray-300">Deskripsi produk belum tersedia.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 1 && (
                    <ol className="flex flex-col gap-4">
                      {HOW_TO_USE_STEPS.map((step, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                          className="flex gap-3 text-[14px] text-gray-500"
                        >
                          <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </motion.li>
                      ))}
                    </ol>
                  )}

                  {activeTab === 2 && (
                    <div>
                      <p className="text-[13px] font-semibold text-brand-900 mb-4">Bahan Aktif Utama</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        {ACTIVE_INGREDIENTS.map((ing, i) => (
                          <motion.div
                            key={ing}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                            className="flex flex-col items-start gap-2 rounded-[10px] border border-brand-100 bg-brand-50/50 p-3.5"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm">
                              <IngredientGlyph index={i} />
                            </span>
                            <span className="text-[12px] font-semibold text-brand-900 leading-snug">{ing}</span>
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {FULL_INGREDIENTS}
                      </p>
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="flex flex-col">
                      {FAQS.map((faq, i) => {
                        const isOpen = openFaq === i;
                        return (
                          <div key={i} className="border-b border-brand-100">
                            <button
                              onClick={() => setOpenFaq(isOpen ? null : i)}
                              className="flex w-full items-center justify-between gap-3 py-4 text-left text-[14px] font-semibold text-brand-900"
                            >
                              {faq.q}
                              <motion.svg
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.25, ease: EASE }}
                                width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"
                                className="flex-shrink-0"
                              >
                                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                              </motion.svg>
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: EASE }}
                                  className="overflow-hidden"
                                >
                                  <p className="pb-4 text-[13px] leading-relaxed text-gray-500">{faq.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <Reveal>
          <div className="border-t border-brand-100 py-10">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
              <h2 className="text-[18px] font-bold text-brand-900 mb-5">Kamu Mungkin Juga Suka</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {related.map(p => (
                  <div key={p.slug} className="w-[45%] sm:w-[200px] flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ── Sticky mobile Add-to-Cart bar ── */}
      <AnimatePresence>
        {!ctaInView && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-brand-100 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_-8px_24px_rgba(91,75,138,0.10)] md:hidden"
            style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] text-gray-400">{product.name}</p>
              <p className="text-[15px] font-bold text-brand-700 tabular-nums">{formatPrice(product.priceMinor * qty)}</p>
            </div>
            <motion.button
              whileTap={product.stockQty > 0 ? { scale: 0.97 } : undefined}
              onClick={handleAddToCart}
              disabled={product.stockQty === 0}
              className="flex-shrink-0 rounded-[6px] bg-brand-700 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
            >
              {product.stockQty === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
