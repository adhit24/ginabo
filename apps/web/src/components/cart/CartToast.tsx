"use client";

import { useEffect, useState } from "react";

interface CartToastProps {
  show: boolean;
  onDone: () => void;
}

export function CartToast({ show, onDone }: CartToastProps) {
  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    setAnimOut(false);

    const hideTimer = setTimeout(() => {
      setAnimOut(true);
    }, 1800);

    const doneTimer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 2200);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        animOut ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      style={{ transitionProperty: "opacity, transform" }}
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-10 py-8 shadow-2xl ring-1 ring-gray-100">
        {/* Icon bag + arrow */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Arrow down circle */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5a6e4e] text-white shadow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>
          {/* Shopping bag */}
          <svg
            width="52"
            height="52"
            viewBox="0 0 48 48"
            fill="none"
            stroke="#6b7c5c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="8" y="16" width="32" height="26" rx="3" />
            <path d="M16 16v-4a8 8 0 0116 0v4" />
          </svg>
        </div>

        {/* Text */}
        <p className="text-center text-sm font-medium leading-relaxed text-gray-700">
          Produk berhasil ditambahkan
          <br />
          ke
          <br />
          keranjang belanja
        </p>
      </div>
    </div>
  );
}
