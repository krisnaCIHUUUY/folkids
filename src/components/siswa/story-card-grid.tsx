import { BookOpen } from "lucide-react";
import type { DashboardStory } from "@/lib/mock/siswa-dashboard";
import { StoryCard } from "@/components/siswa/story-card";

export function StoryCardGrid({ stories }: { stories: DashboardStory[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-mint text-clay-ink">
          <BookOpen className="size-5" />
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Cerita untukmu
        </h2>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
