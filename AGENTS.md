# AGENTS.md — Wayang Folkids

Indonesian literacy app for elementary students. Three portals: Siswa (student), Guru (teacher), Admin.

## Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 3000, Turbopack)
npm run build        # Production build
npm run lint         # ESLint (core-web-vitals + typescript)
npm run db:types     # Regenerate src/types/database.ts from Supabase
```

No test suite exists. Verify changes with `npm run build` (catches type errors + lint).

## Architecture

**Next.js 16 App Router + Supabase**

- `src/proxy.ts` — Middleware entry (session refresh, role-based routing)
- `src/lib/supabase/middleware.ts` — Supabase session + auth gating
- `src/lib/auth.ts` — `getCurrentUser()` cached per request, `requireRole()` for page guards
- `src/lib/roles.ts` — Role prefixes, `canAccess()` path checks

**Route groups** (each has `layout.tsx` calling `requireRole`):
- `(siswa)` → `/beranda`, `/perpustakaan`, `/cerita`, `/kuis`, `/game`, `/papan-peringkat`
- `(guru)` → `/dashboard`, `/cms`, `/asesmen`, `/kelas`, `/tugas`
- `(admin)` → `/admin`, `/pengguna`, `/akun`
- `(auth)` → `/login`, `/register`, `/lupa-password`

**Database**: Supabase Postgres + RLS. Migrations in `supabase/migrations/`. Generated types in `src/types/database.ts`.

**Storage**: `story-media` bucket (public, 100MB). Upload via browser client in `src/components/guru/media-uploader.tsx`.

**Default stories**: Saat guru membuat kelas baru, 3 cerita default otomatis di-seed (dari `public/cerita/`). Story di-reuse per guru (cek by `module_pdf_url`). Lihat `src/lib/seed/default-stories.ts`.

## Key Patterns

**Supabase clients** (3 variants):
- `src/lib/supabase/server.ts` — Server Components / Route Handlers (cookies-based)
- `src/lib/supabase/client.ts` — Browser client
- `src/lib/supabase/admin.ts` — Service role (bypasses RLS, server-only)

**Server Actions**: `src/lib/actions/` — Use `"use server"` directive, call `requireRole()` for auth.

**Forms**: react-hook-form + Zod v4 schemas in `src/lib/validations/`.

**Styling**: Tailwind CSS v4 + custom `clay` design system (`clay`, `clay-sm`, `clay-inset`, `clay-press` utilities in `globals.css`).

**Language**: All UI text and code comments in Indonesian (Bahasa).

## Gotchas

- **Middleware**: Don't add logic between `createServerClient()` and `getUser()` in `src/lib/supabase/middleware.ts` — breaks session refresh.
- **Cookies**: Server Components can't set cookies; rely on `proxy.ts` for session refresh.
- **Service role key**: `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — never import in client code or expose to browser.
- **PDF embedding**: Supabase Storage blocks iframe embedding — gunakan Google Docs Viewer URL (`docs.google.com/gview?url=...&embedded=true`). Untuk file di `public/cerita/`, PdfViewer embed langsung via `<iframe src>` (same-origin, tanpa Google Viewer).
- **Animations**: Respects `prefers-reduced-motion`. Use `useReducedMotion()` from framer-motion for conditional animation.
- **Tailwind v4**: Uses `@theme` directive (not `tailwind.config`). Custom colors in `globals.css`.
- **Zod v4**: Import from `"zod"` (not `"zod/v4"`). Use `.optional().or(z.literal(""))` for optional string fields.
- **Next.js 16**: Check `node_modules/next/dist/docs/` for breaking changes before writing code.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Public anon key (RLS-protected)
SUPABASE_SERVICE_ROLE_KEY=      # Admin key — SERVER ONLY
```

Copy `.env.example` to `.env.local`. Git ignores `.env*` files.

## Git Workflow

- Branch: `feat/perf-and-a11y-optimizations`
- Remote: `https://github.com/krisnaCIHUUUY/folkids.git`
- Commit style: `feat(scope): description` (Indonesian descriptions OK)
- PR to main after verification

## File Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # UI components (admin/, auth/, guru/, siswa/, ui/)
├── hooks/         # Custom React hooks (currently empty)
├── lib/           # Utilities, actions, Supabase, validations
├── proxy.ts       # Middleware entry point
└── types/         # TypeScript types (database.ts generated)
```

## Reference Docs

- `Folkids_prd.md` — Product Requirements Document
- `IMPLEMENTATION_PLAN.md` — Implementation plan by phase
