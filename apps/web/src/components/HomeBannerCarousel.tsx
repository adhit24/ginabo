"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type Slide = {
  src: string;
  alt: string;
  href?: string;
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

export function HomeBannerCarousel({
  slides,
  intervalMs = 3000,
  className,
  aspectClassName,
  imageClassName,
  children,
}: {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
  aspectClassName?: string;
  imageClassName?: string;
  children?: ReactNode;
}) {
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

  function goTo(i: number) {
    if (count <= 1) return;
    const nextIndex = ((i % count) + count) % count;
    setIndex(nextIndex);
  }

  return (
    <div className={className ?? "relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-hero shadow-brand-sm"}>
      <div
        className={[
          "flex w-full will-change-transform",
          prefersReducedMotion ? "" : "transition-transform duration-700 ease-out"
        ].join(" ")}
        style={trackStyle}
      >
        {slides.map((s) => {
          const inner = (
            <div className={aspectClassName ?? "relative aspect-[16/7] w-full md:aspect-[16/6]"}>
              <Image
                src={s.src}
                alt={s.alt}
                fill
                className={imageClassName ?? "object-contain"}
                sizes="100vw"
                priority={slides[0]?.src === s.src}
              />
            </div>
          );

          return s.href ? (
            <Link key={s.src} href={s.href} className="relative block w-full shrink-0">
              {inner}
            </Link>
          ) : (
            <div key={s.src} className="relative block w-full shrink-0">
              {inner}
            </div>
          );
        })}
      </div>

      {children ? <div className="absolute inset-0 z-10">{children}</div> : null}

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide sebelumnya"
            className="absolute left-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-brand-800 shadow-brand-sm backdrop-blur transition hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Slide berikutnya"
            className="absolute right-3 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/70 text-brand-800 shadow-brand-sm backdrop-blur transition hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/35 bg-white/30 px-3 py-2 backdrop-blur">
              {slides.map((s, i) => {
                const active = i === index;
                return (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Ke slide ${i + 1}`}
                    aria-current={active ? "true" : "false"}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition",
                      active ? "bg-brand-800" : "bg-white/70 hover:bg-white"
                    ].join(" ")}
                  />
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
