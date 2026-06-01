# Status Fitur — Wayang Folkids

Daftar fitur proyek berdasarkan [`Folkids_prd.md`](./Folkids_prd.md) beserta status
pengerjaannya. Diturunkan dari kode aktual di branch `main` (per 31 Mei 2026).

**Legenda:** ✅ selesai · 🟡 sebagian · ⬜ belum dikerjakan

---

## Fondasi & Autentikasi (PRD §4, §6, §7.3)

- [x] ✅ Integrasi Supabase (Auth + Postgres + Storage) & 15 migrasi
- [x] ✅ Row Level Security per role (siswa/guru/admin) — `supabase/migrations/00000000000006_rls_policies.sql`
- [x] ✅ Proteksi rute berbasis role — `src/proxy.ts`, `src/lib/roles.ts`
- [x] ✅ Login siswa (kode kelas + username + password) — `src/app/(auth)/login`
- [x] ✅ Login guru/admin (email + password)
- [x] ✅ Registrasi siswa mandiri & registrasi guru — `src/app/(auth)/register`
- [x] ✅ Logout mengarah ke landing page
- [x] ✅ Manajemen kelas guru: CRUD kelas + kode kelas + roster siswa — `src/app/(guru)/kelas`
- [x] ✅ Enrollment siswa via kode kelas (`/gabung-kelas`) + auto-join saat login

---

## §3.1 Portal Siswa

### 1. Perpustakaan Cerita Digital
- [x] ✅ Katalog cerita published + cover + daerah asal + progres baca — `src/app/(siswa)/perpustakaan`
- [x] ✅ Filter kategori daerah & tingkat kesulitan (chip, kombinasi AND) — `src/components/siswa/library-browser.tsx`

### 2. Pembaca Cerita Interaktif (Story Reader)
- [x] ✅ Baca per-halaman + navigasi + progres tersimpan — `src/components/siswa/story-reader.tsx`
- [x] ✅ Audio narasi per halaman (pemutar `<audio>` bila ada `audio_url`)
- [x] ✅ Panel nilai karakter per halaman
- [ ] ⬜ Text-to-speech otomatis + highlight teks
- [ ] ⬜ Animasi wayang (Framer Motion)

### 3. Game & Kuis Literasi
- [x] ✅ Kuis 4 tipe: pilihan ganda, benar/salah, isian, mencocokkan — `src/app/(siswa)/kuis/[id]`
- [x] ✅ Skor & feedback instan + rincian benar/salah per soal — `/kuis/[id]/hasil`
- [x] ✅ Scoring server-authoritative (sekali kerja) — `supabase/migrations/00000000000015_quiz_attempt_submit.sql`
- [ ] ⬜ Leaderboard kelas
- [ ] ⬜ Game literasi (selain kuis)

---

## §3.2 Portal Guru

### 4. Dashboard Guru
- [x] ✅ Ringkasan: jumlah cerita, kuis, kelas — `src/app/(guru)/dashboard`
- [x] ✅ Pantau siswa: penyelesaian, rata-rata nilai, status aktif/perlu perhatian
- [x] ✅ Hasil asesmen: pengumpulan, rata-rata/tertinggi/terendah per kuis
- [x] ✅ Grafik tren progres literasi per siswa/kelas (mingguan ×8, 3 metrik, drill kelas→siswa) — `src/components/guru/literacy-trend-section.tsx`

### 5. Manajemen Konten Cerita (CMS)
- [x] ✅ CRUD cerita + publish/unpublish — `src/app/(guru)/cms`
- [x] ✅ Manajemen halaman cerita (CRUD + urutkan)
- [x] ✅ Upload media (ilustrasi & audio) ke Supabase Storage — `src/components/guru/media-uploader.tsx`
- [x] ✅ Tagging: daerah asal, tema karakter, tingkat kesulitan
- [x] ✅ Editor teks kaya WYSIWYG (bold/italic/heading/list) konten halaman — `src/components/guru/rich-text-editor.tsx` (TipTap, render disanitasi DOMPurify)
- [ ] ⬜ Upload video pendukung

### 6. Manajemen Asesmen
- [x] ✅ CRUD kuis per cerita — `src/app/(guru)/cms/[id]/kuis`
- [x] ✅ CRUD soal 4 tipe + urutkan — `/cms/[id]/kuis/[quizId]`
- [x] ✅ Atur bobot skor & batas waktu pengerjaan
- [x] ✅ Lihat hasil agregat per kuis (di dashboard)
- [ ] 🟡 Halaman rekap detail per siswa / per kelas

---

## §3.3 Portal Admin

### 7. Manajemen Pengguna
- [ ] ⬜ Tambah/edit/nonaktifkan akun guru & siswa
- [ ] ⬜ Reset password pengguna
- [ ] ⬜ Atur kelas & kelompok belajar (sisi admin)

### 8. Dashboard Admin
- [ ] ⬜ Statistik keseluruhan (total pengguna/cerita/kuis)
- [ ] ⬜ Monitoring aktivitas sistem

---

## Milestone (PRD §8)

| Fase | Deliverable | Status |
|------|-------------|--------|
| 1 — Foundation | Setup, Supabase, schema, RLS, CRUD users & classes | ✅ Selesai |
| 2 — CMS & Konten | CMS cerita + media upload + story reader | ✅ Selesai |
| 3 — Interaktif & Asesmen | Audio narasi, animasi, kuis & scoring | 🟡 Sebagian (audio + kuis ✅; animasi/TTS ⬜) |
| 4 — Dashboard & Analytics | Dashboard guru & admin | 🟡 Sebagian (guru ✅; admin ⬜) |
| 5 — Polish & Launch | Refinement, testing, deploy, domain | ⬜ Belum |

---

## Backlog (belum ada tabel/skema)

- [ ] ⬜ Game literasi & poin (`totalPoin`, `gameDimainkan` di beranda siswa masih mock)
- [ ] ⬜ Badge/lencana siswa
- [ ] ⬜ Leaderboard kelas
- [ ] ⬜ Penugasan guru (assignment) dengan tenggat — kini "Tugas untukmu" diturunkan dari aktivitas
- [ ] ⬜ Animasi wayang interaktif
- [ ] ⬜ Notifikasi (lonceng navbar masih placeholder)
