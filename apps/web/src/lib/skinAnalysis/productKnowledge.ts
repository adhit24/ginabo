export type SkinConcern =
  | "kering"
  | "kusam"
  | "penuaan"
  | "jerawat"
  | "hiperpig"
  | "tidakmerata"
  | "pori"
  | "sensitif"
  | "barrier";

export type SkinType = "normal" | "kering" | "berminyak" | "kombinasi" | "sensitif";
export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+";
export type Confidence = "high" | "medium" | "low";

export type RedFlag =
  | "jerawat_berat"
  | "luka_infeksi"
  | "alergi_aktif"
  | "perih_hebat"
  | "mengelupas_ekstrem"
  | "obat_dokter"
  | "hamil_menyusui"
  | "riwayat_alergi";

export type ProductKey = "glowage_serum" | "hydra_moist_gel" | "bright_care_cream";
export type BundleKey = "complete_skin_nutrition" | "repair_glow" | "daily_skin_barrier" | "bright_renewal";

export type ProductKnowledge = {
  key: ProductKey;
  name: string;
  category: string;
  role: string;
  image: string;
  strengths: string[];
  idealFor: SkinConcern[];
  bestSkinTypes: SkinType[];
  caution: string[];
  routineHint: string;
};

export type BundleKnowledge = {
  key: BundleKey;
  name: string;
  products: ProductKey[];
  idealFor: SkinConcern[];
  bestSkinTypes: SkinType[];
  caution: string[];
};

export type FaceAnalysisInput = {
  concerns: SkinConcern[];
  skinType: SkinType;
  age?: AgeRange;
  redFlags?: RedFlag[];
  isBeginner?: boolean;
  unavailableProducts?: ProductKey[];
};

export type FaceAnalysisRecommendation = {
  primary: ProductKnowledge;
  support: ProductKnowledge | null;
  bundle: BundleKnowledge | null;
  confidence: Confidence;
  reasons: string[];
  cautions: string[];
  routine: string[];
  shouldConsultFirst: boolean;
};

export const productKnowledge: Record<ProductKey, ProductKnowledge> = {
  glowage_serum: {
    key: "glowage_serum",
    name: "GlowAge Multi-Active Serum",
    category: "Serum",
    role: "Treatment untuk tampilan kulit kusam, warna tidak merata, dan tanda penuaan awal.",
    image: "/serumfix.png",
    strengths: [
      "Membantu kulit tampak lebih cerah alami.",
      "Membantu meratakan warna kulit.",
      "Membantu merawat tampilan garis halus dan tanda penuaan.",
      "Tekstur ringan untuk rutinitas harian.",
    ],
    idealFor: ["kusam", "penuaan", "hiperpig", "tidakmerata", "pori"],
    bestSkinTypes: ["normal", "kombinasi", "berminyak"],
    caution: [
      "Untuk kulit sangat sensitif atau sedang iritasi, mulai perlahan dan lakukan patch test.",
      "Gunakan sunscreen di pagi hari saat fokus pada brightening.",
    ],
    routineHint: "Gunakan setelah wajah bersih, lalu kunci dengan pelembap. Pagi hari wajib lanjut sunscreen.",
  },
  hydra_moist_gel: {
    key: "hydra_moist_gel",
    name: "Hydra Moist Gel Ultimate",
    category: "Gel Moisturizer",
    role: "Hydrator ringan untuk kulit kering, dehidrasi, sensitif, atau barrier yang butuh dukungan.",
    image: "/salmonfix.png",
    strengths: [
      "Membantu melembapkan kulit.",
      "Membantu kulit terasa lebih tenang dan nyaman.",
      "Mendukung skin barrier.",
      "Tekstur gel ringan, bisa dipakai sebagai moisturizer, makeup prep, atau sleeping mask.",
    ],
    idealFor: ["kering", "sensitif", "barrier", "jerawat"],
    bestSkinTypes: ["kering", "sensitif", "kombinasi", "berminyak"],
    caution: [
      "Bukan pengganti konsultasi untuk iritasi berat, luka, atau alergi aktif.",
      "Validasi istilah resmi DNA Salmon/DHA Salmon sebelum klaim final dipublikasikan.",
    ],
    routineHint: "Gunakan sebagai pelembap pagi dan malam. Bisa dipakai tipis untuk kulit berminyak.",
  },
  bright_care_cream: {
    key: "bright_care_cream",
    name: "Bright & Care Moisture Cream",
    category: "Moisture Cream",
    role: "Pelembap harian untuk menjaga kelembapan, kenyamanan, dan skin barrier.",
    image: "/moistfix.png",
    strengths: [
      "Membantu melembapkan sepanjang hari.",
      "Membantu menjaga skin barrier.",
      "Membantu merawat tampilan kulit kusam.",
      "Cocok untuk rutinitas pagi dan malam.",
    ],
    idealFor: ["kering", "kusam", "hiperpig", "barrier"],
    bestSkinTypes: ["normal", "kering", "kombinasi", "sensitif"],
    caution: [
      "Untuk kulit sangat berminyak atau mudah komedo, gunakan tipis dan evaluasi kenyamanan.",
      "Lakukan patch test jika kulit sensitif.",
    ],
    routineHint: "Gunakan setelah serum atau hydrating gel untuk menjaga kelembapan.",
  },
};

