import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  GuruMetrics,
  StudentParticipation,
  StudentStatus,
  QuizResult,
} from "@/lib/mock/guru-dashboard";
import { ContentSummaryCard } from "@/components/guru/content-summary-card";
import { ClassSection } from "@/components/guru/class-section";
import { StudentMonitoringSection } from "@/components/guru/student-monitoring-section";
import { QuizResultsSection } from "@/components/guru/quiz-results-section";
import {
  ContentSection,
  type DashboardContent,
} from "@/components/guru/content-section";
import {
  LiteracyTrendSection,
  type TrendMember,
  type TrendAttempt,
  type TrendReading,
} from "@/components/guru/literacy-trend-section";

const DIFFICULTY_LABEL: Record<string, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const name = user?.name ?? "Bu/Pak Guru";

  const supabase = await createClient();
  const [ceritaRes, kuisRes, kelasRes, siswaRes, attemptsRes, readingRes] =
    await Promise.all([
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
    // Siswa di kelas guru (RLS: hanya keanggotaan kelas milik guru).
    supabase.from("class_students").select("student_id, class_id, users(name)"),
    // Attempt kuis siswa di kelas guru (RLS membatasi ke siswa kelasnya).
    supabase
      .from("quiz_attempts")
      .select("quiz_id, student_id, total_score, max_score, completed_at"),
    // Progres baca siswa di kelas guru.
    supabase
      .from("reading_progress")
      .select("student_id, is_completed, completed_at"),
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

  // ===== Monitoring siswa & hasil kuis (data nyata) =====
  const pct = (score: number, max: number) =>
    max > 0 ? Math.round((score / max) * 100) : 0;

  // Kuis milik guru (judul + cerita induk).
  const guruQuizzes = (kuisRes.data ?? []).map((q) => {
    const story = Array.isArray(q.stories) ? q.stories[0] : q.stories;
    return { id: q.id, title: q.title, storyTitle: story?.title ?? "Cerita" };
  });
  const quizIdSet = new Set(guruQuizzes.map((q) => q.id));

  // Siswa unik di kelas guru.
  const studentName = new Map<string, string>();
  for (const r of siswaRes.data ?? []) {
    const u = (Array.isArray(r.users) ? r.users[0] : r.users) as { name: string } | null;
    if (!studentName.has(r.student_id)) {
      studentName.set(r.student_id, u?.name ?? "Siswa");
    }
  }
  const totalStudents = studentName.size;

  // Attempt hanya untuk kuis milik guru.
  const attempts = (attemptsRes.data ?? []).filter((a) => quizIdSet.has(a.quiz_id));

  const attemptsByStudent = new Map<string, { title: string; pct: number }[]>();
  const attemptsByQuiz = new Map<number, { students: Set<string>; pcts: number[] }>();
  const quizTitleById = new Map(guruQuizzes.map((q) => [q.id, q.title]));
  for (const a of attempts) {
    const p = pct(a.total_score, a.max_score);
    const list = attemptsByStudent.get(a.student_id) ?? [];
    list.push({ title: quizTitleById.get(a.quiz_id) ?? "Kuis", pct: p });
    attemptsByStudent.set(a.student_id, list);

    const agg = attemptsByQuiz.get(a.quiz_id) ?? { students: new Set<string>(), pcts: [] };
    agg.students.add(a.student_id);
    agg.pcts.push(p);
    attemptsByQuiz.set(a.quiz_id, agg);
  }

  const readingByStudent = new Map<string, { started: number; completed: number }>();
  for (const r of readingRes.data ?? []) {
    const cur = readingByStudent.get(r.student_id) ?? { started: 0, completed: 0 };
    cur.started += 1;
    if (r.is_completed) cur.completed += 1;
    readingByStudent.set(r.student_id, cur);
  }

  const studentList: StudentParticipation[] = [...studentName.entries()].map(
    ([sid, sname]) => {
      const sAttempts = attemptsByStudent.get(sid) ?? [];
      const avgScore = sAttempts.length
        ? Math.round(sAttempts.reduce((s, x) => s + x.pct, 0) / sAttempts.length)
        : 0;
      const distinctQuizzes = new Set(
        attempts.filter((a) => a.student_id === sid).map((a) => a.quiz_id),
      ).size;
      const completion =
        guruQuizzes.length > 0
          ? Math.round((distinctQuizzes / guruQuizzes.length) * 100)
          : 0;
      const reading = readingByStudent.get(sid);
      const hasActivity = sAttempts.length > 0 || (reading?.started ?? 0) > 0;

      let status: StudentStatus = "active";
      if (!hasActivity) status = "inactive";
      else if (sAttempts.length > 0 && avgScore < 60) status = "at-risk";

      const recentActivity =
        sAttempts.length > 0
          ? sAttempts.slice(-3).reverse().map((x) => `Kuis ${x.title}: ${x.pct}%`)
          : reading && reading.started > 0
            ? [`Membaca cerita (${reading.completed} selesai)`]
            : ["Belum ada aktivitas"];

      return { id: sid, name: sname, status, completion, avgScore, recentActivity };
    },
  );

  const quizResultList: QuizResult[] = guruQuizzes.map((q) => {
    const agg = attemptsByQuiz.get(q.id);
    const pcts = agg?.pcts ?? [];
    const submitted = agg?.students.size ?? 0;
    return {
      id: `quiz-${q.id}`,
      title: q.title,
      className: q.storyTitle,
      status: totalStudents > 0 && submitted >= totalStudents ? "closed" : "in-progress",
      submitted,
      total: totalStudents,
      avg: pcts.length ? Math.round(pcts.reduce((s, x) => s + x, 0) / pcts.length) : 0,
      highest: pcts.length ? Math.max(...pcts) : 0,
      lowest: pcts.length ? Math.min(...pcts) : 0,
    };
  });

  // ===== Tren progres literasi (8 minggu) =====
  const trendClasses = kelasList.map((c) => ({ id: c.id, name: c.name }));
  const trendMembers: TrendMember[] = (siswaRes.data ?? []).map((r) => {
    const u = (Array.isArray(r.users) ? r.users[0] : r.users) as { name: string } | null;
    return { classId: r.class_id, studentId: r.student_id, name: u?.name ?? "Siswa" };
  });
  const trendAttempts: TrendAttempt[] = attempts.map((a) => ({
    studentId: a.student_id,
    completedAt: a.completed_at,
    pct: pct(a.total_score, a.max_score),
  }));
  const trendReadings: TrendReading[] = (readingRes.data ?? [])
    .filter((r) => r.completed_at)
    .map((r) => ({ studentId: r.student_id, completedAt: r.completed_at }));

  const metrics: GuruMetrics = {
    ceritaDiunggah: storyContents.length,
    kuisDibuat: quizContents.length,
    kelasAktif: kelasList.length,
  };

  return (
    <div className="pt-2">
      <ContentSummaryCard name={name} metrics={metrics} />
      <ClassSection classes={kelasList} />
      <LiteracyTrendSection
        classes={trendClasses}
        members={trendMembers}
        attempts={trendAttempts}
        readings={trendReadings}
      />
      <StudentMonitoringSection students={studentList} />
      <QuizResultsSection results={quizResultList} />
      <ContentSection contents={contents} />
    </div>
  );
}
