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
      type: "Serum · 30ml", desc: "Bantu kulit tampak lebih cerah alami, tetap nyaman dipakai harian",
      price: "Rp 285.000", rating: "4.9",
      img: "/product-serum-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Menutrisi dan bantu jaga skin barrier, nyaman dipakai pagi dan malam",
      price: "Rp 195.000", rating: "4.8",
      img: "/product-cream-bg.png",
    },
    {
      name: "Daily Skin Nutrition Set",
      type: "Bundling Set", desc: "Rutinitas AM/PM yang simpel, praktis untuk dipakai konsisten",
      price: "Rp 380.000", rating: "5.0",
      img: "/product-bundle.png",
    },
  ],
  kering: [
    {
      name: "Hydra Moist Gel Ultimate",
      type: "DNA Salmon · 30ml", desc: "Bantu hidrasi dan menenangkan saat kulit terasa kering atau capek",
      price: "Rp 215.000", rating: "4.7",
      img: "/product-dna-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Nourishing tapi tetap terasa ringan, bantu jaga kenyamanan kulit",
      price: "Rp 195.000", rating: "4.9",
      img: "/product-cream-bg.png",
    },
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 30ml", desc: "Bantu kulit tampak lebih cerah alami dengan tekstur yang nyaman dipakai",
      price: "Rp 285.000", rating: "4.9",
      img: "/product-serum-bg.png",
    },
  ],
  berminyak: [
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 30ml", desc: "Ringan dan cepat meresap, nyaman untuk aktivitas dan sebelum makeup",
      price: "Rp 285.000", rating: "4.9",
      img: "/product-serum-bg.png",
    },
    {
      name: "Hydra Moist Gel Ultimate",
      type: "DNA Salmon · 30ml", desc: "Tekstur gel ringan untuk hidrasi tanpa rasa berat",
      price: "Rp 215.000", rating: "4.7",
      img: "/product-dna-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Membantu lock in hidrasi dengan rasa yang tetap nyaman",
      price: "Rp 195.000", rating: "4.8",
      img: "/product-cream-bg.png",
    },
  ],
  kombinasi: [
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 30ml", desc: "Serum harian yang simpel, bantu kulit tampak lebih segar dan cerah alami",
      price: "Rp 285.000", rating: "4.9",
      img: "/product-serum-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Hidrasi yang nyaman, membantu menjaga skin barrier tetap stabil",
      price: "Rp 195.000", rating: "4.8",
      img: "/product-cream-bg.png",
    },
    {
      name: "Hydra Moist Gel Ultimate",
      type: "DNA Salmon · 30ml", desc: "Bantu menenangkan area yang mudah rewel, terasa ringan di kulit",
      price: "Rp 215.000", rating: "4.7",
      img: "/product-dna-bg.png",
    },
  ],
  sensitif: [
    {
      name: "Hydra Moist Gel Ultimate",
      type: "DNA Salmon · 30ml", desc: "Membantu menenangkan dan mendukung recovery untuk kulit sensitif",
      price: "Rp 215.000", rating: "4.9",
      img: "/product-dna-bg.png",
    },
    {
      name: "GlowAge Multi-Active Serum",
      type: "Serum · 20ml", desc: "Ukuran travel untuk mulai rutinitas yang nyaman dipakai dan tidak ribet",
      price: "Rp 285.000", rating: "4.8",
      img: "/product-serum-bg.png",
    },
    {
      name: "Bright & Care Moisture Cream",
      type: "Moisturizer · 10g", desc: "Moisture cream untuk bantu jaga kenyamanan dan kelembapan harian",
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
