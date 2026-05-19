"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { store, type GFlashItem } from "@/lib/adminStore";

export function FlashSaleSection() {
  const [time, setTime]           = useState<{ h: number; m: number; s: number } | null>(null);
  const [flashProducts, setFlash] = useState<GFlashItem[]>([]);

  useEffect(() => { setFlash(store.getFlash()); }, []);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(20, 0, 0, 0);
      if (end <= now) end.setDate(end.getDate() + 1);
      const d = end.getTime() - now.getTime();
      return {
        h: Math.floor(d / 3600000),
        m: Math.floor((d % 3600000) / 60000),
        s: Math.floor((d % 60000) / 1000),
      };
    };
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="py-10 md:py-14" style={{ background: "#2a2356" }}>
      <div className="mx-auto w-full max-w-8xl px-4 md:px-8">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="badge-bg rounded-[10px] px-4 sm:px-8 py-2">
              <span className="font-bold text-white text-[13px] tracking-wider">Flash Sale</span>
            </div>
            {time && (
              <div className="flex items-center gap-1">
                <span className="mr-1 text-[12px] text-[#ffa8f8]">Berakhir dalam</span>
                {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
                  <span key={i} className="flex items-center">
                    <span
                      className="rounded-lg px-2.5 py-1 font-bold text-white text-[16px] tabular-nums"
                      style={{ background: "#4a3662" }}
                    >
                      {v}
                    </span>
                    {i < 2 && <span className="mx-1 font-bold text-[16px] text-[#ffa8f8]">:</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link href="/shop" className="text-sm font-semibold text-[#ffa8f8] hover:underline">
            Lihat Semua →
          </Link>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {flashProducts.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <Link
                href="/shop"
                className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-brand-sm transition hover:shadow-brand"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <span
                    className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    style={{ background: "#cf99b4" }}
                  >
                    -{p.discount}
                  </span>
                  <div
                    className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center py-3 text-xs font-semibold text-white transition-transform duration-200 group-hover:translate-y-0"
                    style={{ background: "#78257Cee" }}
                  >
                    Lihat Produk →
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3 md:p-4">
                  <div className="text-[11px] text-brand-400">{p.type}</div>
                  <div className="text-sm font-semibold leading-snug text-brand-900 md:text-base">{p.name}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold" style={{ color: "#665dac" }}>{p.salePrice}</span>
                    <span className="text-[11px] line-through text-brand-400">{p.original}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
