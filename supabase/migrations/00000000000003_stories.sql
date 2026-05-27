-- Stories & story_pages: master cerita + konten per halaman

create type public.difficulty as enum ('mudah', 'sedang', 'sulit');

create table public.stories (
  id bigint generated always as identity primary key,
  title text not null,
  synopsis text,
  cover_image_url text,
  region_origin text,
  character_theme text,
  difficulty public.difficulty not null default 'mudah',
  created_by uuid not null references public.users(id) on delete restrict,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stories_created_by_idx on public.stories (created_by);
create index stories_is_published_idx on public.stories (is_published);
create index stories_difficulty_idx on public.stories (difficulty);

create table public.story_pages (
  id bigint generated always as identity primary key,
  story_id bigint not null references public.stories(id) on delete cascade,
  page_number int not null,
  content text not null,
  illustration_url text,
  audio_url text,
  animation_data jsonb,
  character_values text,
  created_at timestamptz not null default now(),
  unique (story_id, page_number)
);

create index story_pages_story_id_idx on public.story_pages (story_id);

alter table public.stories enable row level security;
alter table public.story_pages enable row level security;
