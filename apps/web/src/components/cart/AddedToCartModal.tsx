"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { FlowButton } from "@/components/ui/flow-button";
import { useCart } from "@/components/cart/CartProvider";
import { listActiveProducts, type CatalogProduct } from "@/lib/catalog";

export type AddedCartItem = {
  productId: string;
  slug: string;
  name: string;
  priceMinor: number;
  quantity: number;
  imageUrl: string | null;
};

type Props = {
  open: boolean;
  item: AddedCartItem | null;
  onClose: () => void;
  formatPrice: (amountIdr: number) => string;
};

export function AddedToCartModal({ open, item, onClose, formatPrice }: Props) {
  const { addItem } = useCart();
  const [crossSell, setCrossSell] = useState<CatalogProduct[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !item) return;
    setAddedIds(new Set());
    let cancelled = false;
    listActiveProducts()
      .then((products) => {
        if (cancelled) return;
        setCrossSell(products.filter((p) => p.id !== item.productId).slice(0, 4));
      })
      .catch(() => setCrossSell([]));
    return () => {
      cancelled = true;
    };
  }, [open, item]);

  if (!item) return null;

  function handleQuickAdd(p: CatalogProduct) {
    addItem(
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        priceMinor: p.priceMinor,
        currency: p.currency,
        imageUrl: p.images[0]?.url ?? null,
        weightGrams: p.weightGrams,
      },
      1
    );
    setAddedIds((prev) => new Set(prev).add(p.id));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Berhasil Ditambahkan"
      widthClassName="max-w-[620px]"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-[6px] border border-[#E0E0E0] bg-white px-5 py-2.5 text-[13px] font-bold text-[#231F20] transition hover:bg-[#F5F5F5]"
          >
            Lanjut Belanja
          </button>
          <FlowButton href="/cart" onClick={onClose} text="Lihat Keranjang" className="flex-1" />
        </div>
      }
    >
      <div className="flex items-center gap-4 rounded-[8px] border border-[#EDEDED] bg-[#FAF8FC] p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[6px] bg-white">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain p-1.5" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[13.5px] font-bold text-[#231F20]">{item.name}</p>
          <p className="mt-0.5 text-[12px] text-[#707070]">{item.quantity} item</p>
        </div>
        <span className="shrink-0 text-[14px] font-bold text-[#E91E63]">{formatPrice(item.priceMinor * item.quantity)}</span>
      </div>

      {crossSell.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-[#707070]">Cocok Dipakai Bersama</p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
            {crossSell.map((p) => {
              const isAdded = addedIds.has(p.id);
              return (
                <div key={p.id} className="w-[128px] shrink-0">
                  <Link href={`/shop/${p.slug}`} onClick={onClose} className="block">
                    <div className="relative aspect-square w-full overflow-hidden rounded-[6px] bg-[#FAF8FC]">
                      {p.images[0]?.url ? (
                        <img src={p.images[0].url} alt={p.name} className="h-full w-full object-contain p-2" />
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-[11.5px] font-semibold leading-snug text-[#231F20]">{p.name}</p>
                  </Link>
                  <div className="mt-1 flex items-center justify-between gap-1.5">
                    <span className="text-[11.5px] font-bold text-[#E91E63]">{formatPrice(p.priceMinor)}</span>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(p)}
                      disabled={isAdded}
                      aria-label={`Tambah ${p.name} ke keranjang`}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white transition ${
                        isAdded ? "bg-emerald-500" : "bg-[#8E51B8] hover:bg-[#78257C]"
                      }`}
                    >
                      {isAdded ? (
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" viewBox="0 0 24 24">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      ) : (
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" viewBox="0 0 24 24">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
