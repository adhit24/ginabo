export const CUSTOMER_EVENT_NAMES = [
  "session_started",
  "product_viewed",
  "search_submitted",
  "add_to_cart",
  "remove_from_cart",
  "checkout_started",
  "checkout_completed",
  "order_created",
  "payment_success",
  "payment_failed",
  "coupon_applied",
] as const;

export const CLIENT_ALLOWED_EVENT_NAMES = [
  "session_started",
  "product_viewed",
  "search_submitted",
  "add_to_cart",
  "remove_from_cart",
  "checkout_started",
  "coupon_applied",
] as const;

export type CustomerEventName = (typeof CUSTOMER_EVENT_NAMES)[number];

const FORBIDDEN_KEYS = /password|token|secret|authorization|payment_payload|address_line|postal|phone|raw_notification/i;
const CLIENT_FORBIDDEN_METADATA_KEYS = /revenue|amount|order_total|gross_revenue|net_revenue/i;

export type CustomerEventInput = {
  event_name: CustomerEventName;
  anonymous_session_id?: string | null;
  product_id?: string | null;
  order_id?: string | null;
  metadata?: Record<string, unknown>;
  consent: boolean;
  event_id?: string;
};

export function validateCustomerEvent(input: unknown, options: { isClient?: boolean } = {}): CustomerEventInput {
  if (!input || typeof input !== "object") throw new Error("event harus berupa object");
  
  // Guard against arbitrary large payloads
  if (JSON.stringify(input).length > 16384) {
    throw new Error("payload terlalu besar (maksimal 16KB)");
  }

  const event = input as Record<string, unknown>;
  const eventName = event.event_name as CustomerEventName;
  if (!CUSTOMER_EVENT_NAMES.includes(eventName)) throw new Error("event_name tidak valid");
  
  if (options.isClient) {
    if (!CLIENT_ALLOWED_EVENT_NAMES.includes(eventName as any)) {
      throw new Error(`event_name "${eventName}" tidak diizinkan dikirim langsung dari client`);
    }
  }

  if (event.consent !== true) throw new Error("consent wajib diberikan");
  const metadata = event.metadata == null ? {} : event.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("metadata tidak valid");
  
  if (Object.keys(metadata as Record<string, unknown>).some((key) => FORBIDDEN_KEYS.test(key))) {
    throw new Error("metadata mengandung data terlarang");
  }

  if (options.isClient) {
    if (Object.keys(metadata as Record<string, unknown>).some((key) => CLIENT_FORBIDDEN_METADATA_KEYS.test(key))) {
      throw new Error("client tidak diizinkan mengirim data revenue atau nilai finansial");
    }
  }

  return {
    event_name: eventName,
    anonymous_session_id: typeof event.anonymous_session_id === "string" ? event.anonymous_session_id.slice(0, 128) : null,
    product_id: typeof event.product_id === "string" ? event.product_id : null,
    order_id: typeof event.order_id === "string" ? event.order_id : null,
    metadata: metadata as Record<string, unknown>,
    consent: true,
    event_id: typeof event.event_id === "string" ? event.event_id : undefined,
  };
}

export function getAnonymousSessionId(): string {
  const key = "ginabo_analytics_session_v1";
  const existing = globalThis.sessionStorage?.getItem(key);
  if (existing) return existing;
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  globalThis.sessionStorage?.setItem(key, value);
  return value;
}

export function trackCustomerEvent(input: Omit<CustomerEventInput, "anonymous_session_id" | "consent">) {
  if (typeof window === "undefined") return;
  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, anonymous_session_id: getAnonymousSessionId(), consent: true }),
    keepalive: true,
  }).catch(() => undefined);
}
