"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  to: number;
  from?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  to,
  from = 0,
  suffix = "",
  prefix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const spring = useSpring(from, { stiffness: 50, damping: 20, restDelta: 0.5 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (isInView) spring.set(to);
  }, [isInView, spring, to]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
