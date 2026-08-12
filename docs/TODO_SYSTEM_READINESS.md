# Ginabo — Todo List Kesiapan Sistem

Kerangka kerja untuk membawa Ginabo dari mode trial/demo menuju sistem transaksi produksi.

## P0 — Wajib sebelum transaksi real

- [x] Matikan `DEMO_PAYMENT_MODE` pada checkout; demo hanya explicit via `NEXT_PUBLIC_GINABO_DEMO_PAYMENT_MODE=true`.
- [ ] Aktifkan integrasi Midtrans Sandbox/Production yang sebenarnya; local route sudah memakai Snap, credential/provider belum diverifikasi.
- [x] Implementasikan webhook Midtrans untuk status pending/paid/expired/failed dengan signature, amount check, monotonic transition, dan retry-safe fulfillment.
- [x] Pastikan Command Center default ke provider live; demo hanya explicit via `COMMAND_CENTER_DATA_SOURCE=demo`.
- [x] Hitung ulang harga produk, ongkir, biaya pembayaran, diskon, dan total di server.
- [x] Implementasikan pengurangan stok setelah pembayaran berhasil melalui RPC atomic.
- [ ] Kembalikan stok untuk pembayaran expired/cancelled.
- [ ] Cegah overselling pada checkout bersamaan; fulfillment menolak stok negatif, tetapi reservation sebelum payment masih perlu.

## P1 — Keamanan dan kepercayaan pelanggan

- [ ] Implementasikan verifikasi nomor telepon melalui OTP WhatsApp/SMS.
- [ ] Audit dan perketat Supabase RLS untuk profil, alamat, order, dan pembayaran.
- [ ] Pisahkan role customer, admin, dan service role.
- [ ] Tambahkan audit log untuk perubahan status order dan tindakan admin.
- [ ] Tambahkan rate limit pada endpoint autentikasi, checkout, profile, dan webhook.
- [x] Tambahkan idempotency key untuk mencegah double order.
- [x] Validasi stok, variant, dan product ID di server.
- [ ] Aktifkan backup database otomatis dan uji proses restore.

## P2 — Operasional

- [x] Simpan ongkir, courier, service, dan berat paket di order; tracking number tetap diisi saat fulfillment operasional.
- [ ] Integrasikan tracking resi.
- [ ] Tambahkan fallback jika layanan JNE tidak tersedia pada rute tertentu.
- [ ] Kirim notifikasi order dibuat, pembayaran berhasil/gagal, dikirim, dan selesai.
- [ ] Tampilkan pendapatan bersih setelah biaya Midtrans dan ongkir.
- [x] Tambahkan view customer RFM/LTV/AOV dan product affinity; repeat-order/cohort/return metrics masih perlu query lanjutan.
- [ ] Tambahkan monitoring order terlambat, stok kritis, dan webhook gagal.

## P3 — Kualitas dan reliability

- [ ] Test checkout sukses dan gagal.
- [ ] Test webhook Midtrans dan retry reconciliation.
- [ ] Test perubahan stok dan concurrent checkout.
- [ ] Test pemilihan alamat dan kalkulasi ongkir.
- [ ] Test role admin/customer.
- [ ] Pasang error tracking seperti Sentry.
- [ ] Tambahkan alert untuk error Midtrans, RajaOngkir, database, dan webhook.

## Status setelah audit lokal 2026-08-08

- Checkout production path sudah server-authoritative; mode simulasi hanya berjalan bila env demo diaktifkan eksplisit.
- Halaman demo pembayaran masih tersedia di `/checkout/payment` untuk local trial.
- Migration 007–010 belum diklaim sudah diterapkan ke Supabase production.
- RajaOngkir JNE sudah mendukung REG/YES dan fallback CTC untuk rute lokal.

## Urutan eksekusi yang disarankan

1. Midtrans nyata + webhook.
2. Validasi total dan stok server-side.
3. Command Center live.
4. Keamanan RLS, OTP, rate limit, dan idempotency.
5. Notifikasi, tracking, monitoring, dan automated tests.
