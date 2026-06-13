"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ─── MOTION TOKENS ────────────────────────────────────────────────────────────
const EASE = [0.25, 1, 0.5, 1] as const;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.22, ease: EASE },
  }),
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const PRODUCTS = {
  serum: {
    name: "GlowAge Multi-Active Serum",
    tagline: "Anti-Aging & Brightening",
    desc: "Serum multi-aktif dengan peptida & vitamin C untuk melawan tanda penuaan, mencerahkan, dan meratakan warna kulit.",
    benefits: ["Menyamarkan kerutan & garis halus", "Mencerahkan kulit kusam", "Meratakan warna kulit"],
    img: "/product-serum-1.png",
    href: "/shop",
    accent: "#78257C",
  },
  salmon: {
    name: "Hydra Moist Gel Ultimate",
    tagline: "Deep Hydration · DHA Salmon",
    desc: "Gel pelembab dengan DHA Salmon yang mengunci kelembaban mendalam, memperkuat skin barrier, cocok untuk kulit kering & sensitif.",
    benefits: ["Hidrasi mendalam 24 jam", "Memperkuat skin barrier", "Cocok untuk kulit sensitif"],
    img: "/product-dna-1.png",
    href: "/shop",
    accent: "#0369A1",
  },
  cream: {
    name: "Bright & Care Moisture Cream",
    tagline: "Daily Moisture · Brightening",
    desc: "Krim harian yang mencerahkan, melembabkan sepanjang hari, dan cocok untuk semua jenis kulit termasuk kombinasi.",
    benefits: ["Melembabkan sepanjang hari", "Mencerahkan secara bertahap", "Cocok semua jenis kulit"],
    img: "/product-cream-1.png",
    href: "/shop",
    accent: "#B45309",
  },
} as const;

type ProductKey = keyof typeof PRODUCTS;

// ─── SCORING ──────────────────────────────────────────────────────────────────
function computeResults(
  concerns: string[],
  skinType: string,
  age: string,
): ProductKey[] {
  const score: Record<ProductKey, number> = { serum: 0, salmon: 0, cream: 0 };

  const concernScore: Record<string, Partial<Record<ProductKey, number>>> = {
    kering: { salmon: 3 },
    kusam: { serum: 2, cream: 1 },
    penuaan: { serum: 3 },
    jerawat: { salmon: 1, cream: 1 },
    hiperpig: { serum: 2, cream: 2 },
    tidakmerata: { serum: 2, cream: 1 },
    pori: { serum: 1, cream: 1 },
    sensitif: { salmon: 3 },
  };

  concerns.forEach((c) => {
    const map = concernScore[c];
    if (map) {
      (Object.entries(map) as [ProductKey, number][]).forEach(
        ([k, v]) => { score[k] += v; },
      );
    }
  });

  const skinTypeScore: Record<string, Partial<Record<ProductKey, number>>> = {
    kering: { salmon: 3 },
    sensitif: { salmon: 3 },
    berminyak: { cream: 2 },
    normal: { cream: 1 },
    kombinasi: { serum: 1, cream: 1 },
  };
  const stMap = skinTypeScore[skinType];
  if (stMap) {
    (Object.entries(stMap) as [ProductKey, number][]).forEach(
      ([k, v]) => { score[k] += v; },
    );
  }

  if (["35-44", "45-54", "55+"].includes(age)) score.serum += 2;

  const sorted = (Object.keys(score) as ProductKey[]).sort(
    (a, b) => score[b] - score[a],
  );
  const top = sorted.filter((k) => score[k] > 0);
  if (top.length === 0) return ["cream"];
  if (top.length === 1) return [top[0]];
  if (score[top[1]] >= score[top[0]] - 2) return [top[0], top[1]];
  return [top[0]];
}

// ─── LEFT PANEL IMAGE PER STEP ────────────────────────────────────────────────
const STEP_IMAGES: Record<number, string> = {
  0: "/skin_analist.png",
  1: "/product-serum-bg.png",
  2: "/product-cream-bg.png",
  3: "/product-dna-bg.png",
  4: "/product-serum-2.png",
  5: "/product-bestseller.png",
  6: "/mulai_journey.png",
};

