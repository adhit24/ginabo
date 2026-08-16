# Ginabo Customer and Order Data Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menjadikan alur registrasi, profil, katalog, checkout, pembayaran, dan analitik pelanggan konsisten dengan schema Supabase serta aman untuk transaksi nyata.

**Architecture:** Supabase menjadi source of truth tunggal untuk ecommerce. Browser hanya mengirim identifier dan pilihan pelanggan; server mengambil ulang harga, stok, berat, alamat, dan menghitung total. Order dibuat idempotent, webhook payment aman terhadap retry, dan perilaku pelanggan direkam sebagai event yang terpisah dari tabel transaksi.

**Tech Stack:** Next.js App Router, TypeScript, Supabase Auth/Postgres/RLS, Midtrans Snap, Zod, Vitest.

---

## Baseline and safety

- Semua perubahan dilakukan di branch `feature/somethinc-style-header-footer-cart-search`.
- File untracked milik pekerjaan sebelumnya tidak dihapus atau di-stage otomatis.
- Tidak mengubah database production langsung; schema change dibuat sebagai migration dan diverifikasi read-only.
- Setiap task harus memiliki test/verifikasi lokal sebelum lanjut.
- Setelah setiap task, update checkbox plan dan buat catatan di `C:\Users\Win11\.codex\memories\extensions\ad_hoc\notes\`.

### Task 1: Canonical Supabase contract

**Files:**
- Create: `supabase/migrations/007_customer_order_integrity.sql`
- Create: `apps/web/src/lib/domain/customerOrder.ts`
- Modify: `apps/web/src/types/database.ts`
- Modify: `apps/web/src/lib/catalog.ts`
- Test: `apps/web/src/lib/domain/customerOrder.test.ts`

- [x] Inventaris ulang nama kolom canonical dari migration 001-006 dan tulis contract runtime untuk profile, product, address, order, order item, payment.
- [x] Tambahkan migration additive untuk `profiles.gender`, `profiles.loyalty_points`, checkout idempotency, provider transaction ID, dan constraint quantity/price/payment fee.
- [x] Tambahkan unique/idempotency support pada payments melalui provider transaction ID dan order idempotency key.
- [x] Perbaiki tipe TypeScript agar memuat field canonical `profile_id`, `phone_number`, `stock_quantity`, `base_price`, `midtrans_gross_amount`, dan `raw_notification`.
- [x] Buat helper murni `calculateOrderTotals()` dan `normalizeCheckoutItem()` yang menolak angka negatif, pecahan quantity, harga client, serta subtotal overflow.
- [x] Tulis test gagal lalu test lulus untuk total IDR dan penolakan data client yang tidak valid.
- [x] Verifikasi targeted test lulus; typecheck masih memiliki dua error baseline React 18 pada halaman return.

### Task 2: Registration, profile, and address integrity

**Files:**
- Modify: `apps/web/src/components/auth/AuthProvider.tsx`
- Modify: `apps/web/src/components/auth/AuthModal.tsx`
- Modify: `apps/web/src/app/auth/google-callback/page.tsx`
- Modify: `apps/web/src/app/api/profile/route.ts`
- Modify: `apps/web/src/lib/validation.ts`
- Test: `apps/web/src/components/auth/auth-contract.test.ts`

- [x] Teruskan nomor WhatsApp dari form signup ke Supabase Auth metadata dan `profiles.phone_number`.
- [x] Gunakan satu kontrak `buildProfileUpsert()` untuk email signup dan Google signup.
- [x] Validasi dan normalisasi nomor Indonesia tanpa menyimpan password atau token di log.
- [x] Update profile dan address memakai field canonical serta mengembalikan data DB terbaru.
- [x] Pertahankan RLS ownership dan tambahkan unique default address per profile melalui migration.
- [x] Test kontrak profile tidak kehilangan phone dan menolak nomor malformed.
- [x] Verifikasi seluruh test lokal lulus; typecheck tetap hanya memiliki dua error baseline React 18.

### Task 3: Canonical catalog and cart handoff

**Files:**
- Modify: `apps/web/src/lib/catalog.ts`
- Modify: `apps/web/src/components/cart/cartTypes.ts`
- Modify: `apps/web/src/components/cart/CartProvider.tsx`
- Modify: `apps/web/src/app/api/products/route.ts`
- Modify: `apps/web/src/app/shop/[slug]/ProductDetailClient.tsx`
- Test: `apps/web/src/lib/catalog.test.ts`

- [x] Map catalog dari `base_price`, `stock_quantity`, `product_images.alt_text`, dan `sort_order`.
- [x] Hilangkan fallback dummy untuk environment live; fallback demo hanya boleh aktif jika `GINABO_DEMO_CATALOG=true`.
- [x] Cart menyimpan `productId` canonical UUID/slug yang berasal dari katalog canonical dan quantity; harga cart diperlakukan sebagai display-only. Variant belum dipakai di UI dan akan dipasang bersama validasi server checkout.
- [x] API produk menolak response demo ketika Supabase error pada mode live dan mengembalikan error yang dapat dimonitor.
- [x] Test mapping database row dan perilaku error catalog.
- [x] Verifikasi kode `/api/products` hanya mengeluarkan data dari `listActiveProducts()` sehingga tidak mengembalikan `demo_prod_*` pada mode live.

### Task 4: Server-authoritative checkout

**Files:**
- Modify: `apps/web/src/app/checkout/page.tsx`
- Modify: `apps/web/src/app/api/checkout/route.ts`
- Modify: `apps/web/src/types/database.ts`
- Create: `apps/web/src/lib/checkout/checkoutService.ts`
- Test: `apps/web/src/lib/checkout/checkoutService.test.ts`

- [x] Default `DEMO_PAYMENT_MODE` menjadi environment flag false; mode demo hanya explicit di local.
- [x] Request checkout hanya menerima product/variant IDs, quantity, address ID, coupon code, courier/service selection, dan client idempotency key.
- [x] Server mengambil ulang product/variant aktif, harga, stok, berat, dan menghitung subtotal/ongkir/total.
- [x] Server memvalidasi address ownership serta menyimpan snapshot lengkap recipient, phone, line, city, province, postal code, dan shipping metadata.
- [x] Gunakan idempotency key untuk mengembalikan order lama jika user mengulang submit.
- [x] Jangan menghapus order diam-diam setelah payment gateway error; simpan status payment initiation failed agar dapat diaudit.
- [x] Payment row failure harus menggagalkan response checkout, bukan mengembalikan sukses palsu.
- [x] Test tampered price, tampered stock, duplicate submit, dan total calculation; ownership address diverifikasi melalui query `profile_id` pada route.

### Task 5: Payment webhook and fulfillment integrity

**Files:**
- Modify: `apps/web/src/app/api/payment/webhook/route.ts`
- Create: `supabase/migrations/008_payment_webhook_integrity.sql`
- Create: `apps/web/src/lib/payments/paymentState.ts`
- Test: `apps/web/src/lib/payments/paymentState.test.ts`

- [x] Samakan semua field webhook dengan schema: `profile_id`, `midtrans_gross_amount`, `raw_notification`, dan status payment canonical `success`.
- [x] Verifikasi signature HMAC sebelum lookup/update dan simpan payload raw tanpa credential.
- [x] Buat transition table order/payment yang idempotent untuk settlement, pending, deny, expire, cancel, refund.
- [x] Decrement stock hanya sekali per order melalui marker fulfillment dan function database yang atomic.
- [x] Simpan notification setelah status payment berhasil; HTTP acceptance tidak dianggap sebagai delivery final.
- [x] Test status transition, duplicate fulfillment, out-of-order status, dan amount mismatch secara pure.
- [x] Webhook tetap merespons 200 sesuai kebijakan retry saat payload provider invalid, tanpa membocorkan detail internal.

### Task 6: Behavioral events and customer analytics

**Files:**
- Create: `supabase/migrations/009_customer_events.sql`
- Create: `apps/web/src/lib/analytics/events.ts`
- Create: `apps/web/src/app/api/events/route.ts`
- Modify: `apps/web/src/components/cart/CartProvider.tsx`
- Modify: `apps/web/src/app/shop/[slug]/ProductDetailClient.tsx`
- Modify: `apps/web/src/app/checkout/page.tsx`
- Create: `supabase/migrations/010_customer_analytics_views.sql`
- Test: `apps/web/src/lib/analytics/events.test.ts`

- [x] Tambahkan `customer_events` dengan `profile_id` nullable, anonymous session ID, event name, product/order references, metadata JSONB, occurred_at, consent flag, dan indexes.
- [x] Event minimal: `product_viewed`, `search_submitted`, `add_to_cart`, `remove_from_cart`, `checkout_started`, `checkout_completed`, `payment_failed`.
- [x] Jangan menyimpan password, access token, full payment payload, atau data alamat mentah pada event.
- [x] Hubungkan authenticated events ke `profile_id`; anonymous events memakai session ID dan dapat diatribusikan pada pipeline analitik lanjutan.
- [x] Buat view awal untuk RFM/lifetime value/AOV dan product affinity; metrik cohort, coupon, return, dan repeat-rate ditambahkan setelah Command Center canonical selesai diaudit.
- [x] Ubah Command Center live agar default ke provider live dan membaca `stock_quantity`/`midtrans_gross_amount`; demo hanya explicit melalui `COMMAND_CENTER_DATA_SOURCE=demo`.
- [x] Test event validation, consent, dan metadata safety; deduplication dijaga dengan `event_id` primary key.

### Final verification and handoff

- [x] Run `npm test -- --run`: 6 file / 13 test lulus.
- [x] Run `npx tsc --noEmit --pretty false`: bersih.
- [x] Run PowerShell equivalent `NODE_OPTIONS=--use-system-ca npm run build`: build lulus dengan warning dependency/runtime yang sudah ada.
- [ ] Run local smoke checks untuk `/api/products`, anonymous profile/address protection, checkout invalid payload, dan webhook invalid signature.
- [ ] Run schema/security review: RLS, grants, service-role usage, indexes, constraints, and migration ordering.
- [x] Update `docs/TODO_SYSTEM_READINESS.md` dengan bukti local completion, database verification, dan provider-dependent gaps secara terpisah.
- [ ] Jangan commit/push sebelum user memberi instruksi ship; audit local terlebih dahulu.
