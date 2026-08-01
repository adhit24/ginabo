# Member Account Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `/member`'s "Pengaturan Akun" and "Alamat Pengiriman" tabs to real data — native date picker, a `PATCH /api/profile` endpoint that actually persists Simpan, a Tokopedia-style address-add flow backed by free Nominatim geocoding, and a working profile-photo upload (2MB cap) into the already-existing `user-avatars` bucket.

**Architecture:** Two new small API routes proxy Nominatim server-side (browsers can't set the User-Agent header Nominatim's usage policy requires). A new `PATCH /api/profile` route follows the exact pattern of the existing `/api/addresses` routes. `AuthProvider` gains the profile fields the UI needs plus a `refreshProfile()` method so saves show up immediately without a page reload. A new `AddressModal` component handles the 2-step search/current-location → confirm-and-save flow, reusing the existing `POST /api/addresses`.

**Tech Stack:** Next.js 14 App Router (edge + node runtimes), Supabase (Postgres + Auth + Storage), Zod validation, Tailwind (no new CSS framework), native browser Geolocation + `<input type="date">`, OpenStreetMap Nominatim (no SDK — plain `fetch`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-01-member-account-settings-design.md` — read it before starting; every task below implements a section of it.
- Mobile-first, fit-to-screen, fully responsive. Every new UI element must be checked at a 375px viewport, not just desktop — this is the primary usage context.
- No new npm dependencies. Everything here (date input, geolocation, debounce, fetch) is native browser/Next.js API.
- This codebase has zero existing `*.test.ts(x)` files despite Vitest being configured — automated tests are not the established convention for pages or API routes here. Each task's verification step is manual (dev server + curl/browser), matching how every other feature in this session was verified. Do not invent a test suite that doesn't match the codebase's actual practice.
- Follow existing conventions exactly: API routes use `jsonOk`/`jsonError` from `@/lib/http`, Zod schemas live in `@/lib/validation.ts`, Supabase update/insert calls are cast `as never` (see `/api/addresses/route.ts`) due to the generated `Database` type's strictness.
- The `user-avatars` Supabase Storage bucket already exists in production (public, 2MB limit, jpeg/png/webp) — confirmed live via the Storage API. Do not write a migration for it.
- Windows/PowerShell dev environment — when a task says "run the dev server", use the project's existing `npm run dev` from `apps/web`, and remember port 3000 may already be in use (Next.js will pick the next free port; check the terminal output for the actual port before curling).

---

### Task 1: `PATCH /api/profile` endpoint

**Files:**
- Modify: `apps/web/src/lib/validation.ts` — add `profileUpdateSchema`
- Create: `apps/web/src/app/api/profile/route.ts`

**Interfaces:**
- Produces: `PATCH /api/profile` — body `{ full_name?: string; phone?: string | null; date_of_birth?: string | null; gender?: 'male' | 'female' | 'other' | null; avatar_url?: string }` (all optional, at least one key required). Response: `{ ok: true, data: ProfileRow }` on success, `{ ok: false, error: { message, details? } }` on failure. Requires an authenticated session (401 if not logged in).

- [ ] **Step 1: Add the validation schema**

In `apps/web/src/lib/validation.ts`, append at the end of the file (after `addressUpdateSchema`):

```ts
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(120).optional(),
  phone: z.string().min(8).max(30).nullable().optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  avatar_url: z.string().url().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Tidak ada data untuk diperbarui",
});
```

- [ ] **Step 2: Create the route**

Create `apps/web/src/app/api/profile/route.ts`:

```ts
// PATCH /api/profile — update the current user's profile fields
// (full_name, phone, date_of_birth, gender, avatar_url)

