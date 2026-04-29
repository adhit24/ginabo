"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const skinTypes = [
  { label: "Kulit Normal",    slug: "normal"    },
  { label: "Kulit Kering",    slug: "kering"    },
  { label: "Kulit Berminyak", slug: "berminyak" },
  { label: "Kombinasi",       slug: "kombinasi" },
  { label: "Sensitif",        slug: "sensitif"  },
];

type Product = { name: string; type: string; desc: string; price: string; rating: string; img: string };

const productsByType: Record<string, Product[]> = {
  normal: [
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 30ml", desc: "Brightening + anti-aging untuk kulit normal",
      price: "Rp 285.000", rating: "4.9",
      img: "/product-serum-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Hidrasi seimbang AM/PM",
      price: "Rp 195.000", rating: "4.8",
      img: "/product-cream-bg.png",
    },
    {
      name: "Daily Barrier Routine Set",
      type: "Bundling Set", desc: "Paket rutinitas lengkap hemat 20%",
      price: "Rp 380.000", rating: "5.0",
      img: "/product-bundle.png",
    },
  ],
  kering: [
    {
      name: "Hydration Boost Serum",
      type: "Serum · 30ml", desc: "Deep moisture untuk kulit kering & dehidrasi",
      price: "Rp 265.000", rating: "4.8",
      img: "/product-serum-1.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Krim intensif barrier support",
      price: "Rp 195.000", rating: "4.9",
      img: "/product-cream-bg.png",
    },
    {
      name: "Hydra Moist Gel Ultimate",
      type: "DNA Salmon · 30ml", desc: "Soothing + recovery untuk kulit kering",
      price: "Rp 215.000", rating: "4.7",
      img: "/product-dna-bg.png",
    },
  ],
  berminyak: [
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 30ml", desc: "Brightening ringan, non-comedogenic",
      price: "Rp 285.000", rating: "4.9",
      img: "/product-serum-bg.png",
    },
    {
      name: "Hydra Moist Gel Ultimate",
      type: "DNA Salmon · 30ml", desc: "Kontrol sebum, tekstur gel ringan",
      price: "Rp 215.000", rating: "4.7",
      img: "/product-dna-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Tekstur ringan, cocok kulit berminyak",
      price: "Rp 195.000", rating: "4.8",
      img: "/product-cream-bg.png",
    },
  ],
  kombinasi: [
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 30ml", desc: "Multifungsi untuk kulit kombinasi",
      price: "Rp 285.000", rating: "4.9",
      img: "/product-serum-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Hidrasi tanpa rasa berat di T-zone",
      price: "Rp 195.000", rating: "4.8",
      img: "/product-cream-bg.png",
    },
    {
      name: "Hydra Moist Gel Ultimate",
      type: "DNA Salmon · 30ml", desc: "Soothing zona sensitif di pipi",
      price: "Rp 215.000", rating: "4.7",
      img: "/product-dna-bg.png",
    },
  ],
  sensitif: [
    {
      name: "DNA Salmon Calming Essence",
      type: "Essence · 30ml", desc: "Calming + recovery untuk kulit sensitif",
      price: "Rp 215.000", rating: "4.9",
      img: "/product-dna-bg.png",
    },
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 20ml", desc: "Perkuat lapisan pelindung kulit sensitif",
      price: "Rp 285.000", rating: "4.8",
      img: "/product-serum-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Formula lembut, minim iritasi",
      price: "Rp 195.000", rating: "4.8",
      img: "/product-cream-bg.png",
    },
  ],
};

export function SkinTypeSection() {
  const [active, setActive] = useState("normal");
  const products = productsByType[active] ?? [];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-8xl px-4 md:px-8">

        {/* Header */}
        <div className="mb-3 text-center">
          <h2 className="font-serif text-3xl font-semibold text-brand-900 md:text-4xl">
            Product Recommendations
          </h2>
          <p className="mt-3 text-sm text-brand-500">
            Rekomendasi produk Ginabo sesuai kondisi kulitmu.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex justify-start gap-2 overflow-x-auto pb-1 md:justify-center md:gap-3">
          {skinTypes.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setActive(t.slug)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200
                ${ active === t.slug
                  ? "bg-brand-800 text-white shadow-sm"
                  : "bg-brand-100 text-brand-700 hover:bg-brand-200" }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {products.map((p) => (
            <Link
              key={p.name}
              href="/shop"
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-brand-sm transition hover:shadow-brand"
            >
              {/* Product image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-brand-700/90 py-2.5 text-xs font-semibold text-white transition-transform duration-200 group-hover:translate-y-0">
                  + Tambah ke Keranjang
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <div className="text-[11px] font-medium uppercase tracking-wide text-brand-400">{p.type}</div>
                <div className="text-sm font-semibold leading-snug text-brand-900 md:text-base">{p.name}</div>
                <div className="text-xs text-brand-500">{p.desc}</div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div>
                    <div className="text-xs text-amber-400">★ {p.rating}</div>
                    <div className="font-bold text-brand-700">{p.price}</div>
                  </div>
                  <span className="rounded-xl border border-brand-700 px-3 py-1.5 text-[11px] font-semibold text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                    Beli
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-brand-800 px-8 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-800 hover:text-white"
          >
            Lihat Semua Produk →
          </Link>
        </div>

      </div>
    </section>
  );
}
