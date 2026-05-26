# Plan Implementasi — Wayang Folkids (Folkids v2)

## Context

Project [folkids_v2](D:\WEB_PROJECT\folkids_v2) saat ini masih boilerplate `create-next-app` (Next.js **16.2.6**, React 19, Tailwind v4, TypeScript strict). PRD lengkap (`Folkids_prd.md`) sudah mendefinisikan: aplikasi literasi cerita rakyat & wayang untuk siswa SD, 3 portal (Siswa/Guru/Admin), Supabase (Auth + Postgres + Storage), Vercel deploy. Estimasi PRD: 14 minggu, MVP.

User belum punya project Supabase, dan plan ini mencakup tambahan tooling: **react-hook-form + zod** (forms), **shadcn/ui** (UI primitives), **Vitest + Playwright** (testing).

**Catatan kritikal sebelum coding (dari `AGENTS.md`):**
- Next.js 16 punya breaking changes. **Wajib baca** dokumentasi relevan di `node_modules/next/dist/docs/01-app/` sebelum implementasi tiap fitur.
- `params` & `searchParams` adalah **`Promise`** — wajib `await` di server components.
- Server Components default; Client Components butuh `'use client'`.
- Tailwind **v4** (bukan v3) — config & directive berbeda dari yang umum diketahui.

---

## Fase 0 — Pre-flight (1–2 hari)

Persiapan akun eksternal & tooling lokal sebelum coding.

1. **Buat akun & project Supabase** di https://supabase.com
   - Region: pilih Singapore atau Tokyo (terdekat dari Indonesia).
   - Catat: `Project URL`, `anon public key`, `service_role key` (jangan commit).
   - Aktifkan: Auth (Email/Password), Storage, Database.
2. **Install Supabase CLI** lokal: `npm install -D supabase` (untuk migrations).
3. **Buat akun Vercel** & hubungkan ke GitHub repo (deploy preview otomatis).
4. **Buat akun GitHub repo** untuk project ini (saat ini repo lokal saja).
5. **Baca dokumentasi Next.js 16 yang relevan**:
   - [node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md](node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md)
   - [node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md](node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md)
   - [node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md](node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md)

**Verifikasi**: Bisa login ke Supabase dashboard, `supabase --version` jalan, repo terhubung ke GitHub & Vercel.

---

## Fase 1 — Foundation (3 minggu)

### 1.1 Bersihkan boilerplate
- Hapus konten default `src/app/page.tsx` (placeholder home page sementara).
- Update `src/app/layout.tsx`: ganti metadata `title`/`description` ke "Wayang Folkids".
- Update `globals.css` (Tailwind v4 sudah pakai `@import "tailwindcss"`).
- Update README.md singkat untuk project ini.

### 1.2 Setup folder structure
Buat folder kosong sesuai PRD section 7.2:
```
src/
├── app/(auth)/{login,register}/
├── app/(siswa)/{perpustakaan,cerita,kuis}/
├── app/(guru)/{dashboard,cms,asesmen}/
├── app/(admin)/{dashboard,pengguna}/
├── app/api/{stories,quizzes,progress,upload}/
├── components/{ui,story-reader,quiz,dashboard,layout}/
├── lib/supabase/
├── lib/{utils.ts,fonts.ts,validations/}
├── hooks/
└── types/
supabase/{migrations,seed.sql}
```

### 1.3 Install dependencies inti
```
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install framer-motion
npm install clsx tailwind-merge class-variance-authority lucide-react
npm install -D @types/node
```

### 1.4 Setup shadcn/ui
- Jalankan: `npx shadcn@latest init` (pilih: TypeScript, Tailwind v4, RSC).
- Install komponen dasar: `npx shadcn@latest add button input label card dialog form select textarea sonner`.
- Hasil: `src/components/ui/` terisi primitives.

### 1.5 Setup Supabase clients
Buat 3 file di `src/lib/supabase/`:
- `client.ts` — browser client (gunakan `createBrowserClient` dari `@supabase/ssr`).
- `server.ts` — server client (gunakan `createServerClient` + cookies dari `next/headers`).
- `middleware.ts` — refresh session token tiap request.
- Buat `src/middleware.ts` di root src untuk auth gate (proteksi route per role).

