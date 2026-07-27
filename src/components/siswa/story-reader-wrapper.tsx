"use client";

import dynamic from "next/dynamic";
import type { ReaderPage, ReaderQuiz } from "./story-reader";

const StoryReader = dynamic(() => import("./story-reader").then((m) => m.StoryReader), {
  ssr: false,
  loading: () => (
    <div className="clay-inset mt-6 bg-white p-8 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="size-5 animate-spin rounded-full border-2 border-clay-ink/20 border-t-clay-rose" />
        <span className="text-sm font-semibold text-clay-ink/60">Memuat cerita…</span>
      </div>
    </div>
  ),
});

export function StoryReaderWrapper({
  storyId,
  pages,
  quizzes,
  initialPageNumber,
}: {
  storyId: number;
  pages: ReaderPage[];
  quizzes: ReaderQuiz[];
  initialPageNumber: number;
}) {
  return (
    <StoryReader
      storyId={storyId}
      pages={pages}
      quizzes={quizzes}
      initialPageNumber={initialPageNumber}
    />
  );
}
