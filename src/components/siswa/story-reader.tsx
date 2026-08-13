"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ListChecks, CheckCircle2 } from "lucide-react";
import { upsertReadingProgress } from "@/lib/actions/reading";
import { ReadAloudText } from "@/components/siswa/read-aloud";
import { VideoPlayer } from "@/components/ui/video-player";
import { PdfViewer } from "@/components/siswa/pdf-viewer";
import type { Json } from "@/types/database";

export type ReaderPage = {
  id: number;
  page_number: number;
  content: string;
  illustration_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  character_values: string | null;
  animation_data: Json | null;
};

type AnimState = { x: number; y: number; rotate: number; scale: number };
const DEFAULT_ANIM: AnimState = { x: 28, y: 0, rotate: 0, scale: 0.98 };

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function parseAnimation(data: Json | null): AnimState {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return DEFAULT_ANIM;
  }
  const d = data as Record<string, unknown>;
  return {
    x: num(d.x, DEFAULT_ANIM.x),
    y: num(d.y, DEFAULT_ANIM.y),
    rotate: num(d.rotate, DEFAULT_ANIM.rotate),
    scale: num(d.scale, DEFAULT_ANIM.scale),
  };
}

export type ReaderQuiz = { id: number; title: string; done: boolean };

function QuizSection({ quizzes }: { quizzes: ReaderQuiz[] }) {
  if (quizzes.length === 0) {
    return (
      <div className="clay mt-6 bg-white p-5">
        <p className="font-serif text-lg font-bold text-clay-ink">
          Ayo uji pemahamanmu!
        </p>
        <p className="mt-2 text-sm font-semibold text-clay-ink/60">
          Kuis untuk cerita ini belum tersedia.
        </p>
      </div>
    );
  }
  return (
    <div className="clay mt-6 bg-white p-5">
      <p className="font-serif text-lg font-bold text-clay-ink">
        Ayo uji pemahamanmu!
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {quizzes.map((q) => (
          <Link
            key={q.id}
            href={`/kuis/${q.id}`}
            className={`clay-sm inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-black transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] ${
              q.done
                ? "bg-clay-lavender text-clay-ink"
                : "bg-clay-mint text-white"
            }`}
          >
            {q.done ? (
              <>
                <CheckCircle2 className="size-4" /> {q.title} · Lihat Hasil
              </>
            ) : (
              <>
                <ListChecks className="size-4" /> {q.title}
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StoryReader({
  storyId,
  storyTitle,
  pages,
  quizzes,
  initialPageNumber,
  modulePdfUrl,
}: {
  storyId: number;
  storyTitle: string;
  pages: ReaderPage[];
  quizzes: ReaderQuiz[];
  initialPageNumber: number;
  modulePdfUrl?: string | null;
}) {
  const startIndex = Math.max(
    0,
    pages.findIndex((p) => p.page_number === initialPageNumber),
  );
  const [index, setIndex] = useState(startIndex === -1 ? 0 : startIndex);
  const [, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  const page = pages[index];
  const total = pages.length;
  const isLast = index === total - 1;

  function save(pageNumber: number, completed: boolean) {
    startTransition(async () => {
      await upsertReadingProgress(storyId, pageNumber, completed);
    });
  }

  function go(next: number) {
    if (next < 0 || next >= total) return;
    setIndex(next);
    save(pages[next].page_number, next === total - 1);
  }

  if (modulePdfUrl) {
    return (
      <div className="mt-6">
        <PdfViewer url={modulePdfUrl} title={storyTitle} />
        <QuizSection quizzes={quizzes} />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="clay-inset mt-6 bg-white p-8 text-center font-semibold text-clay-ink/60">
        Cerita ini belum memiliki halaman.
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Progress halaman */}
      <div className="flex items-center justify-between font-mono text-xs font-bold text-clay-ink/55">
        <span>
          Halaman {index + 1} dari {total}
        </span>
      </div>
      <div className="clay-inset mt-2 h-3 bg-clay-cream p-0.5">
        <div
          className="h-full rounded-full bg-clay-mint transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {(() => {
          const anim = parseAnimation(page.animation_data);
          return (
            <motion.article
              key={page.id}
              className="clay mt-5 bg-white p-5 md:p-8"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: anim.x, y: anim.y, rotate: anim.rotate, scale: anim.scale }
              }
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: "easeOut" }}
            >
              {page.illustration_url && (
                <motion.div
                  className="clay-inset relative mb-6 aspect-video w-full overflow-hidden bg-clay-cream"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
                >
                  <Image
                    src={page.illustration_url}
                    alt={`Ilustrasi halaman ${page.page_number}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </motion.div>
              )}

              {page.audio_url && (
                <audio controls src={page.audio_url} className="mb-6 w-full">
                  Browser-mu tidak mendukung pemutar audio.
                </audio>
              )}

              {page.video_url && (
                <VideoPlayer src={page.video_url} className="mb-6" />
              )}

              <ReadAloudText key={page.id} content={page.content} />

              {page.character_values && (
                <div className="clay-sm mt-6 flex items-start gap-3 bg-clay-sun/20 p-4">
                  <span className="clay-sm grid size-9 shrink-0 place-items-center bg-clay-sun text-clay-ink">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <p className="font-mono text-xs font-black uppercase tracking-wider text-clay-ink/60">
                      Nilai Karakter
                    </p>
                    <p className="mt-1 font-semibold text-clay-ink">{page.character_values}</p>
                  </div>
                </div>
              )}
            </motion.article>
          );
        })()}
      </AnimatePresence>

      {/* Navigasi */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="clay-sm inline-flex items-center gap-1.5 bg-white px-4 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-30"
        >
          <ChevronLeft className="size-4" /> Sebelumnya
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="clay-sm inline-flex items-center gap-1.5 bg-clay-rose px-4 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            Selanjutnya <ChevronRight className="size-4" />
          </button>
        ) : (
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-clay-mint">
            Selesai dibaca 🎉
          </span>
        )}
      </div>

      {isLast && <QuizSection quizzes={quizzes} />}
    </div>
  );
}
