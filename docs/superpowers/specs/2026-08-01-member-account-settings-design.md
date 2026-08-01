# Member Account Settings — Working Profile, Address & Photo Design

## Status

Design approved. Implementation not started.

## Objective

`/member` → "Pengaturan Akun" tab is currently a static mockup: the date-of-birth
picker is three plain `<select>`s, "Ganti Password" was already fixed in a prior
change, but "Tambah Alamat", "Simpan", and the avatar upload button have no
handlers at all — nothing on the tab persists. This design wires the tab to
real data and adds a Tokopedia-style address-adding flow.

## Scope

One page (`/member`, "Pengaturan Akun" + "Alamat Pengiriman" tabs). Four
related pieces of work, all serving the same goal (a working account
settings page), not independent subsystems:

1. Native calendar date picker for Tanggal Lahir
2. Persist profile fields on "Simpan" (name, phone, DOB, gender)
3. "Tambah Alamat" — Tokopedia-style search / current-location flow
4. Profile photo upload, max 2MB

## Responsiveness

Mobile-first, fit-to-screen, fully responsive — this is the primary usage
context, not an afterthought. Concretely:

- `AddressModal` (section 3) follows the existing `pwModalOpen` password
  modal's pattern of a centered card on desktop, but must not overflow the
  viewport on small screens: full-height/full-width sheet on mobile
  (`w-full`, scrollable body, safe-area padding), converting to a centered
  max-width card at `md:` and up — matching how the mobile drawer in
  `SiteHeader.tsx` already handles the same tradeoff.
- The native `<input type="date">` and all new form fields use the same
  `w-full` + responsive grid (`grid-cols-1 md:grid-cols-2`) already used
  elsewhere on this page — single column on mobile, two columns from `md:`.
- The avatar upload control (pencil icon) keeps its current tap target
  size (no shrinking below ~40px) since it's a small hit-target already on
  a small circle.
- Verification includes checking the address modal and profile form at a
  narrow mobile viewport (e.g. 375px), not just desktop.

## Existing infrastructure this builds on

- `profiles` table already has `avatar_url`, `phone`, `date_of_birth`,
  `gender` columns (`src/types/database.ts`) — currently unused by the UI.
- `addresses` table + full CRUD already exist at `/api/addresses` and
  `/api/addresses/[id]`, used today by `AddressPicker` in checkout.
- User-uploaded files use direct-from-client Supabase Storage uploads
  (see `returns/new/page.tsx`: `supabase.storage.from(bucket).upload(...)`),
  not Cloudflare R2 (R2 is for admin-managed product media).
- No geocoding provider is configured. Decision: OpenStreetMap Nominatim
  (free, no API key/billing setup), proxied server-side.

## 1. Tanggal Lahir → native calendar

Replace the `dob_d` / `dob_m` / `dob_y` selects with one
`<input type="date">` bound to a single `date_of_birth` string
(`YYYY-MM-DD`, matching the column's format), styled with the same dark
input classes used elsewhere on the page. Clicking anywhere in the field
opens the browser's native calendar popup — no new dependency.

## 2. Persist "Simpan"

New route `PATCH /api/profile`, following the same pattern as
`/api/addresses`: `createServerSupabaseClient`, zod schema in
`lib/validation.ts` (`profileUpdateSchema`), `jsonOk`/`jsonError`. Updates
`full_name`, `phone`, `date_of_birth`, `gender` on the caller's own
`profiles` row (scoped by `auth.getUser()`, not a client-supplied id).

`AuthProvider`'s `User` type gains `phone`, `dateOfBirth`, `gender`,
`avatarUrl` (all nullable), sourced from the `profiles` row alongside the
existing `full_name`/`loyalty_points` fetch. The member page's local form
state is seeded from this on load instead of starting blank. "Simpan"
calls the new route and shows inline success/error feedback, same visual
pattern as the password-change modal.

`profiles.gender` is the enum `'male' | 'female' | 'other' | null`, but the
UI's existing gender buttons are labeled "Laki-laki" / "Perempuan". The
form maps `Laki-laki ↔ male` and `Perempuan ↔ female` at the read/write
boundary; no `'other'` option is exposed in this UI.

## 3. Tambah Alamat — Tokopedia-style flow (member page only)

New `AddressModal` component, opened from both the "Tambah Alamat" button
on the settings tab and the "Alamat Pengiriman" tab (which also gets wired
to actually list saved addresses via `GET /api/addresses` — currently a
dead placeholder). Scoped to `/member` only; checkout's existing
`AddressPicker` is untouched.

Two steps (simplified from Tokopedia's three — no draggable pinpoint map,
since that needs a map-tile library and wasn't part of the ask):

**Step 1 — Cari lokasi.** Debounced (350ms) search input plus a "Gunakan
Lokasi Saat Ini" row pinned above the results. Search calls a new
`GET /api/geocode/search?q=` proxy; current-location uses the browser
Geolocation API then `GET /api/geocode/reverse?lat=&lon=`. Both proxies
wrap Nominatim server-side (`nominatim.openstreetmap.org`), restricted to
`countrycodes=id`, with a required identifying `User-Agent` header per
Nominatim's usage policy — this can't be done client-side since browsers
block overriding that header. On any Nominatim failure/timeout, the proxy
returns an empty result list rather than throwing (same soft-fail
convention as `src/lib/sanity.ts`); the UI shows "Tidak ditemukan, coba
kata kunci lain."

Selecting a result (or a resolved current-location) prefills
`address_line1`, `city`, `province`, `postal_code` and advances to:

**Step 2 — Lengkapi & simpan.** The prefilled fields (editable) plus what
geocoding can't know: Label, Nama Penerima, No. Telepon. "Simpan Alamat"
calls the existing `POST /api/addresses` unchanged. A small
"© OpenStreetMap contributors" line is shown per Nominatim's attribution
requirement.

If browser geolocation permission is denied, show an inline message and
let the user fall back to typing — do not block the rest of the flow.

## 4. Foto Profil, max 2MB

No new bucket needed. `supabase/migrations/002_storage_buckets.sql`
already created a `user-avatars` bucket — public, `file_size_limit`
2097152 (2MB), `allowed_mime_types` jpeg/png/webp — with RLS policies
letting an authenticated user insert/update/delete only under their own
`<user_id>/` path, and public read for everyone. Confirmed live on the
production project via the Storage API (`GET /storage/v1/bucket`): this
bucket already exists with exactly this config. Section 4 is purely
application code — no migration work.

Clicking the pencil icon on the avatar opens a file picker restricted to
`image/png`, `image/jpeg`, `image/webp`. Client validates `file.size <=
2 * 1024 * 1024` before doing anything else — oversized files never reach
the network (the bucket's own limit is a backstop, not the primary UX).
On pass, upload directly to `user-avatars/<user_id>/avatar.<ext>` via
`supabase.storage.from('user-avatars').upload(..., { upsert: true })`
(same direct-upload pattern as return evidence), then `PATCH /api/profile`
with the resulting public URL to persist `avatar_url`.

Once `avatar_url` is set, the member page shows the image instead of
initials — both the profile banner circle and the settings-tab avatar
block. Other initials-only spots in the app (e.g. the site header account
button) are left as-is; out of scope.

## Testing

No existing automated-test coverage for this page. Given the geolocation
and external-network dependence, verification is manual (dev server +
browser) — consistent with how prior work in this session was verified.
No new automated tests are proposed for this change.
