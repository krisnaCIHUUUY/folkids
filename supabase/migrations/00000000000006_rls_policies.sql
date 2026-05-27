-- RLS policies sesuai PRD section 7.3
-- Helper: role check via security definer agar tidak terjadi recursion RLS pada tabel users.

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- =========================
-- users
-- =========================
-- Setiap user bisa lihat profil sendiri; admin bisa lihat semua.
create policy "users_select_self" on public.users
  for select to authenticated
  using (id = auth.uid());

create policy "users_select_admin" on public.users
  for select to authenticated
  using (public.current_user_role() = 'admin');

-- Admin bisa update semua user; user bisa update profilnya sendiri (kecuali role — guarded via trigger di layer aplikasi).
create policy "users_update_self" on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "users_update_admin" on public.users
  for update to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "users_insert_admin" on public.users
  for insert to authenticated
  with check (public.current_user_role() = 'admin');

create policy "users_delete_admin" on public.users
  for delete to authenticated
  using (public.current_user_role() = 'admin');

-- =========================
-- classes
-- =========================
create policy "classes_select_teacher_or_admin" on public.classes
  for select to authenticated
  using (
    teacher_id = auth.uid()
    or public.current_user_role() = 'admin'
    or exists (
      select 1 from public.class_students cs
      where cs.class_id = classes.id and cs.student_id = auth.uid()
    )
  );

create policy "classes_insert_teacher_or_admin" on public.classes
  for insert to authenticated
  with check (
    (public.current_user_role() in ('guru', 'admin'))
    and (teacher_id = auth.uid() or public.current_user_role() = 'admin')
  );

create policy "classes_update_owner_or_admin" on public.classes
  for update to authenticated
  using (teacher_id = auth.uid() or public.current_user_role() = 'admin')
  with check (teacher_id = auth.uid() or public.current_user_role() = 'admin');

create policy "classes_delete_owner_or_admin" on public.classes
  for delete to authenticated
  using (teacher_id = auth.uid() or public.current_user_role() = 'admin');

-- =========================
-- class_students
-- =========================
create policy "class_students_select_member_or_owner" on public.class_students
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.current_user_role() = 'admin'
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id and c.teacher_id = auth.uid()
    )
  );

create policy "class_students_insert_owner_or_admin" on public.class_students
  for insert to authenticated
  with check (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id and c.teacher_id = auth.uid()
    )
  );

create policy "class_students_delete_owner_or_admin" on public.class_students
  for delete to authenticated
  using (
    public.current_user_role() = 'admin'
    or exists (
      select 1 from public.classes c
      where c.id = class_students.class_id and c.teacher_id = auth.uid()
    )
  );

-- =========================
-- stories
-- =========================
-- SELECT: published terlihat oleh semua authenticated; guru/admin lihat miliknya / semua.
create policy "stories_select_published_or_owner" on public.stories
  for select to authenticated
  using (
    is_published = true
    or created_by = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "stories_insert_guru_admin" on public.stories
  for insert to authenticated
  with check (
    public.current_user_role() in ('guru', 'admin')
    and (created_by = auth.uid() or public.current_user_role() = 'admin')
  );

create policy "stories_update_owner_or_admin" on public.stories
  for update to authenticated
  using (created_by = auth.uid() or public.current_user_role() = 'admin')
  with check (created_by = auth.uid() or public.current_user_role() = 'admin');

create policy "stories_delete_owner_or_admin" on public.stories
  for delete to authenticated
  using (created_by = auth.uid() or public.current_user_role() = 'admin');

-- =========================
-- story_pages
-- =========================
create policy "story_pages_select_if_story_visible" on public.story_pages
  for select to authenticated
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_pages.story_id
        and (
          s.is_published = true
          or s.created_by = auth.uid()
          or public.current_user_role() = 'admin'
        )
    )
  );

create policy "story_pages_modify_owner_or_admin" on public.story_pages
  for all to authenticated
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_pages.story_id
        and (s.created_by = auth.uid() or public.current_user_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.stories s
      where s.id = story_pages.story_id
        and (s.created_by = auth.uid() or public.current_user_role() = 'admin')
    )
  );

-- =========================
-- quizzes
-- =========================
create policy "quizzes_select_authenticated" on public.quizzes
  for select to authenticated
  using (
    exists (
      select 1 from public.stories s
      where s.id = quizzes.story_id
        and (
          s.is_published = true
          or s.created_by = auth.uid()
          or public.current_user_role() = 'admin'
        )
    )
  );

create policy "quizzes_modify_owner_or_admin" on public.quizzes
  for all to authenticated
  using (created_by = auth.uid() or public.current_user_role() = 'admin')
  with check (
    public.current_user_role() in ('guru', 'admin')
    and (created_by = auth.uid() or public.current_user_role() = 'admin')
  );

-- =========================
-- quiz_questions
-- =========================
create policy "quiz_questions_select_if_quiz_visible" on public.quiz_questions
  for select to authenticated
  using (
    exists (
      select 1
      from public.quizzes q
      join public.stories s on s.id = q.story_id
      where q.id = quiz_questions.quiz_id
        and (
          s.is_published = true
          or s.created_by = auth.uid()
          or public.current_user_role() = 'admin'
        )
    )
  );

create policy "quiz_questions_modify_owner_or_admin" on public.quiz_questions
  for all to authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and (q.created_by = auth.uid() or public.current_user_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_questions.quiz_id
        and (q.created_by = auth.uid() or public.current_user_role() = 'admin')
    )
  );

-- =========================
-- quiz_attempts
-- =========================
create policy "quiz_attempts_select_owner_teacher_admin" on public.quiz_attempts
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.current_user_role() = 'admin'
    or exists (
      select 1
      from public.class_students cs
      join public.classes c on c.id = cs.class_id
      where cs.student_id = quiz_attempts.student_id
        and c.teacher_id = auth.uid()
    )
  );

create policy "quiz_attempts_insert_self_student" on public.quiz_attempts
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and public.current_user_role() = 'siswa'
  );

create policy "quiz_attempts_update_self_student" on public.quiz_attempts
  for update to authenticated
  using (student_id = auth.uid() and public.current_user_role() = 'siswa')
  with check (student_id = auth.uid() and public.current_user_role() = 'siswa');

-- =========================
-- reading_progress
-- =========================
create policy "reading_progress_select_owner_teacher_admin" on public.reading_progress
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.current_user_role() = 'admin'
    or exists (
      select 1
      from public.class_students cs
      join public.classes c on c.id = cs.class_id
      where cs.student_id = reading_progress.student_id
        and c.teacher_id = auth.uid()
    )
  );

create policy "reading_progress_insert_self_student" on public.reading_progress
  for insert to authenticated
  with check (student_id = auth.uid() and public.current_user_role() = 'siswa');

create policy "reading_progress_update_self_student" on public.reading_progress
  for update to authenticated
  using (student_id = auth.uid() and public.current_user_role() = 'siswa')
  with check (student_id = auth.uid() and public.current_user_role() = 'siswa');
