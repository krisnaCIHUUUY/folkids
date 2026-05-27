-- Users: profil tambahan terhubung ke auth.users via id (UUID)

create type public.user_role as enum ('admin', 'guru', 'siswa');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role public.user_role not null default 'siswa',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users (role);

alter table public.users enable row level security;
