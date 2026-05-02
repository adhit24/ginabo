"use client";

interface MarqueeProps {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: string;
}

export function Marquee({
  items,
  speed = 30,
  reverse = false,
  className,
  itemClassName,
  separator = "✦",
}: MarqueeProps) {
  // Duplicate so the loop is seamless — CSS animates translateX(-50%)
  const doubled = [...items, ...items];

  return (
    <div
      className={`overflow-hidden ${className ?? ""}`}
      style={{
        "--marquee-speed": `${speed}s`,
        "--marquee-dir": reverse ? "reverse" : "normal",
      } as React.CSSProperties}
    >
      <ul className="marquee-track flex list-none m-0 p-0 w-max" aria-hidden="true">
        {doubled.map((item, i) => (
          <li key={i} className={`shrink-0 flex items-center ${itemClassName ?? ""}`}>
            <span className="px-5">{item}</span>
            <span className="opacity-25 text-xs">{separator}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
