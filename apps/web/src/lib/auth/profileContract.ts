export type ProfileUpsertInput = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
};

export function normalizeIndonesianPhone(input: string): string {
  const compact = input.trim().replace(/[\s().-]/g, "");
  const digits = compact.startsWith("+") ? compact.slice(1) : compact;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;

  if (!/^628\d{8,12}$/.test(normalized)) {
    throw new Error("phone must be a valid Indonesian mobile number");
  }

  return `+${normalized}`;
}

export function buildProfileUpsert(input: ProfileUpsertInput): {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
} {
  const name = input.name.trim();
  if (!input.id || !input.email || !name) throw new Error("profile identity is required");

  return {
    id: input.id,
    email: input.email.trim().toLowerCase(),
    full_name: name,
    phone_number: input.phone?.trim() ? normalizeIndonesianPhone(input.phone) : null,
  };
}
