# Ginabo Face Analysis Product Knowledge

Tujuan dokumen ini adalah menjadi basis rekomendasi untuk fitur **Coba Analisa Wajah / Skin Check** agar hasilnya tidak asal mengarahkan pelanggan ke produk. Isi dokumen disusun dari data lokal project Ginabo per 24 Juli 2026.

## Sumber Yang Diaudit

- `ginabo/apps/web/src/app/skincheck/page.tsx`
- `ginabo/apps/web/src/components/SkinTypeSection.tsx`
- `ginabo/apps/web/src/lib/adminStore.ts`
- `ginabo/apps/web/src/lib/catalog.ts`
- `ginabo/apps/web/src/app/page.tsx`
- `ginabo/apps/web/src/app/shop/page.tsx`
- `ginabo/apps/web/src/app/shop/[slug]/ProductDetailClient.tsx`
- `ginabo/apps/web/d1-seed.sql`
- `ginabo/21days.md`

## Catatan Penting Sebelum Implementasi

Fitur ini harus diposisikan sebagai **panduan rekomendasi skincare**, bukan diagnosis medis. Hindari klaim seperti "menyembuhkan jerawat", "menghilangkan flek permanen", "pasti cocok", atau "hasil instan".

Gunakan bahasa:

- membantu
- mendukung
- merawat tampilan
- menjaga kelembapan
- membantu kulit terasa lebih nyaman

Hindari bahasa:

- menyembuhkan
- menghilangkan permanen
- memutihkan
- dijamin cocok
- hasil instan

Jika user melaporkan kondisi berat seperti jerawat meradang parah, luka terbuka, infeksi, alergi aktif, perih hebat, kulit mengelupas ekstrem, atau sedang dalam perawatan dokter, sistem harus mengarahkan ke konsultasi manusia/dokter terlebih dahulu.

## Produk Inti Ginabo

### 1. GlowAge Multi-Active Serum

**Kategori:** Serum wajah  
**Ukuran yang muncul di project:** 20ml dan 30ml  
**Harga yang muncul di project:** Rp 89.999, Rp 90.000, Rp 165.000, Rp 285.000, Rp 228.000 saat flash sale  
**Aset utama:** `/serumfix.png`, `/product-serum-bg.png`, `/product-serum-1.png`

**Narasi manfaat dari project:**

- Serum pencerah, pelembap, dan anti-aging harian.
- Membantu kulit tampak lebih cerah alami.
- Membantu meratakan warna kulit.
- Membantu merawat tampilan tanda penuaan.
- Tekstur ringan dan cepat meresap.
- Nyaman dipakai harian dan sebelum makeup.

**Kandungan/klaim aktif yang disebut:**

- Peptide
- Vitamin C

**Concern yang cocok diprioritaskan:**

- Kulit kusam
- Warna kulit tidak merata
- Hiperpigmentasi/flek ringan
- Tanda penuaan awal
- Garis halus/kerutan
- Kulit normal atau kombinasi yang ingin brightening

**Skin type yang cocok sebagai prioritas:**

- Normal
- Kombinasi
- Berminyak, jika user ingin tekstur ringan
- Kering, jika dipasangkan dengan moisturizer/hydrator

**Perlu hati-hati:**

- Kulit sangat sensitif atau sedang iritasi aktif.
- User baru mulai skincare dan takut reaksi. Sarankan patch test.
- Jika ada klaim Vitamin C, jangan overpromise untuk flek berat/melasma.

**Role di routine:**

- Treatment/serum setelah wajah bersih.
- Pagi atau malam, tetapi pagi wajib dilanjutkan sunscreen.

### 2. Hydra Moist Gel Ultimate

**Kategori:** Gel moisturizer/hydrator multifungsi  
**Ukuran yang muncul di project:** 30ml  
**Harga yang muncul di project:** Rp 118.999, Rp 120.000, Rp 150.000 flash sale, Rp 215.000  
**Aset utama:** `/salmonfix.png`, `/product-dna-bg.png`, `/product-dna-1.png`

**Narasi manfaat dari project:**

- Gel 3-in-1: moisturizer harian, makeup preparation, sleeping mask.
- Membantu melembapkan dan menenangkan kulit.
- Membantu mendukung recovery saat kulit terasa kering atau capek.
- Membantu memperkuat skin barrier.
- Tekstur gel ringan, hidrasi tanpa rasa berat.

**Kandungan/klaim aktif yang disebut:**

- DNA Salmon atau DHA Salmon muncul tidak konsisten di copy. Perlu validasi brand owner.

**Concern yang cocok diprioritaskan:**

- Kulit kering/dehidrasi
- Kulit sensitif/mudah rewel
- Barrier terasa lemah
- Kulit terasa capek, ketarik, atau kurang nyaman
- Kemerahan ringan akibat kulit kering, dengan catatan bukan iritasi berat

