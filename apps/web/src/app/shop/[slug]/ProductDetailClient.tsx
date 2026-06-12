"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

type ProductImage = { url: string; alt: string; sortOrder: number };

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    priceMinor: number;
    currency: string;
    stockQty: number;
    images: ProductImage[];
  };
};

function formatPrice(minor: number, currency: string) {
  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(minor);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);
}

const TABS = ["Detail", "Cara Pakai", "Kandungan", "Tanya Jawab"];

export function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const [activeImg, setActiveImg]   = useState(0);
  const [activeTab, setActiveTab]   = useState(0);
  const [qty, setQty]               = useState(1);
  const [added, setAdded]           = useState(false);

  const images = product.images.length > 0
    ? product.images.sort((a, b) => a.sortOrder - b.sortOrder)
    : [{ url: "/placeholder.png", alt: product.name, sortOrder: 0 }];

  const mainImage = images[activeImg];

  function handleAddToCart() {
    addItem({
      productId:  product.id,
      slug:       product.slug,
      name:       product.name,
      priceMinor: product.priceMinor * qty,
      currency:   (product.currency as "IDR" | "USD") ?? "IDR",
      imageUrl:   images[0]?.url ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-[#f0f0f0] py-3 px-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-1.5 text-[12px] text-[#808080]">
            <Link href="/" className="hover:text-[#78257C]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#78257C]">Produk</Link>
            <span>/</span>
            <span className="text-[#303030]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main product section ── */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Left: Image Gallery ── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-[5px] bg-[#fafafa] border border-[#f0f0f0]">
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
                <div className="flex h-full items-center justify-center text-[#ccc] text-sm">
                  Belum ada foto
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-[3px] overflow-hidden border-2 transition ${
                      activeImg === idx ? "border-[#78257C]" : "border-[#E2E2E2] hover:border-[#78257C]"
                    }`}
                  >
                    <Image src={img.url} alt={img.alt || ""} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col gap-4">
            {/* Brand */}
            <p className="text-[12px] font-semibold text-[#808080] uppercase tracking-wide">Ginabo</p>

            {/* Name */}
            <h1 className="text-[22px] md:text-[26px] font-bold text-[#303030] leading-tight">{product.name}</h1>

            {/* Badges: BPOM + Halal */}
            <div className="flex items-center gap-2">
              <span className="rounded-[3px] border border-[#78257C] px-2.5 py-0.5 text-[11px] font-semibold text-[#78257C]">
                BPOM Terdaftar
              </span>
              <span className="rounded-[3px] border border-[#2d8a4e] px-2.5 py-0.5 text-[11px] font-semibold text-[#2d8a4e]">
                Halal MUI
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-[22px] font-bold" style={{ color: "#78257C" }}>
                {formatPrice(product.priceMinor, product.currency)}
              </span>
            </div>

            {/* Short description */}
            {product.description && (
              <p className="text-[14px] leading-relaxed text-[#808080]">
                {product.description}
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-[#f0f0f0]" />

            {/* Stock */}
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-[#808080]">Stok:</span>
              {product.stockQty > 0 ? (
                <span className="text-[#2d8a4e] font-semibold">{product.stockQty} tersedia</span>
              ) : (
                <span className="text-red-500 font-semibold">Habis</span>
              )}
            </div>

            {/* Qty selector */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#808080]">Jumlah:</span>
              <div className="flex items-center border border-[#E2E2E2] rounded-[5px] overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-[#303030] hover:bg-[#f5f5f5] transition text-[16px]"
                >−</button>
                <span className="px-4 py-1.5 text-[14px] font-semibold text-[#303030] border-x border-[#E2E2E2]">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="px-3 py-1.5 text-[#303030] hover:bg-[#f5f5f5] transition text-[16px]"
                >+</button>
              </div>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stockQty === 0}
              className="w-full rounded-[5px] py-3.5 text-[14px] font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: added ? "#2d8a4e" : "#78257C",
                transition: "background 0.3s",
              }}
            >
              {added ? "Ditambahkan ke Keranjang ✓" : product.stockQty === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
            </button>

            {/* Trust line */}
            <p className="text-center text-[11px] text-[#808080]">
              Pengiriman ke seluruh Indonesia · Kemasan aman & terlindungi
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab Section ── */}
      <div className="border-t border-[#f0f0f0] mt-4">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Tab headers */}
          <div className="flex border-b border-[#f0f0f0] overflow-x-auto">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`px-5 py-4 text-[13px] font-semibold flex-shrink-0 transition border-b-2 ${
                  activeTab === idx
                    ? "border-[#78257C] text-[#78257C]"
                    : "border-transparent text-[#808080] hover:text-[#303030]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-8 max-w-3xl">
            {activeTab === 0 && (
              <div className="text-[14px] leading-relaxed text-[#808080]">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p className="text-[#ccc]">Deskripsi produk belum tersedia.</p>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div className="text-[14px] text-[#808080]">
                <ol className="flex flex-col gap-4">
                  {[
                    "Bersihkan wajah terlebih dahulu dengan cleanser.",
                    "Aplikasikan produk secukupnya pada wajah yang bersih.",
                    "Ratakan dengan gerakan memijat lembut hingga menyerap.",
                    "Lanjutkan dengan SPF di pagi hari.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "#78257C" }}>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <p className="text-[13px] font-semibold text-[#303030] mb-3">Bahan Aktif Utama</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Niacinamide", "Ceramide", "Hyaluronic Acid", "Vitamin C", "Peptide"].map(ing => (
                    <span key={ing} className="rounded-full border border-[#e8d5f0] px-3 py-1 text-[12px] font-medium text-[#78257C]">
                      {ing}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#808080] leading-relaxed">
                  Aqua, Niacinamide, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Glycerin, Ascorbic Acid, Panthenol, Allantoin, Carbomer, Polysorbate 20, Sodium PCA, Xanthan Gum, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin.
                </p>
              </div>
            )}

            {activeTab === 3 && (
              <div className="flex flex-col gap-4">
                {[
                  { q: "Apakah produk ini cocok untuk kulit sensitif?", a: "Ya, produk Ginabo diformulasikan khusus untuk semua jenis kulit termasuk kulit sensitif. Menggunakan bahan-bahan gentle yang telah diuji dermatologis." },
                  { q: "Bolehkah digunakan saat hamil atau menyusui?", a: "Sebaiknya konsultasikan terlebih dahulu dengan dokter sebelum menggunakan skincare baru saat hamil atau menyusui." },
                  { q: "Berapa lama produk bisa bertahan setelah dibuka?", a: "Produk dapat digunakan hingga 12 bulan setelah dibuka (PAO: 12M), simpan di tempat sejuk dan terhindar dari sinar matahari langsung." },
                ].map((faq, i) => (
                  <details key={i} className="border-b border-[#f0f0f0] pb-4">
                    <summary className="cursor-pointer text-[14px] font-semibold text-[#303030] list-none flex items-center justify-between">
                      {faq.q}
                      <svg width="16" height="16" fill="none" stroke="#808080" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <p className="mt-3 text-[13px] leading-relaxed text-[#808080]">{faq.a}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
