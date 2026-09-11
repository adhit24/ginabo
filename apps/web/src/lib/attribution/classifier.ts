import type { MarketingChannelName } from './types'

export function cleanUtmParam(val?: string | null, maxLength = 100): string | null {
  if (!val || typeof val !== 'string') return null
  const trimmed = val.trim()
  if (!trimmed) return null
  // Strip control characters and sanitize
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F<>\"\'`]/g, '')
  if (!sanitized) return null
  return sanitized.slice(0, maxLength)
}

export function isInternalDomain(referrerUrl: string, appHost?: string): boolean {
  try {
    const refUrl = new URL(referrerUrl)
    const refHostname = refUrl.hostname.toLowerCase()
    if (!appHost) {
      return (
        refHostname === 'ginabo.id' ||
        refHostname.endsWith('.ginabo.id') ||
        refHostname === 'localhost' ||
        refHostname === '127.0.0.1'
      )
    }
    const currentHost = appHost.split(':')[0].toLowerCase()
    return refHostname === currentHost || refHostname.endsWith(`.${currentHost}`)
  } catch {
    return false
  }
}

export function classifyReferrer(referrer?: string | null, appHost?: string) {
  if (!referrer || typeof referrer !== 'string' || !referrer.trim()) {
    return { isDirect: true }
  }

  const trimmed = referrer.trim()
  if (isInternalDomain(trimmed, appHost)) {
    return { isInternal: true, isDirect: true }
  }

  let hostname = ''
  try {
    const url = new URL(trimmed)
    hostname = url.hostname.toLowerCase()
  } catch {
    hostname = trimmed.toLowerCase()
  }

  // 1. WhatsApp
  if (hostname.includes('whatsapp.com') || hostname === 'wa.me' || hostname.endsWith('.wa.me')) {
    return { isWhatsApp: true, domain: hostname }
  }

  // 2. Search Engines
  if (
    hostname.includes('google.') ||
    hostname.includes('bing.') ||
    hostname.includes('yahoo.') ||
    hostname.includes('duckduckgo.') ||
    hostname.includes('yandex.') ||
    hostname.includes('baidu.')
  ) {
    return { isSearchEngine: true, domain: hostname }
  }

  // 3. Social Media
  if (
    hostname.includes('instagram.com') ||
    hostname.includes('facebook.com') ||
    hostname.includes('tiktok.com') ||
    hostname.includes('twitter.com') ||
    hostname === 't.co' ||
    hostname === 'x.com' ||
    hostname.includes('youtube.com') ||
    hostname.includes('pinterest.') ||
    hostname.includes('threads.net')
  ) {
    return { isSocial: true, domain: hostname }
  }

  // 4. Marketplaces
  if (
    hostname.includes('shopee.') ||
    hostname.includes('tokopedia.com') ||
    hostname.includes('lazada.') ||
    hostname.includes('blibli.com') ||
    hostname.includes('bukalapak.com')
  ) {
    return { isMarketplace: true, domain: hostname }
  }

  return { isReferral: true, domain: hostname }
}

export function classifyMarketingChannel(
  rawSource?: string | null,
  rawMedium?: string | null,
  rawReferrer?: string | null,
  rawCampaign?: string | null,
  appHost?: string,
): MarketingChannelName {
  const source = cleanUtmParam(rawSource)?.toLowerCase()
  const medium = cleanUtmParam(rawMedium)?.toLowerCase()
  const campaign = cleanUtmParam(rawCampaign)
  const referrerInfo = classifyReferrer(rawReferrer, appHost)

  // 1. WhatsApp Attribution
  if (
    source === 'whatsapp' ||
    source === 'wa' ||
    medium === 'whatsapp' ||
    referrerInfo.isWhatsApp
  ) {
    return 'WhatsApp'
  }

  // 2. Paid Search (Google Ads, Bing Ads)
  const paidMediums = ['cpc', 'ppc', 'paid_search', 'paidsearch', 'sem', 'adwords']
  if (
    (source?.includes('google') || source?.includes('bing') || referrerInfo.isSearchEngine) &&
    medium &&
    paidMediums.includes(medium)
  ) {
    return 'Paid Search'
  }

  // 3. Paid Social (Meta Ads, Instagram Ads, TikTok Ads)
  const paidSocialMediums = ['paid_social', 'paidsocial', 'cpm', 'ads', 'sponsored', 'social_paid', 'paid-social']
  if (
    medium &&
    (paidSocialMediums.includes(medium) ||
      (medium === 'cpc' && (source?.includes('fb') || source?.includes('facebook') || source?.includes('ig') || source?.includes('instagram') || source?.includes('tiktok') || referrerInfo.isSocial)))
  ) {
    return 'Paid Social'
  }

  // 4. Marketplace
  if (
    source?.includes('shopee') ||
    source?.includes('tokopedia') ||
    source?.includes('lazada') ||
    source?.includes('blibli') ||
    source?.includes('tiktokshop') ||
    referrerInfo.isMarketplace
  ) {
    return 'Marketplace'
  }

  // 5. Email Marketing
  if (source === 'email' || medium === 'email' || medium === 'newsletter') {
    return 'Email'
  }

  // 6. Organic Search
  if (
    source === 'google' ||
    source === 'bing' ||
    source === 'yahoo' ||
    source === 'duckduckgo' ||
    referrerInfo.isSearchEngine ||
    medium === 'organic'
  ) {
    return 'Organic Search'
  }

  // 7. Organic Social
  if (
    source?.includes('instagram') ||
    source?.includes('facebook') ||
    source?.includes('tiktok') ||
    source?.includes('twitter') ||
    source?.includes('youtube') ||
    source?.includes('pinterest') ||
    referrerInfo.isSocial ||
    medium === 'social'
  ) {
    return 'Organic Social'
  }

  // 8. Explicit Campaign with unknown medium
  if (campaign && source) {
    return 'Campaign'
  }

  // 9. External Referral
  if (referrerInfo.isReferral && referrerInfo.domain) {
    return 'Referral'
  }

  // 10. Direct / Unknown
  if (referrerInfo.isDirect || (!source && !medium && !rawReferrer)) {
    return 'Direct'
  }

  return 'Unknown'
}
