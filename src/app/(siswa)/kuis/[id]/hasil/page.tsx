import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { QuizResult, type ResultItem } from "@/components/siswa/quiz-result";
import type { QuestionType } from "@/lib/validations/quiz";

export default async function HasilKuisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quizId = Number(id);
  if (!Number.isFinite(quizId)) notFound();

  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, story_id")
    .eq("id", quizId)
    .maybeSingle();

  if (!quiz) notFound();

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("answers, total_score, max_score")
    .eq("quiz_id", quizId)
    .eq("student_id", user!.id)
    .maybeSingle();

  // Belum pernah mengerjakan → arahkan ke pengerjaan.
  if (!attempt) redirect(`/kuis/${quizId}`);

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
        href={`/cerita/${quiz.story_id}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke cerita
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Hasil: {quiz.title}
      </h1>

      <QuizResult
        totalScore={attempt.total_score}
        maxScore={attempt.max_score}
        items={items}
      />

      <div className="mt-6">
        <Link
          href="/perpustakaan"
          className="clay-sm inline-flex items-center gap-1.5 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          Jelajahi cerita lain
        </Link>
      </div>
    </div>
  );
}
