import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StoryForm } from "@/components/guru/story-form";

export default async function EditCeritaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storyId = Number(id);
  if (!Number.isFinite(storyId)) notFound();

  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select(
      "title, synopsis, region_origin, character_theme, difficulty, cover_image_url",
    )
    .eq("id", storyId)
    .maybeSingle();

  if (!story) notFound();

  return (
    <div className="pt-6">
      <Link
        href="/cms"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Edit Cerita
      </h1>
      <StoryForm
        storyId={storyId}
        defaultValues={{
          title: story.title,
          synopsis: story.synopsis ?? "",
          region_origin: story.region_origin ?? "",
          character_theme: story.character_theme ?? "",
          difficulty: story.difficulty,
          cover_image_url: story.cover_image_url ?? "",
        }}
      />
    </div>
  );
}