### 1.6 Environment variables
- Buat `.env.local` dengan: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Buat `.env.example` untuk dokumentasi (commit ke git).
- Tambah `.env.local` ke `.gitignore` (kemungkinan sudah ada dari create-next-app).

### 1.7 Database schema & migrations
Buat SQL migrations di `supabase/migrations/` (urut timestamp):
- `00000000000001_users.sql` — tabel `users` (FK ke `auth.users`), enum `user_role`.
- `00000000000002_classes.sql` — tabel `classes` + `class_students`.
- `00000000000003_stories.sql` — tabel `stories` + `story_pages` + enum `difficulty`.
- `00000000000004_quizzes.sql` — tabel `quizzes`, `quiz_questions`, `quiz_attempts` + enum `question_type`.
- `00000000000005_reading_progress.sql` — tabel `reading_progress`.
- `00000000000006_rls_policies.sql` — semua RLS policies sesuai PRD section 7.3.
- `00000000000007_storage_buckets.sql` — buat bucket `story-media` dengan policies upload (guru+admin only).
- `00000000000008_triggers.sql` — trigger `on_auth_user_created` untuk auto-insert ke tabel `users` saat signup, dan `updated_at` trigger.

Jalankan: `npx supabase db push` (link ke project Supabase via `supabase link`).

### 1.8 TypeScript types dari Supabase
- Jalankan: `npx supabase gen types typescript --linked > src/types/database.ts`.
- Tambah script `db:types` di `package.json` untuk regenerate.

### 1.9 Auth implementation
- `src/app/(auth)/login/page.tsx` — form login (email+password) pakai react-hook-form + zod.
- `src/app/(auth)/register/page.tsx` — form register (hanya untuk admin via panel, atau diaktifkan kemudian).
- `src/app/api/auth/callback/route.ts` — handle Supabase Auth callback.
- Logout action (Server Action di `src/lib/actions/auth.ts`).
- Helper `getCurrentUser()` & `getUserRole()` di `src/lib/auth.ts`.

### 1.10 Role-based route protection
- Di `src/middleware.ts`: cek session + role, redirect:
  - `/perpustakaan/*` → hanya siswa.
  - `/dashboard|/cms|/asesmen/*` → hanya guru/admin.
  - `/pengguna|/admin/*` → hanya admin.
- Buat layout per route group: `src/app/(siswa)/layout.tsx`, `(guru)/layout.tsx`, `(admin)/layout.tsx` yang fetch user di server.

