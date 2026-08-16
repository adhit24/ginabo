# Ginabo — Work Journey: Product Weight & RajaOngkir

Dokumen handoff pekerjaan untuk fitur berat produk, bundling, dan persiapan integrasi ongkos kirim RajaOngkir/Komerce.

## Strategi environment dan deployment

Website dan repository berikut adalah **development/staging playground** untuk membangun dan menyempurnakan Ginabo:

- Website development: https://ginabo-three.vercel.app/
- Repository development: https://github.com/adhit24/ginabo

Website dan repository berikut adalah **official production**:

- Website official: https://www.ginabo.id/
- Repository official: https://github.com/ginaboofficial/ginabo
- Project Vercel official: https://vercel.com/ginabo-s-projects/ginabo

Website official sengaja berada dalam kondisi **Under maintenance** agar pengunjung tidak kecewa selama performa, fitur, database, pembayaran, pengiriman, dan operasional masih dibangun.

Aturan kerja:

1. Semua eksperimen, perubahan kode, migration, dan pengujian dilakukan lebih dulu di `adhit24/ginabo` dan `ginabo-three.vercel.app`.
2. Jangan push, deploy, atau mengubah `ginaboofficial/ginabo` maupun project Vercel official secara langsung selama fase pembangunan.
3. Setelah fitur dianggap stabil dan lolos validasi, perubahan dipromosikan secara terencana ke repository official dan deployment official.
4. Sebelum promosi, lakukan review perbedaan environment variable, database, webhook, domain, payment provider, dan shipping provider.

## Status terakhir

- Repository: `adhit24/ginabo`
- Branch remote: `master`
- Origin gudang: Kecapi, Harjamukti, Kota Cirebon
- RajaOngkir destination ID: `15992`
- API yang digunakan: RajaOngkir API V2 / Komerce Shipping Cost
- API key: disimpan hanya di environment variable, tidak di-commit

## Data berat produk

Produk dasar yang sudah diisi ke Supabase:

| Produk | Berat |
|---|---:|
| Bright & Care Cream | 10 gram |
| Hydra Moist Gel | 30 gram |
| GlowAge / Multi Active Serum | 20 gram |

Bundling dihitung dari komponen:

| Bundling | Komponen | Total |
|---|---|---:|
| Daily Skin Barrier Set | Bright & Care + Hydra Moist | 40 gram |
| Bright Renewal Set | Bright & Care + Multi Active Serum | 30 gram |
| Repair & Glow Set | Multi Active Serum + Hydra Moist | 50 gram |
| Ginabo Complete Skin Nutrition Set | Bright & Care + Multi Active Serum + Hydra Moist | 60 gram |

## Database

Migration yang dibuat:

- `supabase/migrations/005_product_weights.sql`
  - Mengisi `products.weight_grams` untuk produk dasar.
- `supabase/migrations/006_bundle_weights_and_catalog.sql`
  - Menambahkan `bundles.weight_grams`.
  - Membuat 4 record bundling.
  - Mengisi relasi `bundle_items`.
  - Menghitung total berat bundling dari berat komponen.

Migration bundling sudah dieksekusi langsung ke Supabase dan diverifikasi:

- Daily Skin Barrier Set: 40g
- Bright Renewal Set: 30g
- Repair & Glow Set: 50g
- Ginabo Complete Skin Nutrition Set: 60g

## Frontend

Perubahan utama:

- Berat ditampilkan di halaman detail produk.
- Data katalog fallback membawa `weightGrams`.
- Prisma seed dan D1 seed diperbarui.
- Komponen `ShippingCalculator` memakai total berat dalam gram.

File penting:

- `apps/web/src/lib/catalog.ts`
- `apps/web/src/app/shop/[slug]/ProductDetailClient.tsx`
- `apps/web/src/components/shipping/ShippingCalculator.tsx`
- `apps/web/src/app/api/shipping/cities/route.ts`
- `apps/web/src/lib/rajaongkir.ts`

## RajaOngkir API V2

Adapter lama yang memakai `api.rajaongkir.com/starter` sudah dimigrasikan ke:

```text
https://rajaongkir.komerce.id/api/v1
```

Endpoint yang digunakan:

- Search destination:
  `/destination/domestic-destination`
- Calculate shipping:
  `/calculate/domestic-cost`

Environment variable:

```env
RAJAONGKIR_API_KEY=...
RAJAONGKIR_ORIGIN_CITY_ID=15992
```

API sudah dites langsung dengan origin `15992` dan menghasilkan tarif JNE.

## Commit penting

- `709dc1c` — menambahkan berat produk ke katalog.
- `281a9e0` — sinkronisasi source aplikasi dengan remote master.
- `34db660` — menambahkan bundling dan berat berdasarkan komponen.
- `4a78e88` — menghapus integrasi Sanity Blog yang tidak digunakan.
- `8f6e34e` — migrasi RajaOngkir ke API V2.

## Pekerjaan lanjutan

1. Pasang `ShippingCalculator` ke halaman checkout utama.
2. Hitung total berat keranjang berdasarkan `berat produk × quantity`.
3. Kirim `shipping_cost` terpilih ke endpoint checkout, bukan lagi `0`.
4. Simpan courier, service, cost, dan berat paket ke order.
5. Update tracking AWB ke endpoint RajaOngkir V2.
6. Tambahkan webhook/reconciliation Midtrans.
7. Tambahkan cron untuk retry notifikasi dan sinkronisasi status pengiriman.

## Validasi

- Query Supabase produk dan bundling berhasil.
- RajaOngkir API V2 search destination berhasil.
- RajaOngkir API V2 calculate domestic cost berhasil.
- `git diff --check` bersih.
- Typecheck masih memiliki 2 error lama pada `React.use` di halaman returns.

## Keamanan

API key RajaOngkir dan service-role Supabase pernah dibagikan di chat. Setelah konfigurasi selesai, lakukan rotate/revoke key tersebut dan perbarui environment variable di Vercel.
