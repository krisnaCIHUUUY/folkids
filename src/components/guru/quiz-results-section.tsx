import { ClipboardCheck } from "lucide-react";
import type { QuizResult } from "@/lib/mock/guru-dashboard";
import { QuizResultCard } from "@/components/guru/quiz-result-card";
import { WayangAccent } from "@/components/wayang-accent";

export function QuizResultsSection({ results }: { results: QuizResult[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="relative grid size-10 place-items-center overflow-hidden">
          <WayangAccent className="absolute inset-0 h-full w-full text-clay-lavender/30" />
          <span className="clay-sm relative grid size-10 place-items-center bg-clay-lavender text-clay-ink">
            <ClipboardCheck className="size-5" />
          </span>
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Hasil Asesmen
        </h2>
      </div>

      {results.length === 0 ? (
        <div className="clay mt-5 bg-white p-8 text-center font-semibold text-clay-ink/60">
          Belum ada kuis. Buat kuis di cerita untuk melihat hasil asesmen di sini.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {results.map((data) => (
            <QuizResultCard key={data.id} data={data} />
          ))}
        </div>
      )}
    </section>
  );
}
