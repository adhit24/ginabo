"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

// Refined deceleration — feels decisive, not bouncy
const EASE = [0.25, 1, 0.5, 1] as const;

interface RevealProps {
  children: ReactNode;
  direction?: "up" | "left" | "right" | "down" | "scale";
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.65,
  className,
  style,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{
        opacity: 0,
        x: direction === "left" ? -48 : direction === "right" ? 48 : 0,
        y: direction === "up" ? 36 : direction === "down" ? -36 : 0,
        scale: direction === "scale" ? 0.88 : 1,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
