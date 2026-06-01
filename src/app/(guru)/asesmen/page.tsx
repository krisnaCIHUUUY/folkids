import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  RekapAsesmen,
  type RekapQuiz,
  type RekapMember,
  type RekapAttempt,
} from "@/components/guru/rekap-asesmen";

export default async function AsesmenPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [kuisRes, kelasRes, siswaRes, attemptsRes] = await Promise.all([
    supabase
      .from("quizzes")
      .select("id, title")
      .eq("created_by", user!.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("classes")
      .select("id, name")
      .order("created_at", { ascending: true }),
    supabase.from("class_students").select("student_id, class_id, users(name)"),
    supabase
      .from("quiz_attempts")
      .select("student_id, quiz_id, total_score, max_score"),
  ]);

  const pct = (score: number, max: number) =>
    max > 0 ? Math.round((score / max) * 100) : 0;

  const quizzes: RekapQuiz[] = (kuisRes.data ?? []).map((q) => ({
    id: q.id,
    title: q.title,
  }));
  const quizIdSet = new Set(quizzes.map((q) => q.id));

  const classes = (kelasRes.data ?? []).map((c) => ({ id: c.id, name: c.name }));

  const members: RekapMember[] = (siswaRes.data ?? []).map((r) => {
    const u = (Array.isArray(r.users) ? r.users[0] : r.users) as { name: string } | null;
    return { classId: r.class_id, studentId: r.student_id, name: u?.name ?? "Siswa" };
  });

  const attempts: RekapAttempt[] = (attemptsRes.data ?? [])
    .filter((a) => quizIdSet.has(a.quiz_id))
    .map((a) => ({
      studentId: a.student_id,
      quizId: a.quiz_id,
      pct: pct(a.total_score, a.max_score),
    }));

  return (
    <div className="pt-2">
      <RekapAsesmen
        classes={classes}
        quizzes={quizzes}
        members={members}
        attempts={attempts}
      />
    </div>
  );
}