**Skin type yang cocok sebagai prioritas:**

- Kering
- Sensitif
- Kombinasi yang butuh hidrasi ringan
- Berminyak yang tetap dehidrasi, karena teksturnya gel

**Perlu hati-hati:**

- Jangan menyebut produk ini menyembuhkan iritasi/eksim.
- Untuk luka, alergi, perih hebat, atau reaksi aktif, arahkan konsultasi dulu.
- Validasi istilah resmi: DNA Salmon atau DHA Salmon.

**Role di routine:**

- Moisturizer/hydrator.
- Bisa dipakai pagi dan malam.
- Bisa menjadi makeup prep atau sleeping mask sesuai copy yang ada.

### 3. Bright & Care Moisture Cream

**Kategori:** Moisture cream  
**Ukuran yang muncul di project:** 10g  
**Harga yang muncul di project:** Rp 75.000, Rp 79.999, Rp 146.000 flash sale, Rp 175.000, Rp 195.000  
**Aset utama:** `/moistfix.png`, `/product-cream-bg.png`, `/product-cream-1.png`

**Narasi manfaat dari project:**

- Cream harian untuk kelembapan dan skin barrier.
- Membantu melembapkan kulit sepanjang hari.
- Membantu menjaga skin barrier.
- Membantu merawat tampilan kulit kusam.
- Cocok dipakai pagi dan malam.
- Disebut cocok untuk semua jenis kulit, termasuk kombinasi.
- Disebut tidak menyumbat pori di halaman 21 Days.

**Concern yang cocok diprioritaskan:**

- Kulit kering ringan sampai sedang
- Skin barrier perlu dijaga
- Kulit kusam yang juga butuh pelembap
- Normal/kombinasi yang butuh moisturizer harian sederhana
- User pemula yang butuh produk paling basic

**Skin type yang cocok sebagai prioritas:**

- Normal
- Kombinasi
- Kering
- Sensitif ringan, jika tidak ada iritasi aktif
- Berminyak, dengan catatan gunakan tipis dan evaluasi kenyamanan

**Perlu hati-hati:**

- Untuk kulit sangat berminyak/komedo aktif, jangan jadikan satu-satunya rekomendasi tanpa mempertimbangkan tekstur dan riwayat komedo.
- Tetap sarankan patch test pada kulit sensitif.

**Role di routine:**

- Moisturizer harian pagi dan malam.
- Produk dasar untuk menjaga kenyamanan dan kelembapan.

## Bundle / Paket

### Ginabo Complete Skin Nutrition Set

**Isi:** Hydra Moist Gel Ultimate + Bright & Care Moisture Cream + GlowAge Multi-Active Serum  
**Harga yang muncul:** Rp 287.999, Rp 620.000, original Rp 575.999  
**Cocok untuk:**

- User yang ingin routine lengkap.
- User dengan kombinasi concern: kusam + kering + barrier.
- User yang sudah terbiasa skincare dan mau AM/PM routine.

**Jangan langsung rekomendasikan jika:**

- User sangat sensitif, baru iritasi, atau takut mencoba banyak produk sekaligus.
- User pemula total. Lebih aman mulai dari 1 sampai 2 produk dulu.

### Repair & Glow Set

**Isi:** Hydra Moist Gel Ultimate + GlowAge Multi-Active Serum  
**Harga yang muncul:** Rp 207.999, Rp 360.000, original Rp 415.999  
**Cocok untuk:**

- Kulit kusam + dehidrasi.
- Kulit kombinasi/berminyak yang ingin serum ringan plus hidrasi gel.
- Concern warna tidak merata dengan kebutuhan hidrasi.

**Perlu hati-hati:**

- Jika kulit sangat sensitif, dahulukan Hydra Moist Gel Ultimate, baru pertimbangkan serum setelah kulit nyaman.

### Daily Skin Barrier Set

**Isi:** Bright & Care Moisture Cream + Hydra Moist Gel Ultimate  
**Harga yang muncul:** Rp 197.999, original Rp 395.999  
**Cocok untuk:**

- Kulit kering/dehidrasi.
- Skin barrier lemah.
- Kulit sensitif ringan.
- User yang prioritasnya kenyamanan, hidrasi, dan rutinitas sederhana.

**Prioritas rekomendasi tinggi untuk:**

- User dengan concern kering + sensitif.
- User yang sering di AC, kulit ketarik, atau mudah rewel.

### Bright Renewal Set

**Isi:** Bright & Care Moisture Cream + GlowAge Multi-Active Serum  
**Harga yang muncul:** Rp 169.999, Rp 435.000, original Rp 339.999  
**Cocok untuk:**

