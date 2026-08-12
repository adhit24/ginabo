import { describe, expect, it } from "vitest";

import { validateCustomerEvent } from "./events";

describe("customer events", () => {
  it("requires consent and allows safe product metadata", () => {
    expect(validateCustomerEvent({ event_name: "product_viewed", consent: true, product_id: "p1", metadata: { source: "shop" } }).event_name).toBe("product_viewed");
    expect(() => validateCustomerEvent({ event_name: "product_viewed", consent: false })).toThrow("consent");
  });

  it("rejects credentials, payment payloads, and unknown events", () => {
    expect(() => validateCustomerEvent({ event_name: "product_viewed", consent: true, metadata: { access_token: "x" } })).toThrow("terlarang");
    expect(() => validateCustomerEvent({ event_name: "unknown", consent: true })).toThrow("tidak valid");
  });
});
