# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js 16 + React 19 + Tailwind v4

This project uses **Next.js 16.2.6**, which diverges from older Next.js knowledge. Before writing feature code, read the relevant guide in `node_modules/next/dist/docs/01-app/`. Key differences that bite:

- **`params` and `searchParams` are `Promise`s** — `await` them in Server Components / route handlers.
- **Middleware is `src/proxy.ts`, not `middleware.ts`.** It exports `proxy()` (not `middleware()`) plus a `config` matcher. It calls `updateSession()` to refresh the Supabase auth cookie on every matched request.
- Server Components are the default; add `'use client'` only when needed.
- **Tailwind CSS v4** — config lives in `src/app/globals.css` via `@import "tailwindcss"` and `@theme` blocks. There is no `tailwind.config.ts`. shadcn theme is imported with `@import "shadcn/tailwind.css"`.

## Commands

```bash
npm run dev          # dev server (localhost:3000)
npm run build        # production build
npm run lint         # eslint (flat config, eslint.config.mjs)
npm run db:types     # regenerate src/types/database.ts from linked Supabase project
```

There is no test runner configured yet. Lint is the only automated check; run `npm run lint` and `npm run build` to validate changes.

After any schema migration, run `npm run db:types` to keep `src/types/database.ts` in sync with the database.

## Architecture

A fullstack-monolith Next.js app (App Router) backed entirely by Supabase (Auth + Postgres + Storage), deployed on Vercel. The app is a children's literacy platform (Indonesian folk tales / wayang) with three role-scoped portals: **siswa** (student), **guru** (teacher), **admin**.

### Supabase client boundaries

Three clients exist and are **not** interchangeable — pick by execution context:

- `src/lib/supabase/client.ts` — `createClient()` browser client, for Client Components.
- `src/lib/supabase/server.ts` — `createClient()` async server client (reads/writes cookies via `next/headers`), for Server Components, Server Actions, and route handlers.
- `src/lib/supabase/middleware.ts` — `updateSession()`, called only from `proxy.ts` to refresh the session. **Do not insert logic between `createServerClient` and `getUser()`** there — it can drop the session.

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Only import it from server-only code (Server Actions / route handlers), never client.

### Authorization model — RLS is the source of truth

Access control is enforced in Postgres via Row Level Security, **not** in application code. Migrations in `supabase/migrations/` define the policies (see `..._rls_policies.sql`). Core rules:

- Role lookups use the `public.current_user_role()` SECURITY DEFINER function to avoid RLS recursion on the `users` table. Reuse it in new policies rather than querying `users` directly.
- `guru` can only manage their own rows (`created_by = auth.uid()` / `teacher_id = auth.uid()`); `admin` can manage everything; `siswa` can only read published content and write their own `quiz_attempts` / `reading_progress`.
- The `users` table mirrors `auth.users` and holds profile data only (no credentials). A new auth signup auto-creates the profile row via the `handle_new_user()` trigger, which reads `name` and `role` from `raw_user_meta_data` (defaulting role to `siswa`). To create a non-student, pass `role` in the signup metadata.

When adding a feature that touches a new table, write the migration **and** its RLS policies together — an unpoliced table with RLS enabled denies all access.

### Routing layout (per PRD §7.2)

Route groups segregate portals: `(auth)` (login/register), `(siswa)`, `(guru)`, `(admin)`. API logic lives under `app/api/*/route.ts`. Shared UI primitives are in `src/components/ui/` (shadcn, `base-nova` style). Path alias `@/*` → `src/*`.

### Auth nuance to resolve

Per the PRD, students log in with **username + password** while teachers/admins use **email + password**, but Supabase Auth is email-based. Any login implementation must bridge username → email (e.g., synthetic email or a lookup). Confirm the chosen approach before building the auth forms.

## Reference docs

- `Folkids_prd.md` — full product requirements (features, ERD, RLS table, design constraints).
- `IMPLEMENTATION_PLAN.md` — phased build plan; check it for current phase scope.
- Language: code comments, commits, and docs in this repo are written in Indonesian.
