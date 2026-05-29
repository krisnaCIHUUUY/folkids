import { LayoutGrid } from "lucide-react";
import type { ContentItem } from "@/lib/mock/guru-dashboard";
import { ContentCard } from "@/components/guru/content-card";
import { WayangAccent } from "@/components/wayang-accent";

export function ContentSection({ contents }: { contents: ContentItem[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="relative grid size-10 place-items-center overflow-hidden">
          <WayangAccent className="absolute inset-0 h-full w-full text-clay-sun/40" />
          <span className="clay-sm relative grid size-10 place-items-center bg-clay-sun text-clay-ink">
            <LayoutGrid className="size-5" />
          </span>
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Konten Saya
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contents.map((data) => (
          <ContentCard key={data.id} data={data} />
        ))}
      </div>
    </section>
  );
}
