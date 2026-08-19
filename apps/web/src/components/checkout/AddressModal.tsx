"use client";

import { Modal } from "@/components/ui/Modal";
import { AddressPicker } from "@/components/checkout/AddressPicker";
import type { AddressRow } from "@/types/database";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (id: string | null, address?: AddressRow) => void;
};

export function AddressModal({ open, onClose, selectedId, onSelect }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pilih Alamat Pengiriman"
      widthClassName="max-w-[560px]"
      footer={
        <button
          type="button"
          onClick={onClose}
          disabled={!selectedId}
          className="inline-flex w-full items-center justify-center rounded-[6px] bg-[#8E51B8] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#78257C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Gunakan Alamat Ini
        </button>
      }
    >
      <AddressPicker selectedId={selectedId} onSelect={onSelect} />
    </Modal>
  );
}
