"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type BannerSlide = {
  src: string;
  alt: string;
  cta1: { img: string; alt: string; href: string };
  cta2: { img: string; alt: string; href: string };
};

const banners: BannerSlide[] = [
  {
    src: "/Banner/banner1.png",
    alt: "Banner Ginabo 1",
    cta1: { img: "/belanja_sekarang.png", alt: "Belanja Sekarang", href: "/shop" },
    cta2: { img: "/tentang_kami.png",     alt: "Tentang Kami",     href: "/about" },
  },
  {
    src: "/Banner/banner2.png",
    alt: "Banner Ginabo 2",
    cta1: { img: "/gabung_sekarang.png", alt: "Gabung Sekarang", href: "/reseller/register" },
    cta2: { img: "/tentang_kami.png",    alt: "Tentang Kami",    href: "/about" },
  },
  {
    src: "/Banner/banner3.png",
    alt: "Banner Ginabo 3",
    cta1: { img: "/mulai_journey.png", alt: "Mulai Journey", href: "/shop" },
    cta2: { img: "/product_kami.png",  alt: "Produk Kami",   href: "/shop" },
  },
  {
    src: "/Banner/banner4.png",
    alt: "Banner Ginabo 4",
    cta1: { img: "/daftar_sekarang.png", alt: "Daftar Sekarang", href: "/reseller/register" },
    cta2: { img: "/tentang_kami.png",    alt: "Tentang Kami",    href: "/about" },
  },
  {
    src: "/Banner/banner5.png",
    alt: "Banner Ginabo 5",
    cta1: { img: "/belanja_sekarang.png", alt: "Belanja Sekarang", href: "/shop" },
    cta2: { img: "/tentang_kami.png",     alt: "Tentang Kami",     href: "/about" },
  },
];

const SLIDE_DURATION = 5000;

type Dir = 1 | -1;

const BEZIER = [0.25, 1, 0.5, 1] as [number, number, number, number];

// Slide transition — crossfade + slight directional push
const slideVariants = {
  enter: (dir: Dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.72, ease: BEZIER },
  },
  exit: (dir: Dir) => ({
    x: dir > 0 ? "-30%" : "30%",
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.6, ease: BEZIER },
  }),
};

// CTA buttons stagger
const ctaContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
};
const ctaItem = {
  hidden: { opacity: 0, y: 18, scale: 0.92 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: BEZIER } },
};

export function HeroBanner() {
  const [index, setIndex]   = useState(0);
  const [dir, setDir]       = useState<Dir>(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((d: Dir) => {
    setDir(d);
    setIndex(i => (i + d + banners.length) % banners.length);
  }, []);

  const goTo = useCallback((n: number) => {
    setDir(n > index ? 1 : -1);
    setIndex(n);
  }, [index]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), SLIDE_DURATION);
    return () => clearInterval(t);
  }, [go, paused]);

  // Touch swipe
  const touchStart = useRef<number | null>(null);
  const touchEnd   = useRef<number | null>(null);
  const MIN_SWIPE  = 50;

  function onTouchStart(e: React.TouchEvent) {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  }
  function onTouchMove(e: React.TouchEvent) {
    touchEnd.current = e.targetTouches[0].clientX;
  }
  function onTouchEnd() {
    if (touchStart.current === null || touchEnd.current === null) return;
    const dist = touchStart.current - touchEnd.current;
    if (Math.abs(dist) >= MIN_SWIPE) go(dist > 0 ? 1 : -1);
    touchStart.current = null;
    touchEnd.current   = null;
  }

  return (
    <section
      className="relative w-full mb-10 sm:mb-12 select-none overflow-hidden [aspect-ratio:16/9] sm:[aspect-ratio:16/7] md:[aspect-ratio:16/6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slides ── */}
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={index}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Ken Burns: subtle zoom-out while slide is visible */}
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          >
            <Image
              src={banners[index].src}
              alt={banners[index].alt}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="100vw"
            />
          </motion.div>

          {/* ── CTA overlay ── */}
          <motion.div
            className="absolute z-10 flex items-center gap-3 md:gap-4 bottom-[15%] left-[5%] sm:bottom-[20%] sm:left-[10%] md:bottom-[18%] md:left-[17%]"
            variants={ctaContainer}
            initial="hidden"
            animate="show"
          >
            {/* Button 1 */}
            <motion.div
              variants={ctaItem}
              whileHover={{ scale: 1.07, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{ filter: "drop-shadow(0 6px 18px rgba(120,37,124,0.45))" }}
            >
              <Link href={banners[index].cta1.href} tabIndex={0}>
                <Image
                  src={banners[index].cta1.img}
                  alt={banners[index].cta1.alt}
                  width={220}
                  height={60}
                  className="h-auto w-[160px] sm:w-[145px] md:w-[185px] lg:w-[210px]"
                  priority
                />
              </Link>
            </motion.div>

            {/* Button 2 — hidden on mobile */}
            <motion.div
              variants={ctaItem}
              className="hidden sm:block"
              whileHover={{ scale: 1.07, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{ filter: "drop-shadow(0 6px 18px rgba(120,37,124,0.30))" }}
            >
              <Link href={banners[index].cta2.href} tabIndex={0}>
                <Image
                  src={banners[index].cta2.img}
                  alt={banners[index].cta2.alt}
                  width={220}
                  height={60}
                  className="h-auto sm:w-[145px] md:w-[185px] lg:w-[210px]"
                  priority
                />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Prev button ── */}
      <motion.button
        onClick={() => go(-1)}
        aria-label="Previous"
        whileHover={{ scale: 1.12, backgroundColor: "rgba(255,255,255,0.95)" }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 hidden sm:flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/75 shadow-lg backdrop-blur-sm transition"
      >
        <svg width="20" height="20" fill="none" stroke="#78257C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </motion.button>

      {/* ── Next button ── */}
      <motion.button
        onClick={() => go(1)}
        aria-label="Next"
        whileHover={{ scale: 1.12, backgroundColor: "rgba(255,255,255,0.95)" }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 hidden sm:flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/75 shadow-lg backdrop-blur-sm transition"
      >
        <svg width="20" height="20" fill="none" stroke="#78257C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </motion.button>

      {/* ── Dot indicators (glassmorphic, animated width) ── */}
      <div
        className="absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2.5 rounded-full px-4 py-2.5"
        style={{
          background:           "rgba(20,5,40,0.70)",
          backdropFilter:       "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border:               "1px solid rgba(255,255,255,0.15)",
          boxShadow:            "0 4px 16px rgba(0,0,0,0.20)",
        }}
      >
        {banners.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            animate={{
              width:           i === index ? 28 : 10,
              backgroundColor: i === index ? "#a855f7" : "rgba(255,255,255,0.45)",
              boxShadow:       i === index ? "0 0 12px rgba(168,85,247,0.7)" : "none",
            }}
            transition={{ duration: 0.38, ease: [0.25, 1, 0.5, 1] }}
            className="h-2.5 rounded-full cursor-pointer"
            style={{ minWidth: 10 }}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      {!paused && (
        <motion.div
          key={`progress-${index}`}
          className="absolute bottom-0 left-0 z-10 h-[3px] rounded-r-full"
          style={{ background: "linear-gradient(90deg, #78257C, #e879f9)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
        />
      )}
    </section>
  );
}
