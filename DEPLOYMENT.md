# Deployment Guide — ginabo.id

> **Bahasa / Language:** Dokumen ini bilingual — Indonesia (ID) di atas, English (EN) di bawah setiap bagian.

---

## 1. Pre-deployment Checklist / Daftar Periksa Sebelum Deploy

**ID:** Pastikan semua item berikut sudah selesai sebelum push ke production.
**EN:** Confirm every item before pushing to production.

- [ ] Semua environment variables sudah diset di Vercel project settings (lihat Bagian 3)
- [ ] Supabase migration sudah dijalankan di project production (`lvmyjtzfohlorocrjvcx`)
- [ ] Midtrans production key sudah diaktifkan dan notification URL sudah dikonfigurasi
- [ ] Cloudflare DNS sudah mengarah ke Vercel (lihat Bagian 4)
- [ ] R2 bucket `ginabo-media` sudah dibuat dan custom domain `media.ginabo.id` aktif
- [ ] Google OAuth redirect URI production sudah ditambahkan
- [ ] `AUTH_SECRET` sudah di-generate (`openssl rand -base64 32`)
- [ ] `MIDTRANS_IS_PRODUCTION=true` sudah diset
- [ ] Build lokal berhasil: `npm run build` tanpa error

---

## 2. Supabase Setup

### 2a. Jalankan Migrations / Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ke project production
supabase link --project-ref lvmyjtzfohlorocrjvcx

# Push semua migrations
supabase db push
```

### 2b. Konfigurasi Auth Providers / Configure Auth Providers

1. Buka: https://supabase.com/dashboard/project/lvmyjtzfohlorocrjvcx/auth/providers
2. **Email** — pastikan "Enable Email provider" aktif
3. **Google OAuth** — masukkan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`

### 2c. Set Redirect URLs

Buka **Authentication > URL Configuration** dan tambahkan:

```
https://ginabo.id/auth/callback
https://ginabo.id/auth/google-callback
https://www.ginabo.id/auth/callback
```

Untuk development lokal:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/google-callback
```

### 2d. Storage Buckets

```sql
-- Jalankan di Supabase SQL Editor
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;
```

---

## 3. Vercel Environment Variables

Set semua variabel berikut di:
**Vercel Dashboard > Project "web" > Settings > Environment Variables**

Pilih environment: **Production**, **Preview**, **Development** sesuai kebutuhan.

| Variable | Environment | Value / Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://lvmyjtzfohlorocrjvcx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Dari Supabase > Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Dari Supabase > Settings > API > service_role (rahasia!) |
| `NEXT_PUBLIC_APP_URL` | Production | `https://ginabo.id` |
| `NEXT_PUBLIC_APP_URL` | Preview | `https://preview.ginabo.id` (atau URL preview Vercel) |
| `AUTH_SECRET` | All | `openssl rand -base64 32` |
| `MIDTRANS_SERVER_KEY` | Production | Key production dari dashboard Midtrans |
| `MIDTRANS_SERVER_KEY` | Preview, Development | Key sandbox dari dashboard Midtrans |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Production | Client key production |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Preview, Development | Client key sandbox |
| `MIDTRANS_IS_PRODUCTION` | Production | `true` |
| `MIDTRANS_IS_PRODUCTION` | Preview, Development | `false` |
| `GOOGLE_CLIENT_ID` | All | Dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | All | Dari Google Cloud Console |
| `R2_ACCOUNT_ID` | All | `123c47f0858d8f172331dcb94d15dcee` |
| `R2_ACCESS_KEY_ID` | All | Dari Cloudflare R2 API token |
| `R2_SECRET_ACCESS_KEY` | All | Dari Cloudflare R2 API token |
| `R2_BUCKET_NAME` | All | `ginabo-media` |
| `R2_PUBLIC_URL` | All | `https://media.ginabo.id` |
| `EMAIL_PROVIDER` | Production | `resend` (jika menggunakan Resend) |
| `RESEND_API_KEY` | Production | API key dari resend.com |
| `WHATSAPP_PROVIDER` | Production | Nama provider (e.g. `fonnte`) |
| `WHATSAPP_API_KEY` | Production | API key provider WhatsApp |
| `DATABASE_URL` | Production | Supabase direct connection string (Pooler: port 6543) |

> **Catatan keamanan:** Jangan pernah commit file `.env` ke git. Gunakan Vercel Environment Variables atau `.env.local` yang ada di `.gitignore`.

### Cara cepat via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login dan link ke project
vercel link

