-- Game literasi: riwayat permainan siswa + poin yang diperoleh.
-- Sumber kebenaran metrik beranda (totalPoin, gameDimainkan).

create type public.game_type as enum ('tangkap_kata', 'susun_kata', 'ketik_cepat');

create table public.game_plays (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.users(id) on delete cascade,
  game public.game_type not null,
  score int not null default 0,
  points int not null default 0,
  duration_seconds int,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index game_plays_student_id_idx on public.game_plays (student_id);
create index game_plays_game_idx on public.game_plays (game);

alter table public.game_plays enable row level security;

-- SELECT: pemilik, admin, atau guru pengampu kelas siswa tsb.
create policy "game_plays_select_owner_teacher_admin" on public.game_plays
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.current_user_role() = 'admin'
    or exists (
      select 1
      from public.class_students cs
      join public.classes c on c.id = cs.class_id
      where cs.student_id = game_plays.student_id
        and c.teacher_id = auth.uid()
    )
  );

-- INSERT: hanya siswa untuk dirinya sendiri (riwayat append-only, tanpa update/delete).
create policy "game_plays_insert_self_student" on public.game_plays
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and public.current_user_role() = 'siswa'
  );
