-- Leaderboard kelas: peringkat siswa berdasarkan Poin Literasi gabungan
-- (poin game + skor kuis + bonus cerita selesai).
--
-- SECURITY DEFINER: RLS pada game_plays/quiz_attempts/reading_progress hanya
-- mengizinkan SELECT oleh pemilik/admin/guru-pengampu, sehingga siswa tak bisa
-- membaca baris milik teman sekelas. Fungsi ini gerbang terkontrol yang hanya
-- mengembalikan AGREGAT per anggota kelas (bukan baris mentah), dengan otorisasi
-- ketat di dalamnya.
--
-- Bobot: bonus cerita selesai = 20 poin/cerita.

create or replace function public.class_leaderboard(p_class_id bigint)
returns table (
  student_id uuid,
  name text,
  game_points bigint,
  quiz_points bigint,
  reading_points bigint,
  total_points bigint,
  rank bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  -- Otorisasi: admin, guru pemilik kelas, atau siswa anggota kelas.
  if not (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.classes c
      where c.id = p_class_id and c.teacher_id = v_uid
    )
    or exists (
      select 1 from public.class_students cs
      where cs.class_id = p_class_id and cs.student_id = v_uid
    )
  ) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  with members as (
    select cs.student_id as sid, u.name as uname
    from public.class_students cs
    join public.users u on u.id = cs.student_id
    where cs.class_id = p_class_id
  ),
  g as (
    select gp.student_id as sid, coalesce(sum(gp.points), 0) as pts
    from public.game_plays gp
    join members m on m.sid = gp.student_id
    group by gp.student_id
  ),
  q as (
    select qa.student_id as sid, coalesce(sum(qa.total_score), 0) as pts
    from public.quiz_attempts qa
    join members m on m.sid = qa.student_id
    where qa.completed_at is not null
    group by qa.student_id
  ),
  r as (
    select rp.student_id as sid, count(*) * 20 as pts
    from public.reading_progress rp
    join members m on m.sid = rp.student_id
    where rp.is_completed
    group by rp.student_id
  ),
  scored as (
    select
      m.sid,
      m.uname,
      coalesce(g.pts, 0) as game_pts,
      coalesce(q.pts, 0) as quiz_pts,
      coalesce(r.pts, 0) as read_pts,
      coalesce(g.pts, 0) + coalesce(q.pts, 0) + coalesce(r.pts, 0) as total
    from members m
    left join g on g.sid = m.sid
    left join q on q.sid = m.sid
    left join r on r.sid = m.sid
  )
  select
    s.sid,
    s.uname,
    s.game_pts::bigint,
    s.quiz_pts::bigint,
    s.read_pts::bigint,
    s.total::bigint,
    rank() over (order by s.total desc)::bigint
  from scored s
  order by s.total desc, s.uname asc;
end;
$$;

revoke all on function public.class_leaderboard(bigint) from public, anon;
grant execute on function public.class_leaderboard(bigint) to authenticated;
