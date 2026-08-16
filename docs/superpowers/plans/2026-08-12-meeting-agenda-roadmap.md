# Ginabo — Roadmap Agenda Meeting 6 Agustus 2026

> Ini roadmap ringan (urutan & prioritas), bukan implementation plan task-by-task.
> Untuk tiap item, plan detail baru ditulis saat item itu mulai dikerjakan
> (brainstorm spec dulu → `docs/superpowers/specs/`, lalu plan → `docs/superpowers/plans/`).

**Status:** Draft — menunggu 3 keputusan dari pemilik produk (lihat bagian 3).

---

## 0. Temuan penting: state git repo sebelum lanjut

Repo saat ini punya **4 branch dengan kerjaan yang belum di-`merge`**, dan beberapa
di antaranya overlap langsung dengan item agenda di bawah:

| Branch | Status merge | Isi |
|---|---|---|
| `feature/somethinc-style-header-footer-cart-search` (branch aktif saat ini) | belum merge | Rebuild header/footer/cart/search, halaman detail produk baru, AuthModal login/register. **Perbaikan 3 card hari ini ada di branch ini.** |
| `feature/member-account-settings` | belum merge | AddressModal + geocoding, `PATCH /api/profile`. Catatan: spec-nya menulis "Implementation not started" tapi commit di branch ini sudah mengimplementasikannya — dokumen status itu perlu diperbarui. |
| `publish/product-weights` | belum merge ke `main`/`dev`, tapi **`master` sudah menunjuk ke branch ini** | Shipping selector JNE/RajaOngkir, UI checkout gaya Midtrans, persistensi berat produk. |
| `feature/operations-command-center` | **sudah merge** ke `main` & `dev` | Sistem admin Returns/Command Center. Aman, tidak perlu tindakan. |

`master` dan `main`/`dev` sekarang menunjuk ke commit yang berbeda — ini sebaiknya
diklarifikasi (branch mana yang jadi acuan produksi) sebelum branch lain di-merge,
supaya tidak terjadi merge yang saling menimpa pekerjaan satu sama lain.

**Ini murni temuan, bukan tindakan yang saya ambil sepihak** — keputusan mau
konsolidasi branch dulu atau lanjut kerja di branch aktif ada di kamu (lihat §3).

---

## 1. Pemetaan 7 item agenda → status kode saat ini

### 1. Visual/UI — kurangi dominasi ungu, hindari kesan "AI-generated"
**Status:** Sebagian jalan.
3 card di bawah hero sudah dibenahi hari ini (ganti gambar + samakan warna) di
branch `feature/somethinc-style-header-footer-cart-search`. Section lain
(hero banner, marquee, katalog produk, footer info-strip) belum diaudit.
**Next:** audit visual section-per-section, lanjutan dari kerjaan hari ini.

### 2. Halaman detail produk lengkap
**Status:** Hampir selesai.
`shop/[slug]/ProductDetailClient.tsx` (branch aktif, 579 baris) sudah punya:
nama, harga, deskripsi singkat, berat, stok, qty selector, add-to-cart, tab
*Detail / Cara Pakai / Kandungan / Tanya Jawab*, dan section produk terkait.
**Belum ada:** selector varian/ukuran, tampilan harga promo (coret + badge
diskon), estimasi ongkir langsung di halaman produk.
**Next:** merge branch ini, lalu isi 3 gap di atas — scope-nya kecil, bukan
bangun dari nol.

### 3. Registrasi member dengan OTP
**Status:** Belum ada verifikasi.
Form signup (`AuthModal.tsx`, `/auth/signup`) sudah mengumpulkan nomor
telepon, tapi tidak ada langkah verifikasi OTP sama sekali. Tercatat juga di
`docs/TODO_SYSTEM_READINESS.md` sebagai item P1 yang belum dicentang.
**Next:** perlu pilih provider OTP (WhatsApp Business API / SMS gateway)
dulu — ini keputusan biaya & vendor, bukan teknis — baru brainstorm spec.

