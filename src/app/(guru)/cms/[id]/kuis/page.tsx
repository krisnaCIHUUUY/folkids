import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuizManager, type QuizData } from "@/components/guru/quiz-manager";

export default async function KelolaKuisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storyId = Number(id);
  if (!Number.isFinite(storyId)) notFound();

  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("id, title")
    .eq("id", storyId)
    .maybeSingle();

  if (!story) notFound();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, time_limit_minutes, quiz_questions(count)")
    .eq("story_id", storyId)
    .order("created_at", { ascending: true });

  const list: QuizData[] = (quizzes ?? []).map((q) => {
    const countRow = Array.isArray(q.quiz_questions) ? q.quiz_questions[0] : q.quiz_questions;
    const questionCount = (countRow as { count: number } | undefined)?.count ?? 0;
    return {
      id: q.id,
      title: q.title,
      time_limit_minutes: q.time_limit_minutes,
      questionCount,
    };
  });

  return (
    <div className="pt-6">
      <Link
        href="/cms"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Kelola Kuis
      </h1>
      <p className="mt-1 font-semibold text-clay-ink/60">{story.title}</p>

      <QuizManager storyId={storyId} quizzes={list} />
    </div>
  );
}
