import Link from "next/link";
import { Plus, BookOpen, LayoutGrid } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StoryRow } from "@/components/guru/story-row";
import { WayangAccent } from "@/components/wayang-accent";

export default async function CmsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select(
      "id, title, cover_image_url, region_origin, difficulty, is_published, updated_at",
    )
    .eq("created_by", user!.id)
    .order("updated_at", { ascending: false });

  const list = stories ?? [];

  return (
    <div className="pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center overflow-hidden">
            <WayangAccent className="absolute inset-0 h-full w-full text-clay-sun/40" />
            <span className="clay-sm relative grid size-10 place-items-center bg-clay-sun text-clay-ink">
              <LayoutGrid className="size-5" />
            </span>
          </span>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
            Manajemen Cerita
          </h1>
        </div>

        <Link
          href="/cms/buat"
          className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Plus className="size-4" /> Buat Cerita
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="clay mt-8 flex flex-col items-center gap-3 bg-white p-10 text-center">
          <span className="clay-sm grid size-14 place-items-center bg-clay-sun text-clay-ink">
            <BookOpen className="size-7" />
          </span>
          <p className="font-serif text-lg font-bold text-clay-ink">
            Belum ada cerita
          </p>
          <p className="max-w-sm font-semibold text-clay-ink/60">
            Mulai buat cerita rakyat pertamamu untuk dibaca para siswa.
          </p>
          <Link
            href="/cms/buat"
            className="clay-sm mt-2 inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <Plus className="size-4" /> Buat Cerita
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((story) => (
            <StoryRow key={story.id} data={story} />
          ))}
        </div>
      )}
    </div>
  );
}