import { type NextRequest } from 'next/server'
import { jsonError, jsonOk } from '@/lib/http'
import { profileUpdateSchema } from '@/lib/validation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@/types/database'

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return jsonError('Silakan login terlebih dahulu', 401)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError('Request body tidak valid', 400)
  }

  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError('Data profil tidak valid', 400, parsed.error.flatten())
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(parsed.data as never)
    .eq('id', user.id)
    .select('full_name, phone, date_of_birth, gender, avatar_url')
    .single()

  if (error || !data) return jsonError('Gagal menyimpan profil', 500, error?.message)

  return jsonOk(data as Pick<ProfileRow, 'full_name' | 'phone' | 'date_of_birth' | 'gender' | 'avatar_url'>)
}
```

- [ ] **Step 3: Verify manually**

Run `npm run dev` from `apps/web` (note the actual port from the terminal output — 3000 may be busy). Without a session cookie, confirm the route fails closed:

```bash
curl -s -X PATCH http://localhost:3000/api/profile -H "content-type: application/json" -d "{\"full_name\":\"Test\"}"
```

Expected: `{"ok":false,"error":{"message":"Silakan login terlebih dahulu","details":null}}` with a 401 status (check with `-w "%{http_code}"` appended, or `-i` for full headers). Full authenticated verification happens in Task 3 once the UI calls this route from a logged-in browser session.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/validation.ts apps/web/src/app/api/profile/route.ts
git commit -m "feat: add PATCH /api/profile endpoint"
```

---

### Task 2: Extend `AuthProvider` with profile fields + `refreshProfile()`

**Files:**
- Modify: `apps/web/src/components/auth/AuthProvider.tsx`

**Interfaces:**
- Consumes: nothing new (uses existing `createClient` from `@/lib/supabase/client`)
- Produces: `User` type gains `phone: string | null`, `dateOfBirth: string | null`, `gender: 'male' | 'female' | 'other' | null`, `avatarUrl: string | null`. `AuthContextValue` gains `refreshProfile: () => Promise<void>`.

- [ ] **Step 1: Extend the `User` type and `toAppUser`**

In `apps/web/src/components/auth/AuthProvider.tsx`, replace the `User` interface (lines 9-16):

```ts
export interface User {
  id: string;
  name: string;
  email: string;
  tier: MemberTier;
  points: number;
  joinedAt: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other" | null;
  avatarUrl: string | null;
}
```

Replace `toAppUser` (lines 32-42):

```ts
function toAppUser(supabaseUser: SupabaseUser, profile?: Record<string, unknown> | null): User {
  const createdAt = new Date(supabaseUser.created_at);
  return {
    id: supabaseUser.id,
    name: (profile?.full_name as string) ?? supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split("@")[0] ?? "User",
    email: supabaseUser.email ?? "",
    tier: "Regular",
    points: (profile?.loyalty_points as number) ?? 100,
    joinedAt: `${MONTHS[createdAt.getMonth()]} ${createdAt.getFullYear()}`,
    phone: (profile?.phone as string) ?? null,
    dateOfBirth: (profile?.date_of_birth as string) ?? null,
    gender: (profile?.gender as User["gender"]) ?? null,
    avatarUrl: (profile?.avatar_url as string) ?? null,
  };
}
```

- [ ] **Step 2: Widen the profile `select()` and lift `fetchAndSetUser` out of the effect**

Replace the whole `useEffect` block (lines 48-83) so `fetchAndSetUser` is a component-level function `refreshProfile` can also call:

```ts
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchAndSetUser(supabaseUser: SupabaseUser) {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, loyalty_points, phone, date_of_birth, gender, avatar_url")
      .eq("id", supabaseUser.id)
      .single();
    setUser(toAppUser(supabaseUser, profile));
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetUser(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Set flag cookie so middleware can detect auth server-side
        document.cookie = `ginabo-auth-status=1; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
        fetchAndSetUser(session.user).catch(() => {
          setUser(toAppUser(session.user));
        });
      } else {
        document.cookie = "ginabo-auth-status=; path=/; max-age=0";
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
```

(This moves `const [user, ...]` / `const [isLoading, ...]` declarations up above the new `fetchAndSetUser` function — they were previously the first two lines inside `AuthProvider`; keep them in that position, just add `fetchAndSetUser` as a sibling function after them instead of nested inside the effect.)

- [ ] **Step 3: Add `refreshProfile` and wire it into the context value**

Add this function after `changePassword` (after line 147):

```ts
  async function refreshProfile() {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) await fetchAndSetUser(supabaseUser);
  }
```

Update the `AuthContextValue` interface (lines 18-26) to add the new method:

```ts
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  signInWithGoogle: () => void;
  changePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}
