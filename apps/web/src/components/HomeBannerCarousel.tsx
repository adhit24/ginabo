"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  src: string;
  alt: string;
  href: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(Boolean(mq.matches));
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

export function HomeBannerCarousel({ slides, intervalMs = 3000 }: { slides: Slide[]; intervalMs?: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  const count = slides.length;

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs, prefersReducedMotion]);

  const trackStyle = useMemo(() => {
    const x = -(index * 100);
    return { transform: `translate3d(${x}%, 0, 0)` };
  }, [index]);

  function prev() {
    if (count <= 1) return;
    setIndex((i) => (i - 1 + count) % count);
  }

  function next() {
    if (count <= 1) return;
    setIndex((i) => (i + 1) % count);
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-hero shadow-brand-sm">
      <div
        className={[
          "flex w-full will-change-transform",
          prefersReducedMotion ? "" : "transition-transform duration-700 ease-out"
        ].join(" ")}
        style={trackStyle}
      >
        {slides.map((s) => (
          <Link key={s.src} href={s.href} className="relative block w-full shrink-0">
            <div className="relative aspect-[16/7] w-full md:aspect-[16/6]">
              <Image src={s.src} alt={s.alt} fill className="object-contain" sizes="100vw" priority={slides[0]?.src === s.src} />
            </div>
          </Link>
        ))}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide sebelumnya"
            className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-brand-800 shadow-brand-sm backdrop-blur transition hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Slide berikutnya"
            className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-brand-800 shadow-brand-sm backdrop-blur transition hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  );
}
