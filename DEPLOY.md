# Checklist Deploy — Fase 5 (Polish & Launch)

Panduan langkah-demi-langkah men-deploy **Wayang Folkids** ke produksi:
**Next.js 16** di **Vercel** + **Supabase** (Auth/Postgres/Storage) dengan **domain kustom**.

> Centang `- [ ]` → `- [x]` seiring progres. Langkah Dashboard (Vercel/Supabase) & DNS
> dilakukan manual oleh tim karena butuh kredensial akun.

---

## 1. Pra-deploy (lokal)

- [ ] `npm run lint` → 0 error.
- [ ] `npm run build` → sukses (tidak ada error type/build).
- [ ] Branch `main` up-to-date & semua perubahan sudah ter-merge (`git status` bersih).
- [ ] Migrasi DB sinkron: daftar di `supabase/migrations/` cocok dengan yang sudah ter-apply
      (cek via Supabase MCP `list_migrations` atau `supabase migration list --linked`).

---

## 2. Supabase — Database & Auth (produksi)

- [ ] Konfirmasi project Supabase produksi. Bila memakai project terpisah dari dev,
      jalankan semua migrasi ke prod: `supabase db push` (atau `supabase migration up --linked`).
- [ ] **Auth → URL Configuration**
  - [ ] **Site URL** = `https://<domain-kustom>` (mis. `https://folkids.id`).
  - [ ] **Redirect URLs** (tambahkan keduanya):
    - `https://<domain-kustom>/api/auth/callback`
    - `https://<domain-kustom>/api/auth/callback?next=/reset-password`
    - (opsional, untuk preview Vercel) `https://*.vercel.app/api/auth/callback`
  - > Wajib: kode auth memakai `origin` dinamis (`src/lib/actions/auth.ts`). Tanpa allowlist
    > ini, email verifikasi & reset password akan mengarah ke URL yang salah/ditolak.
- [ ] **Auth → Policies**: aktifkan **Leaked Password Protection** (HaveIBeenPwned).
      *(Saat ini OFF — temuan advisor keamanan.)*
- [ ] **Storage → Settings**: naikkan **Upload file size limit** project ke **≥ 100 MB**.
  - > Bucket `story-media` sudah `file_size_limit = 100 MB`, tapi limit **global per-project**
    > (default 50 MB) membatasi upload video hingga dinaikkan di sini.
- [ ] *(Opsional hardening)* Cabut akses util internal yang ter-expose ke publik:
      ```sql
      revoke execute on function public.rls_auto_enable() from anon, authenticated;
      ```
- [ ] Jalankan ulang `get_advisors` (security + performance) → tidak ada level **ERROR**.
      *(Warning SECURITY DEFINER pada RPC seperti `join_class_by_code`, `submit_quiz_attempt`,
      `class_leaderboard`, `send_announcement`, `create_assignment`, dan helper RLS memang
      disengaja — boleh diabaikan.)*

---

## 3. Vercel — Project & Environment Variables

- [ ] Import repo GitHub `krisnaCIHUUUY/folkids` ke Vercel (framework auto-detect: **Next.js**).
- [ ] Set **Environment Variables** (scope **Production** + **Preview**):

  | Variable | Sumber | Catatan |
  |----------|--------|---------|
  | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Boleh terekspos di client |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Boleh terekspos (dibatasi RLS) |
  | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **Server-only, BYPASS RLS** — tandai sensitif, JANGAN beri prefix `NEXT_PUBLIC_` |

- [ ] **Node.js Version** ≥ 20 (Project Settings → General).
- [ ] Deploy dari branch `main` → build hijau.

---

## 4. Domain Kustom

- [ ] Vercel → Project → **Domains** → tambah domain apex + `www`
      (mis. `folkids.id` dan `www.folkids.id`).
- [ ] Set DNS di registrar sesuai instruksi Vercel:
  - Apex: record **A** / **ALIAS** ke alamat yang ditunjukkan Vercel.
  - `www`: record **CNAME** → `cname.vercel-dns.com`.
- [ ] Tunggu verifikasi domain & penerbitan sertifikat **SSL** (otomatis).
- [ ] **Kembali ke Bagian 2** dan pastikan **Site URL** + **Redirect URLs** Supabase memakai
      domain final (bukan URL `*.vercel.app`).

---

## 5. Verifikasi Pasca-Deploy (smoke test di domain produksi)

**Autentikasi**
- [ ] Registrasi guru → email verifikasi mengarah ke `https://<domain>/api/auth/callback` & berhasil.
- [ ] Login guru/admin (email + password).
- [ ] Login siswa (kode kelas + username + password).
- [ ] Reset password → link mengarah ke `/reset-password` domain produksi.

**Portal Guru**
- [ ] Buat cerita + halaman; upload **ilustrasi**, **audio**, dan **video**
      (uji video mendekati 100 MB → sukses; membuktikan limit storage sudah benar).
- [ ] Buat kuis + soal; atur bobot & batas waktu.

**Portal Siswa**
- [ ] Buka cerita: gambar (next/image) tampil, audio & video play, TTS jalan.
- [ ] Kerjakan kuis → skor tersimpan; main game → poin tersimpan.
- [ ] Lencana & notifikasi muncul.

**Portal Admin**
- [ ] Dashboard statistik & monitoring aktivitas menampilkan data nyata.

**Keamanan**
- [ ] Siswa tidak bisa mengakses rute guru/admin (di-redirect oleh `src/proxy.ts`).

---

## 6. Rilis

- [ ] Perbarui `FITUR.md`: tandai **Fase 5** sesuai cakupan yang benar-benar selesai.
- [ ] *(Opsional)* Buat git tag rilis: `git tag v1.0.0 && git push origin v1.0.0`.

---

## Catatan

- **Variabel rahasia**: hanya `SUPABASE_SERVICE_ROLE_KEY` yang server-only; tidak boleh
  pernah dipakai dari Client Component. Lihat `.env.example` untuk daftar lengkap.
- **Di luar cakupan deploy ini**: fitur backlog *Animasi wayang interaktif* (opsional —
  infrastruktur `animation_data` sudah ada, tapi belum ada editor/aset).
