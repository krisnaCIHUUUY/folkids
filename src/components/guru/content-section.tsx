import { LayoutGrid } from "lucide-react";
import { ContentCard } from "@/components/guru/content-card";
import { WayangAccent } from "@/components/wayang-accent";

export type DashboardContent = {
  id: string; // kunci unik gabungan, mis. "story-1" / "quiz-3"
  title: string;
  type: "story" | "quiz";
  published: boolean;
  meta: string;
  tags: string[];
  href: string; // tautan kelola
  storyId?: number; // untuk toggle publikasi cerita
};

export function ContentSection({ contents }: { contents: DashboardContent[] }) {
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

      {contents.length === 0 ? (
        <div className="clay mt-5 bg-white p-10 text-center">
          <p className="font-serif text-lg font-bold text-clay-ink">
            Belum ada konten
          </p>
          <p className="mt-1 font-semibold text-clay-ink/60">
            Cerita dan kuis yang kamu buat akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contents.map((data) => (
            <ContentCard key={data.id} data={data} />
          ))}
        </div>
      )}
    </section>
  );
}
