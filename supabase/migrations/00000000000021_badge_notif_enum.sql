-- Tambah nilai enum 'badge_baru' ke notification_type.
--
-- DIPISAH dari migrasi badges (00022) secara sengaja: nilai enum yang baru
-- ditambah tak boleh dipakai pada transaksi yang sama. Migrasi 00022 menjalankan
-- backfill yang menyisipkan notifikasi 'badge_baru', jadi nilai ini harus sudah
-- ter-commit lebih dulu di migrasi terpisah ini.

alter type public.notification_type add value 'badge_baru';
