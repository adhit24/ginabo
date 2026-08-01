"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { store, type GFlashItem, type GProduct } from "@/lib/adminStore";

type FlashCandidate = GProduct & { checked: boolean; salePrice: string; salePriceMinor: number; original: string; discount: string; type: string };

function toCandidate(p: GProduct, existing?: GFlashItem): FlashCandidate {
  return {
    ...p,
    checked:        !!existing,
    salePrice:      existing?.salePrice      ?? p.priceVal,
    salePriceMinor: existing?.salePriceMinor ?? p.priceMinor,
    original:       existing?.original       ?? p.originalPrice ?? p.priceVal,
    discount:       existing?.discount       ?? "0%",
    type:           existing?.type           ?? p.tag            ?? "",
  };
}

export default function AdminFlashSalePage() {
  const [candidates, setCandidates] = useState<FlashCandidate[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const all      = [...store.getProducts(), ...store.getBundles()];
    const flash    = store.getFlash();
    const flashMap = Object.fromEntries(flash.map(f => [f.id, f]));
    setCandidates(all.map(p => toCandidate(p, flashMap[p.id])));
  }, []);

  const selected = candidates.filter(c => c.checked);

  function toggle(id: string) {
    setCandidates(prev => {
      const checked = prev.filter(c => c.checked).length;
      return prev.map(c => {
        if (c.id !== id) return c;
        if (!c.checked && checked >= 3) return c;
        return { ...c, checked: !c.checked };
      });
    });
    setSaved(false);
  }

  function update(id: string, field: keyof FlashCandidate, value: string | number) {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    setSaved(false);
  }

  function save() {
    const flash: GFlashItem[] = selected.map(c => ({
      id:             c.id,
      name:           c.name.replace(/\n/g, " "),
      type:           c.type,
      salePrice:      c.salePrice,
      salePriceMinor: c.salePriceMinor,
      original:       c.original,
      discount:       c.discount,
      img:            c.img,
    }));
    store.setFlash(flash);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Flash Sale</h1>
          <p className="text-sm text-white/40">Pilih maksimal 3 produk/bundle untuk Flash Sale</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1 text-sm font-semibold text-green-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Tersimpan</span>}
          <button onClick={save} className="rounded-xl px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#e879f9)" }}>
            Simpan Flash Sale
          </button>
        </div>
      </div>

      <p className="text-xs text-white/30">Dipilih: {selected.length}/3</p>

      <div className="grid gap-3">
        {candidates.map(c => (
          <div key={c.id} className="rounded-2xl p-4 transition"
            style={{
              background: c.checked ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${c.checked ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
            }}>
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button onClick={() => toggle(c.id)}
                className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition"
                style={{
                  background: c.checked ? "linear-gradient(135deg,#8b5cf6,#e879f9)" : "rgba(255,255,255,0.08)",
                  border: c.checked ? "none" : "1px solid rgba(255,255,255,0.2)",
                }}>
                {c.checked && <svg className="h-3 w-3" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>}
              </button>

              {/* Image */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                {c.img && <Image src={c.img} alt={c.name} fill className="object-contain p-1" sizes="48px" />}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm whitespace-pre-line leading-snug">{c.name}</p>

                {/* Editable fields when checked */}
                {c.checked && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {([
                      ["Tipe/Ukuran", "type", "text"], ["Harga Flash Sale", "salePrice", "text"],
                      ["Harga Asli", "original", "text"], ["Diskon (e.g. 20%)", "discount", "text"],
                    ] as [string, keyof FlashCandidate, string][]).map(([label, key, type]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</label>
                        <input type={type} value={String(c[key] ?? "")}
                          onChange={e => update(c.id, key, e.target.value)}
                          className="rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
