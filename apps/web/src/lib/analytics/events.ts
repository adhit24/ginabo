export const CUSTOMER_EVENT_NAMES = [
  "product_viewed",
  "search_submitted",
  "add_to_cart",
  "remove_from_cart",
  "checkout_started",
  "checkout_completed",
  "payment_failed",
] as const;

export type CustomerEventName = (typeof CUSTOMER_EVENT_NAMES)[number];

const FORBIDDEN_KEYS = /password|token|secret|authorization|payment_payload|address_line|postal|phone|raw_notification/i;

export type CustomerEventInput = {
  event_name: CustomerEventName;
  anonymous_session_id?: string | null;
  product_id?: string | null;
  order_id?: string | null;
  metadata?: Record<string, unknown>;
  consent: boolean;
  event_id?: string;
};

export function validateCustomerEvent(input: unknown): CustomerEventInput {
  if (!input || typeof input !== "object") throw new Error("event harus berupa object");
  const event = input as Record<string, unknown>;
  if (!CUSTOMER_EVENT_NAMES.includes(event.event_name as CustomerEventName)) throw new Error("event_name tidak valid");
  if (event.consent !== true) throw new Error("consent wajib diberikan");
  const metadata = event.metadata == null ? {} : event.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error("metadata tidak valid");
  if (Object.keys(metadata as Record<string, unknown>).some((key) => FORBIDDEN_KEYS.test(key))) throw new Error("metadata mengandung data terlarang");
  return {
    event_name: event.event_name as CustomerEventName,
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
