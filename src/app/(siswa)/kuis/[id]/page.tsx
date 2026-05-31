import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ListChecks, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { QuizRunner, type RunnerQuestion } from "@/components/siswa/quiz-runner";
import type { QuestionType } from "@/lib/validations/quiz";

export default async function KuisPage({
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
    .select("id, title, time_limit_minutes")
    .eq("id", quizId)
    .maybeSingle();

  if (!quiz) notFound();

  // Sekali saja: bila sudah pernah dikerjakan, langsung ke hasil.
  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("id")
    .eq("quiz_id", quizId)
    .eq("student_id", user!.id)
    .maybeSingle();

  if (attempt) redirect(`/kuis/${quizId}/hasil`);

  // Penting: TANPA correct_answer agar kunci jawaban tak sampai ke browser.
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, order_number, question_text, question_type, options")
    .eq("quiz_id", quizId)
    .order("order_number", { ascending: true });

  const list = (questions ?? []).map((q) => ({
    id: q.id,
    order_number: q.order_number,
    question_text: q.question_text,
    question_type: q.question_type as QuestionType,
    options: q.options,
  })) satisfies RunnerQuestion[];

  return (
    <div className="pt-6">
      <Link
        href="/perpustakaan"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke perpustakaan
      </Link>
      <div className="mt-3 flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-mint text-white">
          <ListChecks className="size-5" />
        </span>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
          {quiz.title}
        </h1>
      </div>
      <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-clay-ink/55">
        <Clock className="size-3.5" />
        {quiz.time_limit_minutes > 0
          ? `${quiz.time_limit_minutes} menit`
          : "Tanpa batas waktu"}{" "}
        · {list.length} soal · kesempatan sekali
      </p>

      {list.length === 0 ? (
        <div className="clay-inset mt-6 bg-white p-8 text-center font-semibold text-clay-ink/60">
          Kuis ini belum memiliki soal.
        </div>
      ) : (
        <QuizRunner quizId={quizId} questions={list} />
      )}
    </div>
  );
}
