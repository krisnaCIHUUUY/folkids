-- Triggers: auto-insert profil saat signup + updated_at otomatis

-- 1. Saat user baru terdaftar di auth.users, insert profil ke public.users.
--    Role & name diambil dari raw_user_meta_data (default: siswa).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'role', '')::public.user_role,
      'siswa'::public.user_role
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Trigger generik untuk kolom updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger stories_set_updated_at
  before update on public.stories
  for each row execute function public.set_updated_at();
