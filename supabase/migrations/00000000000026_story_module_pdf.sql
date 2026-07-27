-- Modul PDF per cerita.
--
-- Guru bisa mengunggah satu file PDF sebagai modul pendukung cerita.
-- File disimpan di bucket 'story-media' yang sudah ada (public, guru+admin upload).

alter table public.stories add column module_pdf_url text;
