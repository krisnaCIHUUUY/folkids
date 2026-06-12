-- Badge/lencana siswa.
--
-- Lencana di-AWARD OTOMATIS dari aktivitas siswa (baca cerita, kerjakan kuis,
-- main game) lewat trigger → fungsi evaluate_badges (SECURITY DEFINER) yang
-- menyisipkan ke student_badges (tabel ini TIDAK punya policy INSERT) lalu
-- fan-out notifikasi 'badge_baru'. Pola sama seperti create_assignment (00019).
--
-- Katalog lencana di-seed di sini (read-only untuk user). Syarat unlock bersifat
-- heterogen (count / distinct / threshold) sehingga logikanya tinggal di fungsi
-- evaluate_badges, dikunci per `code`; tabel badges hanya menyimpan metadata
-- tampilan.

-- ── Enum kategori ────────────────────────────────────────────────────────────
create type public.badge_category as enum ('membaca', 'kuis', 'game');

-- ── Tabel: badges (katalog) ──────────────────────────────────────────────────
create table public.badges (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  description text not null,
  emoji text not null,
  category public.badge_category not null,
  sort_order int not null default 0
);

alter table public.badges enable row level security;

-- Katalog dapat dibaca semua user terautentikasi. Tanpa policy tulis (di-seed).
create policy "badges_select_all" on public.badges
  for select to authenticated
  using (true);

-- ── Tabel: student_badges (lencana yang diperoleh siswa) ─────────────────────
create table public.student_badges (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.users(id) on delete cascade,
  badge_id bigint not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (student_id, badge_id)
);

create index student_badges_student_idx on public.student_badges (student_id);

alter table public.student_badges enable row level security;

-- SELECT: pemilik atau admin. TIDAK ADA policy INSERT/UPDATE → baris hanya
-- ditulis lewat fungsi SECURITY DEFINER evaluate_badges.
create policy "student_badges_select_owner_admin" on public.student_badges
  for select to authenticated
  using (student_id = auth.uid() or public.current_user_role() = 'admin');

-- ── Seed katalog ─────────────────────────────────────────────────────────────
insert into public.badges (code, name, description, emoji, category, sort_order) values
  ('pembaca_pemula',       'Pembaca Pemula',       'Selesaikan 1 cerita',               '📖', 'membaca', 1),
  ('kutu_buku',            'Kutu Buku',            'Selesaikan 5 cerita',               '📚', 'membaca', 2),
  ('penjelajah_nusantara', 'Penjelajah Nusantara', 'Baca cerita dari 5 daerah berbeda', '🗺️', 'membaca', 3),
  ('penguji_cerdik',       'Penguji Cerdik',       'Kerjakan 1 kuis',                   '✏️', 'kuis',    4),
  ('juara_kuis',           'Juara Kuis',           'Raih nilai sempurna di 1 kuis',     '🏆', 'kuis',    5),
  ('sang_ahli',            'Sang Ahli',            'Raih nilai sempurna di 3 kuis',     '🎓', 'kuis',    6),
  ('pemain_baru',          'Pemain Baru',          'Mainkan 1 game literasi',           '🎮', 'game',    7),
  ('serba_bisa',           'Serba Bisa',           'Mainkan ketiga jenis game',         '🌟', 'game',    8),
  ('pengumpul_poin',       'Pengumpul Poin',       'Kumpulkan 100 poin dari game',      '💎', 'game',    9);

-- ── Fungsi: evaluate_badges ──────────────────────────────────────────────────
-- Hitung statistik siswa, award lencana yang memenuhi syarat (idempoten via
-- ON CONFLICT), lalu kirim notifikasi 'badge_baru' untuk lencana yang BARU saja
-- diperoleh.
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
    on conflict (student_id, badge_id) do nothing
    returning badge_id
  )
  insert into public.notifications (user_id, type, title, body, link)
  select p_student, 'badge_baru', 'Lencana baru: ' || b.name, b.description, '/lencana'
  from ins
  join public.badges b on b.id = ins.badge_id;
end;
$$;

-- Hanya dipanggil oleh trigger internal & backfill (eksekusi trigger tak butuh
-- privilege EXECUTE). Cabut akses RPC dari anon & authenticated.
revoke all on function public.evaluate_badges(uuid) from public, anon, authenticated;

-- ── Trigger: evaluasi badge setelah aktivitas siswa ──────────────────────────
-- Satu wrapper generik (SECURITY DEFINER agar boleh memanggil evaluate_badges
-- dan menulis ke student_badges/notifications) dipakai oleh ketiga tabel sumber.
create or replace function public.trg_eval_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.evaluate_badges(NEW.student_id);
  return NEW;
end;
$$;

create trigger eval_badges_after_reading
  after insert or update of is_completed on public.reading_progress
  for each row when (NEW.is_completed)
  execute function public.trg_eval_badges();

create trigger eval_badges_after_quiz
  after insert on public.quiz_attempts
  for each row execute function public.trg_eval_badges();

create trigger eval_badges_after_game
  after insert on public.game_plays
  for each row execute function public.trg_eval_badges();

-- Trigger function tak perlu ter-ekspos sebagai RPC.
revoke all on function public.trg_eval_badges() from public, anon, authenticated;

-- ── Backfill ─────────────────────────────────────────────────────────────────
-- Award lencana retroaktif untuk siswa yang sudah memenuhi syarat sebelum fitur
-- ini ada. Notifikasi 'badge_baru' ikut terkirim sebagai sambutan.
select public.evaluate_badges(id) from public.users where role = 'siswa';