- Kulit kusam.
- Warna kulit tidak merata.
- Flek ringan/hiperpigmentasi ringan.
- Normal/kombinasi yang ingin brightening plus moisturizer.

**Perlu hati-hati:**

- Jika sensitif/iritasi aktif, jangan langsung dorong brightening set. Mulai dari barrier/hydration dulu.

## Mapping Concern Ke Produk

| Concern user | Prioritas 1 | Prioritas 2 | Catatan |
| --- | --- | --- | --- |
| Kering/dehidrasi | Hydra Moist Gel Ultimate | Bright & Care Moisture Cream | Jika parah atau perih, arahkan konsultasi dulu. |
| Kulit kusam | GlowAge Multi-Active Serum | Bright & Care Moisture Cream | Jangan janji hasil instan. |
| Penuaan dini/kerutan | GlowAge Multi-Active Serum | Bright & Care Moisture Cream | Fokus "merawat tampilan", bukan menghilangkan. |
| Hiperpigmentasi/flek ringan | GlowAge Multi-Active Serum | Bright & Care Moisture Cream | Untuk melasma/flek berat, sarankan konsultasi. |
| Warna kulit tidak merata | GlowAge Multi-Active Serum | Bright & Care Moisture Cream | Wajib edukasi sunscreen pagi. |
| Pori besar | GlowAge Multi-Active Serum | Hydra Moist Gel Ultimate | Jangan klaim mengecilkan pori permanen. |
| Jerawat/komedo ringan | Hydra Moist Gel Ultimate | Bright & Care Moisture Cream | Ginabo belum punya acne treatment khusus di data produk. |
| Sensitif/mudah iritasi | Hydra Moist Gel Ultimate | Daily Skin Barrier Set | Jika aktif meradang/perih, konsultasi dulu. |
| Barrier lemah | Daily Skin Barrier Set | Hydra Moist Gel Ultimate | Hindari terlalu banyak active di awal. |
| Pemula skincare | Bright & Care Moisture Cream | Hydra Moist Gel Ultimate | Mulai sederhana dulu. |

## Mapping Skin Type Ke Produk

| Skin type | Rekomendasi aman | Rekomendasi tambahan | Catatan |
| --- | --- | --- | --- |
| Normal | Bright & Care Moisture Cream | GlowAge Multi-Active Serum | Pilih serum jika concern kusam/penuaan dominan. |
| Kering | Hydra Moist Gel Ultimate | Daily Skin Barrier Set | Tambahkan serum hanya jika kulit nyaman. |
| Berminyak | Hydra Moist Gel Ultimate | GlowAge Multi-Active Serum | Hindari mendorong cream tebal jika user mudah komedo. |
| Kombinasi | GlowAge Multi-Active Serum | Bright & Care Moisture Cream | Bisa tambah Hydra untuk area kering. |
| Sensitif | Hydra Moist Gel Ultimate | Bright & Care Moisture Cream | Patch test, mulai satu produk dulu. |

## Red Flag Untuk Tidak Langsung Rekomendasi Produk

Jika user memilih atau menulis salah satu kondisi berikut, sistem tidak boleh langsung hard-sell produk:

- Jerawat meradang berat atau bernanah
- Kulit luka, berdarah, atau infeksi
- Alergi aktif
- Kulit terasa panas/perih terus menerus
- Mengelupas ekstrem
- Sedang memakai obat dokter seperti retinoid, steroid, antibiotik topical, atau treatment klinik agresif
- Hamil/menyusui dan ragu menggunakan skincare baru
- Riwayat alergi terhadap bahan tertentu

Output yang disarankan:

> Dari jawaban kamu, kulit sedang butuh perhatian ekstra. Sebaiknya konsultasi dulu dengan Beauty Expert Ginabo atau dokter kulit sebelum mencoba produk baru. Jika tetap ingin mulai, lakukan patch test dan mulai dari produk paling basic.

## Model Skoring Yang Disarankan

Jangan hanya mengembalikan produk dengan skor tertinggi. Sistem harus menghasilkan:

1. **Primary recommendation:** produk utama yang paling relevan.
2. **Support recommendation:** produk pendamping jika aman.
3. **Reason:** alasan rekomendasi berbasis jawaban user.
4. **Caution:** catatan aman, patch test, atau konsultasi.
5. **Routine suggestion:** cara pakai pagi/malam secara sederhana.
6. **Confidence:** high, medium, atau low.

### Bobot Awal

Produk diberi skor dari kombinasi concern, skin type, usia, sensitivitas, dan red flag.

