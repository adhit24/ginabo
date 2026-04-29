"use client";

import { useState } from "react";

const filterGroups = [
  {
    label: "Based on Product Highlight",
    options: [
      "Best Seller/Most Popular Product",
      "New Arrival/Special Release",
      "Skincare Set/Bundle",
      "Raya Package",
    ],
  },
  {
    label: "Based on Skin Condition",
    options: [
      "Acne Prone Skin",
      "Dry Skin",
      "Oily Skin",
      "Sensitive Skin",
    ],
  },
  {
    label: "Based on Type of Product",
    options: [
      "Facial Cleanser",
      "Moisturizer",
      "Serum/Ampoule",
      "Sheet Mask/Serum Mask",
    ],
  },
];

export function FilterSidebar() {
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Based on Product Highlight": true,
    "Based on Skin Condition": true,
    "Based on Type of Product": true,
  });

  function toggle(label: string) {
    setOpen(prev => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="hidden w-48 shrink-0 lg:block">
      <div className="sticky top-24 flex flex-col divide-y divide-gray-100 border-y border-gray-100 bg-white">
        {filterGroups.map(g => (
          <div key={g.label}>
            {/* Group header */}
            <button
              onClick={() => toggle(g.label)}
              className="flex w-full items-start justify-between gap-3 px-0 py-4 text-left"
            >
              <span className="text-sm font-semibold leading-snug text-gray-800">
                {g.label}
              </span>
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className={`mt-0.5 shrink-0 text-gray-500 transition-transform duration-200 ${open[g.label] ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Options */}
            {open[g.label] && (
              <div className="flex flex-col gap-0 pb-4">
                {g.options.map(o => (
                  <button
                    key={o}
                    className="w-full py-2 pl-3 text-left text-sm leading-snug text-gray-500 transition hover:text-gray-900"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
