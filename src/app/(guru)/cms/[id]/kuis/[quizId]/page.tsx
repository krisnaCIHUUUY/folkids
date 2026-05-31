import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  QuizQuestionsManager,
  type QuestionData,
} from "@/components/guru/quiz-questions-manager";
import type { QuestionType } from "@/lib/validations/quiz";

export default async function KelolaSoalPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId: quizIdParam } = await params;
  const storyId = Number(id);
  const quizId = Number(quizIdParam);
  if (!Number.isFinite(storyId) || !Number.isFinite(quizId)) notFound();

  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, story_id")
    .eq("id", quizId)
    .maybeSingle();

  if (!quiz || quiz.story_id !== storyId) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, order_number, question_text, question_type, options, correct_answer, score_weight")
    .eq("quiz_id", quizId)
    .order("order_number", { ascending: true });

  const list: QuestionData[] = (questions ?? []).map((q) => ({
    id: q.id,
    order_number: q.order_number,
    question_text: q.question_text,
    question_type: q.question_type as QuestionType,
    options: q.options,
    correct_answer: q.correct_answer,
    score_weight: q.score_weight,
  }));

  return (
    <div className="pt-6">
      <Link
        href={`/cms/${storyId}/kuis`}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar kuis
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Kelola Soal
      </h1>
      <p className="mt-1 font-semibold text-clay-ink/60">{quiz.title}</p>

      <QuizQuestionsManager storyId={storyId} quizId={quizId} questions={list} />
    </div>
  );
}
