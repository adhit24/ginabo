"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const FLOW_BUTTON_CLASS =
  "group relative flex items-center justify-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#8E51B8] bg-transparent px-8 py-3 text-sm font-bold text-[#8E51B8] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-50";

function FlowButtonContent({ text }: { text: string }) {
  return (
    <>
      {/* Left arrow (arr-2) */}
      <ArrowRight
        className="absolute w-4 h-4 left-[-25%] stroke-[#8E51B8] fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#78257C] rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]" />

      {/* Right arrow (arr-1) */}
      <ArrowRight
        className="absolute w-4 h-4 right-4 stroke-[#8E51B8] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      />
    </>
  );
}

type FlowLinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  text?: string;
  href: string;
};

type FlowActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string;
  href?: undefined;
};

type FlowButtonProps = FlowLinkButtonProps | FlowActionButtonProps;

/** Pill CTA that morphs into a rounded-corner filled button on hover. Renders a Link when `href` is passed, otherwise a `<button>`. */
export function FlowButton({ text = "Modern Button", className = "", href, ...props }: FlowButtonProps) {
  if (href !== undefined) {
    return (
      <Link href={href} className={`${FLOW_BUTTON_CLASS} ${className}`} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <FlowButtonContent text={text} />
      </Link>
    );
  }

  return (
    <button className={`${FLOW_BUTTON_CLASS} ${className}`} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <FlowButtonContent text={text} />
    </button>
  );
}
