-- Agregat statistik dashboard admin dihitung di database (satu round-trip)
-- alih-alih menarik seluruh baris tabel ke aplikasi. Menghormati RLS via
-- SECURITY INVOKER + guard peran admin (current_user_role SECURITY DEFINER
-- menghindari rekursi RLS pada tabel users).

create or replace function public.admin_dashboard_stats()
returns json
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return json_build_object(
    'totalUsers', (select count(*) from public.users),
    'siswa', (select count(*) from public.users where role = 'siswa'),
    'guru', (select count(*) from public.users where role = 'guru'),
    'admin', (select count(*) from public.users where role = 'admin'),
    'aktif', (select count(*) from public.users where is_active),
    'nonaktif', (select count(*) from public.users where not is_active),
    'cerita', (select count(*) from public.stories),
    'ceritaPublished', (select count(*) from public.stories where is_published),
    'ceritaDraft', (select count(*) from public.stories where not is_published),
    'kuis', (select count(*) from public.quizzes),
    'kelas', (select count(*) from public.classes),
    'attempts', (select count(*) from public.quiz_attempts),
    'attemptsLulus', (
      select count(*) from public.quiz_attempts
      where max_score > 0 and total_score::numeric / max_score >= 0.6
    ),
    'rataSkor', coalesce(
      (select round(avg(total_score::numeric / max_score) * 100)
       from public.quiz_attempts where max_score > 0),
      0
    ),
    'readingTotal', (select count(*) from public.reading_progress),
    'readingSelesai', (select count(*) from public.reading_progress where is_completed)
  );
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_dashboard_stats() to authenticated;
