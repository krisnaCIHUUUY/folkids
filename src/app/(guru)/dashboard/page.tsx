import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  students,
  quizResults,
  contents,
  type GuruMetrics,
} from "@/lib/mock/guru-dashboard";
import { ContentSummaryCard } from "@/components/guru/content-summary-card";
import { ClassSection } from "@/components/guru/class-section";
import { StudentMonitoringSection } from "@/components/guru/student-monitoring-section";
import { QuizResultsSection } from "@/components/guru/quiz-results-section";
import { ContentSection } from "@/components/guru/content-section";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const name = user?.name ?? "Bu/Pak Guru";

  const supabase = await createClient();
  const [ceritaRes, kuisRes, kelasRes] = await Promise.all([
    supabase
      .from("stories")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user!.id),
    supabase
      .from("quizzes")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user!.id),
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

  const metrics: GuruMetrics = {
    ceritaDiunggah: ceritaRes.count ?? 0,
    kuisDibuat: kuisRes.count ?? 0,
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
