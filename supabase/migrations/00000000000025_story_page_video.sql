-- Video pendukung per halaman cerita.
--
-- Guru mengunggah video (MP4/WebM) ke bucket publik 'story-media' yang sudah ada
-- (policy insert/update/delete guru+admin, read publik tetap dipakai). Hanya
-- perlu kolom baru + menaikkan batas ukuran bucket agar muat 100MB.

alter table public.story_pages add column video_url text;

-- Naikkan batas ukuran file bucket ke 100MB (default biasanya lebih kecil).
-- CATATAN: Supabase juga punya limit upload GLOBAL per-project (default 50MB).
-- Bila masih 50MB, naikkan di Dashboard → Storage → Settings → Upload file size
-- limit ke >= 100MB; setelan global itu tak bisa diubah lewat migrasi SQL biasa.
update storage.buckets set file_size_limit = 104857600 where id = 'story-media';
