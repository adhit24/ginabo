"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import JneShippingQuote from "@/components/shipping/JneShippingQuote";
import type { ShippingOption } from "@/lib/rajaongkir";

type Props = {
  open: boolean;
  onClose: () => void;
  city: string;
  province?: string | null;
  weightGrams: number;
  value: ShippingOption | null;
  onConfirm: (option: ShippingOption | null) => void;
  formatPrice: (amountIdr: number) => string;
};

export function ShippingMethodModal({ open, onClose, city, province, weightGrams, value, onConfirm, formatPrice }: Props) {
  const [draft, setDraft] = useState<ShippingOption | null>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pilih Jasa Pengiriman"
      widthClassName="max-w-[520px]"
      footer={
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[6px] border border-[#E0E0E0] bg-white px-5 py-2.5 text-[13px] font-bold text-[#231F20] transition hover:bg-[#F5F5F5]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(draft);
              onClose();
            }}
            disabled={!draft}
            className="flex-1 rounded-[6px] bg-[#8E51B8] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#78257C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Konfirmasi{draft ? ` · ${formatPrice(draft.cost)}` : ""}
          </button>
        </div>
      }
    >
      <JneShippingQuote city={city} province={province} weightGrams={weightGrams} onSelect={setDraft} />
    </Modal>
  );
}
