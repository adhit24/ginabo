"use client";

export type PaymentMethod = {
  group: "bank_transfer" | "virtual_account" | "e_wallet";
  provider: string;
  label: string;
};

type Props = {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
};

const methods: Array<PaymentMethod & { description: string; icon: string; badge?: string }> = [
  {
    group: "bank_transfer",
    provider: "bank_transfer",
    label: "Transfer Bank",
    description: "Transfer langsung melalui rekening bank pilihanmu.",
    icon: "↔",
  },
  {
    group: "virtual_account",
    provider: "virtual_account",
    label: "Virtual Account",
    description: "BCA, BNI, Mandiri, BRI, Permata, dan bank lainnya.",
    icon: "▣",
    badge: "REKOMENDASI",
  },
  {
    group: "e_wallet",
    provider: "DANA",
    label: "E-Wallet",
    description: "Bayar praktis dengan dompet digital favoritmu.",
    icon: "ϟ",
  },
];

const wallets = ["DANA", "OVO", "GoPay", "ShopeePay", "Jago", "SeaBank"];

export function PaymentMethodSelector({ value, onChange }: Props) {
  const selectedGroup = value?.group;

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-900">Pilih metode pembayaran</p>
        <p className="mt-1 text-xs text-gray-500">Pembayaran aman diproses melalui Midtrans.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {methods.map((method) => {
          const selected = selectedGroup === method.group;
          return (
            <button
              key={method.group}
              type="button"
              onClick={() => onChange(method)}
              className={`relative rounded-xl border p-4 text-left transition ${selected ? "border-brand-500 bg-white shadow-sm ring-2 ring-brand-100" : "border-gray-200 bg-white/70 hover:border-brand-300"}`}
            >
              {method.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-extrabold tracking-wide text-emerald-700">
                  {method.badge}
                </span>
              )}
              <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black ${selected ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"}`}>
                {method.icon}
              </span>
              <span className="block text-sm font-bold text-gray-900">{method.label}</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-gray-500">{method.description}</span>
            </button>
          );
        })}
      </div>

      {selectedGroup === "e_wallet" && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Pilih e-wallet</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {wallets.map((wallet) => {
              const selected = value?.provider === wallet;
              return (
                <button
                  key={wallet}
                  type="button"
                  onClick={() => onChange({ group: "e_wallet", provider: wallet, label: wallet })}
                  className={`rounded-lg border px-2 py-2.5 text-xs font-bold transition ${selected ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-brand-300"}`}
                >
                  {wallet}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value && (
        <p className="mt-3 text-xs font-semibold text-brand-700">
          Metode dipilih: {value.label}
        </p>
      )}
    </div>
  );
}
