-- Reading progress: tracking progres baca siswa per cerita

create table public.reading_progress (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.users(id) on delete cascade,
  story_id bigint not null references public.stories(id) on delete cascade,
  last_page_read int not null default 0,
  is_completed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, story_id)
);

create index reading_progress_student_id_idx on public.reading_progress (student_id);
create index reading_progress_story_id_idx on public.reading_progress (story_id);

alter table public.reading_progress enable row level security;
