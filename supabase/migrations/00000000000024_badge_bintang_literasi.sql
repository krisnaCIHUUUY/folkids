-- Lencana milestone "Bintang Literasi": diberikan saat siswa menyelesaikan
-- 10 cerita DAN 5 kuis. Menambah baris katalog + memperbarui evaluate_badges
-- (create or replace) dengan satu kondisi baru, lalu backfill retroaktif.

insert into public.badges (code, name, description, emoji, category, sort_order) values
  ('bintang_literasi', 'Bintang Literasi', 'Selesaikan 10 cerita & 5 kuis', '⭐', 'milestone', 10);

create or replace function public.evaluate_badges(p_student uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with stats as (
    select
      (select count(*) from public.reading_progress
         where student_id = p_student and is_completed) as stories_done,
      (select count(distinct s.region_origin)
         from public.reading_progress rp
         join public.stories s on s.id = rp.story_id
         where rp.student_id = p_student and rp.is_completed) as regions_read,
      (select count(*) from public.quiz_attempts
         where student_id = p_student and completed_at is not null) as quizzes_done,
      (select count(*) from public.quiz_attempts
         where student_id = p_student and completed_at is not null
           and max_score > 0 and total_score = max_score) as perfect_quizzes,
      (select count(distinct game) from public.game_plays
         where student_id = p_student) as game_types,
      (select count(*) from public.game_plays
         where student_id = p_student) as games_played,
      (select coalesce(sum(points), 0) from public.game_plays
         where student_id = p_student) as total_points
  ),
  ins as (
    insert into public.student_badges (student_id, badge_id)
    select p_student, b.id
    from public.badges b, stats s
    where (b.code = 'pembaca_pemula'       and s.stories_done    >= 1)
       or (b.code = 'kutu_buku'            and s.stories_done    >= 5)
       or (b.code = 'penjelajah_nusantara' and s.regions_read    >= 5)
       or (b.code = 'penguji_cerdik'       and s.quizzes_done    >= 1)
       or (b.code = 'juara_kuis'           and s.perfect_quizzes >= 1)
       or (b.code = 'sang_ahli'            and s.perfect_quizzes >= 3)
       or (b.code = 'pemain_baru'          and s.games_played    >= 1)
       or (b.code = 'serba_bisa'           and s.game_types      >= 3)
       or (b.code = 'pengumpul_poin'       and s.total_points    >= 100)
       or (b.code = 'bintang_literasi'     and s.stories_done    >= 10
                                           and s.quizzes_done    >= 5)
    on conflict (student_id, badge_id) do nothing
    returning badge_id
  )
  insert into public.notifications (user_id, type, title, body, link)
  select p_student, 'badge_baru', 'Lencana baru: ' || b.name, b.description, '/lencana'
  from ins
  join public.badges b on b.id = ins.badge_id;
end;
$$;

revoke all on function public.evaluate_badges(uuid) from public, anon, authenticated;

-- Award retroaktif bagi siswa yang sudah memenuhi syarat.
select public.evaluate_badges(id) from public.users where role = 'siswa';
