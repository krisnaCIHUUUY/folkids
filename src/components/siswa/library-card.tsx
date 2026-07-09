import Link from "next/link";
import Image from "next/image";
import { MapPin, BookOpen } from "lucide-react";

const DIFFICULTY_LABEL: Record<string, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

export type LibraryStory = {
  id: number;
  title: string;
  region: string | null;
  difficulty: string;
  coverUrl: string | null;
  progress: number; // 0-100
  completed: boolean;
};

export function LibraryCard({ story }: { story: LibraryStory }) {
  const started = story.progress > 0 || story.completed;

  return (
    <article className="clay-sm group flex flex-col overflow-hidden bg-white p-3 transition hover:[transform:translateY(-4px)]">
      <div className="clay-inset relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-clay-mint to-clay-sky">
        {story.coverUrl ? (
          <Image src={story.coverUrl} alt={story.title} fill className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-4xl opacity-80">
            🎭
          </span>
        )}
        {story.region && (
          <span className="clay-sm absolute left-2.5 top-2.5 inline-flex items-center gap-1 bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-clay-ink">
            <MapPin className="size-3" />
            {story.region}
          </span>
        )}
        {story.completed && (
          <span className="clay-sm absolute right-2.5 top-2.5 bg-clay-sun px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-clay-ink">
            Selesai
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2">
        <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
          {story.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-clay-cream px-2.5 py-0.5 font-mono text-[10px] font-bold text-clay-ink/70">
            {DIFFICULTY_LABEL[story.difficulty] ?? story.difficulty}
          </span>
        </div>

        {started && !story.completed && (
          <div className="mt-3">
            <div className="clay-inset h-3 bg-clay-cream p-0.5">
              <div
                className="h-full rounded-full bg-clay-mint"
                style={{ width: `${story.progress}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[11px] font-bold text-clay-ink/55">
              {story.progress}% selesai
            </p>
          </div>
        )}

        <Link
          href={`/cerita/${story.id}`}
          className="clay-sm mt-3 inline-flex w-full items-center justify-center gap-1.5 bg-clay-rose py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <BookOpen className="size-4" />
          {started && !story.completed ? "Lanjutkan" : story.completed ? "Baca Ulang" : "Baca"}
        </Link>
      </div>
    </article>
  );
}
