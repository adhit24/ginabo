"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useShopCatalog, type ShopProduct } from "@/lib/useShopCatalog";

const MAX_RESULTS = 5;

function SearchIcon({ color = "#78257C" }: { color?: string }) {
  return (
    <svg width="16" height="16" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function ResultsList({ query, results, onPick }: { query: string; results: ShopProduct[]; onPick: () => void }) {
  if (!query.trim()) return null;
  if (results.length === 0) {
    return <p className="px-4 py-4 text-[13px] text-[#808080]">Produk tidak ditemukan.</p>;
  }
  return (
    <ul className="flex flex-col py-1">
      {results.map(p => (
        <li key={p.slug}>
          <Link
            href={`/shop/${p.slug}`}
            onClick={onPick}
            className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#F3E8FF]/50"
          >
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#F0E5FA] bg-[#FAF7FD]">
              {p.img && <img src={p.img} alt={p.name} className="h-full w-full object-contain p-1" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-[#303030]">{p.name}</span>
              <span className="block text-[12px] font-semibold text-[#78257C]">{p.price}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const catalog = useShopCatalog();
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      desktopInputRef.current?.focus();
      mobileInputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? catalog.filter(p => p.name.toLowerCase().includes(trimmed)).slice(0, MAX_RESULTS)
    : [];

  function goToAllResults() {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToAllResults();
  }

  return (
    <div ref={wrapRef}>
      {/* ── Desktop: icon expands into an inline pill + dropdown ── */}
      <div className="relative hidden md:block">
        <div
          className={`flex items-center overflow-hidden rounded-full border transition-all duration-300 ${
            open
              ? "w-64 border-[#D8B4FE] bg-white shadow-[0_2px_12px_rgba(120,37,124,0.1)]"
              : "w-9 border-white/60 bg-white/50 backdrop-blur-sm hover:border-[#D8B4FE]"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center"
            aria-label="Cari produk"
          >
            <SearchIcon />
          </button>
          {open && (
            <form onSubmit={handleSubmit} className="flex-1 pr-2">
              <input
                ref={desktopInputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full bg-transparent text-[13px] text-[#4A1A5E] placeholder-[#a78bc9] outline-none"
              />
            </form>
          )}
        </div>

        {open && trimmed && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_16px_48px_rgba(120,37,124,0.14)]">
            <ResultsList query={query} results={results} onPick={() => setOpen(false)} />
            <button
              type="button"
              onClick={goToAllResults}
              className="block w-full border-t border-[#F3E8FF] px-4 py-3 text-center text-[12px] font-semibold text-[#78257C] transition hover:bg-[#F3E8FF]/50"
            >
              Lihat semua hasil untuk &ldquo;{query.trim()}&rdquo;
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile: icon opens a full-screen overlay ── */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#F3E8FF]/40"
          aria-label="Cari produk"
        >
          <SearchIcon color="#808080" />
        </button>

        {open && (
          <div className="fixed inset-0 z-[70] flex flex-col bg-white">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b border-[#F0E5FA] px-4 py-3">
              <SearchIcon />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari produk..."
                className="flex-1 bg-transparent text-[14px] text-[#4A1A5E] placeholder-[#a78bc9] outline-none"
              />
              <button type="button" onClick={() => setOpen(false)} className="text-[13px] font-semibold text-[#78257C]">
                Batal
              </button>
            </form>
            <div className="flex-1 overflow-y-auto">
              <ResultsList query={query} results={results} onPick={() => setOpen(false)} />
              {trimmed && (
                <button
                  type="button"
                  onClick={goToAllResults}
                  className="block w-full border-t border-[#F3E8FF] px-4 py-3 text-center text-[13px] font-semibold text-[#78257C]"
                >
                  Lihat semua hasil untuk &ldquo;{query.trim()}&rdquo;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
