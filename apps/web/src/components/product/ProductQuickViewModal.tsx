"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { FlowButton } from "@/components/ui/flow-button";

export type QuickViewProduct = {
  productId: string;
  slug: string;
  name: string;
  priceMinor: number;
  originalPriceMinor?: number | null;
  currency: "IDR" | "USD";
  imageUrl: string | null;
};

type Props = {
  open: boolean;
  product: QuickViewProduct | null;
  onClose: () => void;
  onAddToCart: (product: QuickViewProduct, quantity: number) => void;
  formatPrice: (amountIdr: number) => string;
};

export function ProductQuickViewModal({ open, product, onClose, onAddToCart, formatPrice }: Props) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) setQty(1);
  }, [open, product?.productId]);

  if (!product) return null;

  const discountPct = product.originalPriceMinor
    ? Math.round((1 - product.priceMinor / product.originalPriceMinor) * 100)
    : 0;

  return (
    <Modal open={open} onClose={onClose} title="Lihat Cepat Produk" widthClassName="max-w-[680px]">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-[8px] bg-[#FAF8FC]">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-4" />
          ) : (
            <div className="grid h-full place-items-center text-[12px] text-gray-400">Belum ada foto</div>
          )}
          {discountPct > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#F94A8C] px-2.5 py-1 text-[10px] font-bold text-white">
              {discountPct}% Off
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <Link
            href={`/shop/${product.slug}`}
            onClick={onClose}
            className="text-[16px] font-bold leading-snug text-[#231F20] hover:text-[#8E51B8] transition"
          >
            {product.name}
          </Link>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[22px] font-extrabold text-[#E91E63]">{formatPrice(product.priceMinor)}</span>
            {product.originalPriceMinor && (
              <span className="text-[13px] text-[#9CA3AF] line-through">{formatPrice(product.originalPriceMinor)}</span>
            )}
          </div>
          {discountPct > 0 && (
            <p className="mt-1 text-[12px] font-medium text-emerald-600">
              Hemat {formatPrice((product.originalPriceMinor ?? 0) - product.priceMinor)}
            </p>
          )}

          <div className="mt-6">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-[#707070]">Jumlah</span>
            <div className="inline-flex items-center rounded-[6px] border border-[#E0E0E0] bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-[16px] text-[#707070] transition hover:bg-[#F5F5F5] disabled:opacity-30"
                disabled={qty <= 1}
                aria-label="Kurangi jumlah"
              >
                −
              </button>
              <span className="min-w-10 text-center text-[14px] font-bold text-[#231F20]">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center text-[16px] text-[#707070] transition hover:bg-[#F5F5F5]"
                aria-label="Tambah jumlah"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 pt-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#707070]">Total Harga</p>
              <p className="text-[16px] font-extrabold text-[#231F20]">{formatPrice(product.priceMinor * qty)}</p>
            </div>
            <FlowButton type="button" onClick={() => onAddToCart(product, qty)} text="Add to Cart" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
