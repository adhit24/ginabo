# GINABO Staging Contract

Dokumentasi resmi arsitektur, isolasi lingkungan, dan aturan rilis staging environment untuk Project GINABO.

---

## 1. Repository & Baseline

* **Repository**: `adhit24/ginabo`
* **Production Baseline (`main` HEAD)**: `dbef05dee3afcdee2fd3412e8f09fec3e4745de8` (`feat(payment): audit and fix payment webhook & atomic settlement (Task 7)`)
* **Staging Integration Baseline (`staging` HEAD)**: `dbef05dee3afcdee2fd3412e8f09fec3e4745de8`
* **Backup Previous Staging Branch**: `backup/staging-premature-tasks-8-15` (`04c82a18ba6bda6469a9f8dac298ec684e3f92b2`)

---

## 2. Deployment Boundaries

* **Production URL**: `https://ginabo.id` / `https://www.ginabo.id`
* **Staging / Preview URL**: `https://ginabo-three.vercel.app` (atau Vercel Preview URL `https://preview.ginabo.id`)
* **Boundary Rule**:
  * Staging tidak boleh diarahkan ke domain produksi `ginabo.id`.
  * Dynamic URL harus selalu merujuk ke variable `NEXT_PUBLIC_APP_URL` (`https://ginabo-three.vercel.app` atau `http://localhost:3000`).

---

## 3. Supabase Project Boundaries

| Parameter | Staging / Shadow | Production |
| :--- | :--- | :--- |
| **Project Ref** | `qnvrfoidfipjmrmdrvsz` | `lvmyjtzfohlorocrjvcx` |
| **Supabase URL** | `https://qnvrfoidfipjmrmdrvsz.supabase.co` | `https://lvmyjtzfohlorocrjvcx.supabase.co` |
| **Access Keys** | Staging Anon & Service Role keys | Production Anon & Service Role keys |
| **Service Role Boundary** | Server-side only (Route Handlers, admin utilities) | Server-side only |
| **Client Bundle Safety** | Browser client hanya memuat `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client hanya memuat anon key |

> **PERINGATAN KEAMANAN**:
> Script `scripts/apply-ginabo-staging-migrations.ps1` memiliki default project ref `lvmyjtzfohlorocrjvcx` (PRODUCTION). Target migration staging **HARUS** diubah ke `qnvrfoidfipjmrmdrvsz`.

---

## 4. DOKU Payment Gateway Boundary

| Parameter | Staging | Production |
| :--- | :--- | :--- |
| **Environment** | **Sandbox** (`DOKU_IS_PRODUCTION=false`) | Production (`DOKU_IS_PRODUCTION=true`) |
| **Base API URL** | `https://api-sandbox.doku.com` | `https://api.doku.com` |
| **Client ID** | Sandbox Client ID (prefix `BRN-...`) | Production Merchant ID |
| **Secret Key** | Sandbox Secret Key (prefix `SK-...`) | Production Secret Key |
| **Webhook / Callback** | `${NEXT_PUBLIC_APP_URL}/api/payment/webhook` | `https://ginabo.id/api/payment/webhook` |
| **Finish URL** | `${NEXT_PUBLIC_APP_URL}/checkout/finish?order=...` | `https://ginabo.id/checkout/finish?order=...` |

---

## 5. Resend & Email Isolation Policy

* **Staging Email Policy**:
  * Untuk mencegah email terkirim ke customer aktual dari staging, `RESEND_API_KEY` di staging dapat dikosongkan (kode secara aman melewati pengiriman email tanpa throwing error).
  * Jika pengujian email diperlukan, gunakan Resend test onboarding recipient atau internal test email sandbox.
  * `RESELLER_NOTIFY_EMAIL` diarahkan ke internal developer/QA mailbox.

---

## 6. Shipping (RajaOngkir / Komerce) Policy

* **API Endpoint**: `https://rajaongkir.komerce.id/api/v1`
* **Behavior**: Seluruh pemanggilan dari aplikasi bersifat **read-only** (kueri destinasi kota, kalkulasi tarif domestik, pelacakan nomor resi).
* **Integrity**: Tidak ada mutasi atau penulisan data eksternal ke ekspedisi. Kegagalan API RajaOngkir tidak mempengaruhi state order atau database produksi.

---

## 7. Required Environment Variables Checklist

### Public (Client-Side Safe)
- [x] `NEXT_PUBLIC_SUPABASE_URL`: Supabase staging URL (`https://qnvrfoidfipjmrmdrvsz.supabase.co`)
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase staging anon key
- [x] `NEXT_PUBLIC_APP_URL`: Staging URL (`https://ginabo-three.vercel.app` / `http://localhost:3000`)
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER`: Staging WhatsApp contact number
- [ ] `NEXT_PUBLIC_GTM_ID`: Kosongkan di staging (agar tidak mengotori analytics produksi)
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Kosongkan / gunakan test site key
- [ ] `NEXT_PUBLIC_R2_PUBLIC_URL`: `https://media.ginabo.id`

### Server-Only (Confidential)
- [x] `SUPABASE_SERVICE_ROLE_KEY`: Staging service role key (RAHASIA, server-side only)
- [x] `AUTH_SECRET`: Secret hash untuk admin/user session cookies
- [x] `DOKU_CLIENT_ID`: DOKU Sandbox Client ID (`BRN-...`)
- [x] `DOKU_SECRET_KEY`: DOKU Sandbox Secret Key
- [x] `DOKU_IS_PRODUCTION`: `false`
- [ ] `RAJAONGKIR_API_KEY`: RajaOngkir / Komerce API key
- [ ] `RAJAONGKIR_ORIGIN_CITY_ID`: `15992` (Kecapi, Cirebon)
- [ ] `RESEND_API_KEY`: Dikosongkan atau sandbox-only
- [ ] `RESEND_FROM_EMAIL`: `noreply@ginabo.id`
- [ ] `RESELLER_NOTIFY_EMAIL`: QA / Staging email

---

## 8. Database Migration State

* **Staging Current Baseline**: Migration `001_initial_schema.sql` sampai `015_atomic_payment_settlement.sql`.
* **Gate Migration `016–022`**: **BELUM DIJALANKAN (NOT YET APPLIED)** pada staging baseline ini. Migration tersebut menjadi bagian dari Merge Gate berurutan Task 8–15.

---

## 9. Release Rules

1. Seluruh perubahan Task 8–15 **WAJIB** masuk melalui branch `staging` secara berurutan:
   `Task 8` → `Task 9` → `Task 10` → `Task 11` → `Task 12` → `Task 13` → `Task 14` → `Task 15`.
2. Setiap task wajib melewati individual branch validation, typecheck, lint, test, dan smoke test sebelum task berikutnya di-merge.
3. Branch `main` (Production) berada dalam status **HOLD** penuh sampai seluruh regression testing di staging selesai dan disetujui.
