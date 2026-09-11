import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordLanding,
  getAttributionForCheckout,
  STORAGE_KEY,
  SESSION_KEY,
  DEFAULT_ATTRIBUTION_WINDOW_MS,
  type StoredAttributionState,
} from './attributionTracker'

describe('attributionTracker', () => {
  // In-memory mock storage
  let memoryStore: Record<string, string> = {}
  let sessionStore: Record<string, string> = {}

  beforeEach(() => {
    memoryStore = {}
    sessionStore = {}

    // Mock localStorage and sessionStorage
    global.localStorage = {
      getItem: (key: string) => memoryStore[key] ?? null,
      setItem: (key: string, val: string) => {
        memoryStore[key] = val
      },
      removeItem: (key: string) => {
        delete memoryStore[key]
      },
      clear: () => {
        memoryStore = {}
      },
      length: 0,
      key: () => null,
    }

    global.sessionStorage = {
      getItem: (key: string) => sessionStore[key] ?? null,
      setItem: (key: string, val: string) => {
        sessionStore[key] = val
      },
      removeItem: (key: string) => {
        delete sessionStore[key]
      },
      clear: () => {
        sessionStore = {}
      },
      length: 0,
      key: () => null,
    }
  })

  it('captures first UTM arrival and sets both firstTouch and lastTouch', () => {
    const t0 = 1700000000000
    const state = recordLanding({
      searchParams: '?utm_source=instagram&utm_medium=paid_social&utm_campaign=summer_drop',
      referrer: 'https://l.instagram.com/',
      pathname: '/products/batik-silk',
      now: t0,
    })

    expect(state.firstTouch?.source).toBe('instagram')
    expect(state.firstTouch?.medium).toBe('paid_social')
    expect(state.firstTouch?.campaign).toBe('summer_drop')
    expect(state.firstTouch?.channel).toBe('Paid Social')

    expect(state.lastTouch?.source).toBe('instagram')
    expect(state.lastTouch?.channel).toBe('Paid Social')
  })

  it('does not allow internal page navigation to overwrite marketing attribution', () => {
    const t0 = 1700000000000
    recordLanding({
      searchParams: '?utm_source=google&utm_medium=cpc&utm_campaign=brand_search',
      referrer: 'https://www.google.com/',
      pathname: '/catalog',
      now: t0,
    })

    // Next step: internal navigation to cart
    const t1 = t0 + 60000
    const stateAfterCart = recordLanding({
      searchParams: '',
      referrer: 'https://ginabo.id/catalog',
      pathname: '/cart',
      appHost: 'ginabo.id',
      now: t1,
    })

    // Marketing source is preserved
    expect(stateAfterCart.lastTouch?.source).toBe('google')
    expect(stateAfterCart.lastTouch?.channel).toBe('Paid Search')
  })

  it('preserves firstTouch when a new campaign touch arrives, but updates lastTouch', () => {
    const t0 = 1700000000000
    recordLanding({
      searchParams: '?utm_source=tiktok&utm_medium=social&utm_campaign=creator_haul',
      referrer: 'https://www.tiktok.com/',
      pathname: '/products/batik-modern',
      now: t0,
    })

    // Day 2: arrives via WhatsApp promo
    const t1 = t0 + 86400000
    const state = recordLanding({
      searchParams: '?utm_source=whatsapp&utm_medium=chat&utm_campaign=vip_privilege',
      referrer: 'https://wa.me/628123456789',
      pathname: '/products/batik-modern',
      now: t1,
    })

    // firstTouch remains TikTok
    expect(state.firstTouch?.source).toBe('tiktok')
    expect(state.firstTouch?.channel).toBe('Organic Social')

    // lastTouch is updated to WhatsApp
    expect(state.lastTouch?.source).toBe('whatsapp')
    expect(state.lastTouch?.channel).toBe('WhatsApp')
    expect(state.lastTouch?.campaign).toBe('vip_privilege')
  })

  it('direct revisit does not erase previous marketing touch within 30-day window', () => {
    const t0 = 1700000000000
    recordLanding({
      searchParams: '?utm_source=facebook&utm_medium=ads&utm_campaign=retargeting_1',
      referrer: 'https://l.facebook.com/',
      pathname: '/landing/promo',
      now: t0,
    })

    // Day 5: Customer types ginabo.id directly in browser
    const t1 = t0 + 5 * 24 * 3600 * 1000
    const state = recordLanding({
      searchParams: '',
      referrer: '',
      pathname: '/',
      now: t1,
    })

    // Last touch should still be Facebook because direct does NOT overwrite within attribution window
    expect(state.lastTouch?.source).toBe('facebook')
    expect(state.lastTouch?.channel).toBe('Paid Social')

    const payload = getAttributionForCheckout(t1)
    expect(payload.attribution_channel).toBe('Paid Social')
    expect(payload.utm_source).toBe('facebook')
    expect(payload.attribution_snapshot?.model).toBe('last_non_direct')
  })

  it('resets to direct if revisit happens after attribution window expires (>30 days)', () => {
    const t0 = 1700000000000
    recordLanding({
      searchParams: '?utm_source=facebook&utm_medium=ads&utm_campaign=promo',
      referrer: 'https://l.facebook.com/',
      pathname: '/landing/promo',
      now: t0,
    })

    // 35 days later: direct visit
    const t1 = t0 + 35 * 24 * 3600 * 1000
    const state = recordLanding({
      searchParams: '',
      referrer: '',
      pathname: '/',
      now: t1,
    })

    // Expired -> reset to direct
    expect(state.lastTouch?.channel).toBe('Direct')

    const payload = getAttributionForCheckout(t1)
    expect(payload.attribution_channel).toBe('Direct')
  })

  it('generates a clean payload for checkout with snapshot', () => {
    const t0 = 1700000000000
    recordLanding({
      searchParams: '?utm_source=google&utm_medium=cpc&utm_campaign=winter_promo&utm_content=banner1&utm_term=batik+premium',
      referrer: 'https://www.google.com/search?q=batik',
      pathname: '/catalog',
      now: t0,
    })

    const payload = getAttributionForCheckout(t0 + 1000)
    expect(payload.utm_source).toBe('google')
    expect(payload.utm_medium).toBe('cpc')
    expect(payload.utm_campaign).toBe('winter_promo')
    expect(payload.utm_content).toBe('banner1')
    expect(payload.utm_term).toBe('batik premium')
    expect(payload.attribution_channel).toBe('Paid Search')
    expect(payload.attribution_snapshot?.model).toBe('last_non_direct')
    expect(payload.attribution_snapshot?.channel).toBe('Paid Search')
  })
})
