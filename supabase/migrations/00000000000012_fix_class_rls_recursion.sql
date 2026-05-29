-- Perbaikan rekursi RLS antara classes <-> class_students (error 42P17).
-- Policy SELECT classes merujuk class_students, dan policy class_students merujuk
-- classes -> saling memicu sehingga rekursif. Solusinya: pindahkan subquery EXISTS
-- ke fungsi SECURITY DEFINER (bypass RLS) sehingga tidak lagi memicu policy tabel lain.
-- Pola sama seperti public.current_user_role() yang sudah dipakai untuk tabel users.

-- =========================
-- Helper SECURITY DEFINER
-- =========================
create or replace function public.is_class_teacher(p_class_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.teacher_id = auth.uid()
  );
$$;

revoke all on function public.is_class_teacher(bigint) from public;
grant execute on function public.is_class_teacher(bigint) to authenticated;

create or replace function public.is_class_member(p_class_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_students cs
    where cs.class_id = p_class_id and cs.student_id = auth.uid()
  );
$$;

revoke all on function public.is_class_member(bigint) from public;
grant execute on function public.is_class_member(bigint) to authenticated;

-- =========================
-- classes: tulis ulang SELECT tanpa subquery ke class_students
-- =========================
drop policy if exists "classes_select_teacher_or_admin" on public.classes;

create policy "classes_select_teacher_or_admin" on public.classes
  for select to authenticated
  using (
    teacher_id = auth.uid()
    or public.current_user_role() = 'admin'
    or public.is_class_member(id)
  );

-- =========================
-- class_students: tulis ulang SELECT/INSERT/DELETE tanpa subquery ke classes
-- =========================
drop policy if exists "class_students_select_member_or_owner" on public.class_students;

create policy "class_students_select_member_or_owner" on public.class_students
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.current_user_role() = 'admin'
    or public.is_class_teacher(class_id)
  );

drop policy if exists "class_students_insert_owner_or_admin" on public.class_students;

create policy "class_students_insert_owner_or_admin" on public.class_students
  for insert to authenticated
  with check (
    public.current_user_role() = 'admin'
    or public.is_class_teacher(class_id)
  );

drop policy if exists "class_students_delete_owner_or_admin" on public.class_students;

create policy "class_students_delete_owner_or_admin" on public.class_students
  for delete to authenticated
  using (
    public.current_user_role() = 'admin'
    or public.is_class_teacher(class_id)
  );
