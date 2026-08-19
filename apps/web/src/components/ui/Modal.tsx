"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export function Modal({ open, onClose, title, children, footer, widthClassName = "max-w-[520px]" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[1000] flex items-end justify-center transition-opacity duration-300 sm:items-center sm:p-4 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
        style={{ backdropFilter: "blur(2px)" }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex w-full ${widthClassName} flex-col overflow-hidden rounded-t-[16px] bg-white shadow-2xl transition-transform duration-300 ease-out sm:rounded-[10px] ${
          open ? "translate-y-0" : "translate-y-8 sm:translate-y-4"
        }`}
        style={{ maxHeight: "min(88vh, 720px)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#EDEDED] px-5 py-4 sm:px-6">
          <h2 className="text-[15px] font-bold text-[#231F20] sm:text-[16px]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="relative -m-2.5 flex h-9 w-9 items-center justify-center rounded-full text-[#707070] transition hover:bg-[#F5F5F5] hover:text-[#231F20]"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && <div className="shrink-0 border-t border-[#EDEDED] px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