# Set satu variabel
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Pull env untuk dev lokal
vercel env pull .env.local
```

---

## 4. Cloudflare DNS Configuration

Masuk ke **Cloudflare Dashboard > ginabo.id > DNS > Records**

Account ID: `123c47f0858d8f172331dcb94d15dcee`

### 4a. Records yang perlu dibuat:

| Type | Name | Content / Value | Proxy | TTL |
|---|---|---|---|---|
| `A` | `@` (ginabo.id) | `76.76.21.21` | Proxied (orange) | Auto |
| `CNAME` | `www` | `cname.vercel-dns.com` | Proxied (orange) | Auto |
| `CNAME` | `media` | `<r2-bucket-domain>.r2.cloudflarestorage.com` | Proxied (orange) | Auto |

> **IP Vercel Singapore (sin1):** `76.76.21.21`
> Vercel juga menerima `76.76.21.22` sebagai failover — tambahkan A record kedua jika ingin HA.

### 4b. Vercel Custom Domain

```bash
# Tambahkan domain di Vercel
vercel domains add ginabo.id
vercel domains add www.ginabo.id
```

Atau via Vercel Dashboard > Project > Settings > Domains.

### 4c. R2 Custom Domain (`media.ginabo.id`)

1. Buka Cloudflare Dashboard > R2 > bucket `ginabo-media`
2. Tab **Settings > Custom Domains**
3. Klik **Connect Domain** > masukkan `media.ginabo.id`
4. Cloudflare akan otomatis menambahkan CNAME record

### 4d. Email (Resend — opsional)

Jika menggunakan [Resend](https://resend.com) untuk email transaksional:

| Type | Name | Content | TTL |
|---|---|---|---|
| `MX` | `@` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) | Auto |
| `TXT` | `@` | SPF record dari Resend dashboard | Auto |
| `TXT` | `resend._domainkey` | DKIM record dari Resend dashboard | Auto |

### 4e. SSL / TLS

- Set **SSL/TLS mode** ke **Full (strict)** di Cloudflare
- Vercel auto-provisions Let's Encrypt certificate

---

## 5. Midtrans Production Setup

### 5a. Aktifkan Production Mode

1. Login ke https://dashboard.midtrans.com
2. Switch ke mode **Production** (bukan Sandbox)
3. Salin **Server Key** dan **Client Key** ke Vercel env vars

### 5b. Notification URL (Webhook)

Buka **Settings > Payment > Configuration** dan set:

```
Payment Notification URL: https://ginabo.id/api/payment/webhook
Finish Redirect URL:      https://ginabo.id/checkout/finish
Unfinish Redirect URL:    https://ginabo.id/checkout/unfinish
Error Redirect URL:       https://ginabo.id/checkout/error
```

### 5c. IP Whitelist

Di **Settings > IP Whitelist**, tambahkan IP Vercel Singapore.
Vercel menggunakan IP dinamis — gunakan validasi signature SHA-512 sebagai pengganti IP whitelist (sudah diimplementasi di `src/lib/midtrans.ts`).

Sebagai alternatif, aktifkan opsi **"Skip IP Validation"** di Midtrans jika tersedia, dan andalkan signature verification.

### 5d. Verifikasi Sandbox Sebelum Production

```bash
# Test checkout dengan card sandbox Midtrans:
# Card: 4811 1111 1111 1114
# CVV: 123
# Exp: 01/25 (tanggal masa depan)
# OTP: 112233
```

---

## 6. Post-deployment Testing Checklist

### Fungsional:
- [ ] Halaman utama `/` dapat diakses dan produk tampil
- [ ] `/shop` menampilkan catalog produk
- [ ] `/shop/[slug]` membuka detail produk
- [ ] Tombol "Tambah ke Keranjang" berfungsi
- [ ] `/cart` menampilkan isi keranjang (redirect ke login jika belum auth)
- [ ] `/checkout` proses checkout berhasil (test dengan Midtrans sandbox)
- [ ] Email konfirmasi order terkirim (jika `EMAIL_PROVIDER` dikonfigurasi)
- [ ] Login Google OAuth berfungsi
- [ ] `/member` hanya dapat diakses setelah login
- [ ] `/admin` redirect ke `/admin/login` jika belum auth
- [ ] Admin login dan dashboard berfungsi
- [ ] Cron job `/api/jobs/dispatch-notifications` berjalan setiap jam

### Performa:
- [ ] Lighthouse score > 90 untuk halaman utama
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Verifikasi static assets menggunakan `Cache-Control: immutable`

### Keamanan:
- [ ] `https://ginabo.id` otomatis redirect dari `http://`
- [ ] `www.ginabo.id` redirect ke `ginabo.id` (atau sebaliknya)
- [ ] Response headers mengandung `X-Frame-Options: SAMEORIGIN`
- [ ] `/api/admin/*` mengembalikan 401/redirect untuk request tanpa session
- [ ] Webhook `/api/payment/webhook` menerima POST tanpa auth

### Monitoring:
- [ ] Vercel Analytics aktif (dashboard > Analytics tab)
- [ ] Vercel Speed Insights aktif
- [ ] Supabase Database log tidak menunjukkan error
- [ ] Cloudflare Analytics menunjukkan traffic masuk

---

## 7. Rollback Procedure

```bash
# Rollback ke deployment sebelumnya via Vercel CLI
vercel rollback [deployment-url]

# Atau via dashboard:
# Vercel Dashboard > Deployments > pilih deployment lama > "..." > Promote to Production
```

---

## 8. Useful Commands

```bash
# Check deployment status
vercel ls

# View production logs
vercel logs --prod

# Redeploy tanpa cache
vercel --force

# Check environment variables
vercel env ls

# Inspect a specific deployment
vercel inspect [deployment-url]
```

---

*Last updated: 2026-06-12 | Project: ginabo.id | Region: Vercel sin1 + Cloudflare AP*