export const bundleKnowledge: Record<BundleKey, BundleKnowledge> = {
  complete_skin_nutrition: {
    key: "complete_skin_nutrition",
    name: "Ginabo Complete Skin Nutrition Set",
    products: ["hydra_moist_gel", "bright_care_cream", "glowage_serum"],
    idealFor: ["kering", "kusam", "tidakmerata", "barrier", "penuaan"],
    bestSkinTypes: ["normal", "kering", "kombinasi"],
    caution: [
      "Tidak disarankan langsung untuk pemula total atau kulit sedang iritasi aktif.",
      "Mulai bertahap bila kulit sensitif.",
    ],
  },
  repair_glow: {
    key: "repair_glow",
    name: "Repair & Glow Set",
    products: ["hydra_moist_gel", "glowage_serum"],
    idealFor: ["kering", "kusam", "tidakmerata", "hiperpig"],
    bestSkinTypes: ["normal", "kombinasi", "berminyak"],
    caution: ["Untuk kulit sangat sensitif, dahulukan Hydra Moist Gel sebelum menambah serum."],
  },
  daily_skin_barrier: {
    key: "daily_skin_barrier",
    name: "Daily Skin Barrier Set",
    products: ["bright_care_cream", "hydra_moist_gel"],
    idealFor: ["kering", "sensitif", "barrier"],
    bestSkinTypes: ["kering", "sensitif", "kombinasi"],
    caution: ["Jika kulit sedang perih hebat atau luka, konsultasi dulu sebelum memakai produk baru."],
  },
  bright_renewal: {
    key: "bright_renewal",
    name: "Bright Renewal Set",
    products: ["bright_care_cream", "glowage_serum"],
    idealFor: ["kusam", "hiperpig", "tidakmerata", "penuaan"],
    bestSkinTypes: ["normal", "kombinasi"],
    caution: ["Jika kulit sensitif/iritasi aktif, mulai dari barrier/hydration dulu."],
  },
};

const concernWeights: Record<SkinConcern, Partial<Record<ProductKey, number>>> = {
  kering: { hydra_moist_gel: 4, bright_care_cream: 2 },
  kusam: { glowage_serum: 3, bright_care_cream: 1 },
  penuaan: { glowage_serum: 4, bright_care_cream: 1 },
  jerawat: { hydra_moist_gel: 2 },
  hiperpig: { glowage_serum: 3, bright_care_cream: 2 },
  tidakmerata: { glowage_serum: 3, bright_care_cream: 1 },
  pori: { glowage_serum: 1, hydra_moist_gel: 1 },
  sensitif: { hydra_moist_gel: 4, bright_care_cream: 1, glowage_serum: -1 },
  barrier: { hydra_moist_gel: 4, bright_care_cream: 3, glowage_serum: -1 },
};

const skinTypeWeights: Record<SkinType, Partial<Record<ProductKey, number>>> = {
  normal: { bright_care_cream: 2, glowage_serum: 1, hydra_moist_gel: 1 },
  kering: { hydra_moist_gel: 3, bright_care_cream: 2 },
  berminyak: { hydra_moist_gel: 2, glowage_serum: 1, bright_care_cream: -1 },
  kombinasi: { glowage_serum: 2, hydra_moist_gel: 1, bright_care_cream: 1 },
  sensitif: { hydra_moist_gel: 4, bright_care_cream: 1, glowage_serum: -1 },
};

