import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuizResult, type ResultItem } from "@/components/siswa/quiz-result";
import type { QuestionType } from "@/lib/validations/quiz";

export default async function RekapDetailPage({
  params,
}: {
  params: Promise<{ quizId: string; studentId: string }>;
}) {
  const { quizId: quizIdRaw, studentId } = await params;
  const quizId = Number(quizIdRaw);
  if (!Number.isFinite(quizId)) notFound();

  const supabase = await createClient();

  // RLS membatasi ke kuis milik guru → null bila di luar scope.
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("id", quizId)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("answers, total_score, max_score, users(name)")
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (!attempt) notFound();

  const studentName =
    ((Array.isArray(attempt.users) ? attempt.users[0] : attempt.users) as
      | { name: string }
      | null)?.name ?? "Siswa";

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, order_number, question_text, question_type, options, correct_answer")
    .eq("quiz_id", quizId)
    .order("order_number", { ascending: true });

  const answers = (attempt.answers ?? {}) as Record<string, unknown>;
  const items: ResultItem[] = (questions ?? []).map((q) => ({
    id: q.id,
    order_number: q.order_number,
    question_text: q.question_text,
    question_type: q.question_type as QuestionType,
    options: q.options,
    correct_answer: q.correct_answer,
    studentAnswer: answers[String(q.id)],
  }));

  return (
    <div className="pt-6">
      <Link
        href="/asesmen"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke rekap
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Rekap: {studentName}
      </h1>
      <p className="mt-1 font-semibold text-clay-ink/60">{quiz.title}</p>

      <QuizResult
        totalScore={attempt.total_score}
        maxScore={attempt.max_score}
        items={items}
        scoreLabel="Skor Siswa"
        answerLabel="Jawaban siswa:"
      />
    </div>
  );
}