```

Update the provider's return value (line 150) to include it:

```ts
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, signInWithGoogle, changePassword, refreshProfile }}>
```

- [ ] **Step 4: Verify with a typecheck**

```bash
cd apps/web && npm run typecheck
```

Expected: only the two pre-existing unrelated errors (`src/app/admin/returns/[id]/page.tsx` and `src/app/returns/[returnNumber]/page.tsx` — `react` has no exported member `use`). No new errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/auth/AuthProvider.tsx
git commit -m "feat: extend AuthProvider with profile fields and refreshProfile"
```

---

### Task 3: Wire "Pengaturan Akun" — native date picker + persist Simpan

**Files:**
- Modify: `apps/web/src/app/member/page.tsx`

**Interfaces:**
- Consumes: `useAuth()` now also exposing `refreshProfile` (Task 2), `PATCH /api/profile` (Task 1)
- Produces: nothing new consumed by later tasks (this task is UI-only wiring)

- [ ] **Step 1: Replace the form state shape**

Replace line 111:

```ts
  const [form, setForm] = useState({ name: "", phone: "", email: "", dob_d: "", dob_m: "", dob_y: "", gender: "" });
```

with:

```ts
  const [form, setForm] = useState({ name: "", phone: "", email: "", dob: "", gender: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
```

- [ ] **Step 2: Seed the form from real user data**

Replace the `useEffect` at lines 148-151:

```ts
  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        dob: user.dateOfBirth ?? "",
        gender: user.gender === "male" ? "Laki-laki" : user.gender === "female" ? "Perempuan" : "",
      }));
    }
  }, [user, isLoading, router]);
```

- [ ] **Step 3: Add the Simpan handler**

Add this function right after the existing `handleChangePassword` function, before the `useEffect` you just replaced in Step 2:

```ts
  async function handleSaveProfile() {
    setProfileError("");
    setProfileSuccess(false);
    setProfileSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        full_name: form.name,
        phone: form.phone || null,
        date_of_birth: form.dob || null,
        gender: form.gender === "Laki-laki" ? "male" : form.gender === "Perempuan" ? "female" : null,
      }),
    });
    const json = await res.json() as { ok: boolean; error?: { message: string } };
    setProfileSaving(false);
    if (!json.ok) {
      setProfileError(json.error?.message ?? "Gagal menyimpan profil.");
      return;
    }
    await refreshProfile();
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  }
```

Update the destructuring on line 108 to include `refreshProfile`:

```ts
  const { user, isLoading, logout, changePassword, refreshProfile } = useAuth();
```

- [ ] **Step 4: Replace the Tanggal Lahir field**

Replace the "Tanggal Lahir" block (lines 320-338):

```tsx
                  <div>
                    <label className={labelCls}>Tanggal Lahir</label>
                    <input
                      type="date"
                      className={inputCls}
                      style={{ ...inputStyle, colorScheme: "dark" }}
                      value={form.dob}
                      onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                      max={new Date().toISOString().slice(0, 10)}
                    />
                  </div>
```

(`colorScheme: "dark"` makes the native calendar icon/popup render in dark mode instead of a jarring white square on this dark page — supported by all evergreen browsers.)

- [ ] **Step 5: Wire the Simpan button and show feedback**

Replace the closing block (lines 389-393):

```tsx
                {profileError && (
                  <div className="mt-4 rounded-lg px-4 py-3 text-sm font-medium text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="mt-4 rounded-lg px-4 py-3 text-sm font-medium text-green-300" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    Profil berhasil disimpan.
                  </div>
                )}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="rounded-xl px-12 py-3 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}
                  >
                    {profileSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
```

- [ ] **Step 6: Verify manually in the browser**

Run `npm run dev` from `apps/web`, log in at `/auth/login`, go to `/member`. Confirm:
- Clicking the Tanggal Lahir field opens the native calendar directly (no more three dropdowns).
- Changing Nama/Nomor Handphone/Tanggal Lahir/Jenis Kelamin and clicking "Simpan" shows "Profil berhasil disimpan." and the values persist after a full page reload (refetch from `profiles` table).
- At a 375px-wide viewport (browser DevTools device toolbar), the two-column grid collapses to one column and nothing overflows horizontally.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/member/page.tsx
git commit -m "feat: wire native date picker and persist profile Simpan"
```

---

### Task 4: Nominatim geocoding proxy

**Files:**
- Create: `apps/web/src/lib/geocode.ts`
- Create: `apps/web/src/app/api/geocode/search/route.ts`
- Create: `apps/web/src/app/api/geocode/reverse/route.ts`

**Interfaces:**
- Produces: `GeocodeResult` type, `searchAddress(query: string): Promise<GeocodeResult[]>`, `reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null>` (all exported from `@/lib/geocode`). Both swallow upstream errors and return `[]` / `null` rather than throwing. Routes: `GET /api/geocode/search?q=` → `jsonOk(GeocodeResult[])`; `GET /api/geocode/reverse?lat=&lon=` → `jsonOk(GeocodeResult | null)`.

- [ ] **Step 1: Write `src/lib/geocode.ts`**

```ts
/**
 * OpenStreetMap Nominatim geocoding — free, no API key.
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 *
 * Usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * requires an identifying User-Agent and caps usage at ~1 request/second,
 * which is why this is called server-side rather than directly from the
 * browser (browsers also block overriding the User-Agent header anyway).
 */

