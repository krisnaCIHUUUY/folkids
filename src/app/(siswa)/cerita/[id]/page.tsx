import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  StoryReader,
  type ReaderPage,
  type ReaderQuiz,
} from "@/components/siswa/story-reader";

export default async function CeritaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storyId = Number(id);
  if (!Number.isFinite(storyId)) notFound();

  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("id, title")
    .eq("id", storyId)
    .maybeSingle();

  if (!story) notFound();

  const [pagesRes, quizzesRes, progressRes, attemptsRes] = await Promise.all([
    supabase
      .from("story_pages")
      .select("id, page_number, content, illustration_url, audio_url, character_values")
      .eq("story_id", storyId)
      .order("page_number", { ascending: true }),
    supabase.from("quizzes").select("id, title").eq("story_id", storyId),
    supabase
      .from("reading_progress")
      .select("last_page_read")
      .eq("student_id", user!.id)
      .eq("story_id", storyId)
      .maybeSingle(),
    supabase.from("quiz_attempts").select("quiz_id").eq("student_id", user!.id),
  ]);

  const pages = (pagesRes.data ?? []) as ReaderPage[];
  const attemptedQuizzes = new Set((attemptsRes.data ?? []).map((a) => a.quiz_id));
  const quizzes: ReaderQuiz[] = (quizzesRes.data ?? []).map((q) => ({
    id: q.id,
    title: q.title,
    done: attemptedQuizzes.has(q.id),
  }));
  const initialPageNumber = progressRes.data?.last_page_read ?? 1;

  return (
    <div className="pt-6">
      <Link
        href="/perpustakaan"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke perpustakaan
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        {story.title}
      </h1>

      <StoryReader
        storyId={storyId}
        pages={pages}
        quizzes={quizzes}
        initialPageNumber={initialPageNumber}
      />
    </div>
  );
}
