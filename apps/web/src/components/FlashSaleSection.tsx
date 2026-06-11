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
    <section
      className="relative overflow-hidden py-14 md:py-20"
      style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1e0a38 55%,#2a1040 100%)" }}
    >
      {/* Glow blobs */}
      <div
        className="pointer-events-none absolute -top-32 left-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-0 h-[400px] w-[400px] translate-x-1/2 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle,#e879f9,transparent 70%)" }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-5 md:px-10">

        {/* ── Header ── */}
        <Reveal>
          <div className="mb-10 flex flex-col items-center gap-5 text-center">

            {/* Badge */}
            <div
              className="flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Penawaran Terbatas</span>
            </div>

            {/* Big title */}
            <h2
              className="font-extrabold uppercase leading-none tracking-tight"
              style={{
                fontSize: "clamp(3rem, 10vw, 7rem)",
                background: "linear-gradient(135deg,#ffffff 0%,#e9d5ff 40%,#e879f9 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Flash Sale
            </h2>

            {/* Countdown */}
            {time && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-white/40">Berakhir dalam</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { v: pad(time.h), label: "JAM" },
                    { v: pad(time.m), label: "MNT" },
                    { v: pad(time.s), label: "DTK" },
                  ].map((seg, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="flex flex-col items-center">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black text-white tabular-nums"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          {seg.v}
                        </span>
                        <span className="mt-0.5 text-[9px] font-bold tracking-widest text-white/30">{seg.label}</span>
                      </span>
                      {i < 2 && <span className="mb-4 text-base font-bold text-white/30">:</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* ── Product cards ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {flashProducts.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <Link
                href="/shop"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Image — square like Produk Kami */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  {/* Discount badge */}
                  <span
                    className="absolute left-2 top-2 z-10 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}
                  >
                    -{p.discount}
                  </span>
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center py-2.5 text-xs font-semibold text-white transition-transform duration-200 group-hover:translate-y-0"
                    style={{ background: "rgba(139,92,246,0.92)" }}
                  >
                    Lihat Produk
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <div className="text-[10px] text-gray-400">{p.type}</div>
                  <div className="text-sm font-semibold leading-snug text-gray-900">{p.name}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "#7c3aed" }}>{p.salePrice}</span>
                    <span className="text-[11px] text-gray-400 line-through">{p.original}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* ── Lihat Semua button ── */}
        <Reveal>
          <div className="mt-10 flex justify-center">
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl px-8 py-3.5 text-sm font-bold text-white transition hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#e879f9)",
                boxShadow: "0 4px 24px rgba(139,92,246,0.40)",
              }}
            >
              <span>Lihat Semua Flash Sale</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
