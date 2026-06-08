import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { badges, type DashboardMetrics } from "@/lib/mock/siswa-dashboard";
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
  const [storiesRes, pagesRes, progressRes, quizzesRes, attemptsRes, gamePlaysRes] =
    await Promise.all([
      supabase
        .from("stories")
        .select("id, title, region_origin, difficulty, cover_image_url")
        .order("created_at", { ascending: false }),
      supabase.from("story_pages").select("story_id"),
      supabase
        .from("reading_progress")
        .select("story_id, last_page_read, is_completed")
        .eq("student_id", user!.id),
      supabase.from("quizzes").select("id, title, story_id"),
      supabase.from("quiz_attempts").select("quiz_id").eq("student_id", user!.id),
      supabase.from("game_plays").select("game, points").eq("student_id", user!.id),
    ]);

  const stories = storiesRes.data ?? [];
  const storyTitle = new Map(stories.map((s) => [s.id, s.title]));

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

  // "Tugas untukmu" (diturunkan): lanjut baca cerita yang belum selesai +
  // kerjakan kuis dari cerita yang sudah selesai dibaca tapi belum dikerjakan.
  const bacaTasks: StudentTask[] = (progressRes.data ?? [])
    .filter((p) => !p.is_completed && p.last_page_read > 0 && storyTitle.has(p.story_id))
    .map((p) => ({
      id: `baca-${p.story_id}`,
      kind: "baca" as const,
      storyTitle: storyTitle.get(p.story_id)!,
      href: `/cerita/${p.story_id}`,
    }));

  const completedStories = new Set(
    (progressRes.data ?? []).filter((p) => p.is_completed).map((p) => p.story_id),
  );
  const kuisTasks: StudentTask[] = (quizzesRes.data ?? [])
    .filter((q) => completedStories.has(q.story_id) && !attemptedQuizzes.has(q.id))
    .map((q) => ({
      id: `kuis-${q.id}`,
      kind: "kuis" as const,
      storyTitle: storyTitle.get(q.story_id) ?? q.title,
      href: `/kuis/${q.id}`,
    }));

  const tasks = [...bacaTasks, ...kuisTasks].slice(0, TASK_LIMIT);

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
      <BadgeCollection badges={badges} />
    </>
  );
}
