-- Tambah kategori 'milestone' untuk lencana pencapaian gabungan (lintas membaca
-- + kuis + game), mis. "Bintang Literasi".
--
-- DIPISAH dari migrasi 00024 secara sengaja: nilai enum yang baru ditambah tak
-- boleh dipakai pada transaksi yang sama. Migrasi 00024 menyisipkan baris badge
-- bercategory 'milestone', jadi nilai ini harus ter-commit lebih dulu.

alter type public.badge_category add value 'milestone';
