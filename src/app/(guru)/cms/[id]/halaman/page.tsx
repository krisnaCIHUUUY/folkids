import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StoryPagesManager } from "@/components/guru/story-pages-manager";

export default async function KelolaHalamanPage({
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
    .select("id, title")
    .eq("id", storyId)
    .maybeSingle();

  if (!story) notFound();

  const { data: pages } = await supabase
    .from("story_pages")
    .select("id, page_number, content, illustration_url, audio_url, video_url, character_values")
    .eq("story_id", storyId)
    .order("page_number", { ascending: true });

  return (
    <div className="pt-6">
      <Link
        href="/cms"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Kelola Halaman
      </h1>
      <p className="mt-1 font-semibold text-clay-ink/60">{story.title}</p>

      <StoryPagesManager storyId={storyId} pages={pages ?? []} />
    </div>
  );
}
