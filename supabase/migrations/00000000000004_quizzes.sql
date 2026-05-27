-- Quizzes, quiz_questions, quiz_attempts

create type public.question_type as enum (
  'pilihan_ganda',
  'benar_salah',
  'isian',
  'mencocokkan'
);

create table public.quizzes (
  id bigint generated always as identity primary key,
  story_id bigint not null references public.stories(id) on delete cascade,
  title text not null,
  time_limit_minutes int not null default 0,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index quizzes_story_id_idx on public.quizzes (story_id);
create index quizzes_created_by_idx on public.quizzes (created_by);

create table public.quiz_questions (
  id bigint generated always as identity primary key,
  quiz_id bigint not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  question_type public.question_type not null,
  options jsonb,
  correct_answer text not null,
  score_weight int not null default 1,
  order_number int not null,
  unique (quiz_id, order_number)
);

create index quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);

create table public.quiz_attempts (
  id bigint generated always as identity primary key,
  quiz_id bigint not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  total_score int not null default 0,
  max_score int not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index quiz_attempts_quiz_id_idx on public.quiz_attempts (quiz_id);
create index quiz_attempts_student_id_idx on public.quiz_attempts (student_id);

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
