"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TIERS, useResellerTier } from "@/components/reseller/ResellerTierProvider";

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const matrix: { label: string; s: string; g: string; p: string }[] = [
  { label: "Akses harga grosir", s: "Ya", g: "Ya", p: "Terbaik" },
  { label: "Materi promosi", s: "Dasar", g: "Lengkap", p: "Premium" },
  { label: "Training penjualan", s: "Onboarding", g: "Lanjutan", p: "Coaching 1-on-1" },
  { label: "Support", s: "Komunitas", g: "Priority", p: "Account manager" },
  { label: "Free sample", s: "—", g: "Setiap kuartal", p: "Setiap bulan" },
  { label: "Cashback target", s: "—", g: "Ya", p: "Ya" },
  { label: "Undangan event & launching", s: "—", g: "Ya", p: "Ya + trip" },
  { label: "Early access produk baru", s: "—", g: "—", p: "Ya" },
  { label: "Pengajuan hak wilayah", s: "—", g: "—", p: "Ya" },
];

const explainerCards = [
  { title: "Cara naik tier", desc: "Setiap transaksi menghasilkan poin. Saat akumulasi poin mencapai ambang tier berikutnya, upgrade otomatis ditawarkan tanpa biaya tambahan." },
  { title: "Evaluasi tier", desc: "Tier dievaluasi setiap kuartal. Partner yang konsisten mencapai target mempertahankan tier beserta seluruh benefitnya." },
  { title: "Tier Elite", desc: "Undangan khusus untuk Premier Partner dengan performa nasional terbaik. Termasuk hak wilayah dan business coaching langsung dari tim Ginabo." },
];

export default function TierDetailPage() {
  const { setTier } = useResellerTier();

  return (
    <div className="py-9 md:py-9" style={{ background: "linear-gradient(180deg,#FBFAFE,#F6F2FD)" }}>
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span variants={fadeUp} className="mb-4 inline-block rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white" style={{ background: "linear-gradient(135deg,#9333EA,#7C3AED)" }}>
            Detail Tier
          </motion.span>
          <motion.h1 variants={fadeUp} className="text-2xl font-extrabold leading-tight md:text-[2rem]" style={{ color: "#4A1A5E" }}>
            Benefit lengkap tiap tier partner
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-3 text-[15px] leading-relaxed text-[#5a4a6a]">
            Semua tier mendapat akses harga partner. Yang membedakan adalah margin, level dukungan, dan reward yang bisa kamu raih.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp}
          className="mt-9 overflow-hidden rounded-[20px] bg-white"
          style={{ border: "1px solid #EDE7F8" }}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr]">
                <span />
                <div className="border-l border-[#F4F0FA] px-5 py-6 text-center">
                  <b className="block text-[16px] font-extrabold" style={{ color: "#7C3AED" }}>Starter</b>
                  <span className="mt-2 block text-[25px] font-extrabold" style={{ color: "#241338" }}>{TIERS.starter.modal}</span>
                  <span className="mt-1 block text-[12px] font-medium text-[#8b7aa8]">Margin 30%</span>
                </div>
                <div className="px-5 py-6 text-center" style={{ background: "linear-gradient(160deg,#7C3AED,#6D28D9)" }}>
                  <b className="block text-[16px] font-extrabold text-white">Growth</b>
                  <span className="mt-2 block text-[25px] font-extrabold text-white">{TIERS.growth.modal}</span>
                  <span className="mt-1 block text-[12px] font-medium text-white/70">Margin 35%</span>
                </div>
                <div className="border-l border-[#F4F0FA] px-5 py-6 text-center" style={{ background: "#FFFDF8" }}>
                  <b className="block text-[16px] font-extrabold" style={{ color: "#B98A2E" }}>Premier</b>
                  <span className="mt-2 block text-[25px] font-extrabold" style={{ color: "#B98A2E" }}>{TIERS.premier.modal}</span>
                  <span className="mt-1 block text-[12px] font-medium text-[#9c8a6b]">Margin 40%</span>
                </div>
              </div>

              {matrix.map((r) => (
                <div key={r.label} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center border-t border-[#F4F0FA]">
                  <span className="px-6 py-4 text-[12.5px] font-semibold text-[#3b2b52]">{r.label}</span>
                  <span className="border-l border-[#F4F0FA] px-5 py-4 text-center text-[12.5px] font-medium text-[#6b5c80]">{r.s}</span>
                  <span className="px-5 py-4 text-center text-[12.5px] font-semibold text-[#4A1A5E]" style={{ background: "#FAF6FE" }}>{r.g}</span>
                  <span className="border-l border-[#F4F0FA] px-5 py-4 text-center text-[12.5px] font-semibold text-[#8a6b2e]" style={{ background: "#FFFDF8" }}>{r.p}</span>
                </div>
              ))}

              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-t border-[#F4F0FA]">
                <span className="px-6 py-5" />
                <span className="px-5 py-5">
                  <Link href="/reseller/register" onClick={() => setTier("starter")} className="block min-h-[42px] rounded-xl py-2.5 text-center text-[12.5px] font-bold" style={{ border: "1px solid #DCCFF4", background: "#F7F3FE", color: "#7C3AED" }}>
                    Pilih Starter
                  </Link>
                </span>
                <span className="px-5 py-5">
                  <Link href="/reseller/register" onClick={() => setTier("growth")} className="block min-h-[42px] rounded-xl py-2.5 text-center text-[12.5px] font-bold text-white" style={{ background: "linear-gradient(135deg,#6D28D9,#9333EA)" }}>
                    Pilih Growth
                  </Link>
                </span>
                <span className="px-5 py-5">
                  <Link href="/reseller/register" onClick={() => setTier("premier")} className="block min-h-[42px] rounded-xl py-2.5 text-center text-[12.5px] font-bold" style={{ border: "1px solid #EAD8AC", background: "#FDF8EC", color: "#B98A2E" }}>
                    Pilih Premier
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={stagger}
          className="mt-5 grid gap-4 md:grid-cols-3"
        >
          {explainerCards.map((c) => (
            <motion.div key={c.title} variants={fadeUp} className="rounded-2xl bg-white p-6" style={{ border: "1px solid #F1ECF9" }}>
              <b className="text-[15px] font-extrabold" style={{ color: "#241338" }}>{c.title}</b>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#7b6b90]">{c.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
