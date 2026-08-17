"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ResellerBenefitCardProps {
  imageSrc: string;
  alt: string;
  className?: string;
}

export default function ResellerBenefitCard({
  imageSrc,
  alt,
  className,
}: ResellerBenefitCardProps) {
  return (
    <motion.div
      initial={{ y: 0, scale: 1 }}
      whileHover={{
        y: -10,
        scale: 1.025,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 18,
      }}
      style={{
        x: "var(--shift-x, 0px)",
      }}
      className={cn("relative w-full aspect-[3/4] cursor-pointer select-none", className)}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-contain"
        priority
      />
    </motion.div>
  );
}
