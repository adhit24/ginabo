"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import type { PaymentMethod } from "@/components/checkout/PaymentMethodSelector";

type Props = {
  open: boolean;
  onClose: () => void;
  value: PaymentMethod | null;
  onConfirm: (method: PaymentMethod) => void;
};

const otherBanks: PaymentMethod[] = [
  { group: "virtual_account", provider: "mandiri_va", label: "Mandiri VA", fee: 4000 },
  { group: "virtual_account", provider: "bni_va", label: "BNI VA", fee: 4000 },
  { group: "virtual_account", provider: "bri_va", label: "BRI VA", fee: 4000 },
  { group: "virtual_account", provider: "mega_va", label: "Bank Mega VA", fee: 3500 },
  { group: "virtual_account", provider: "bsi_va", label: "BSI VA", fee: 3000 },
  { group: "virtual_account", provider: "maybank_va", label: "Maybank VA", fee: 3000 },
];

const primaryRows: { method: PaymentMethod; icon: ReactNode; expandable?: boolean }[] = [
  {
    method: { group: "virtual_account", provider: "bca_va", label: "Virtual Account BCA", fee: 4000 },
    icon: <RowIcon label="BCA" />,
  },
  {
    method: { group: "virtual_account", provider: "mandiri_va", label: "VA Bank Lain", fee: 4000 },
    icon: <RowIcon label="VA" />,
    expandable: true,
  },
  {
    method: { group: "credit_card", provider: "credit_card", label: "Credit Card", fee: 0 },
    icon: <RowIcon label="CC" />,
  },
  {
    method: { group: "e_wallet", provider: "shopeepay", label: "ShopeePay", fee: 0 },
    icon: <RowIcon label="SP" />,
  },
  {
    method: { group: "e_wallet", provider: "gopay", label: "GoPay", fee: 1000 },
    icon: <RowIcon label="GP" />,
  },
  {
    method: { group: "qris", provider: "qris", label: "QRIS", fee: 0 },
    icon: <RowIcon label="QR" />,
  },
];

function RowIcon({ label }: { label: string }) {
  return (
    <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-[6px] border border-[#EDEDED] bg-[#FAF8FC] text-[10px] font-extrabold text-[#8E51B8]">
      {label}
    </span>
  );
}

function feeLabel(fee: number) {
  return fee === 0 ? "Gratis" : `+ Rp ${fee.toLocaleString("id-ID")}`;
}

export function PaymentMethodModal({ open, onClose, value, onConfirm }: Props) {
  const [draft, setDraft] = useState<PaymentMethod | null>(value);
  const [banksOpen, setBanksOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setBanksOpen(false);
    }
  }, [open, value]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pilih Metode Pembayaran"
      widthClassName="max-w-[480px]"
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
              if (draft) onConfirm(draft);
              onClose();
            }}
            disabled={!draft}
            className="flex-1 rounded-[6px] bg-[#8E51B8] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#78257C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Konfirmasi
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        {primaryRows.map(({ method, icon, expandable }) => {
          const selected = !expandable && draft?.provider === method.provider;
          return (
            <div key={method.provider + method.label}>
              <button
                type="button"
                onClick={() => {
                  if (expandable) {
                    setBanksOpen((v) => !v);
                    return;
                  }
                  setDraft(method);
                }}
                className={`flex w-full items-center gap-3 rounded-[8px] border px-4 py-3 text-left transition ${
                  selected ? "border-[#8E51B8] bg-[#FAF5FC]" : "border-[#EDEDED] bg-white hover:border-[#D8C7E8]"
                }`}
              >
                {icon}
                <span className="flex-1 text-[13.5px] font-bold text-[#231F20]">{method.label}</span>
                {expandable ? (
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#707070"
                    strokeWidth="2"
                    strokeLinecap="round"
                    viewBox="0 0 24 24"
                    className={`transition-transform ${banksOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                ) : (
                  <span className="text-[11px] font-semibold text-[#707070]">{feeLabel(method.fee)}</span>
                )}
              </button>

              {expandable && banksOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2 pl-2">
                  {otherBanks.map((bank) => {
                    const bankSelected = draft?.provider === bank.provider;
                    return (
                      <button
                        key={bank.provider}
                        type="button"
                        onClick={() => setDraft(bank)}
                        className={`rounded-[6px] border px-3 py-2 text-left text-[12px] font-semibold transition ${
                          bankSelected ? "border-[#8E51B8] bg-[#FAF5FC] text-[#8E51B8]" : "border-[#EDEDED] text-[#231F20] hover:border-[#D8C7E8]"
                        }`}
                      >
                        {bank.label}
                        <span className="block text-[10px] font-medium text-[#707070]">{feeLabel(bank.fee)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
