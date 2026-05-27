-- Hardening dari Supabase advisor:
-- 1. set_updated_at: pin search_path.
-- 2. handle_new_user: trigger function, tidak perlu execute publik via RPC.
-- 3. story-media: drop broad SELECT policy pada storage.objects. Public bucket
--    tetap bisa diakses via object URL tanpa SELECT, dan ini mencegah listing isi bucket.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "story_media_public_read" on storage.objects;
