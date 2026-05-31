import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  students,
  quizResults,
  type GuruMetrics,
} from "@/lib/mock/guru-dashboard";
import { ContentSummaryCard } from "@/components/guru/content-summary-card";
import { ClassSection } from "@/components/guru/class-section";
import { StudentMonitoringSection } from "@/components/guru/student-monitoring-section";
import { QuizResultsSection } from "@/components/guru/quiz-results-section";
import {
  ContentSection,
  type DashboardContent,
} from "@/components/guru/content-section";

const DIFFICULTY_LABEL: Record<string, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const name = user?.name ?? "Bu/Pak Guru";

  const supabase = await createClient();
  const [ceritaRes, kuisRes, kelasRes] = await Promise.all([
    // Cerita milik guru + jumlah halaman.
    supabase
      .from("stories")
      .select(
        "id, title, region_origin, character_theme, difficulty, is_published, updated_at, story_pages(count)",
      )
      .eq("created_by", user!.id)
      .order("updated_at", { ascending: false }),
    // Kuis milik guru + jumlah soal + info cerita induk.
    supabase
      .from("quizzes")
      .select("id, title, story_id, created_at, quiz_questions(count), stories(title, is_published)")
      .eq("created_by", user!.id)
      .order("created_at", { ascending: false }),
    // Daftar kelas + jumlah siswa (RLS membatasi ke kelas milik guru).
    supabase
      .from("classes")
      .select("id, name, grade_level, code, class_students(count)")
      .order("created_at", { ascending: false }),
  ]);

  const kelasList = (kelasRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade_level: c.grade_level,
    code: c.code,
    studentCount: c.class_students?.[0]?.count ?? 0,
  }));

  const storyContents: DashboardContent[] = (ceritaRes.data ?? []).map((s) => {
    const pageCount = s.story_pages?.[0]?.count ?? 0;
    const tags = [DIFFICULTY_LABEL[s.difficulty] ?? s.difficulty];
    if (s.character_theme) tags.push(s.character_theme);
    return {
      id: `story-${s.id}`,
      title: s.title,
      type: "story",
      published: s.is_published,
      meta: `${s.region_origin ?? "Tanpa daerah"} · ${pageCount} halaman`,
      tags,
      href: `/cms/${s.id}/edit`,
      storyId: s.id,
    };
  });

  const quizContents: DashboardContent[] = (kuisRes.data ?? []).map((q) => {
    const story = Array.isArray(q.stories) ? q.stories[0] : q.stories;
    const questionCount = q.quiz_questions?.[0]?.count ?? 0;
    return {
      id: `quiz-${q.id}`,
      title: q.title,
      type: "quiz",
      published: story?.is_published ?? false,
      meta: `${questionCount} soal · ${story?.title ?? "Cerita"}`,
      tags: ["Asesmen"],
      href: `/cms/${q.story_id}/kuis/${q.id}`,
    };
  });

  const contents = [...storyContents, ...quizContents];

  const metrics: GuruMetrics = {
    ceritaDiunggah: storyContents.length,
    kuisDibuat: quizContents.length,
    kelasAktif: kelasList.length,
  };

  return (
    <div className="pt-2">
      <ContentSummaryCard name={name} metrics={metrics} />
      <ClassSection classes={kelasList} />
      <StudentMonitoringSection students={students} />
      <QuizResultsSection results={quizResults} />
      <ContentSection contents={contents} />
    </div>
  );
}
