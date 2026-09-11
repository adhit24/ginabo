import {
  cleanUtmParam,
  classifyMarketingChannel,
  classifyReferrer,
  isInternalDomain,
} from './classifier'
import type {
  AttributionTouch,
  AttributionSnapshot,
  AttributionPayload,
  MarketingChannelName,
} from './types'

export const STORAGE_KEY = 'ginabo_attribution_v1'
export const SESSION_KEY = 'ginabo_session_v1'
// Default baseline attribution window: 30 days (documented centrally as business assumption)
export const DEFAULT_ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

export interface StoredAttributionState {
  sessionId: string
  firstTouch: AttributionTouch | null
  lastTouch: AttributionTouch | null
  updatedAt: number
}

function generateRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateRandomId()
  }
  try {
    let sess = window.sessionStorage.getItem(SESSION_KEY)
    if (!sess) {
      sess = generateRandomId()
      window.sessionStorage.setItem(SESSION_KEY, sess)
    }
    return sess
  } catch {
    return generateRandomId()
  }
}

export function loadStoredAttribution(): StoredAttributionState {
  const fallback: StoredAttributionState = {
    sessionId: getOrCreateSessionId(),
    firstTouch: null,
    lastTouch: null,
    updatedAt: Date.now(),
  }

  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return {
        sessionId: getOrCreateSessionId(),
        firstTouch: parsed.firstTouch || null,
        lastTouch: parsed.lastTouch || null,
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
      }
    }
  } catch {
    // corrupted or unavailable
  }

  return fallback
}

export function saveStoredAttribution(state: StoredAttributionState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded or restricted storage
  }
}

export interface RecordLandingParams {
  searchParams?: URLSearchParams | string | null
  referrer?: string | null
  pathname?: string | null
  appHost?: string
  now?: number
  attributionWindowMs?: number
}

export function recordLanding(params: RecordLandingParams = {}): StoredAttributionState {
  const now = params.now ?? Date.now()
  const windowMs = params.attributionWindowMs ?? DEFAULT_ATTRIBUTION_WINDOW_MS
  const state = loadStoredAttribution()

  // Parse search params
  let sp: URLSearchParams
  if (params.searchParams instanceof URLSearchParams) {
    sp = params.searchParams
  } else if (typeof params.searchParams === 'string') {
    sp = new URLSearchParams(params.searchParams.replace(/^\?/, ''))
  } else if (typeof window !== 'undefined') {
    sp = new URLSearchParams(window.location.search)
  } else {
    sp = new URLSearchParams()
  }

  const rawReferrer =
    params.referrer !== undefined
      ? params.referrer
      : typeof document !== 'undefined'
      ? document.referrer
      : null

  const landingPage = cleanUtmParam(
    params.pathname !== undefined
      ? params.pathname
      : typeof window !== 'undefined'
      ? window.location.pathname
      : '/',
    200
  )

  const appHost =
    params.appHost ||
    (typeof window !== 'undefined' ? window.location.host : undefined)

  const source = cleanUtmParam(sp.get('utm_source'))
  const medium = cleanUtmParam(sp.get('utm_medium'))
  const campaign = cleanUtmParam(sp.get('utm_campaign'))
  const content = cleanUtmParam(sp.get('utm_content'))
  const term = cleanUtmParam(sp.get('utm_term'))

  const hasUtm = Boolean(source || medium || campaign || content || term)
  const isInternal = isInternalDomain(rawReferrer || '', appHost)

  // Internal navigation without UTMs should never modify attribution
  if (isInternal && !hasUtm) {
    return state
  }

  const channel = classifyMarketingChannel(source, medium, rawReferrer, campaign, appHost)
  const isDirect = channel === 'Direct'

  const currentTouch: AttributionTouch = {
    source: source || (isDirect ? 'direct' : null),
    medium: medium || (isDirect ? 'none' : null),
    campaign,
    content,
    term,
    referrer: cleanUtmParam(rawReferrer, 300),
    landingPage,
    channel,
    capturedAt: new Date(now).toISOString(),
  }

  // 1. FIRST TOUCH:
  // Captured only once if visitor arrives with identifiable marketing or on first touch
  if (!state.firstTouch) {
    state.firstTouch = currentTouch
  }

  // 2. LAST NON-DIRECT TOUCH:
  if (!isDirect) {
    // Meaningful marketing touch arrived -> update last touch
    state.lastTouch = currentTouch
  } else {
    // Direct visit: check if existing lastTouch has expired beyond attribution window
    if (state.lastTouch) {
      const lastTime = new Date(state.lastTouch.capturedAt).getTime()
      if (now - lastTime > windowMs) {
        // Expired -> reset to direct
        state.lastTouch = currentTouch
      }
      // If within window, we DO NOT overwrite existing lastTouch (Direct traffic rule)
    } else {
      state.lastTouch = currentTouch
    }
  }

  state.updatedAt = now
  saveStoredAttribution(state)
  return state
}

export function getAttributionForCheckout(
  now: number = Date.now(),
  windowMs: number = DEFAULT_ATTRIBUTION_WINDOW_MS
): AttributionPayload {
  const state = loadStoredAttribution()

  // Select active touch: prefer last non-direct touch if within window
  let activeTouch: AttributionTouch | null = state.lastTouch

  if (activeTouch) {
    const lastTime = new Date(activeTouch.capturedAt).getTime()
    if (now - lastTime > windowMs && state.firstTouch) {
      // Last touch expired, check if first touch is valid
      const firstTime = new Date(state.firstTouch.capturedAt).getTime()
      activeTouch = now - firstTime <= windowMs ? state.firstTouch : null
    }
  } else if (state.firstTouch) {
    const firstTime = new Date(state.firstTouch.capturedAt).getTime()
    if (now - firstTime <= windowMs) {
      activeTouch = state.firstTouch
    }
  }

  const channel: MarketingChannelName = activeTouch ? activeTouch.channel : 'Direct'

  const snapshot: AttributionSnapshot = {
    firstTouch: state.firstTouch,
    lastTouch: state.lastTouch,
    channel,
    model: 'last_non_direct',
    capturedAt: new Date(now).toISOString(),
  }

  return {
    utm_source: activeTouch?.source || null,
    utm_medium: activeTouch?.medium || null,
    utm_campaign: activeTouch?.campaign || null,
    utm_content: activeTouch?.content || null,
    utm_term: activeTouch?.term || null,
    referrer: activeTouch?.referrer || null,
    landing_page: activeTouch?.landingPage || null,
    attribution_channel: channel,
    attribution_snapshot: snapshot,
  }
}

export function initAttributionTracker(): AttributionPayload {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      attribution_channel: 'Direct',
    }
  }

  try {
    recordLanding()
    return getAttributionForCheckout()
  } catch (err) {
    console.error('[Attribution] Failed to init tracker:', err)
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      attribution_channel: 'Direct',
    }
  }
}