const BASE_URL = "https://nominatim.openstreetmap.org";

function userAgent(): string {
  return `Ginabo/1.0 (${process.env.ADMIN_EMAIL ?? "admin@ginabo.id"})`;
}

export interface GeocodeResult {
  label: string;
  address_line1: string;
  city: string;
  province: string;
  postal_code: string;
  lat: number;
  lon: number;
}

interface NominatimAddress {
  road?: string;
  house_number?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

interface NominatimPlace {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

function normalize(place: NominatimPlace): GeocodeResult {
  const addr = place.address ?? {};
  const road = [addr.road, addr.house_number].filter(Boolean).join(" ");
  return {
    label: place.display_name,
    address_line1: road || place.display_name.split(",")[0]?.trim() || "",
    city: addr.city ?? addr.town ?? addr.village ?? addr.county ?? "",
    province: addr.state ?? "",
    postal_code: addr.postcode ?? "",
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
  };
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      countrycodes: "id",
      limit: "8",
      q: query,
    });
    const res = await fetch(`${BASE_URL}/search?${params.toString()}`, {
      headers: { "User-Agent": userAgent() },
    });
    if (!res.ok) return [];
    const places = (await res.json()) as NominatimPlace[];
    return places.map(normalize);
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      lat: String(lat),
      lon: String(lon),
    });
    const res = await fetch(`${BASE_URL}/reverse?${params.toString()}`, {
      headers: { "User-Agent": userAgent() },
    });
    if (!res.ok) return null;
    const place = (await res.json()) as NominatimPlace;
    if (!place || !place.lat) return null;
    return normalize(place);
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Write the search route**

Create `apps/web/src/app/api/geocode/search/route.ts` (no `export const runtime = 'edge'` — plain Node.js function, since some edge runtimes restrict overriding the `User-Agent` header on outgoing `fetch`):

```ts
// GET /api/geocode/search?q=jl.+sudirman — proxies Nominatim search server-side

import { type NextRequest } from 'next/server'
import { jsonOk } from '@/lib/http'
import { searchAddress } from '@/lib/geocode'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 3) return jsonOk([])
  const results = await searchAddress(q)
  return jsonOk(results)
}
```

- [ ] **Step 3: Write the reverse route**

Create `apps/web/src/app/api/geocode/reverse/route.ts`:

```ts
// GET /api/geocode/reverse?lat=-6.7&lon=108.5 — proxies Nominatim reverse geocoding

import { type NextRequest } from 'next/server'
import { jsonOk, jsonError } from '@/lib/http'
import { reverseGeocode } from '@/lib/geocode'

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get('lat'))
  const lon = Number(req.nextUrl.searchParams.get('lon'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return jsonError('lat/lon tidak valid', 400)
  }
  const result = await reverseGeocode(lat, lon)
  return jsonOk(result)
}
```

- [ ] **Step 4: Verify manually**

```bash
curl -s "http://localhost:3000/api/geocode/search?q=Jalan+Gunung+Kelud+Cirebon" | head -c 500
curl -s "http://localhost:3000/api/geocode/reverse?lat=-6.732&lon=108.552" | head -c 500
```