| Input | GlowAge Serum | Hydra Moist Gel | Bright & Care Cream |
| --- | ---: | ---: | ---: |
| Kusam | +3 | 0 | +1 |
| Penuaan/kerutan | +4 | 0 | +1 |
| Hiperpigmentasi/flek | +3 | 0 | +2 |
| Warna tidak merata | +3 | 0 | +1 |
| Kering/dehidrasi | 0 | +4 | +2 |
| Sensitif | -1 | +4 | +1 |
| Jerawat/komedo | 0 | +2 | 0 |
| Pori besar | +1 | +1 | 0 |
| Skin type kering | 0 | +3 | +2 |
| Skin type berminyak | +1 | +2 | -1 |
| Skin type kombinasi | +2 | +1 | +1 |
| Skin type normal | +1 | +1 | +2 |
| Usia 35+ | +2 | 0 | 0 |

### Aturan Override

- Jika ada red flag, confidence harus **low** dan arahkan konsultasi.
- Jika skin type sensitif dan concern juga sensitif/iritasi, rekomendasi utama harus Hydra Moist Gel Ultimate atau Daily Skin Barrier Set.
- Jika user pemula dan tidak ada concern berat, rekomendasi utama harus Bright & Care Moisture Cream atau Hydra Moist Gel Ultimate, bukan langsung bundle lengkap.
- Jika user memilih lebih dari 3 concern, tampilkan alasan singkat dan fokuskan pada 1 sampai 2 concern dominan.
- Jika stok produk kosong, jangan tampilkan sebagai rekomendasi utama. Tawarkan alternatif atau konsultasi WhatsApp.

## Contoh Output Yang Aman

### Kasus 1: Kusam + kombinasi + usia 25-34

**Rekomendasi utama:** GlowAge Multi-Active Serum  
**Pendamping:** Bright & Care Moisture Cream  
**Alasan:** Fokus jawaban mengarah ke kulit kusam dan warna tidak merata. Serum membantu kulit tampak lebih cerah dan merata, sedangkan cream membantu menjaga kelembapan harian.  
**Catatan:** Mulai bertahap dan gunakan sunscreen di pagi hari.

### Kasus 2: Kering + sensitif

**Rekomendasi utama:** Hydra Moist Gel Ultimate  
**Pendamping:** Daily Skin Barrier Set, jika kulit nyaman setelah patch test  
**Alasan:** Fokus utama adalah hidrasi, kenyamanan, dan barrier.  
**Catatan:** Jangan langsung mencoba banyak produk. Patch test 24 jam.

### Kasus 3: Jerawat/komedo + berminyak

**Rekomendasi utama:** Hydra Moist Gel Ultimate  
**Pendamping:** Konsultasi WhatsApp untuk evaluasi lebih detail  
**Alasan:** Dari data produk saat ini, Ginabo belum punya acne treatment khusus. Produk yang paling aman diarahkan adalah hidrasi ringan agar kulit tetap nyaman.  
**Catatan:** Jika jerawat meradang berat, sebaiknya konsultasi dokter kulit.

## Gap Data Yang Harus Dilengkapi Brand Owner

Data berikut belum cukup kuat di repo dan harus divalidasi sebelum fitur dibuat lebih otomatis:

- Daftar ingredient resmi per produk.
- Nomor BPOM per produk.
- Status Halal per produk.
- Klaim resmi per produk yang boleh dipakai secara legal.
- Apakah istilah resmi produk adalah DNA Salmon atau DHA Salmon.
- Urutan pemakaian resmi untuk kombinasi serum, gel, dan cream.
- Produk mana yang aman untuk ibu hamil/menyusui.
- Produk mana yang sebaiknya dihindari untuk kulit acne-prone atau fungal acne-prone.
- Batas usia rekomendasi.
- Data stok/harga final yang akan dipakai.

## Masalah Data Saat Ini

- Nama produk serum muncul sebagai `GlowAge Multi-Active Serum` dan `GlowAge Multi- Active Serum`.
- Harga produk berbeda antar file.
- `ProductDetailClient.tsx` menampilkan kandungan generik yang sama untuk semua produk: Niacinamide, Ceramide, Hyaluronic Acid, Vitamin C, Peptide.
- `catalog.ts`, `adminStore.ts`, dan `shop/page.tsx` memiliki sumber produk masing-masing.
- Logika `skincheck/page.tsx` belum mengenal red flag, confidence, alasan detail, dan stok.

## Rekomendasi Implementasi Berikutnya

1. Buat satu source of truth produk, misalnya `src/lib/skin-analysis/productKnowledge.ts`.
2. Pindahkan scoring dari `skincheck/page.tsx` ke helper terpisah yang bisa dites.
3. Tambahkan pertanyaan red flag sebelum hasil.
4. Tambahkan output alasan dan caution, bukan hanya nama produk.
5. Tambahkan unit test untuk kombinasi concern penting.
6. Validasi ingredient dan klaim dengan brand owner sebelum live.

