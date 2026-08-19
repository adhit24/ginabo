"use client";

export type PaymentMethod = {
  group: "bank_transfer" | "virtual_account" | "e_wallet" | "credit_card" | "qris";
  provider: string;
  label: string;
  fee: number;
};

type Props = {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
};

type Provider = {
  id: string;
  label: string;
  logo: string;
  fee: number;
};

const virtualAccounts: Provider[] = [
  { id: "bca_va", label: "BCA VA", logo: "/payment-logos/bca.svg", fee: 4000 },
  { id: "mandiri_va", label: "Mandiri VA", logo: "/payment-logos/mandiri.svg", fee: 4000 },
  { id: "bni_va", label: "BNI VA", logo: "/payment-logos/bni.svg", fee: 4000 },
  { id: "bri_va", label: "BRI VA", logo: "/payment-logos/bri.svg", fee: 4000 },
  { id: "mega_va", label: "Bank Mega VA", logo: "/payment-logos/mega.svg", fee: 3500 },
  { id: "bsi_va", label: "BSI VA", logo: "/payment-logos/bsi.svg", fee: 3000 },
  { id: "maybank_va", label: "Maybank VA", logo: "/payment-logos/maybank.svg", fee: 3000 },
];

const eWallets: Provider[] = [
  { id: "dana", label: "DANA", logo: "/payment-logos/dana.svg", fee: 0 },
  { id: "ovo", label: "OVO", logo: "/payment-logos/ovo.svg", fee: 750 },
  { id: "gopay", label: "GoPay", logo: "/payment-logos/gopay.svg", fee: 1000 },
  { id: "shopeepay", label: "ShopeePay", logo: "/payment-logos/shopeepay.svg", fee: 0 },
  { id: "linkaja", label: "LinkAja", logo: "/payment-logos/linkaja.svg", fee: 0 },
];

function feeLabel(fee: number) {
  return fee === 0 ? "Gratis" : `+ Rp ${fee.toLocaleString("id-ID")}`;
}

function MethodIcon({ type }: { type: "bank" | "va" | "wallet" }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
      <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        {type === "bank" && <><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 18h18M12 3l9 5H3l9-5Z" /></>}
        {type === "va" && <><rect x="4" y="5" width="16" height="14" rx="2" /><path strokeLinecap="round" d="M7 9h10M7 13h4" /></>}
        {type === "wallet" && <><path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" /><path d="M4 8h15" /><path strokeLinecap="round" d="M15 12h2" /></>}
      </svg>
    </span>
  );
}

function ProviderCard({ provider, selected, onClick }: { provider: Provider; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[104px] flex-col justify-between rounded-xl border p-2.5 text-left transition duration-200 ${selected ? "border-brand-500 bg-brand-50 shadow-sm ring-2 ring-brand-100" : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"}`}
    >
      <span className="flex h-7 w-full items-center justify-center rounded-md bg-white">
        <img src={provider.logo} alt={`${provider.label} logo`} className="max-h-6 max-w-[72px] object-contain" />
      </span>
      <span>
        <span className="mt-1.5 block min-h-7 text-[11px] font-bold leading-tight text-gray-900">{provider.label}</span>
        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${provider.fee === 0 ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
          {feeLabel(provider.fee)}
        </span>
      </span>
    </button>
  );
}

export function PaymentMethodSelector({ value, onChange }: Props) {
  const selectProvider = (group: PaymentMethod["group"], provider: Provider) => {
    onChange({ group, provider: provider.id, label: provider.label, fee: provider.fee });
  };
  const selectedGroup = value?.group;

  return (
    <fieldset className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
      <legend className="sr-only">Metode pembayaran</legend>
      <div className="mb-4">
        <p className="text-sm font-bold text-gray-900">Pilih metode pembayaran</p>
        <p className="mt-1 text-xs text-gray-500">Biaya jasa pembayaran ditanggung pembeli dan ditampilkan transparan.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <button type="button" onClick={() => onChange({ group: "bank_transfer", provider: "bank_transfer", label: "Transfer Bank", fee: 0 })} aria-pressed={selectedGroup === "bank_transfer"} className={`relative rounded-xl border p-4 text-left transition ${selectedGroup === "bank_transfer" ? "border-brand-500 bg-white shadow-sm ring-2 ring-brand-100" : "border-gray-200 bg-white/70 hover:border-brand-300"}`}>
          <MethodIcon type="bank" />
          <span className="mt-3 block text-sm font-bold text-gray-900">Transfer Bank</span>
          <span className="mt-1 block text-[11px] leading-relaxed text-gray-500">Transfer langsung melalui rekening bank.</span>
          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Biaya admin mengikuti bank</span>
        </button>
        <button type="button" onClick={() => selectProvider("virtual_account", virtualAccounts[0])} aria-pressed={selectedGroup === "virtual_account"} className={`relative rounded-xl border p-4 text-left transition ${selectedGroup === "virtual_account" ? "border-brand-500 bg-white shadow-sm ring-2 ring-brand-100" : "border-gray-200 bg-white/70 hover:border-brand-300"}`}>
          <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-extrabold tracking-wide text-emerald-700">REKOMENDASI</span>
          <MethodIcon type="va" />
          <span className="mt-3 block text-sm font-bold text-gray-900">Virtual Account</span>
          <span className="mt-1 block text-[11px] leading-relaxed text-gray-500">Pilih bank dan dapatkan nomor VA instan.</span>
        </button>
        <button type="button" onClick={() => selectProvider("e_wallet", eWallets[0])} aria-pressed={selectedGroup === "e_wallet"} className={`relative rounded-xl border p-4 text-left transition ${selectedGroup === "e_wallet" ? "border-brand-500 bg-white shadow-sm ring-2 ring-brand-100" : "border-gray-200 bg-white/70 hover:border-brand-300"}`}>
          <MethodIcon type="wallet" />
          <span className="mt-3 block text-sm font-bold text-gray-900">E-Wallet</span>
          <span className="mt-1 block text-[11px] leading-relaxed text-gray-500">DANA, OVO, GoPay, ShopeePay, dan lainnya.</span>
        </button>
      </div>

      {selectedGroup === "virtual_account" && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Pilih bank Virtual Account</p>
            <span className="text-[10px] text-gray-400">Biaya jasa Midtrans</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {virtualAccounts.map((provider) => <ProviderCard key={provider.id} provider={provider} selected={value?.provider === provider.id} onClick={() => selectProvider("virtual_account", provider)} />)}
          </div>
        </div>
      )}

      {selectedGroup === "e_wallet" && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Pilih e-wallet</p>
            <span className="text-[10px] text-gray-400">Biaya jasa Midtrans</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {eWallets.map((provider) => <ProviderCard key={provider.id} provider={provider} selected={value?.provider === provider.id} onClick={() => selectProvider("e_wallet", provider)} />)}
          </div>
        </div>
      )}

      {value && <p className="mt-3 text-xs font-semibold text-brand-700">Metode dipilih: {value.label} · Jasa pembayaran: {feeLabel(value.fee)}</p>}
    </fieldset>
  );
}
