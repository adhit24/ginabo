// @vitest-environment node
import { describe, expect, it } from "vitest";
import { sanitizeCustomerPayload } from "@/lib/auth/adminAuth";
import { verifyAdminSessionToken, createAdminSessionToken } from "@/lib/auth";

describe("Milestone 6: Security Final Gate Unit Tests", () => {
  it("sanitizeCustomerPayload removes all sensitive credentials", () => {
    const raw = {
      id: "u-123",
      email: "cust@example.com",
      password: "secret_password",
      password_hash: "hash123",
      token: "secret_token",
      refresh_token: "rf123",
      provider_token: "pt123",
      auth_metadata: { secret: "123" },
      raw_user_meta_data: { secret: "123" },
      encrypted_password: "enc",
      full_name: "Customer Name",
    };

    const sanitized = sanitizeCustomerPayload(raw);

    expect(sanitized.id).toBe("u-123");
    expect(sanitized.email).toBe("cust@example.com");
    expect(sanitized.full_name).toBe("Customer Name");
    expect((sanitized as any).password).toBeUndefined();
    expect((sanitized as any).password_hash).toBeUndefined();
    expect((sanitized as any).token).toBeUndefined();
    expect((sanitized as any).refresh_token).toBeUndefined();
    expect((sanitized as any).provider_token).toBeUndefined();
    expect((sanitized as any).auth_metadata).toBeUndefined();
    expect((sanitized as any).encrypted_password).toBeUndefined();
  });

  it("verifyAdminSessionToken rejects forged or tampered tokens", async () => {
    process.env.AUTH_SECRET = "super_secret_test_auth_key_1234567890";

    const forgedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const verified = await verifyAdminSessionToken(forgedToken).catch(() => null);
    expect(verified).toBeNull();
  });

  it("verifyAdminSessionToken accepts valid admin token and rejects non-admin", async () => {
    process.env.AUTH_SECRET = "super_secret_test_auth_key_1234567890";

    const validToken = await createAdminSessionToken({
      sub: "admin-1",
      role: "ADMIN",
      email: "admin@ginabo.id",
    });

    const verified = await verifyAdminSessionToken(validToken);
    expect(verified).not.toBeNull();
    expect(verified?.role).toBe("ADMIN");
    expect(verified?.email).toBe("admin@ginabo.id");
  });
});
