import Link from "next/link";
import { BookOpen, HelpCircle, ChevronRight } from "lucide-react";
import { PublishToggle } from "@/components/guru/publish-toggle";
import type { DashboardContent } from "@/components/guru/content-section";

export function ContentCard({ data }: { data: DashboardContent }) {
  const Icon = data.type === "story" ? BookOpen : HelpCircle;

  return (
    <article className="clay-sm flex flex-col gap-3 bg-white p-5 transition hover:[transform:translateY(-4px)]">
      <div className="flex items-start gap-3">
        <span
          className={`clay-sm grid size-11 shrink-0 place-items-center text-white ${
            data.type === "story" ? "bg-clay-sun" : "bg-clay-lavender"
          }`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
            {data.title}
          </h3>
          <span
            className={`clay-sm mt-1 inline-block px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider ${
              data.type === "story"
                ? data.published
                  ? "bg-clay-mint/30 text-clay-ink"
                  : "bg-clay-ink/10 text-clay-ink/60"
                : "bg-clay-lavender/40 text-clay-ink"
            }`}
          >
            {data.type === "story"
              ? data.published
                ? "Terbit"
                : "Draf"
              : "Kuis"}
          </span>
        </div>
      </div>

      <p className="font-mono text-xs font-semibold text-clay-ink/60">{data.meta}</p>

      <div className="flex flex-wrap gap-1.5">
        {data.tags.map((tag) => (
          <span
            key={tag}
            className="clay-sm bg-clay-cream px-2.5 py-1 text-xs font-bold text-clay-ink/70"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-clay-ink/10 pt-3">
        {data.type === "story" && data.storyId != null ? (
          <PublishToggle storyId={data.storyId} initial={data.published} />
        ) : (
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
            Asesmen
          </span>
        )}
        <Link
          href={data.href}
          className="clay-sm inline-flex shrink-0 items-center gap-1 bg-white px-3 py-1.5 text-xs font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          Kelola <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
