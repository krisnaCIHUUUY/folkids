-- Penugasan guru (assignments) + notifikasi.
--
-- Penugasan: guru memberi tugas (menunjuk cerita ATAU kuis) bertenggat ke SATU
-- kelas. Semua siswa kelas itu menerima tugas + notifikasi.
--
-- Notifikasi: tabel generik per-penerima. INSERT untuk penerima LAIN (siswa lain
-- / guru lain) tak bisa lewat RLS (with check user_id = auth.uid()), jadi fan-out
-- dikerjakan fungsi SECURITY DEFINER terkontrol — pola sama seperti
-- join_class_by_code / class_leaderboard.

-- ── Enum ───────────────────────────────────────────────────────────────────
create type public.assignment_kind as enum ('baca', 'kuis');
create type public.notification_type as enum ('tugas_baru', 'kuis_dinilai', 'pengumuman');

-- ── Tabel: assignments ───────────────────────────────────────────────────────
create table public.assignments (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete cascade,
  kind public.assignment_kind not null,
  story_id bigint references public.stories(id) on delete cascade,
  quiz_id bigint references public.quizzes(id) on delete cascade,
  title text not null,
  instructions text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  -- Konsistensi: tugas 'baca' menunjuk cerita, 'kuis' menunjuk kuis.
  constraint assignments_kind_target_chk check (
    (kind = 'baca' and story_id is not null and quiz_id is null)
    or (kind = 'kuis' and quiz_id is not null and story_id is null)
  )
);

create index assignments_class_id_idx on public.assignments (class_id);
create index assignments_created_by_idx on public.assignments (created_by);
create index assignments_due_at_idx on public.assignments (due_at);

alter table public.assignments enable row level security;

-- SELECT: pembuat (guru), admin, atau siswa anggota kelas.
create policy "assignments_select_member_owner_admin" on public.assignments
  for select to authenticated
  using (
    created_by = auth.uid()
    or public.current_user_role() = 'admin'
    or exists (
      select 1 from public.class_students cs
      where cs.class_id = assignments.class_id
        and cs.student_id = auth.uid()
    )
  );

-- INSERT: guru untuk dirinya sendiri (penciptaan utama lewat RPC create_assignment;
-- policy ini menjaga kepemilikan bila insert langsung).
create policy "assignments_insert_owner_guru" on public.assignments
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.current_user_role() = 'guru'
  );

-- UPDATE: pembuat atau admin.
create policy "assignments_update_owner_admin" on public.assignments
  for update to authenticated
  using (created_by = auth.uid() or public.current_user_role() = 'admin')
  with check (created_by = auth.uid() or public.current_user_role() = 'admin');

-- DELETE: pembuat atau admin.
create policy "assignments_delete_owner_admin" on public.assignments
  for delete to authenticated
  using (created_by = auth.uid() or public.current_user_role() = 'admin');

-- ── Tabel: notifications ─────────────────────────────────────────────────────
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  link text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- SELECT & UPDATE: hanya pemilik (UPDATE dipakai untuk menandai dibaca).
-- TIDAK ADA policy INSERT → baris hanya ditulis lewat RPC SECURITY DEFINER.
create policy "notifications_select_owner" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_owner" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── RPC: create_assignment ───────────────────────────────────────────────────
-- Buat tugas + fan-out notifikasi 'tugas_baru' ke seluruh anggota kelas, atomik.
create or replace function public.create_assignment(
  p_class_id bigint,
  p_kind public.assignment_kind,
  p_story_id bigint,
  p_quiz_id bigint,
  p_title text,
  p_instructions text,
  p_due_at timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id bigint;
  v_link text;
begin
  -- Otorisasi: admin atau guru pemilik kelas.
  if not (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.classes c
      where c.id = p_class_id and c.teacher_id = v_uid
    )
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.assignments
    (class_id, created_by, kind, story_id, quiz_id, title, instructions, due_at)
  values
    (p_class_id, v_uid, p_kind, p_story_id, p_quiz_id, p_title,
     nullif(p_instructions, ''), p_due_at)
  returning id into v_id;

  v_link := case p_kind
    when 'baca' then '/cerita/' || p_story_id
    else '/kuis/' || p_quiz_id
  end;

  insert into public.notifications (user_id, type, title, body, link)
  select cs.student_id, 'tugas_baru', 'Tugas baru: ' || p_title,
         nullif(p_instructions, ''), v_link
  from public.class_students cs
  where cs.class_id = p_class_id;

  return v_id;
end;
$$;

revoke all on function public.create_assignment(bigint, public.assignment_kind, bigint, bigint, text, text, timestamptz) from public, anon;
grant execute on function public.create_assignment(bigint, public.assignment_kind, bigint, bigint, text, text, timestamptz) to authenticated;

-- ── RPC: send_announcement ───────────────────────────────────────────────────
-- Kirim pengumuman ke seluruh anggota kelas (notifikasi 'pengumuman').
create or replace function public.send_announcement(
  p_class_id bigint,
  p_title text,
  p_body text
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if not (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.classes c
      where c.id = p_class_id and c.teacher_id = v_uid
    )
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.notifications (user_id, type, title, body, link)
  select cs.student_id, 'pengumuman', p_title, nullif(p_body, ''), '/beranda'
  from public.class_students cs
  where cs.class_id = p_class_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.send_announcement(bigint, text, text) from public, anon;
grant execute on function public.send_announcement(bigint, text, text) to authenticated;