### 4. RajaOngkir/Komerce — kemampuan pickup
**Status:** ON HOLD (sudah dikonfirmasi sebelumnya — butuh paket Delivery API
berbayar; lihat memory `project_pickup_order_on_hold`).
Kabar baiknya: **MVP kalkulasi ongkir + fulfillment manual/drop-off sudah
dibangun** di branch `publish/product-weights` (JNE/RajaOngkir rate
calculation, penyimpanan berat produk).
**Next:** bukan bangun baru — tinggal merge/aktifkan branch yang sudah ada.

### 5. Midtrans
**Status:** Secara teknis hampir selesai.
Webhook (signature check, validasi amount, transisi status monotonic,
retry-safe fulfillment) **sudah selesai** (`TODO_SYSTEM_READINESS.md:9`, ✅).
UI checkout gaya Midtrans juga sudah ada di `publish/product-weights`.
**Belum:** kredensial sandbox/production asli belum diverifikasi/live, alur
refund belum ada, pengembalian stok saat order expired belum, guard
overselling saat checkout bersamaan belum.
**Next:** aktivasi kredensial (tugas ops/akun, bukan koding) + isi 3 gap kode
di atas.

### 6. Promo engine (voucher, flash sale, gratis ongkir, diskon >3 produk)
**Status:** Belum ada sama sekali.
Tidak ada model `Voucher`/`Discount`/`Campaign` di `prisma/schema.prisma`,
tidak ada logic terkait. Ini item dengan scope terbesar dari semua agenda.
**Next:** butuh sesi brainstorm spec tersendiri — aturan periode aktif, kuota,
minimum pembelian, segmentasi, kombinasi/larangan voucher (semua sudah
disebut di notulen meeting, tinggal dirinci).

### 7. Strategi reseller
**Status:** Baru halaman marketing (`/reseller`, copy "margin 40%") + form
apply yang cuma kirim email ke admin (`api/reseller/apply`). Belum ada role
reseller, tier harga, MOQ, atau dashboard di database.
**Next:** butuh keputusan bisnis dulu (skema harga/margin, MOQ, syarat tier)
sebelum desain teknis — desain sistemnya bergantung pada angka-angka itu.

---

## 2. Urutan yang saya sarankan

```
0. Putuskan strategi branch (§0) — sebelum menambah kerjaan baru
1. Selesaikan + merge halaman detail produk (item 2) — paling dekat kelar, dampak conversion langsung
2. Lanjut audit visual site-wide (item 1, sisa section lain)
3. Merge/aktifkan MVP ongkir RajaOngkir (item 4) — tinggal aktivasi
4. Aktivasi Midtrans production + isi 3 gap kode (item 5) — sebagian ops, sebagian kecil koding
5. OTP registrasi (item 3) — jalan begitu provider dipilih
6. Strategi reseller (item 7) — jalan begitu skema harga/MOQ diputuskan
7. Promo engine (item 6) — paling besar; baru digarap setelah produk, ongkir, dan
   payment stabil, karena voucher perlu nempel ke alur checkout yang sudah beres
```

Urutan ini melengkapi (bukan menggantikan) urutan eksekusi yang sudah ada di
`docs/TODO_SYSTEM_READINESS.md` (fokus kesiapan produksi: Midtrans → validasi
server → Command Center live → keamanan/OTP/rate-limit → notifikasi/monitoring).
Roadmap di atas menambahkan lapisan prioritas sisi UX/customer-facing dari hasil
meeting, yang sebagian besar bisa jalan paralel dengan checklist itu.

## 3. Yang saya butuh dari kamu untuk lanjut

1. **Branch:** konsolidasi (merge) branch yang sudah ada dulu, atau lanjut
   nambah kerjaan di branch aktif dan urus merge belakangan?
2. **Provider OTP:** WhatsApp Business API, SMS gateway (mis. Zenziva), atau
   lainnya — ada preferensi/kontrak yang sudah jalan?
3. **Skema reseller:** harga/margin kasar, MOQ, syarat tier — boleh angka
   perkiraan dulu untuk desain, difinalisasi belakangan.
