import { describe, it, expect } from 'vitest'
import {
  cleanUtmParam,
  isInternalDomain,
  classifyReferrer,
  classifyMarketingChannel,
} from './classifier'

describe('cleanUtmParam', () => {
  it('handles null and undefined', () => {
    expect(cleanUtmParam(null)).toBeNull()
    expect(cleanUtmParam(undefined)).toBeNull()
    expect(cleanUtmParam('')).toBeNull()
    expect(cleanUtmParam('   ')).toBeNull()
  })

  it('trims whitespace and strips dangerous characters', () => {
    expect(cleanUtmParam('  google  ')).toBe('google')
    expect(cleanUtmParam('insta<script>alert(1)</script>')).toBe('instascriptalert(1)/script')
    expect(cleanUtmParam('fb"\'`')).toBe('fb')
  })

  it('truncates at maxLength', () => {
    const longStr = 'a'.repeat(200)
    expect(cleanUtmParam(longStr, 50)?.length).toBe(50)
  })
})

describe('isInternalDomain', () => {
  it('identifies internal ginabo domains and localhost', () => {
    expect(isInternalDomain('https://ginabo.id/catalog')).toBe(true)
    expect(isInternalDomain('https://app.ginabo.id/checkout')).toBe(true)
    expect(isInternalDomain('http://localhost:3000/cart')).toBe(true)
    expect(isInternalDomain('http://127.0.0.1:3000/')).toBe(true)
  })

  it('rejects external domains', () => {
    expect(isInternalDomain('https://google.com')).toBe(false)
    expect(isInternalDomain('https://instagram.com/p/123')).toBe(false)
    expect(isInternalDomain('invalid-url')).toBe(false)
  })

  it('supports custom appHost', () => {
    expect(isInternalDomain('https://staging.mysite.com/page', 'staging.mysite.com:3000')).toBe(true)
    expect(isInternalDomain('https://other.com', 'staging.mysite.com:3000')).toBe(false)
  })
})

describe('classifyReferrer', () => {
  it('identifies direct and internal traffic', () => {
    expect(classifyReferrer(null).isDirect).toBe(true)
    expect(classifyReferrer('').isDirect).toBe(true)
    expect(classifyReferrer('https://ginabo.id/cart').isInternal).toBe(true)
  })

  it('identifies WhatsApp referrers', () => {
    expect(classifyReferrer('https://wa.me/628123456789').isWhatsApp).toBe(true)
    expect(classifyReferrer('https://web.whatsapp.com/').isWhatsApp).toBe(true)
  })

  it('identifies search engines', () => {
    expect(classifyReferrer('https://www.google.com/search?q=ginabo').isSearchEngine).toBe(true)
    expect(classifyReferrer('https://www.bing.com/').isSearchEngine).toBe(true)
  })

  it('identifies social networks', () => {
    expect(classifyReferrer('https://l.instagram.com/').isSocial).toBe(true)
    expect(classifyReferrer('https://www.tiktok.com/@ginabo').isSocial).toBe(true)
    expect(classifyReferrer('https://t.co/abcxyz').isSocial).toBe(true)
  })

  it('identifies marketplaces', () => {
    expect(classifyReferrer('https://shopee.co.id/product/123').isMarketplace).toBe(true)
    expect(classifyReferrer('https://www.tokopedia.com/shop').isMarketplace).toBe(true)
  })

  it('identifies other referrals', () => {
    const res = classifyReferrer('https://techinasia.com/ginabo-review')
    expect(res.isReferral).toBe(true)
    expect(res.domain).toBe('techinasia.com')
  })
})

describe('classifyMarketingChannel', () => {
  it('classifies WhatsApp traffic', () => {
    expect(classifyMarketingChannel('whatsapp', 'chat', null, 'promo_ramadan')).toBe('WhatsApp')
    expect(classifyMarketingChannel('wa', 'broadcast', null)).toBe('WhatsApp')
    expect(classifyMarketingChannel(null, null, 'https://wa.me/628123456789')).toBe('WhatsApp')
  })

  it('classifies Paid Search vs Organic Search', () => {
    // Paid search: Google with cpc/ppc
    expect(classifyMarketingChannel('google', 'cpc', 'https://www.google.com', 'brand_keywords')).toBe('Paid Search')
    expect(classifyMarketingChannel('bing', 'ppc', null, 'sem_campaign')).toBe('Paid Search')

    // Organic search: Google without paid medium
    expect(classifyMarketingChannel('google', 'organic', 'https://www.google.com')).toBe('Organic Search')
    expect(classifyMarketingChannel(null, null, 'https://www.google.com/search?q=ginabo')).toBe('Organic Search')
  })

  it('classifies Paid Social vs Organic Social', () => {
    // Paid social
    expect(classifyMarketingChannel('facebook', 'cpc', 'https://l.facebook.com')).toBe('Paid Social')
    expect(classifyMarketingChannel('instagram', 'paid_social', null, 'summer_sale')).toBe('Paid Social')
    expect(classifyMarketingChannel('tiktok', 'ads', null, 'viral_drop')).toBe('Paid Social')

    // Organic social
    expect(classifyMarketingChannel('instagram', 'social', 'https://l.instagram.com')).toBe('Organic Social')
    expect(classifyMarketingChannel(null, null, 'https://www.tiktok.com/@ginabo')).toBe('Organic Social')
    expect(classifyMarketingChannel('twitter', null, null)).toBe('Organic Social')
  })

  it('classifies Marketplaces', () => {
    expect(classifyMarketingChannel('shopee', 'affiliate', null)).toBe('Marketplace')
    expect(classifyMarketingChannel(null, null, 'https://www.tokopedia.com/product')).toBe('Marketplace')
  })

  it('classifies Email Marketing', () => {
    expect(classifyMarketingChannel('newsletter', 'email', null, 'weekly_drop')).toBe('Email')
    expect(classifyMarketingChannel('email', null, null)).toBe('Email')
  })

  it('classifies Campaigns and Referrals', () => {
    // Campaign with custom source
    expect(classifyMarketingChannel('influencer_sarah', 'collab', null, 'unboxing_batch1')).toBe('Campaign')

    // External Referral
    expect(classifyMarketingChannel(null, null, 'https://newsblog.id/article')).toBe('Referral')
  })

  it('classifies Direct traffic correctly', () => {
    expect(classifyMarketingChannel(null, null, null)).toBe('Direct')
    expect(classifyMarketingChannel('', '', '')).toBe('Direct')
    // Internal navigation without UTM is direct / non-channel
    expect(classifyMarketingChannel(null, null, 'https://ginabo.id/shop')).toBe('Direct')
  })
})
