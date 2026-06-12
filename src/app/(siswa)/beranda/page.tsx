import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { type DashboardMetrics } from "@/lib/mock/siswa-dashboard";
import { getMyBadges } from "@/lib/badges";
import type { GameKey } from "@/lib/games/config";
import { ProgressSummaryCard } from "@/components/siswa/progress-summary-card";
import { AssignedTaskSection } from "@/components/siswa/assigned-task-section";
import type { StudentTask } from "@/components/siswa/task-card";
import { StoryCardGrid } from "@/components/siswa/story-card-grid";
import type { LibraryStory } from "@/components/siswa/library-card";
import { GameCardRow } from "@/components/siswa/game-card-row";
import { BadgeCollection } from "@/components/siswa/badge-collection";

const STORY_GRID_LIMIT = 8;
const TASK_LIMIT = 6;

export default async function BerandaPage() {
  const user = await getCurrentUser();
  const firstName = user?.name.split(" ")[0] ?? "Siswa";

  const supabase = await createClient();
  // RLS otomatis membatasi siswa ke konten published & milik sendiri.
  const [
    storiesRes,
    pagesRes,
    progressRes,
    attemptsRes,
    gamePlaysRes,
    assignmentsRes,
    myBadges,
  ] = await Promise.all([
    supabase
      .from("stories")
      .select("id, title, region_origin, difficulty, cover_image_url")
      .order("created_at", { ascending: false }),
    supabase.from("story_pages").select("story_id"),
    supabase
      .from("reading_progress")
      .select("story_id, last_page_read, is_completed")
      .eq("student_id", user!.id),
    supabase.from("quiz_attempts").select("quiz_id").eq("student_id", user!.id),
    supabase.from("game_plays").select("game, points").eq("student_id", user!.id),
    // RLS membatasi assignments ke kelas tempat siswa tergabung.
    supabase
      .from("assignments")
      .select("id, kind, title, due_at, story_id, quiz_id, stories(title), quizzes(title)")
      .order("due_at", { ascending: true, nullsFirst: false }),
    // Katalog lencana + status perolehan siswa (RLS membatasi ke milik sendiri).
    getMyBadges(),
  ]);

  const stories = storiesRes.data ?? [];

  const pageCount = new Map<number, number>();
  for (const p of pagesRes.data ?? []) {
    pageCount.set(p.story_id, (pageCount.get(p.story_id) ?? 0) + 1);
  }

  const progressByStory = new Map(
    (progressRes.data ?? []).map((r) => [r.story_id, r]),
  );
  const attemptedQuizzes = new Set(
    (attemptsRes.data ?? []).map((a) => a.quiz_id),
  );

  // "Cerita untukmu": cerita published terbaru + progress baca siswa.
  const storyGrid: LibraryStory[] = stories.slice(0, STORY_GRID_LIMIT).map((s) => {
    const prog = progressByStory.get(s.id);
    const total = pageCount.get(s.id) ?? 0;
    const percent = prog?.is_completed
      ? 100
      : prog && total > 0
        ? Math.min(100, Math.round((prog.last_page_read / total) * 100))
        : 0;
    return {
      id: s.id,
      title: s.title,
      region: s.region_origin,
      difficulty: s.difficulty,
      coverUrl: s.cover_image_url,
      progress: percent,
      completed: prog?.is_completed ?? false,
    };
  });

  // "Tugas untukmu": tugas nyata dari guru untuk kelas siswa. Status selesai
  // dihitung dari progres baca (cerita selesai) / percobaan kuis (sudah dikerjakan).
  const completedStories = new Set(
    (progressRes.data ?? []).filter((p) => p.is_completed).map((p) => p.story_id),
  );

  const embeddedTitle = (rel: { title: string } | { title: string }[] | null) =>
    !rel ? "" : Array.isArray(rel) ? (rel[0]?.title ?? "") : rel.title;

  const tasks: StudentTask[] = (assignmentsRes.data ?? [])
    .map((a) => {
      const done =
        a.kind === "baca"
          ? a.story_id != null && completedStories.has(a.story_id)
          : a.quiz_id != null && attemptedQuizzes.has(a.quiz_id);
      return {
        id: `tugas-${a.id}`,
        kind: a.kind,
        title: a.title,
        contentTitle:
          a.kind === "baca" ? embeddedTitle(a.stories) : embeddedTitle(a.quizzes),
        href:
          a.kind === "baca" ? `/cerita/${a.story_id}` : `/kuis/${a.quiz_id}`,
        dueAt: a.due_at,
        done,
      };
    })
    // Belum selesai dulu, lalu yang sudah selesai.
    .sort((x, y) => Number(x.done) - Number(y.done))
    .slice(0, TASK_LIMIT);

  // Metrik nyata dari data siswa (menggantikan angka mock).
  const gamePlays = gamePlaysRes.data ?? [];
  const playedGames = [...new Set(gamePlays.map((g) => g.game))] as GameKey[];
  const metrics: DashboardMetrics = {
    ceritaDibaca: (progressRes.data ?? []).filter((p) => p.is_completed).length,
    gameDimainkan: gamePlays.length,
    totalPoin: gamePlays.reduce((sum, g) => sum + (g.points ?? 0), 0),
  };

  return (
    <>
      <ProgressSummaryCard name={firstName} metrics={metrics} />
      <AssignedTaskSection tasks={tasks} />
      <StoryCardGrid stories={storyGrid} />
      <GameCardRow played={playedGames} />
      <BadgeCollection badges={myBadges} />
    </>
  );
}