Expected: both return `{"ok":true,"data":[...]}` / `{"ok":true,"data":{...}}` with non-empty results for these real Cirebon-area coordinates (adjust port if 3000 was busy). If Nominatim is unreachable from this network, expect `{"ok":true,"data":[]}` / `{"ok":true,"data":null}` — not a 500 — confirming the soft-fail behavior.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/geocode.ts apps/web/src/app/api/geocode
git commit -m "feat: add Nominatim geocoding proxy routes"
```

---

### Task 5: `AddressModal` component

**Files:**
- Create: `apps/web/src/components/member/AddressModal.tsx`

**Interfaces:**
- Consumes: `GeocodeResult` type and the two `/api/geocode/*` routes from Task 4; `POST /api/addresses` (existing, unchanged); `AddressRow` type from `@/types/database`.
- Produces: `AddressModal` component with props `{ open: boolean; onClose: () => void; onSaved: (address: AddressRow) => void }`, default export.

- [ ] **Step 1: Write the component**

Create `apps/web/src/components/member/AddressModal.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { AddressRow } from "@/types/database";
import type { GeocodeResult } from "@/lib/geocode";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (address: AddressRow) => void;
}

const inputCls = "w-full rounded-lg border px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-[#8b5cf6]/40";
const inputStyle = { background: "rgba(255,255,255,0.06)", borderColor: "rgba(139,92,246,0.2)" };
const labelCls = "mb-1.5 block text-xs font-semibold text-white/70";

const EMPTY_DETAILS = {
  label: "",
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  province: "",
  postal_code: "",
};

export function AddressModal({ open, onClose, onSaved }: AddressModalProps) {
  const [step, setStep] = useState<"search" | "details">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("search");
      setQuery("");
      setResults([]);
      setLocateError("");
      setDetails(EMPTY_DETAILS);
      setSaveError("");
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`);
        const json = (await res.json()) as { ok: boolean; data?: GeocodeResult[] };
        setResults(json.ok && json.data ? json.data : []);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function selectGeo(geo: GeocodeResult) {
    setDetails(d => ({
      ...d,
      address_line1: geo.address_line1,
      city: geo.city,
      province: geo.province,
      postal_code: geo.postal_code,
    }));
    setStep("details");
  }

  function useCurrentLocation() {
    setLocateError("");
    if (!navigator.geolocation) {
      setLocateError("Perangkat ini tidak mendukung deteksi lokasi.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
          const json = (await res.json()) as { ok: boolean; data?: GeocodeResult | null };
          if (json.ok && json.data) {
            selectGeo(json.data);
          } else {
            setLocateError("Lokasi tidak dapat diidentifikasi. Coba cari manual.");
          }
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocateError("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan, atau cari manual.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    if (!details.recipient_name || !details.phone || !details.address_line1 || !details.city || !details.province || !details.postal_code) {
      setSaveError("Lengkapi semua field yang wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...details, is_default: false }),
      });
      const json = (await res.json()) as { ok: boolean; data?: AddressRow; error?: { message: string } };
      if (!json.ok || !json.data) {
        setSaveError(json.error?.message ?? "Gagal menyimpan alamat.");
        return;
      }
      onSaved(json.data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:px-4" onClick={onClose}>
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-2xl p-6 sm:max-w-md sm:rounded-2xl"
        style={{ background: "linear-gradient(135deg, #1e1b3a, #2d2556)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 8px 32px rgba(20,15,50,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-4 text-base font-bold text-white">Tambah Alamat</h3>

        {step === "search" && (
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              className={inputCls}
              style={inputStyle}
              placeholder="Cari nama jalan / kelurahan / kota"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />

            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#c084fc] transition hover:bg-white/5 disabled:opacity-50"
              style={{ border: "1px solid rgba(139,92,246,0.25)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
              {locating ? "Mengambil lokasi..." : "Gunakan Lokasi Saat Ini"}
            </button>

            {locateError && <p className="text-xs text-red-400/80">{locateError}</p>}

            <div className="flex flex-col gap-1">
              {searching && <p className="text-xs text-white/40">Mencari...</p>}
              {!searching && query.trim().length >= 3 && results.length === 0 && (
                <p className="text-xs text-white/40">Tidak ditemukan, coba kata kunci lain.</p>
              )}
              {results.map((r, i) => (
                <button
                  key={`${r.lat}-${r.lon}-${i}`}
                  type="button"
                  onClick={() => selectGeo(r)}
                  className="rounded-lg px-3 py-2.5 text-left text-xs text-white/70 transition hover:bg-white/5"
                  style={{ border: "1px solid rgba(139,92,246,0.12)" }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <p className="mt-1 text-center text-[10px] text-white/30">© OpenStreetMap contributors</p>
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <button type="button" onClick={() => setStep("search")} className="self-start text-xs text-[#c084fc] hover:text-[#e879f9]">
              ‹ Cari ulang
            </button>

            {saveError && (
              <div className="rounded-lg px-4 py-3 text-sm font-medium text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm sm:col-span-2">
                <span className={labelCls}>Label (opsional)</span>
                <input className={inputCls} style={inputStyle} value={details.label} onChange={e => setDetails(d => ({ ...d, label: e.target.value }))} placeholder="Rumah / Kantor" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className={labelCls}>Nama Penerima</span>
                <input className={inputCls} style={inputStyle} value={details.recipient_name} onChange={e => setDetails(d => ({ ...d, recipient_name: e.target.value }))} placeholder="Nama penerima" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className={labelCls}>No. Telepon</span>
                <input className={inputCls} style={inputStyle} value={details.phone} onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))} placeholder="+62xxx" />
              </label>
              <label className="grid gap-1.5 text-sm sm:col-span-2">
                <span className={labelCls}>Alamat Lengkap</span>
                <input className={inputCls} style={inputStyle} value={details.address_line1} onChange={e => setDetails(d => ({ ...d, address_line1: e.target.value }))} placeholder="Nama jalan, nomor rumah" />
              </label>
              <label className="grid gap-1.5 text-sm sm:col-span-2">
                <span className={labelCls}>Detail Tambahan (opsional)</span>
                <input className={inputCls} style={inputStyle} value={details.address_line2} onChange={e => setDetails(d => ({ ...d, address_line2: e.target.value }))} placeholder="Patokan, unit, lantai" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className={labelCls}>Kota / Kabupaten</span>
                <input className={inputCls} style={inputStyle} value={details.city} onChange={e => setDetails(d => ({ ...d, city: e.target.value }))} />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className={labelCls}>Provinsi</span>
                <input className={inputCls} style={inputStyle} value={details.province} onChange={e => setDetails(d => ({ ...d, province: e.target.value }))} />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className={labelCls}>Kode Pos</span>
                <input className={inputCls} style={inputStyle} value={details.postal_code} onChange={e => setDetails(d => ({ ...d, postal_code: e.target.value }))} />
              </label>
            </div>

            <div className="mt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white/70 transition hover:text-white" style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}
              >
                {saving ? "Menyimpan..." : "Simpan Alamat"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

Note the mobile-first sheet: `items-end` + `rounded-t-2xl` on the outer wrapper make it a bottom sheet on mobile, switching to a centered `sm:items-center` + `sm:rounded-2xl` card from the `sm:` breakpoint up — same tradeoff `SiteHeader.tsx`'s mobile drawer already uses.

- [ ] **Step 2: Typecheck**

```bash
cd apps/web && npm run typecheck
```

Expected: only the same two pre-existing unrelated errors as before.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/member/AddressModal.tsx
git commit -m "feat: add Tokopedia-style AddressModal component"
```

---

### Task 6: Wire "Tambah Alamat" and the "Alamat Pengiriman" tab

**Files:**
- Modify: `apps/web/src/app/member/page.tsx`

**Interfaces:**
- Consumes: `AddressModal` from Task 5, `GET /api/addresses` (existing), `AddressRow` from `@/types/database`.

- [ ] **Step 1: Add imports and address list state**

Add to the imports at the top of `apps/web/src/app/member/page.tsx`:

```ts
import { AddressModal } from "@/components/member/AddressModal";
import type { AddressRow } from "@/types/database";
```

Add state alongside the other `pw*` state declarations (after line 119, before `closePwModal`):

```ts
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  async function loadAddresses() {
    setAddressesLoading(true);
    try {
      const res = await fetch("/api/addresses");
      const json = (await res.json()) as { ok: boolean; data?: AddressRow[] };
      setAddresses(json.ok && json.data ? json.data : []);
    } finally {
      setAddressesLoading(false);
    }
  }

  function handleAddressSaved(address: AddressRow) {
    setAddresses(prev => [address, ...prev]);
  }
```

- [ ] **Step 2: Load addresses once the user is known**

Extend the existing `useEffect` from Task 3 Step 2 (the one seeding `form`) to also call `loadAddresses()`:

```ts
  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth/login");
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        dob: user.dateOfBirth ?? "",
        gender: user.gender === "male" ? "Laki-laki" : user.gender === "female" ? "Perempuan" : "",
      }));
      void loadAddresses();
    }
  }, [user, isLoading, router]);
```

(`void loadAddresses()` runs it once per `user` identity change — fine since `user` only changes on login/logout/profile refresh, not on every render.)

- [ ] **Step 3: Wire the settings-tab "Alamat" summary + button**

Replace the "Alamat" block (lines 378-386):

```tsx
                  <div className="md:col-span-2">
                    <label className={labelCls}>Alamat</label>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
                      <p className="text-xs text-white/40">
                        {addressesLoading
                          ? "Memuat..."
                          : addresses.length === 0
                            ? "belum ada alamat profile"
                            : `${addresses.length} alamat tersimpan`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddressModalOpen(true)}
                        className="ml-3 shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:text-white"
                        style={{ border: "1px solid rgba(139,92,246,0.3)" }}
                      >
                        Tambah Alamat ›
                      </button>
                    </div>
                  </div>
```

- [ ] **Step 4: Wire the "Alamat Pengiriman" tab**

Replace the whole `activeTab === "address"` block (lines 414-425):

```tsx
            {activeTab === "address" && (
              <div>
                <h2 className="mb-1 text-base font-bold text-white">Alamat Pengiriman</h2>
                <div className="mb-6 h-px" style={{ background: "rgba(139,92,246,0.15)" }} />

                {addressesLoading ? (
                  <p className="text-sm text-white/40">Memuat...</p>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl p-10 text-center" style={{ background: "rgba(139,92,246,0.06)", border: "1px dashed rgba(139,92,246,0.25)" }}>
                    <p className="text-sm text-white/40">Belum ada alamat tersimpan</p>
                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(true)}
                      className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-white/70 transition hover:text-white"
                      style={{ border: "1px solid rgba(139,92,246,0.3)" }}
                    >
                      + Tambah Alamat
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {addresses.map(addr => (
                      <div key={addr.id} className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{addr.recipient_name}</span>
                          {addr.is_default && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: "rgba(139,92,246,0.3)" }}>
                              Utama
                            </span>
                          )}
                          {addr.label && <span className="text-[11px] text-white/40">{addr.label}</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-white/50">{addr.phone}</p>
                        <p className="mt-0.5 text-xs text-white/50">
                          {addr.address_line1}
                          {addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city}, {addr.province} {addr.postal_code}
                        </p>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(true)}
                      className="self-start text-xs font-bold text-[#c084fc] hover:text-[#e879f9]"
                    >
                      + Tambah Alamat Baru
                    </button>
                  </div>
                )}
              </div>
            )}
```

- [ ] **Step 5: Render the modal**

Add the `<AddressModal>` element right after the closing `)}` of the "Ganti Password Modal" block (after the modal's closing `)}` around what is now line ~581, still inside the outermost `<div>`):

```tsx
      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSaved={handleAddressSaved}
      />
```

- [ ] **Step 6: Verify manually**

With the dev server running and logged in, go to `/member`:
- Settings tab "Tambah Alamat" opens the modal; typing 3+ characters of a real Cirebon-area street shows Nominatim results.
- "Gunakan Lokasi Saat Ini" (browser will prompt for location permission) prefills the details step.
- Completing and saving an address closes the modal, and both the settings-tab summary line and the "Alamat Pengiriman" tab immediately show it (no reload needed).
- At 375px width, the modal is a full-width bottom sheet, not a cramped floating box.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/member/page.tsx
git commit -m "feat: wire Tambah Alamat and Alamat Pengiriman tab to AddressModal"
```

---

### Task 7: Profile photo upload (max 2MB)

**Files:**
- Modify: `apps/web/src/app/member/page.tsx`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/client`, `PATCH /api/profile` (Task 1), `refreshProfile` (Task 2), the existing `user-avatars` Storage bucket.

- [ ] **Step 1: Add imports and avatar state**

Add to imports:

```ts
import { createClient } from "@/lib/supabase/client";
```

Add state alongside the other new state (after the address state from Task 6 Step 1):

```ts
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
```

Add `useRef` to the existing `"react"` import (it currently imports `useEffect, useState` — change to `useEffect, useRef, useState`).

- [ ] **Step 2: Add the upload handler**

Add this function after `handleAddressSaved` (from Task 6 Step 1):

```ts
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Format foto harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Ukuran foto maksimal 2MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage.from("user-avatars").upload(path, file, { upsert: true });
      if (uploadErr) {
        setAvatarError("Gagal mengunggah foto.");
        return;
      }

      const { data: pub } = supabase.storage.from("user-avatars").getPublicUrl(path);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ avatar_url: pub.publicUrl }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) {
        setAvatarError(json.error?.message ?? "Gagal menyimpan foto profil.");
        return;
      }
      await refreshProfile();
    } finally {
      setAvatarUploading(false);
    }
  }
```

- [ ] **Step 3: Wire the file input and pencil button**

Replace the "Avatar upload area" block (lines 297-307) — this appears inside the "Pengaturan Akun" tab, above the form grid:

```tsx
                {/* Avatar upload area */}
                <div className="mb-2 flex justify-center">
                  <div className="relative">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-20 w-20 rounded-full object-cover"
                        style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-extrabold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
                        {initials}
                      </div>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] text-white shadow disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)" }}
                      aria-label="Ganti foto profil"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" /></svg>
                    </button>
                  </div>
                </div>
                {avatarUploading && <p className="mb-4 text-center text-xs text-white/40">Mengunggah...</p>}
                {avatarError && <p className="mb-4 text-center text-xs text-red-400/80">{avatarError}</p>}
