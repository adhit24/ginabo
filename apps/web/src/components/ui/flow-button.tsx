"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const SIZE_CLASS = {
  default: "px-8 py-3 text-sm",
  compact: "px-4 py-2 text-xs gap-0.5",
} as const;

const FLOW_BUTTON_BASE =
  "group relative flex items-center justify-center overflow-hidden rounded-[100px] border-[1.5px] border-[#8E51B8] bg-transparent font-bold text-[#8E51B8] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50";

type Size = keyof typeof SIZE_CLASS;

function FlowButtonContent({ text, size }: { text: string; size: Size }) {
  const isCompact = size === "compact";

  return (
    <>
      {/* Left arrow (arr-2) */}
      <ArrowRight
        className={
          isCompact
            ? "absolute w-3.5 h-3.5 left-[-25%] stroke-[#8E51B8] fill-none z-[9] group-hover:left-3 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            : "absolute w-3.5 h-3.5 left-[-25%] stroke-[#8E51B8] fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        }
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Circle */}
      <span
        className={
          isCompact
            ? "absolute inset-0 bg-[#78257C] scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
            : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#78257C] rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
        }
      />

      {/* Right arrow (arr-1) */}
      <ArrowRight
        className={
          isCompact
            ? "absolute w-3.5 h-3.5 right-3 stroke-[#8E51B8] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            : "absolute w-3.5 h-3.5 right-4 stroke-[#8E51B8] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        }
      />
    </>
  );
}

type FlowLinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  text?: string;
  href: string;
  size?: Size;
};

type FlowActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string;
  href?: undefined;
  size?: Size;
};

type FlowButtonProps = FlowLinkButtonProps | FlowActionButtonProps;

/** Pill CTA that morphs into a rounded-corner filled button on hover. Renders a Link when `href` is passed, otherwise a `<button>`. Use size="compact" in tight spaces (grid cards) so the hover bloom doesn't overflow into neighboring elements. */
export function FlowButton({ text = "Modern Button", className = "", href, size = "default", ...props }: FlowButtonProps) {
  const classes = `${FLOW_BUTTON_BASE} ${SIZE_CLASS[size]} ${className}`;

  if (href !== undefined) {
    return (
      <Link href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <FlowButtonContent text={text} size={size} />
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <FlowButtonContent text={text} size={size} />
    </button>
  );
}
