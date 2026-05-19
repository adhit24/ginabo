"use client";

import { useState, useEffect, useCallback } from "react";
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
    src: "/Banner1.png",
    alt: "Banner Ginabo 1",
    cta1: { img: "/belanja_sekarang.png", alt: "Belanja Sekarang", href: "/shop" },
    cta2: { img: "/tentang_kami.png",     alt: "Tentang Kami",     href: "/about" },
  },
  {
    src: "/banner2.png",
    alt: "Banner Ginabo 2",
    cta1: { img: "/gabung_sekarang.png", alt: "Gabung Sekarang", href: "/reseller/register" },
    cta2: { img: "/tentang_kami.png",    alt: "Tentang Kami",    href: "/about" },
  },
  {
    src: "/banner3.png",
    alt: "Banner Ginabo 3",
    cta1: { img: "/mulai_journey.png", alt: "Mulai Journey", href: "/shop" },
    cta2: { img: "/product_kami.png",  alt: "Produk Kami",   href: "/shop" },
  },
  {
    src: "/banner4.png",
    alt: "Banner Ginabo 4",
    cta1: { img: "/daftar_sekarang.png", alt: "Daftar Sekarang", href: "/reseller/register" },
    cta2: { img: "/tentang_kami.png",    alt: "Tentang Kami",    href: "/about" },
  },
];

const SLIDE_DURATION = 5000;

type Dir = 1 | -1;

const BEZIER = [0.25, 1, 0.5, 1] as [number, number, number, number];

const variants = {
  enter: (dir: Dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: BEZIER },
  },
  exit: (dir: Dir) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.6, ease: BEZIER },
  }),
};

export function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [dir, setDir]     = useState<Dir>(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((d: Dir) => {
    setDir(d);
    setIndex(i => (i + d + banners.length) % banners.length);
  }, []);

  const goTo = useCallback((n: number) => {
    setDir(n > index ? 1 : -1);
    setIndex(n);
  }, [index]);

  // auto-play
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), SLIDE_DURATION);
    return () => clearInterval(t);
  }, [go, paused]);

  return (
    <section
      className="relative w-full overflow-hidden select-none [aspect-ratio:4/3] sm:[aspect-ratio:16/7] md:[aspect-ratio:16/6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ── */}
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={index}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <Image
            src={banners[index].src}
            alt={banners[index].alt}
            fill
            className="object-contain object-center"
            priority={index === 0}
            sizes="100vw"
          />

          {/* ── CTA overlay: all slides ── */}
          <motion.div
            className="absolute z-10 flex items-center gap-3 md:gap-4"
            style={{ bottom: "18%", left: "17%" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: BEZIER, delay: 0.3 }}
          >
            {/* Button 1 */}
            <motion.div
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ filter: "drop-shadow(0 6px 18px rgba(120,37,124,0.45))" }}
            >
              <Link href={banners[index].cta1.href} tabIndex={0}>
                <Image
                  src={banners[index].cta1.img}
                  alt={banners[index].cta1.alt}
                  width={220}
                  height={60}
                  className="h-auto w-[90px] xs:w-[110px] sm:w-[145px] md:w-[185px] lg:w-[210px]"
                  priority
                />
              </Link>
            </motion.div>

            {/* Button 2 */}
            <motion.div
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ filter: "drop-shadow(0 6px 18px rgba(120,37,124,0.30))" }}
            >
              <Link href={banners[index].cta2.href} tabIndex={0}>
                <Image
                  src={banners[index].cta2.img}
                  alt={banners[index].cta2.alt}
                  width={220}
                  height={60}
                  className="h-auto w-[90px] xs:w-[110px] sm:w-[145px] md:w-[185px] lg:w-[210px]"
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
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.95)" }}
        whileTap={{ scale: 0.92 }}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/75 shadow-lg backdrop-blur-sm transition"
      >
        <svg width="20" height="20" fill="none" stroke="#78257C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </motion.button>

      {/* ── Next button ── */}
      <motion.button
        onClick={() => go(1)}
        aria-label="Next"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.95)" }}
        whileTap={{ scale: 0.92 }}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/75 shadow-lg backdrop-blur-sm transition"
      >
        <svg width="20" height="20" fill="none" stroke="#78257C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </motion.button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            animate={{
              width: i === index ? 28 : 8,
              backgroundColor: i === index ? "#78257C" : "rgba(255,255,255,0.7)",
            }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="h-2 rounded-full shadow"
            style={{ minWidth: 8 }}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      {!paused && (
        <motion.div
          key={`progress-${index}`}
          className="absolute bottom-0 left-0 z-10 h-[3px] rounded-full"
          style={{ background: "#78257C" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
        />
      )}
    </section>
  );
}
