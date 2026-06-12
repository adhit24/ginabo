"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const banners = [
  { src: "/Banner/banner1.png", alt: "Banner Ginabo 1" },
  { src: "/Banner/banner2.png", alt: "Banner Ginabo 2" },
  { src: "/Banner/banner3.png", alt: "Banner Ginabo 3" },
  { src: "/Banner/banner4.png", alt: "Banner Ginabo 4" },
  { src: "/Banner/banner5.png", alt: "Banner Ginabo 5" },
];

const SLIDE_DURATION = 5000;

export function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((d: 1 | -1) => {
    setIndex(i => (i + d + banners.length) % banners.length);
  }, []);

  const goTo = useCallback((n: number) => setIndex(n), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), SLIDE_DURATION);
    return () => clearInterval(t);
  }, [go, paused]);

  // Touch swipe
  const touchStart = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.targetTouches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const dist = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(dist) >= 50) go(dist > 0 ? 1 : -1);
    touchStart.current = null;
  }

  return (
    <section
      className="relative w-full overflow-hidden select-none h-[56.25vw] md:h-[min(50vw,60vh)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {banners.map((b, i) => (
        <div
          key={b.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
        >
          <Image
            src={b.src}
            alt={b.alt}
            fill
            className="object-cover object-top"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Prev button */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/75 hover:bg-white transition shadow"
      >
        <svg width="18" height="18" fill="none" stroke="#78257C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/75 hover:bg-white transition shadow"
      >
        <svg width="18" height="18" fill="none" stroke="#78257C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="h-2 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: i === index ? 24 : 8,
              background: i === index ? "#78257C" : "rgba(255,255,255,0.6)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
