"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/money";
import { RETURN_TYPE_LABELS, type ReturnType, type PreferredResolution } from "@/types/returns";
import type { ReturnEligibility } from "@/types/returns";

const RESOLUTIONS: { value: PreferredResolution; label: string; hint: string }[] = [
  { value: "refund", label: "Refund", hint: "Dana kembali ke metode pembayaran" },
  { value: "store_credit", label: "Saldo Toko", hint: "Kredit untuk belanja berikutnya" },
  { value: "voucher", label: "Voucher", hint: "Kode kupon senilai refund" },
  { value: "exchange", label: "Tukar Barang", hint: "Ganti varian / produk lain" },
];

function NewReturnInner() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";

  const [elig, setElig] = useState<ReturnEligibility | null>(null);
  const [loadingElig, setLoadingElig] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [returnType, setReturnType] = useState<ReturnType>("defective");
  const [resolution, setResolution] = useState<PreferredResolution>("refund");
  const [note, setNote] = useState("");
  const [usageHistory, setUsageHistory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace(`/auth/login?next=/returns/new?order=${orderNumber}`);
  }, [isLoading, user, router, orderNumber]);

  useEffect(() => {
    if (!user || !orderNumber) return;
    let cancelled = false;
    (async () => {
      setLoadingElig(true);
      try {
        const res = await fetch(`/api/returns/eligibility?order=${encodeURIComponent(orderNumber)}`);
        const json = await res.json();
        if (cancelled) return;
        if (!json.ok) setError(json.error?.message ?? "Gagal memeriksa kelayakan");
        else setElig(json.data as ReturnEligibility);
      } finally {
        if (!cancelled) setLoadingElig(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, orderNumber]);

  function toggleItem(id: string, max: number) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = max;
      return next;
    });
  }

  const selectedItems = Object.entries(selected).map(([order_item_id, quantity]) => ({ order_item_id, quantity }));
  const estimatedRefund =
    elig?.eligible_items
      .filter((it) => selected[it.order_item_id])
      .reduce((s, it) => s + it.unit_price * selected[it.order_item_id], 0) ?? 0;

  async function handleSubmit() {
    if (selectedItems.length === 0) {
      setError("Pilih minimal satu produk untuk diretur.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create the return
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: orderNumber,
          return_type: returnType,
          preferred_resolution: resolution,
          customer_note: note || undefined,
          usage_history: returnType === "allergic_reaction" ? usageHistory : undefined,
          items: selectedItems,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(
          Array.isArray(json.error?.details)
            ? json.error.details.join(" ")
            : json.error?.message ?? "Gagal mengajukan retur",
        );
        setSubmitting(false);
        return;
      }
      const returnNumber: string = json.data.return_number;

      // 2. Upload evidence (if any) to private bucket, then register each
      if (files.length > 0 && user) {
        const supabase = createClient();
        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `${user.id}/${returnNumber}/${Date.now()}-${safeName}`;
          const { error: upErr } = await supabase.storage
            .from("return-evidence")
            .upload(path, file, { upsert: false });
          if (upErr) continue;
          await fetch(`/api/returns/${returnNumber}/evidence`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storage_path: path,
              media_type: file.type.startsWith("video") ? "video" : file.type.includes("pdf") ? "document" : "image",
              file_size_bytes: file.size,
            }),
          });
        }
      }

      router.push(`/returns/${returnNumber}?created=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setSubmitting(false);
    }
  }

  if (!orderNumber) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-gray-500">Nomor pesanan tidak ditemukan.</p>
        <Link href="/member" className="mt-3 inline-block text-sm text-emerald-600 hover:underline">
          ← Kembali ke pesanan
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <Link href={`/order/${orderNumber}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Pesanan {orderNumber}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Ajukan Retur</h1>
      </div>

      {loadingElig ? (
        <div className="py-16 text-center text-sm text-gray-400">Memeriksa kelayakan…</div>
      ) : !elig ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : !elig.eligible ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
          <p className="font-medium text-amber-800">Pesanan ini belum bisa diretur</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-700">
            {elig.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-7">
          {typeof elig.days_remaining === "number" && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Sisa {elig.days_remaining} hari dari batas retur {elig.window_days} hari.
            </p>
          )}

          {/* Step 1: items */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">1. Pilih produk</h2>
            <ul className="space-y-2">
              {elig.eligible_items.map((it) => {
                const on = !!selected[it.order_item_id];
                return (
                  <li
                    key={it.order_item_id}
                    onClick={() => toggleItem(it.order_item_id, it.quantity)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      on ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input type="checkbox" readOnly checked={on} className="h-4 w-4 accent-emerald-600" />
                    {it.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{it.product_name}</p>
                      {it.variant_name && <p className="text-xs text-gray-500">{it.variant_name}</p>}
                      <p className="text-xs text-gray-400">
                        {formatMoney(it.unit_price)} · qty {it.quantity}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Step 2: reason */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">2. Alasan retur</h2>
            <select
              value={returnType}
              onChange={(e) => setReturnType(e.target.value as ReturnType)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            >
              {(Object.keys(RETURN_TYPE_LABELS) as ReturnType[]).map((t) => (
                <option key={t} value={t}>
                  {RETURN_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            {returnType === "allergic_reaction" && (
              <textarea
                value={usageHistory}
                onChange={(e) => setUsageHistory(e.target.value)}
                placeholder="Riwayat pemakaian (mis. dipakai 2x sehari selama 3 hari) — wajib untuk klaim alergi"
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                rows={3}
              />
            )}
          </section>

          {/* Step 3: resolution */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">3. Penyelesaian yang diinginkan</h2>
            <div className="grid grid-cols-2 gap-2">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setResolution(r.value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    resolution === r.value ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{r.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{r.hint}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Step 4: evidence */}
          <section>
            <h2 className="mb-1 text-sm font-semibold text-gray-900">4. Unggah bukti</h2>
            <p className="mb-3 text-xs text-gray-500">Foto / video produk (maks 50MB per file). Sangat membantu mempercepat persetujuan.</p>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
            />
            {files.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">{files.length} file dipilih</p>
            )}
          </section>

          {/* Step 5: note + submit */}
          <section>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </section>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="sticky bottom-0 -mx-4 border-t border-gray-100 bg-white/90 px-4 py-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">Estimasi refund</span>
              <span className="font-semibold text-gray-900">{formatMoney(estimatedRefund)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedItems.length === 0}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Mengirim…" : "Kirim Permintaan Retur"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function NewReturnPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-gray-400">Memuat…</div>}>
      <NewReturnInner />
    </Suspense>
  );
}
