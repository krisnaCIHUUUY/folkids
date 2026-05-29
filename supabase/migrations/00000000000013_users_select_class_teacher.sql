-- Izinkan guru membaca profil (nama/email) siswa yang terdaftar di kelasnya.
-- Sebelumnya policy users hanya: lihat diri sendiri (users_select_self) + admin.
-- Akibatnya join users(name,email) di roster kelas dikembalikan null oleh RLS,
-- sehingga UI menampilkan fallback "Siswa" alih-alih nama lengkap.
-- Fungsi SECURITY DEFINER agar subquery tidak memicu RLS tabel lain (anti-rekursi).

create or replace function public.is_student_in_my_class(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.classes c on c.id = cs.class_id
    where cs.student_id = p_student_id
      and c.teacher_id = auth.uid()
  );
$$;

revoke all on function public.is_student_in_my_class(uuid) from public;
grant execute on function public.is_student_in_my_class(uuid) to authenticated;

create policy "users_select_class_teacher" on public.users
  for select to authenticated
  using (public.is_student_in_my_class(id));
