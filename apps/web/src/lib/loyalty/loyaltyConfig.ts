import type { MembershipTier } from './types'

export const LOYALTY_CONFIG = {
  // Configurable conversion rule: 1 point per Rp 1.000 net valid spend
  POINTS_PER_1000_IDR: 1,

  // Welcome bonus granted upon initial registration
  WELCOME_BONUS_POINTS: 100,

  // Minimum net spend thresholds for lifetime tiers (in IDR)
  TIER_THRESHOLDS_IDR: {
    Regular: 0,
    Silver: 500_000,
    Gold: 1_500_000,
    Platinum: 3_000_000,
  } as Record<MembershipTier, number>,

  TIER_ORDER: ['Regular', 'Silver', 'Gold', 'Platinum'] as const,

  TIER_BENEFITS: {
    Regular: 'Akses katalog Ginabo, welcome bonus 100 poin, dan akumulasi poin setiap belanja.',
    Silver: 'Reward poin belanja, promo member bulanan, dan hadiah ulang tahun.',
    Gold: 'Bonus poin 1.25x, prioritas antrean fulfillment, dan promo eksklusif member Gold.',
    Platinum: 'Tier tertinggi: early access produk baru, free gift seasonal, dan layanan konsultasi privat.',
  } as Record<MembershipTier, string>,
}
