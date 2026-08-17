"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// --- Type Definitions for props ---
export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  name: string;
  title: string;
  quote?: string;
  avatarSrc: string;
  rating: number;
}

export interface ClientsSectionProps {
  tagLabel: string;
  title: string;
  description: string;
  stats: Stat[];
  testimonials: Testimonial[];
  primaryActionLabel: string;
  secondaryActionLabel: string;
  primaryActionHref?: string;
  secondaryActionHref?: string;
  className?: string;
}

// --- Internal Sub-Components ---

// StatCard using explicit styling
const StatCard = ({ value, label }: Stat) => (
  <Card className="bg-slate-50 border border-slate-200 text-center rounded-xl">
    <CardContent className="p-4">
      <p className="text-3xl font-bold text-[#4A1A5E]">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </CardContent>
  </Card>
);

// A sticky testimonial card for the stacking effect (sticky on both mobile and desktop).
const StickyTestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  return (
    <motion.div
      style={{
        "--sticky-top": `${70 + index * 20}px`, // Compact stack offset for both mobile and desktop
      } as React.CSSProperties}
      className="sticky top-[var(--sticky-top)] w-full"
    >
      <div className={cn(
        "p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg flex flex-col h-auto w-full",
        "bg-white border border-slate-200/80 text-[#1a1a1a]"
      )}>
        {/* Top section: Image and Author */}
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: `url(${testimonial.avatarSrc})` }}
            aria-label={`Photo of ${testimonial.name}`}
          />
          <div className="flex-grow">
            <p className="font-semibold text-sm md:text-lg text-[#4A1A5E]">{testimonial.name}</p>
            <p className="text-xs md:text-sm text-slate-500">{testimonial.title}</p>
          </div>
        </div>

        {/* Middle section: Rating */}
        <div className="flex items-center gap-2 my-2 md:my-4">
          <span className="font-bold text-xs md:text-base text-slate-800">{testimonial.rating.toFixed(1)}</span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 md:h-4 w-3 md:w-4",
                  i < Math.floor(testimonial.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-slate-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Bottom section: Quote */}
        {testimonial.quote && (
          <p className="text-xs md:text-base text-slate-600 italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
        )}
      </div>
    </motion.div>
  );
};

// --- Main Exported Component ---

export const ClientsSection = ({
  tagLabel,
  title,
  description,
  stats,
  testimonials,
  primaryActionLabel,
  secondaryActionLabel,
  primaryActionHref,
  secondaryActionHref,
  className,
}: ClientsSectionProps) => {
  return (
    <section className={cn("w-full bg-white text-slate-800 py-20 md:py-28", className)}>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start px-4">
        
        {/* Left Column: Sticky Content */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-600 font-semibold">{tagLabel}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4A1A5E] leading-tight">{title}</h2>
          <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-6">
            {secondaryActionHref ? (
              <Button variant="outline" size="lg" className="rounded-full border-[#9333EA] text-[#9333EA] hover:bg-[#9333EA]/10" asChild>
                <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
              </Button>
            ) : (
              <Button variant="outline" size="lg" className="rounded-full border-[#9333EA] text-[#9333EA] hover:bg-[#9333EA]/10">{secondaryActionLabel}</Button>
            )}

            {primaryActionHref ? (
              <Button size="lg" className="rounded-full bg-[#9333EA] text-white hover:bg-[#7C3AED]" asChild>
                <Link href={primaryActionHref}>{primaryActionLabel}</Link>
              </Button>
            ) : (
              <Button size="lg" className="rounded-full bg-[#9333EA] text-white hover:bg-[#7C3AED]">{primaryActionLabel}</Button>
            )}
          </div>
        </div>

        {/* Right Column: Sticky cards stack with bottom padding to cleanly scroll away */}
        <div className="relative flex flex-col gap-6 w-full pb-[40vh] lg:pb-[50vh]">
          {testimonials.map((testimonial, index) => (
            <StickyTestimonialCard
              key={testimonial.name}
              index={index}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
