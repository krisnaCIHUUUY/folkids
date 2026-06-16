# Status Fitur — Wayang Folkids

Daftar fitur proyek berdasarkan [`Folkids_prd.md`](./Folkids_prd.md) beserta status
pengerjaannya. Diturunkan dari kode aktual di branch `main` (per 8 Juni 2026).

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
- [x] ✅ Text-to-speech ("Bacakan") + highlight kata mengikuti bacaan (Web Speech API, suara id-ID) — `src/components/siswa/read-aloud.tsx`
- [x] ✅ Animasi transisi halaman (Framer Motion, hormati `prefers-reduced-motion`) — `src/components/siswa/story-reader.tsx`

### 3. Game & Kuis Literasi
- [x] ✅ Kuis 4 tipe: pilihan ganda, benar/salah, isian, mencocokkan — `src/app/(siswa)/kuis/[id]`
- [x] ✅ Skor & feedback instan + rincian benar/salah per soal — `/kuis/[id]/hasil`
- [x] ✅ Scoring server-authoritative (sekali kerja) — `supabase/migrations/00000000000015_quiz_attempt_submit.sql`
- [x] ✅ Leaderboard kelas (Poin Literasi: game + kuis + bonus baca) — siswa `/papan-peringkat` & guru `/kelas/[id]`, RPC `class_leaderboard` (SECURITY DEFINER) — `supabase/migrations/00000000000018_class_leaderboard.sql`, `src/components/leaderboard/`
- [x] ✅ Game literasi (selain kuis): Tangkap Kata, Susun Kata (drag-and-drop), Ketik Cepat — `src/app/(siswa)/game`, `src/components/siswa/games/`
- [x] ✅ Poin & jumlah main tersimpan ke DB (`game_plays`) → metrik beranda nyata — `src/lib/actions/games.ts`, `supabase/migrations/00000000000017_game_plays.sql`

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
- [x] ✅ Upload video pendukung per halaman (MP4/WebM ≤100MB ke bucket `story-media`, diputar di story reader) — `supabase/migrations/00000000000025_story_page_video.sql`, `src/components/guru/media-uploader.tsx`, `src/lib/storage.ts`

### 6. Manajemen Asesmen
- [x] ✅ CRUD kuis per cerita — `src/app/(guru)/cms/[id]/kuis`
- [x] ✅ CRUD soal 4 tipe + urutkan — `/cms/[id]/kuis/[quizId]`
- [x] ✅ Atur bobot skor & batas waktu pengerjaan
- [x] ✅ Lihat hasil agregat per kuis (di dashboard)
- [x] ✅ Halaman rekap detail per siswa / per kelas (matriks nilai + drill rincian per soal) — `/asesmen`, `src/components/guru/rekap-asesmen.tsx`

---

## §3.3 Portal Admin

### 7. Manajemen Pengguna
- [x] ✅ Tambah/edit/nonaktifkan akun guru & siswa — `src/app/(admin)/pengguna`, `src/lib/actions/admin-users.ts`
- [x] ✅ Reset password pengguna (admin set password langsung) — `src/components/admin/reset-password-button.tsx`


### 8. Dashboard Admin
- [x] ✅ Statistik keseluruhan (pengguna per role + aktif/nonaktif, cerita/kuis/kelas, engagement) — `src/app/(admin)/admin`, `src/components/admin/admin-stats.tsx`
- [x] ✅ Monitoring aktivitas sistem (feed terbaru diturunkan dari timestamp) — `src/components/admin/activity-feed.tsx`

---

## Milestone (PRD §8)

| Fase | Deliverable | Status |
|------|-------------|--------|
| 1 — Foundation | Setup, Supabase, schema, RLS, CRUD users & classes | ✅ Selesai |
| 2 — CMS & Konten | CMS cerita + media upload + story reader | ✅ Selesai |
| 3 — Interaktif & Asesmen | Audio narasi, animasi, kuis & scoring | ✅ Selesai (audio, TTS+highlight, animasi transisi, kuis & scoring) |
| 4 — Dashboard & Analytics | Dashboard guru & admin | ✅ Selesai (guru ✅; admin ✅ — statistik + monitoring aktivitas data nyata) |
| 5 — Polish & Launch | Refinement, testing, deploy, domain | ⬜ Belum |

---

## Backlog (belum ada tabel/skema)

- [x] ✅ Game literasi & poin — 3 game + `totalPoin`/`gameDimainkan` beranda kini nyata (lihat §3.1 #3)
- [x] ✅ Leaderboard kelas — Poin Literasi gabungan (lihat §3.1 #3)
- [x] ✅ Badge/lencana siswa — 10 lencana (membaca/kuis/game + milestone "Bintang Literasi") di-award OTOMATIS via trigger DB + notifikasi 'badge_baru'; tampil di beranda & halaman khusus `/lencana` — `supabase/migrations/00000000000022_badges.sql`, `supabase/migrations/00000000000024_badge_bintang_literasi.sql`, `src/lib/badges.ts`, `src/app/(siswa)/lencana/page.tsx`
- [x] ✅ Penugasan guru (assignment) dengan tenggat — guru beri tugas baca/kuis per kelas (`/tugas`), siswa lihat di "Tugas untukmu" dgn status & tenggat — `supabase/migrations/00000000000019_assignments.sql`, `src/lib/actions/assignments.ts`, `src/components/guru/assignment-form.tsx`
<!-- - [ ] ⬜ Animasi wayang interaktif -->
- [x] ✅ Notifikasi — lonceng nyata (siswa & guru): tugas baru, kuis dinilai, pengumuman; tandai dibaca — `src/components/notifications/notification-bell.tsx`, `src/lib/notifications.ts`, RPC fan-out (SECURITY DEFINER)
