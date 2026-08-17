"use client";

import { motion } from "framer-motion";
import { TIER_ORDER, TIERS, fmtRp, partnerPrice, useResellerTier } from "@/components/reseller/ResellerTierProvider";

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const catalogProducts = [
  { name: "GlowAge Multi Active Serum", img: "/serumfix.png", tag: "BEST SELLER", retail: 85000 },
  { name: "Bright & Care Moisture Cream", img: "/moistfix.png", tag: "FAVORIT", retail: 95000 },
  { name: "Hydra Moist Gel Ultimate", img: "/salmonfix.png", tag: "BARU", retail: 120000 },
];

const filterChips = ["Semua produk", "Serum", "Moisturizer", "Bundling", "Best seller"];

export default function ResellerCatalogPage() {
  const { tier, setTier, picked } = useResellerTier();

  return (
    <div className="px-[34px] py-9" style={{ background: "#FAF8FD" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#9d8ab8]">Katalog partner</p>
            <h1 className="mt-2.5 text-[30px] font-extrabold tracking-[-.02em]" style={{ color: "#241338" }}>Harga partner &amp; margin per produk</h1>
            <p className="mt-2.5 max-w-[520px] text-[13.5px] leading-relaxed text-[#6b5c80]">
              Harga di bawah menyesuaikan tier kamu. Semakin tinggi tier, semakin besar selisih yang jadi keuntunganmu.
            </p>
          </div>
          <div className="flex gap-1.5 rounded-[13px] bg-white p-1.5" style={{ border: "1px solid #EDE7F8" }}>
            {TIER_ORDER.map((key) => {
              const active = tier === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTier(key)}
                  className="h-9 rounded-[10px] px-[18px] text-[12.5px] font-bold transition"
                  style={active ? { background: "#7C3AED", color: "#fff" } : { background: "transparent", color: "#8b7aa8" }}
                >
                  {TIERS[key].short}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filterChips.map((c, i) => (
            <span
              key={c}
              className="rounded-full px-[15px] py-2 text-[12px] font-semibold"
              style={i === 0 ? { background: "#241338", color: "#fff" } : { border: "1px solid #E7DFF5", background: "#fff", color: "#6b5c80" }}
            >
              {c}
            </span>
          ))}
        </div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
          className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {catalogProducts.map((p) => {
            const partner = partnerPrice(p.retail, tier);
            return (
              <motion.article
                key={p.name}
                variants={fadeUp}
                className="flex flex-col overflow-hidden rounded-[18px] bg-white"
                style={{ border: "1px solid #F1ECF9" }}
              >
                <div className="relative aspect-square bg-cover bg-center" style={{ background: "#F4EEFD", backgroundImage: `url(${p.img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                  <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white" style={{ background: "rgba(36,19,56,.85)" }}>
                    {p.tag}
                  </span>
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <b className="text-[14.5px] font-extrabold leading-[1.4]" style={{ color: "#241338" }}>{p.name}</b>
                  <div className="flex flex-wrap gap-1.5">
                    {["BPOM RI", "Halal", "Cruelty Free"].map((b) => (
                      <span key={b} className="rounded-md px-2 py-0.5 text-[10.5px] font-bold" style={{ background: "#F4EEFD", color: "#7C3AED" }}>{b}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-xl p-3.5" style={{ background: "#FBF9FE" }}>
                    <span className="flex justify-between text-[12px] font-medium text-[#8b7aa8]">
                      Harga marketplace<span className="line-through">{fmtRp(p.retail)}</span>
                    </span>
                    <span className="flex justify-between text-[13px] font-bold" style={{ color: "#241338" }}>
                      Harga {picked.short}<span>{fmtRp(partner)}</span>
                    </span>
                    <span className="flex justify-between text-[12.5px] font-bold" style={{ color: "#7C3AED" }}>
                      Profit per pcs<span>+ {fmtRp(p.retail - partner)}</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="h-[42px] flex-1 rounded-xl text-[12.5px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6D28D9,#9333EA)" }}>
                      Tambah ke order
                    </button>
                    <button type="button" aria-label="Tambah cepat" className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-xl" style={{ border: "1px solid #E7DFF5" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5.5" style={{ background: "linear-gradient(120deg,#2A1244,#4A1A5E)" }}>
          <div>
            <b className="block text-[16px] font-extrabold text-white">Minimum starter order untuk {picked.name}</b>
            <span className="mt-1.5 block text-[12.5px] text-white/65">{picked.modal} · {picked.margin} · gratis ongkir untuk order pertama</span>
          </div>
          <button type="button" className="h-11 rounded-xl bg-white px-5.5 text-[13px] font-bold" style={{ color: "#4A1A5E" }}>
            Lanjut ke checkout
          </button>
        </div>
      </div>
    </div>
  );
}
