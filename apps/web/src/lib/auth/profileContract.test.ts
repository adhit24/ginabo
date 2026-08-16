import { describe, expect, it } from "vitest";

import { buildProfileUpsert, normalizeIndonesianPhone } from "./profileContract";

describe("profile contract", () => {
  it("normalizes Indonesian WhatsApp numbers to +62 format", () => {
    expect(normalizeIndonesianPhone("0812 3456 7890")).toBe("+6281234567890");
    expect(normalizeIndonesianPhone("+62 812-3456-7890")).toBe("+6281234567890");
  });

  it("builds canonical profile fields without legacy aliases", () => {
    expect(buildProfileUpsert({ id: "u-1", email: "a@example.com", name: "  Ana  ", phone: "081234567890" })).toEqual({
      id: "u-1",
      email: "a@example.com",
      full_name: "Ana",
      phone_number: "+6281234567890",
    });
  });

  it("rejects malformed phone numbers", () => {
    expect(() => normalizeIndonesianPhone("123")).toThrow("phone");
  });
});
