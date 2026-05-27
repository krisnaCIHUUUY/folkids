-- Classes & class_students: kelas yang dikelola guru + relasi siswa

create table public.classes (
  id bigint generated always as identity primary key,
  name text not null,
  grade_level text not null,
  teacher_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index classes_teacher_id_idx on public.classes (teacher_id);

create table public.class_students (
  id bigint generated always as identity primary key,
  class_id bigint not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create index class_students_student_id_idx on public.class_students (student_id);
create index class_students_class_id_idx on public.class_students (class_id);

alter table public.classes enable row level security;
alter table public.class_students enable row level security;