// ─── PROGRESS DOTS ────────────────────────────────────────────────────────────
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="block rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            background: i === current ? "#78257C" : i < current ? "#be3ab4" : "#e5d0e8",
          }}
        />
      ))}
    </div>
  );
}

// ─── CHOICE BUTTON ────────────────────────────────────────────────────────────
function Choice({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-150"
      style={{
        borderColor: selected ? "#78257C" : "#e5e7eb",
        background: selected ? "#f5eaf8" : "#fff",
        color: selected ? "#78257C" : "#374151",
      }}
    >
      {label}
    </button>
  );
}

// ─── NEXT BUTTON ──────────────────────────────────────────────────────────────
function NextBtn({
  label = "Berikutnya →",
  disabled = false,
  onClick,
}: {
  label?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200"
      style={{
        background: disabled
          ? "#d1b8d8"
          : "linear-gradient(135deg, #78257C 0%, #be3ab4 100%)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      ✓ {label}
    </button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function SkinCheckPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Answers
  const [concerns, setConcerns] = useState<string[]>([]);
  const [skinType, setSkinType] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Result
  const [results, setResults] = useState<ProductKey[]>([]);

  // Biodata
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const TOTAL_STEPS = 7;

  function goTo(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function toggleConcern(val: string) {
    setConcerns((prev) =>
      prev.includes(val)
        ? prev.filter((c) => c !== val)
        : prev.length < 4
          ? [...prev, val]
          : prev,
    );
  }

  function handleResult() {
    const r = computeResults(concerns, skinType, age);
    setResults(r);
    goTo(5);
  }

  function handleSubmitBiodata() {
    const productNames = results.map((k) => PRODUCTS[k].name).join(" & ");
    const msg = `Halo Ginabo! 😊\n\nNama saya *${name}*.\n\nSaya sudah mengisi Ginabo Skin Check dan mendapat rekomendasi produk:\n*${productNames}*\n\nBoleh bantu saya untuk info lebih lanjut dan cara pemesanan?`;
    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const leftImg = STEP_IMAGES[step] ?? STEP_IMAGES[0];

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col md:flex-row"
      style={{ background: "#fdf6ff" }}
    >
      {/* ── LEFT PANEL (desktop) / TOP BANNER (mobile) ── */}
      <div
        className="relative h-48 w-full shrink-0 overflow-hidden md:sticky md:top-0 md:h-dvh md:w-[52%]"
        style={{
          background: "linear-gradient(160deg, #f9eefe 0%, #ecdff5 50%, #f0e4fa 100%)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={leftImg}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="absolute inset-0"
          >
            <Image
              src={leftImg}
              alt="Ginabo Skin Check"
              fill
              className="object-cover object-center"
              priority={step === 0}
              sizes="(max-width:768px) 100vw, 52vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Brand overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Ginabo Skin Check
          </p>
          <p className="text-sm font-bold text-white">
            Rekomendasi Personal untuk Kulitmu
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col items-center justify-start px-4 py-6 md:overflow-y-auto md:px-8 md:py-10">
        <div className="w-full max-w-md">
          {/* Progress dots */}
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <ProgressDots total={TOTAL_STEPS - 2} current={step - 1} />
          )}

          <AnimatePresence mode="wait" custom={dir}>
            {/* ──────────────────────────────────────────
                STEP 0 — INTRO
            ────────────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="intro"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-5"
              >
                <div>
                  <p
                    className="mb-2 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: "#be3ab4" }}
                  >
                    Ginabo Skin Check
                  </p>
                  <h1
                    className="text-2xl font-bold leading-snug md:text-3xl"
                    style={{ color: "#2d0a30" }}
                  >
                    Temukan Produk Ginabo yang Tepat untuk Kulitmu
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    Dapatkan rekomendasi skincare yang dipersonalisasi sesuai kondisi kulitmu — hanya dalam beberapa langkah mudah.
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "#e8d5f0", background: "#fdf4ff" }}
                >
                  <p className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    3 Produk Ginabo
                  </p>
                  <div className="flex gap-3">
                    {(["serum", "salmon", "cream"] as ProductKey[]).map((k) => (
                      <div key={k} className="flex flex-1 flex-col items-center gap-1">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                          <Image
                            src={PRODUCTS[k].img}
                            alt={PRODUCTS[k].name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <p className="text-center text-[10px] font-medium leading-tight text-gray-600">
                          {PRODUCTS[k].tagline}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <NextBtn label="Mulai Sekarang!" onClick={() => goTo(1)} />
              </motion.div>
            )}

            {/* ──────────────────────────────────────────
                STEP 1 — MASALAH KULIT
            ────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="concerns"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-4"
              >
                <div>
                  <h2
                    className="text-xl font-bold leading-snug"
                    style={{ color: "#2d0a30" }}
                  >
                    Masalah kulit apa yang sedang kamu alami?
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Pilih hingga 4 masalah yang paling kamu rasakan
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "kering", label: "Kulit Kering / Dehidrasi" },
                    { val: "kusam", label: "Kulit Kusam" },
                    { val: "penuaan", label: "Penuaan Dini / Kerutan" },
                    { val: "jerawat", label: "Jerawat & Komedo" },
                    { val: "hiperpig", label: "Hiperpigmentasi / Flek" },
                    { val: "tidakmerata", label: "Warna Kulit Tidak Merata" },
                    { val: "pori", label: "Pori-pori Besar" },
                    { val: "sensitif", label: "Kulit Sensitif / Mudah Iritasi" },
                  ].map(({ val, label }) => (
                    <Choice
                      key={val}
                      label={label}
                      selected={concerns.includes(val)}
                      onClick={() => toggleConcern(val)}
                    />
                  ))}
                </div>

                <NextBtn
                  label="Berikutnya"
                  disabled={concerns.length === 0}
                  onClick={() => goTo(2)}
                />
              </motion.div>
            )}

            {/* ──────────────────────────────────────────
                STEP 2 — JENIS KULIT
            ────────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="skintype"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-4"
              >
                <h2
                  className="text-xl font-bold leading-snug"
                  style={{ color: "#2d0a30" }}
                >
                  Apa jenis kulitmu?
                </h2>

                <div className="flex flex-col gap-2">
                  {[
                    { val: "normal", label: "Normal" },
                    { val: "kering", label: "Kering (Dry)" },
                    { val: "berminyak", label: "Berminyak (Oily)" },
                    { val: "kombinasi", label: "Kombinasi (Combination)" },
                    { val: "sensitif", label: "Sensitif" },
                  ].map(({ val, label }) => (
                    <Choice
                      key={val}
                      label={label}
                      selected={skinType === val}
                      onClick={() => setSkinType(val)}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(1)}
                    className="rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
                  >
                    ← Kembali
                  </button>
                  <div className="flex-1">
                    <NextBtn
                      label="Berikutnya"
                      disabled={!skinType}
                      onClick={() => goTo(3)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ──────────────────────────────────────────
                STEP 3 — USIA
            ────────────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="age"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-4"
              >
                <h2
                  className="text-xl font-bold leading-snug"
                  style={{ color: "#2d0a30" }}
                >
                  Berapa usiamu tahun ini?
                </h2>

                <div className="flex flex-col gap-2">
                  {["18–24", "25–34", "35–44", "45–54", "55+"].map((val) => (
                    <Choice
                      key={val}
                      label={val}
                      selected={age === val}
                      onClick={() => setAge(val)}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(2)}
                    className="rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
                  >
                    ← Kembali
                  </button>
                  <div className="flex-1">
                    <NextBtn
                      label="Berikutnya"
                      disabled={!age}
                      onClick={() => goTo(4)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ──────────────────────────────────────────
                STEP 4 — GENDER
            ────────────────────────────────────────── */}
            {step === 4 && (
              <motion.div
                key="gender"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-4"
              >
                <h2
                  className="text-xl font-bold leading-snug"
                  style={{ color: "#2d0a30" }}
                >
                  Saya seorang
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "perempuan", label: "Perempuan" },
                    { val: "lakilaki", label: "Laki-laki" },
                  ].map(({ val, label }) => (
                    <Choice
                      key={val}
                      label={label}
                      selected={gender === val}
                      onClick={() => setGender(val)}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(3)}
                    className="rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
                  >
                    ← Kembali
                  </button>
                  <div className="flex-1">
                    <NextBtn
                      label="Lihat Hasilnya"
                      disabled={!gender}
                      onClick={handleResult}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ──────────────────────────────────────────
                STEP 5 — HASIL / RESULT
            ────────────────────────────────────────── */}
            {step === 5 && (
              <motion.div
                key="result"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-4"
              >
                <div>
                  <p
                    className="mb-1 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: "#be3ab4" }}
                  >
                    Hasil Analisis Kulitmu
                  </p>
                  <h2
                    className="text-xl font-bold leading-snug"
                    style={{ color: "#2d0a30" }}
                  >
                    Produk Ginabo yang Cocok Untukmu
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Berdasarkan kondisi dan kebutuhan kulitmu
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {results.map((key, i) => {
                    const p = PRODUCTS[key];
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.4, delay: i * 0.12, ease: EASE },
                        }}
                        className="flex items-center gap-4 rounded-2xl border p-4"
                        style={{
                          borderColor: "#e8d5f0",
                          background: "#fff",
                          boxShadow: "0 2px 12px rgba(120,37,124,0.07)",
                        }}
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={p.img}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1">
                          <span
                            className="mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ background: p.accent }}
                          >
                            {p.tagline}
                          </span>
                          <p
                            className="text-sm font-bold leading-tight"
                            style={{ color: "#2d0a30" }}
                          >
                            {p.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                            {p.desc}
                          </p>
                          <ul className="mt-2 flex flex-col gap-0.5">
                            {p.benefits.map((b) => (
                              <li key={b} className="flex items-center gap-1 text-[11px] text-gray-500">
                                <span style={{ color: "#78257C" }}>✓</span> {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <NextBtn
                  label="Dapatkan Produk Ini!"
                  onClick={() => goTo(6)}
                />

                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="text-center text-xs text-gray-400 underline underline-offset-2"
                >
                  Ulangi dari awal
                </button>
              </motion.div>
            )}

            {/* ──────────────────────────────────────────
                STEP 6 — BIODATA
            ────────────────────────────────────────── */}
            {step === 6 && (
              <motion.div
                key="biodata"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-5"
              >
                <div>
                  <p
                    className="mb-1 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: "#be3ab4" }}
                  >
                    Sedikit lagi!
                  </p>
                  <h2
                    className="text-xl font-bold leading-snug"
                    style={{ color: "#2d0a30" }}
                  >
                    Isi data dirimu untuk mendapatkan rekomendasi langsung via WhatsApp
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">
                    Tim Ginabo akan membantu kamu mendapatkan produk yang tepat.
                  </p>
                </div>

                {/* Result summary */}
                <div
                  className="rounded-xl border p-3"
                  style={{ borderColor: "#e8d5f0", background: "#fdf4ff" }}
                >
                  <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rekomendasi kamu
                  </p>
                  {results.map((key) => (
                    <p
                      key={key}
                      className="text-sm font-semibold"
                      style={{ color: "#78257C" }}
                    >
                      • {PRODUCTS[key].name}
                    </p>
                  ))}
                </div>

                {/* Form */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label
                      htmlFor="skincheck-name"
                      className="mb-1 block text-xs font-semibold text-gray-600"
                    >
                      Nama Lengkap <span className="text-pink-500">*</span>
                    </label>
                    <input
                      id="skincheck-name"
                      type="text"
                      placeholder="Masukkan nama kamu"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#78257C] focus:ring-2 focus:ring-[#78257C]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="skincheck-phone"
                      className="mb-1 block text-xs font-semibold text-gray-600"
                    >
                      Nomor WhatsApp <span className="text-pink-500">*</span>
                    </label>
                    <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 transition focus-within:border-[#78257C] focus-within:ring-2 focus-within:ring-[#78257C]/20">
                      <span className="border-r border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                        +62
                      </span>
                      <input
                        id="skincheck-phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="8xxxxxxxxxx"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, ""))
                        }
                        className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!name.trim() || phone.length < 8}
                  onClick={handleSubmitBiodata}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background:
                      !name.trim() || phone.length < 8
                        ? "#d1b8d8"
                        : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    cursor:
                      !name.trim() || phone.length < 8
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Dapatkan Rekomendasi di WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => goTo(5)}
                  className="text-center text-xs text-gray-400 underline underline-offset-2"
                >
                  ← Kembali ke hasil
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
