# Wayang Folkids

Aplikasi literasi digital untuk siswa Sekolah Dasar yang menghadirkan cerita rakyat
Nusantara dan wayang dalam kemasan interaktif. Siswa dapat membaca cerita,
mendengarkan narasi audio, mengerjakan kuis, dan bermain game literasi, sementara
guru dapat membuat konten, menugaskan bacaan, dan memantau progres belajar secara
real-time.

Wayang Folkids menyediakan tiga portal peran: **Siswa**, **Guru**, dan **Admin**.
Setiap portal memiliki antarmuka dan alur kerja yang disesuaikan dengan
kebutuhannya masing-masing, lengkap dengan landing page publik untuk promosi dan
panduan awal.

## Fitur Utama

### Landpage dan Otentikasi

- **Landing page** interaktif berisi hero, pratinjau katalog cerita, modal video
  cuplikan (di-host di Supabase Storage), demo progres, dan testimoni. Halaman ini
  di-render ulang otomatis setiap satu jam (ISR).
- **Registrasi berbasis peran**: siswa dapat langsung aktif setelah mendaftar,
  sedangkan guru harus mengonfirmasi akun melalui email terlebih dahulu.
- **Login, lupa password, dan reset password** dengan alur email.
- **Routing otomatis sesuai peran** melalui middleware (`src/proxy.ts`), sehingga
  setiap pengguna hanya mengakses portal miliknya.

### Portal Siswa

- **Beranda**: ringkasan progres (cerita dibaca, game dimainkan, total poin),
  daftar tugas dari guru lengkap dengan tenggat waktu, cerita terbaru, dan
  koleksi lencana.
- **Perpustakaan**: penelusuran dan penyaringan cerita rakyat dari berbagai
  daerah dengan indikator progres baca.
- **Membaca cerita**: navigasi per halaman dengan progres tersimpan otomatis,
  fitur **"Bacakan"** (text-to-speech bahasa Indonesia dengan jeda, lanjut, dan
  penyorotan kata), serta penampil PDF.
- **Kuis**: pengerjaan kuis terkait cerita dengan halaman hasil berisi skor dan
  pembahasan per soal.
- **Game literasi**: tiga permainan edukatif — Tangkap Kata, Susun Kata Acak,
  dan Ketik Cepat Berpacu — dengan poin yang masuk ke peringkat.
- **Papan peringkat**: peringkat poin literasi di dalam kelas, dihitung dari
  game, kuis, dan cerita yang diselesaikan.
- **Lencana**: koleksi badge otomatis dari pencapaian membaca, kuis, dan game.
- **Gabung kelas**: bergabung ke kelas guru menggunakan kode kelas.

### Portal Guru

- **Dashboard**: ringkasan konten, daftar kelas, tren literasi delapan minggu,
  pemantauan status siswa (aktif, berisiko, tidak aktif), serta rekap hasil kuis
  (rata-rata, tertinggi, terendah).
- **Manajemen kelas**: membuat kelas (Kelas 1–6) dengan kode kelas otomatis,
  mengelola anggota, dan mengedit detail kelas.
- **CMS cerita**: membuat dan mengelola cerita dengan editor teks kaya (TipTap),
  halaman per bab, dukungan video dan PDF, serta kontrol publikasi.
- **Kuis**: membuat kuis beserta soal dan batas waktu pengerjaan per cerita.
- **Rekap asesmen**: matriks nilai siswa per kuis dalam bentuk persentase.
- **Tugas**: menugaskan membaca cerita atau mengerjakan kuis ke kelas tertentu
  dengan instruksi dan tenggat; siswa menerima notifikasi otomatis.

### Portal Admin

- **Dashboard**: statistik pengguna, konten, kuis, kelas, dan tingkat keberhasilan.
- **Manajemen pengguna**: membuat, mengedit, dan menonaktifkan akun siswa/guru.
- **Kelola akun**: pengaturan nama dan password admin.

### Lainnya

- **Notifikasi**: lonceng notifikasi untuk tugas baru, kuis dinilai, pengumuman,
  dan lencana baru.
- **Keamanan**: autentikasi Supabase dengan kebijakan Row Level Security (RLS);
  kunci service role hanya digunakan di sisi server.
- **Analitik**: integrasi Vercel Web Analytics.

## Teknologi yang Digunakan

