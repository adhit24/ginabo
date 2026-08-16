"use client";

import React, { useState } from "react";

export function WhatsAppWidget() {
  const [hovered, setHovered] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6285199264835";
  const defaultMessage = "Halo Ginabo, saya ingin menanyakan tentang produk skincare.";
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <div
      className="fixed bottom-[84px] right-[28px] z-[999] flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip Label */}
      <div
        className={`mr-3 px-3 py-1.5 rounded-[6px] bg-[#25D366] text-white text-[12px] font-semibold shadow-md whitespace-nowrap transition-all duration-300 transform origin-right ${
          hovered ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-2 scale-95 pointer-events-none"
        }`}
      >
        Tanya Beauty Advisor 💬
      </div>

      {/* Main Link/Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi kami melalui WhatsApp"
        className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* Pulsing Outer Ring (Exactly centered inside the button) */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-60 pointer-events-none"></span>

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="relative z-10 text-white"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.063 5.285 5.348 0 11.838 0c3.146.001 6.101 1.227 8.324 3.454a11.66 11.66 0 0 1 3.45 8.349c-.006 6.55-5.292 11.835-11.785 11.835-2.007-.001-3.98-.521-5.733-1.51L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.309 0 9.622-4.263 9.627-9.517a9.49 9.49 0 0 0-2.83-6.793 9.53 9.53 0 0 0-6.8-2.816C6.183 2.478 1.87 6.743 1.865 12c-.001 1.636.467 3.23 1.354 4.615l-.997 3.64 3.825-.961zm11.366-5.467c-.29-.145-1.716-.848-1.98-.944-.264-.096-.456-.145-.648.145-.191.29-.74.944-.906 1.135-.166.19-.33.21-.62.066-2.946-1.468-4.717-3.957-5.454-5.234-.294-.51.058-.474.348-.823.136-.165.205-.29.3-.483.097-.19.048-.36-.024-.505-.072-.144-.648-1.56-.888-2.137-.233-.56-.47-.482-.648-.492-.166-.01-.36-.01-.553-.01s-.507.072-.77.36c-.265.29-1.01.99-1.01 2.416s1.037 2.802 1.182 2.996c.145.19 2.04 3.115 4.94 4.373.69.298 1.229.477 1.65.61.694.22 1.326.19 1.825.114.557-.084 1.716-.7 1.96-1.376.244-.677.244-1.256.17-1.376-.073-.12-.263-.19-.553-.335z" />
        </svg>
      </a>
    </div>
  );
}