### 1.11 Setup testing
- Install: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom`.
- Install Playwright: `npm init playwright@latest`.
- Konfigurasi `vitest.config.ts` & `playwright.config.ts`.
- Smoke test: 1 unit test (utility function) + 1 E2E test (visit `/login`).

### 1.12 CI/CD setup
- Buat `.github/workflows/ci.yml`: jalankan `lint`, `typecheck` (`tsc --noEmit`), `vitest`, `playwright`.
- Hubungkan ke Vercel: deploy preview otomatis tiap PR.

**Verifikasi Fase 1**:
- `npm run dev` jalan tanpa error, halaman `/login` muncul.
- Bisa register user manual via Supabase dashboard → set role → login → diarahkan ke portal sesuai role.
- `npx supabase db diff` clean.
- `npm run lint && npx tsc --noEmit` lulus.

---

## Fase 2 — CMS & Konten (4 minggu)

### 2.1 Skema upload file (Supabase Storage)
- Implementasi helper `uploadFile()` di `src/lib/storage.ts` (cek MIME, ukuran max 10MB image / 50MB audio/video).
- Komponen `<MediaUploader>` di `src/components/ui/` — preview + progress bar.

### 2.2 CRUD Cerita (Guru)
- **List**: `src/app/(guru)/cms/page.tsx` — tabel daftar cerita milik guru (server component, filter `created_by`).
- **Create**: `src/app/(guru)/cms/buat/page.tsx` — form lengkap (judul, sinopsis, cover image, region, theme, difficulty).
  - Validasi zod di `src/lib/validations/story.ts`.
  - Server Action `createStory()` di `src/lib/actions/stories.ts`.
- **Edit**: `src/app/(guru)/cms/[id]/edit/page.tsx` — reuse form component.
- **Delete**: Server Action dengan konfirmasi dialog (shadcn `AlertDialog`).
- **Publish toggle**: button untuk set `is_published`.

### 2.3 Manajemen Halaman Cerita
- Sub-page di `src/app/(guru)/cms/[id]/halaman/page.tsx`.
- Editor per halaman: text (textarea), upload ilustrasi, upload audio narasi, field `character_values`.
- Drag-and-drop untuk reorder `page_number` (gunakan `@dnd-kit/sortable`).

### 2.4 API Routes untuk Cerita
- `src/app/api/stories/route.ts` — `GET` (list dengan filter), `POST` (create).
- `src/app/api/stories/[id]/route.ts` — `GET`, `PATCH`, `DELETE`.
- `src/app/api/stories/[id]/pages/route.ts` — list & create halaman.
- **Ingat**: `params` adalah `Promise` di Next.js 16, harus `await`.

### 2.5 Perpustakaan Siswa (read-only)
- `src/app/(siswa)/perpustakaan/page.tsx` — grid katalog cerita published.
- Filter UI: kategori (region, theme, difficulty) — server-side via searchParams.
- Komponen `<StoryCard>` di `src/components/story-reader/`.

### 2.6 Story Reader dasar
- `src/app/(siswa)/cerita/[id]/page.tsx` — fullscreen reader.
- Navigasi halaman per halaman (prev/next, page indicator).
- Tampilan: ilustrasi besar di atas, teks naratif di bawah, panel character_values di samping.
- Track `reading_progress` via Server Action saat ganti halaman & complete.

**Verifikasi Fase 2**:
- Guru bisa CRUD cerita lengkap dengan upload media; file muncul di Supabase Storage.
- Siswa bisa lihat katalog cerita published & baca halaman per halaman.
- Reading progress tersimpan di DB.
- Test E2E: flow guru buat cerita → siswa baca cerita.

---

## Fase 3 — Interaktif & Asesmen (3 minggu)

### 3.1 Audio narasi & highlight teks
- Tambah `<audio>` controls di Story Reader, autoplay opsional.
- Highlight teks per kalimat saat audio main (gunakan `WebVTT` cues di Supabase storage, atau timestamp manual di `story_pages`).
- Fallback: Web Speech API (text-to-speech browser) jika `audio_url` kosong.

### 3.2 Animasi wayang (Framer Motion)
- Komponen `<WayangAnimation>` di `src/components/story-reader/`.
- Pakai field `animation_data` (JSON) di `story_pages` untuk define keyframes sederhana (translate, rotate, opacity).
- Library framer-motion: `<motion.div animate={...} />`.

### 3.3 CRUD Kuis (Guru)
- `src/app/(guru)/asesmen/page.tsx` — list kuis (filter per cerita).
- `src/app/(guru)/asesmen/buat/page.tsx` — form buat kuis (judul, time_limit, link ke story).
- `src/app/(guru)/asesmen/[id]/soal/page.tsx` — manage soal:
  - Tipe: pilihan_ganda, benar_salah, isian, mencocokkan.
  - Form per tipe (conditional render via discriminated union zod schema).
  - Field `score_weight`, `order_number`.

### 3.4 Quiz Player (Siswa)
- `src/app/(siswa)/kuis/[id]/page.tsx` — tampilkan soal satu per satu atau sekaligus.
- Timer countdown (jika `time_limit_minutes` > 0) — client component.
- Auto-save jawaban ke `localStorage` (resilient ke refresh).
- Submit → `POST /api/quizzes/[id]/submit` → hitung skor server-side (jangan trust client).

### 3.5 Scoring & Feedback
- API `src/app/api/quizzes/[id]/submit/route.ts`:
  - Validasi attempt belum di-submit.
  - Bandingkan `answers` JSON dengan `correct_answer` per `quiz_questions`.
  - Hitung `total_score` = sum(score_weight * benar).
  - Insert ke `quiz_attempts` dengan `completed_at`.
- Halaman hasil: skor, feedback per soal (benar/salah), tombol ulang.

**Verifikasi Fase 3**:
- Siswa bisa baca cerita dengan audio + animasi, lalu ambil kuis, dapat skor benar.
- Guru bisa buat kuis dengan 4 tipe soal yang berbeda.
- Skor terhitung benar untuk semua tipe soal (test unit).

---

## Fase 4 — Dashboard & Analytics (2 minggu)

### 4.1 Dashboard Guru
- `src/app/(guru)/dashboard/page.tsx`:
  - Card statistik: total cerita milik guru, total siswa di kelasnya, rata-rata skor kuis.
  - Tabel: 10 siswa terakhir + status (aktif/tidak aktif berdasarkan `last_seen`).
  - Chart progres literasi: gunakan `recharts` (`npm install recharts`).
- API agregasi: `src/app/api/analytics/teacher/route.ts` (Postgres `GROUP BY` + RLS-aware query).

### 4.2 Manajemen Kelas
- `src/app/(guru)/kelas/page.tsx` — list kelas.
- Form buat kelas + assign siswa (multi-select dari user dengan role siswa).

### 4.3 Dashboard Admin
- `src/app/(admin)/dashboard/page.tsx`:
  - Card: total user (per role), total cerita, total kuis, total attempts.
  - Chart: trend bulanan registrasi & aktivitas.
- API: `src/app/api/analytics/admin/route.ts` (gunakan service_role atau RPC dengan `security definer`).

### 4.4 Manajemen Pengguna (Admin)
- `src/app/(admin)/pengguna/page.tsx`:
  - Tabel semua user dengan search + filter role.
  - Action: edit role, nonaktifkan (set kolom `is_active`), reset password (`auth.admin.updateUserById` via server action service_role).
- Form bulk-import siswa via CSV (opsional).

**Verifikasi Fase 4**:
- Guru lihat dashboard dengan data real dari siswa di kelasnya.
- Admin bisa kelola user (edit, deactivate, reset password).
- RLS memastikan guru tidak bisa lihat data siswa di kelas lain.

---

## Fase 5 — Polish & Launch (2 minggu)

### 5.1 UI/UX refinement
- Pasang font sesuai PRD section 7.4.2: Nunito (UI), Literata (reader), JetBrains Mono (data).
  - Pakai `next/font/google` di `src/lib/fonts.ts`.
- Theme colors playful (wayang/batik motif) — palette warna anak di `tailwind.config` atau CSS variables.
- Loading states (`loading.tsx` per route group).
- Error boundaries (`error.tsx` per route group + `not-found.tsx` global).
- Empty states untuk perpustakaan kosong, kuis kosong, dll.

### 5.2 Aksesibilitas
- Audit dengan `@axe-core/playwright` di E2E test.
- Pastikan kontras WCAG AA, alt text di semua `<Image>`, label di semua form input.
- Keyboard navigation: skip-to-content link, focus rings visible.

### 5.3 Performa
- Optimize image dengan `next/image` + Supabase image transformations.
- Audit Lighthouse (target > 80 semua kategori).
- Code-split per route group (sudah otomatis di App Router).
- Cek bundle size: `npm run build` → cek output route size, target < 500KB initial.

### 5.4 Testing menyeluruh
- E2E test untuk flow lengkap: register siswa → login → baca cerita → kuis → lihat skor.
- E2E test guru: CRUD cerita + kuis.
- Unit test untuk scoring logic & validations.

### 5.5 Seed data & dokumentasi
- `supabase/seed.sql`: 15 cerita contoh + halaman + kuis (sesuai success metric PRD).
- Asset cerita contoh di `public/seed-media/` atau langsung upload ke Supabase Storage staging.
- `README.md`: cara setup, jalankan dev, deploy.
- `CONTRIBUTING.md` ringkas untuk guru content creator.

### 5.6 Deployment ke Vercel
- Set environment variables di Vercel dashboard (production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Konfigurasi custom domain (jika ada).
- Aktifkan Vercel Analytics & Web Vitals.
- Setup Supabase production project terpisah dari development (atau 1 project, 2 schema).

### 5.7 Pre-launch checklist
- [ ] Semua RLS policies aktif & teruji (coba akses cross-role).
- [ ] Service role key TIDAK terekspos di client bundle.
- [ ] CORS & rate limiting di API route handlers.
- [ ] Backup strategy Supabase (point-in-time recovery enabled).
- [ ] Monitoring: Sentry atau Vercel logs.
- [ ] Privacy/ToS halaman (sesuai keamanan anak di PRD).

**Verifikasi Fase 5**:
- Lighthouse score > 80 di mobile & desktop.
- Production URL bisa diakses, flow end-to-end siswa & guru jalan.
- Tidak ada console error / network error 4xx-5xx di flow utama.

---

## File Kritikal yang Akan Dibuat / Diubah

**Konfigurasi** (root):
- `package.json` — tambah deps & scripts.
- `next.config.ts` — image domains untuk Supabase Storage.
- `tsconfig.json` — sudah OK (path alias `@/*` aktif).
- `.env.local`, `.env.example`.
- `vitest.config.ts`, `playwright.config.ts`.
- `.github/workflows/ci.yml`.

**Supabase**:
- `supabase/migrations/*.sql` (8 file SQL).
- `supabase/seed.sql`.

**Aplikasi** (`src/`):
- Pattern: tiap halaman = 1 file `page.tsx`; tiap API endpoint = 1 file `route.ts`; tiap form besar punya validasi zod terpisah di `src/lib/validations/`.
- Reuse: semua form pakai react-hook-form + zod resolver + shadcn `<Form>` component.
- Reuse: semua data fetching di Server Components default, pakai `await supabase.from(...)`.
- Total estimasi: ~80 file (page, layout, route handler, component, action, validation).

---

## Pola yang Wajib Diikuti

1. **Selalu baca docs Next.js 16 di `node_modules/next/dist/docs/`** sebelum implementasi pola yang belum familier (AGENTS.md mewajibkan ini).
2. **`params` dan `searchParams` adalah `Promise`** — semua dynamic route page harus `async` dan `await params`.
3. **Server Components default** — pakai `'use client'` hanya untuk interaktif (form, animation, state).
4. **RLS first** — jangan andalkan filter di client/API; security harus di Postgres level via RLS policies.
5. **Service role key hanya di server** — letakkan di `src/lib/supabase/admin.ts` dan import dari Server Actions / API routes saja, jangan dari komponen.
6. **Validasi input dua kali**: client (UX feedback) + server (security) dengan zod schema yang sama.

---

## Verifikasi End-to-End

Setelah semua fase selesai, jalankan skenario manual:

1. Admin login → buat akun guru → assign ke kelas → buat akun siswa → assign siswa ke kelas.
2. Guru login → upload 1 cerita lengkap (cover, 3 halaman, audio, ilustrasi) → publish.
3. Guru buat kuis 5 soal (mix tipe) untuk cerita itu.
4. Siswa login → buka perpustakaan → pilih cerita → baca semua halaman (audio main + animasi muncul) → kerjakan kuis → lihat skor.
5. Guru lihat dashboard → ada data 1 cerita dibaca + 1 kuis dikerjakan oleh siswa tadi.
6. Admin lihat dashboard → statistik global ter-update.
7. Test cross-role: guru A coba akses cerita guru B → ditolak. Siswa coba akses CMS → di-redirect.

Otomatis: `npm run test` (vitest) & `npm run test:e2e` (playwright) hijau di CI.

---

## Estimasi Total

| Fase | Durasi PRD | Catatan |
|------|-----------|---------|
| Fase 0 — Pre-flight | 1–2 hari | Setup akun & baca docs |
| Fase 1 — Foundation | 3 minggu | Critical path, jangan dipercepat |
| Fase 2 — CMS & Konten | 4 minggu | Upload flow & reader |
| Fase 3 — Interaktif & Asesmen | 3 minggu | Audio + animasi + scoring |
| Fase 4 — Dashboard & Analytics | 2 minggu | Agregasi data |
| Fase 5 — Polish & Launch | 2 minggu | A11y, performa, deploy |
| **Total** | **~14 minggu** | Sesuai estimasi PRD |