| Kategori        | Teknologi                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)                                        |
| Bahasa          | TypeScript, React 19                                                      |
| Styling         | Tailwind CSS v4, shadcn/ui, design system `clay`                          |
| Backend         | Supabase (Postgres, Auth, Storage, RLS)                                   |
| Editor teks     | TipTap (rich text untuk halaman cerita)                                   |
| Form & validasi | react-hook-form, Zod v4                                                   |
| Animasi         | framer-motion                                                             |
| UI kit ikon     | lucide-react                                                              |
| Notifikasi UI   | sonner                                                                    |
| Deploy          | Vercel, Vercel Web Analytics                                              |

## Cara Instalasi dan Menjalankan Proyek

### Prasyarat

- Node.js versi 20 ke atas
- npm
- Akun dan proyek Supabase (untuk database, autentikasi, dan storage)

### Langkah Instalasi

1. **Clone repositori**

   ```bash
   git clone https://github.com/krisnaCIHUUUY/folkids.git
   cd folkids
   ```

2. **Install dependensi**

   ```bash
   npm install
   ```

3. **Konfigurasi variabel lingkungan**

   Salin berkas contoh lalu isi nilai sebenarnya:

   ```bash
   cp .env.example .env.local
   ```

   Buka `.env.local` dan isi tiga variabel berikut (dapatkan dari dashboard
   Supabase pada menu Project Settings > API):

   | Variabel                       | Keterangan                                                    |
   | ------------------------------ | ------------------------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`     | URL project Supabase                                          |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Kunci anon publik (dibatasi RLS)                              |
   | `SUPABASE_SERVICE_ROLE_KEY`    | Kunci service role — khusus server, jangan pernah diekspos    |

4. **Terapkan skema database**

   Jalankan migrasi yang tersedia di `supabase/migrations/` ke proyek Supabase
   (misalnya dengan Supabase CLI atau dashboard SQL editor), lalu sinkronkan tipe
   TypeScript:

   ```bash
   npm run db:types
   ```

5. **Jalankan server pengembangan**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di peramban.

### Skrip NPM

| Perintah          | Deskripsi                                        |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Menjalankan server pengembangan (port 3000)      |
| `npm run build`   | Membuat build produksi (termasuk cek tipe & lint)|
| `npm start`       | Menjalankan build produksi                       |
| `npm run lint`    | Menjalankan ESLint                               |
| `npm run db:types`| Regenerasi `src/types/database.ts` dari Supabase |

## Struktur Folder

```
src/
├── app/                  # Halaman Next.js (App Router)
│   ├── (auth)/           # Login, register, lupa & reset password
│   ├── (siswa)/          # Beranda, perpustakaan, cerita, kuis, game, peringkat, lencana
│   ├── (guru)/           # Dashboard, kelas, CMS cerita, kuis, asesmen, tugas
│   ├── (admin)/          # Dashboard admin, manajemen pengguna, akun
│   └── api/              # Route handlers (auth callback, progress, kuis, upload)
├── components/           # Komponen UI per portal (admin, auth, guru, siswa, ui, dsb.)
├── hooks/                # Custom React hooks
├── lib/
│   ├── actions/          # Server actions (kelas, cerita, kuis, tugas, dll.)
│   ├── games/            # Konfigurasi dan logika game literasi
│   ├── mock/             # Data/metrik dashboard
│   ├── seed/             # Cerita default saat kelas dibuat
│   ├── supabase/         # Klien Supabase (server, client, admin)
│   ├── validations/      # Skema Zod untuk form
│   └── auth.ts, roles.ts # Otentikasi & pemeriksaan peran
├── proxy.ts              # Middleware: refresh session & routing per peran
└── types/                # Tipe TypeScript (database.ts hasil generate)

supabase/
└── migrations/           # Skema database dan kebijakan RLS

public/                   # Aset statis (logo, cerita default, dsb.)
```

## Dokumentasi Terkait

- `Folkids_prd.md` — Product Requirements Document.
- `IMPLEMENTATION_PLAN.md` — Rencana implementasi per fase.
- `PANDUAN_PENGGUNAAN.md` — Panduan penggunaan untuk siswa dan guru.
- `AGENTS.md` — Catatan untuk AI agents yang berkolaborasi di repositori ini.
- `DEPLOY.md` — Panduan deployment.

## Lisensi

Proyek ini bersifat privat dan belum memiliki lisensi publik.