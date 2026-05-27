-- Storage bucket untuk media cerita (cover, ilustrasi, audio narasi)
-- Public read agar siswa bisa stream media tanpa signed URL.

insert into storage.buckets (id, name, public)
values ('story-media', 'story-media', true)
on conflict (id) do nothing;

-- Read: bebas (public bucket), tetap kita beri policy eksplisit.
create policy "story_media_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'story-media');

-- Upload: hanya guru & admin.
create policy "story_media_insert_guru_admin"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'story-media'
    and public.current_user_role() in ('guru', 'admin')
  );

-- Update: hanya guru & admin.
create policy "story_media_update_guru_admin"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'story-media'
    and public.current_user_role() in ('guru', 'admin')
  )
  with check (
    bucket_id = 'story-media'
    and public.current_user_role() in ('guru', 'admin')
  );

-- Delete: hanya guru & admin.
create policy "story_media_delete_guru_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'story-media'
    and public.current_user_role() in ('guru', 'admin')
  );