const redFlagLabels: Record<RedFlag, string> = {
  jerawat_berat: "jerawat meradang berat",
  luka_infeksi: "luka, infeksi, atau kulit terbuka",
  alergi_aktif: "alergi aktif",
  perih_hebat: "rasa panas atau perih hebat",
  mengelupas_ekstrem: "kulit mengelupas ekstrem",
  obat_dokter: "sedang memakai obat atau treatment dokter",
  hamil_menyusui: "hamil/menyusui dan ragu memakai skincare baru",
  riwayat_alergi: "riwayat alergi terhadap bahan skincare tertentu",
};

function addWeights(score: Record<ProductKey, number>, weights?: Partial<Record<ProductKey, number>>) {
  if (!weights) return;
  (Object.entries(weights) as [ProductKey, number][]).forEach(([key, value]) => {
    score[key] += value;
  });
}

function scoreBundle(bundle: BundleKnowledge, concerns: SkinConcern[], skinType: SkinType) {
  const concernScore = concerns.filter((concern) => bundle.idealFor.includes(concern)).length * 2;
  const skinTypeScore = bundle.bestSkinTypes.includes(skinType) ? 2 : 0;
  return concernScore + skinTypeScore;
}

export function analyzeFaceForGinabo(input: FaceAnalysisInput): FaceAnalysisRecommendation {
  const unavailable = new Set(input.unavailableProducts ?? []);
  const score: Record<ProductKey, number> = {
    glowage_serum: 0,
    hydra_moist_gel: 0,
    bright_care_cream: 0,
  };

  input.concerns.forEach((concern) => addWeights(score, concernWeights[concern]));
  addWeights(score, skinTypeWeights[input.skinType]);

  if (input.age && ["35-44", "45-54", "55+"].includes(input.age)) {
    score.glowage_serum += 2;
  }

  if (input.isBeginner) {
    score.hydra_moist_gel += 1;
    score.bright_care_cream += 1;
    score.glowage_serum -= 1;
  }

  unavailable.forEach((key) => {
    score[key] = Number.NEGATIVE_INFINITY;
  });

  const ranked = (Object.keys(score) as ProductKey[])
    .filter((key) => Number.isFinite(score[key]))
    .sort((a, b) => score[b] - score[a]);

  const fallbackPrimary: ProductKey = input.skinType === "sensitif" ? "hydra_moist_gel" : "bright_care_cream";
  const primaryKey = ranked[0] ?? fallbackPrimary;
  const supportKey = ranked[1] && score[ranked[1]] >= score[primaryKey] - 3 ? ranked[1] : null;

  const shouldConsultFirst = (input.redFlags?.length ?? 0) > 0;
  const confidence: Confidence = shouldConsultFirst
    ? "low"
    : input.concerns.length >= 1 && score[primaryKey] >= 5
      ? "high"
      : "medium";

  const bundle = !shouldConsultFirst && !input.isBeginner
    ? (Object.values(bundleKnowledge)
        .filter((candidate) => candidate.products.includes(primaryKey))
        .sort((a, b) => scoreBundle(b, input.concerns, input.skinType) - scoreBundle(a, input.concerns, input.skinType))[0] ?? null)
    : null;

  const reasons = [
    `Rekomendasi disesuaikan dengan jenis kulit ${input.skinType}.`,
    input.concerns.length > 0
      ? `Concern utama yang dibaca: ${input.concerns.join(", ")}.`
      : "Concern belum spesifik, jadi sistem memilih produk basic yang lebih aman.",
  ];

  const cautions = [
    ...productKnowledge[primaryKey].caution,
    ...(supportKey ? productKnowledge[supportKey].caution.slice(0, 1) : []),
    ...(input.redFlags ?? []).map((flag) => `Terdeteksi ${redFlagLabels[flag]}; sebaiknya konsultasi dulu sebelum mencoba produk baru.`),
  ];

  const routine = [
    productKnowledge[primaryKey].routineHint,
    supportKey ? productKnowledge[supportKey].routineHint : "Mulai dari satu produk dulu dan evaluasi kenyamanan kulit.",
    "Pagi hari wajib gunakan sunscreen, terutama jika fokusnya brightening atau warna kulit tidak merata.",
  ];

  return {
    primary: productKnowledge[primaryKey],
    support: supportKey ? productKnowledge[supportKey] : null,
    bundle,
    confidence,
    reasons,
    cautions: Array.from(new Set(cautions)),
    routine: Array.from(new Set(routine)),
    shouldConsultFirst,
  };
}