```

- [ ] **Step 4: Also show the avatar in the profile banner**

Replace the banner avatar block (lines 188-192, inside "Profile Banner"):

```tsx
              <div className="relative">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover"
                    style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #e879f9)", boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
                    {initials}
                  </div>
                )}
              </div>
```

- [ ] **Step 5: Typecheck**

```bash
cd apps/web && npm run typecheck
```

Expected: only the same two pre-existing unrelated errors.

- [ ] **Step 6: Verify manually**

Logged in at `/member`, "Pengaturan Akun" tab:
- Clicking the pencil icon opens a file picker restricted to image files.
- Picking a file over 2MB shows "Ukuran foto maksimal 2MB." and does not upload.
- Picking a valid image under 2MB uploads it, and both the settings-tab avatar and the profile banner avatar update immediately (no reload) to show the photo instead of initials.
- Reloading the page still shows the uploaded photo (confirms it persisted to `profiles.avatar_url` and Storage).

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/member/page.tsx
git commit -m "feat: add profile photo upload with 2MB limit"
```

---

### Task 8: Full mobile-viewport pass and ship

**Files:** none (verification + deployment only)

- [ ] **Step 1: Manual mobile-viewport sweep**

With the dev server running, use browser DevTools' device toolbar at 375px width and check each surface touched by this plan:
- `/member` "Pengaturan Akun" tab: avatar block, all form fields (single column), date input, password/address rows, Simpan button.
- `AddressModal` in both steps: confirm it renders as a full-width bottom sheet with no horizontal overflow, and the search results list and detail-form grid both collapse to one column.
- `/member` "Alamat Pengiriman" tab: address cards and the "+ Tambah Alamat" affordance.

Fix any overflow or cramped spacing found before proceeding — do not defer to a follow-up.

- [ ] **Step 2: Full typecheck**

```bash
cd apps/web && npm run typecheck
```

Expected: only the two pre-existing unrelated errors, same as every prior task.

- [ ] **Step 3: Push to both deployment branches**

This repo pushes to two branches on the `adhit` remote for the two live previews (`master` → production preview, `dev` → `ginabo-three.vercel.app`) — same pattern used for every change earlier in this session:

```bash
git push adhit HEAD:master
git checkout dev
git pull adhit dev
git cherry-pick <first-commit-of-this-plan>^..<last-commit-of-this-plan>
git push adhit dev:dev
git checkout -
```

(Replace the two commit refs with the actual range of commits made across Tasks 1-7; if any cherry-pick conflicts, resolve by taking the incoming change — there is no overlapping unrelated work expected on `dev` for these files.)

- [ ] **Step 4: Final live verification**

Once both deployments finish building (poll `GET /api/geocode/search?q=...` and `/member` on the live preview URL the same way earlier Google-auth fixes were verified in this session), repeat the Step 1 checks against the live `ginabo-three.vercel.app` preview, not just localhost — this is what actually confirms the feature works for the user.
