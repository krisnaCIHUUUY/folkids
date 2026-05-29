import { MapPin } from "lucide-react";
import type { DashboardStory } from "@/lib/mock/siswa-dashboard";

export function StoryCard({ story }: { story: DashboardStory }) {
  return (
    <article className="clay-sm group flex flex-col overflow-hidden bg-white p-3 transition hover:[transform:translateY(-4px)]">
      <div
        className={`clay-inset relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${story.cover}`}
      >
        <span className="clay-sm absolute left-2.5 top-2.5 inline-flex items-center gap-1 bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-clay-ink">
          <MapPin className="size-3" />
          {story.region}
        </span>
        {story.variant === "assigned" && (
          <span className="clay-sm absolute right-2.5 top-2.5 bg-clay-rose px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-white">
            Ditugaskan
          </span>
        )}
        <span className="absolute bottom-2 right-2 text-4xl opacity-80">🎭</span>
      </div>

      <div className="flex flex-1 flex-col p-2">
        <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
          {story.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {story.characterTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-clay-cream px-2.5 py-0.5 font-mono text-[10px] font-bold text-clay-ink/70"
            >
              {tag}
            </span>
          ))}
        </div>

        {story.variant === "in-progress" ? (
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
        ) : null}

        <button
          type="button"
          className="clay-sm mt-3 w-full bg-clay-rose py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          {story.variant === "in-progress" ? "Lanjutkan" : "Baca"}
        </button>
      </div>
    </article>
  );
}
