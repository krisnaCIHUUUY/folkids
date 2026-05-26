# Wayang Folkids (folkids_v2)

Aplikasi literasi cerita rakyat dan wayang untuk siswa Sekolah Dasar. Tiga portal: Siswa, Guru, dan Admin.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (Auth + Postgres + Storage)
- **Forms**: react-hook-form + zod
- **Animasi**: framer-motion
- **Deploy**: Vercel

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Salin `.env.example` ke `.env.local` lalu isi credentials Supabase.
3. Jalankan dev server:
   ```bash
   npm run dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000).

## Dokumentasi Internal

- `Folkids_prd.md` — Product Requirements Document.
- `IMPLEMENTATION_PLAN.md` — Rencana implementasi per fase.
- `AGENTS.md` — Catatan untuk AI agents yang berkolaborasi di repo ini.
