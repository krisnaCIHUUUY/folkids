-- Kode kelas (join code) + RPC enrollment lewat kode.
-- Tabel classes/class_students sudah ada di migrasi 002; di sini menambah kolom `code`
-- dan dua fungsi: join_class_by_code (siswa self-enroll) + regenerate_class_code (guru).

-- =========================
-- Generator kode kelas
-- =========================
-- 6 karakter dari himpunan tanpa karakter ambigu (tanpa I, O, 0, 1).
-- Volatile (random) → dievaluasi ulang tiap pemanggilan. Loop sampai unik.
create or replace function public.generate_class_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text;
  v_exists boolean;
  i int;
begin
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars))::int + 1, 1);
    end loop;
    select exists(select 1 from public.classes where code = v_code) into v_exists;
    exit when not v_exists;
  end loop;
  return v_code;
end;
$$;

revoke all on function public.generate_class_code() from public;
grant execute on function public.generate_class_code() to authenticated;

-- =========================
-- Kolom code di classes
-- =========================
alter table public.classes add column code text;

-- Backfill baris lama satu per satu agar tiap baris dapat kode unik
-- (UPDATE massal bisa bentrok karena cek keunikan belum melihat baris lain di statement yang sama).
do $$
declare
  r record;
begin
  for r in select id from public.classes where code is null loop
    update public.classes set code = public.generate_class_code() where id = r.id;
  end loop;
end;
$$;

alter table public.classes alter column code set not null;
alter table public.classes alter column code set default public.generate_class_code();
create unique index classes_code_idx on public.classes (code);

-- =========================
-- join_class_by_code: siswa bergabung lewat kode
-- =========================
-- SECURITY DEFINER karena RLS class_students hanya mengizinkan guru/admin insert.
-- Fungsi ini gerbang terkontrol: hanya siswa, hanya menambahkan dirinya sendiri.
create or replace function public.join_class_by_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_class public.classes;
begin
  if public.current_user_role() <> 'siswa' then
    return jsonb_build_object('ok', false, 'error', 'Hanya siswa yang dapat bergabung ke kelas');
  end if;

  select * into v_class
  from public.classes
  where upper(code) = upper(trim(p_code));

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Kode kelas tidak ditemukan');
  end if;

  insert into public.class_students (class_id, student_id)
  values (v_class.id, v_uid)
  on conflict (class_id, student_id) do nothing;

  return jsonb_build_object('ok', true, 'class_name', v_class.name);
end;
$$;

revoke all on function public.join_class_by_code(text) from public;
grant execute on function public.join_class_by_code(text) to authenticated;

-- =========================
-- regenerate_class_code: guru membuat ulang kode kelasnya
-- =========================
-- SECURITY INVOKER → RLS update (teacher_id = auth.uid() / admin) tetap berlaku,
-- jadi guru hanya bisa mengganti kode kelas miliknya sendiri.
create or replace function public.regenerate_class_code(p_class_id bigint)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_code text;
begin
  v_code := public.generate_class_code();
  update public.classes set code = v_code where id = p_class_id;
  if not found then
    raise exception 'Kelas tidak ditemukan atau tidak diizinkan';
  end if;
  return v_code;
end;
$$;

revoke all on function public.regenerate_class_code(bigint) from public;
grant execute on function public.regenerate_class_code(bigint) to authenticated;
