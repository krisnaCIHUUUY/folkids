import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DEFAULT_STORIES } from "@/lib/seed/default-stories";
import { PdfViewer } from "@/components/siswa/pdf-viewer";

export async function generateStaticParams() {
  return DEFAULT_STORIES.map((_, index) => ({ index: String(index) }));
}

export default async function DefaultStoryPage({
  params,
}: {
  params: Promise<{ index: string }>;
}) {
  const { index } = await params;
  const storyIndex = parseInt(index, 10);
  
  if (storyIndex < 0 || storyIndex >= DEFAULT_STORIES.length || !Number.isFinite(storyIndex)) {
    notFound();
  }
  
  const story = DEFAULT_STORIES[storyIndex];
  
  return (
    <div className="pt-6">
      <Link
        href="/perpustakaan"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke perpustakaan
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        {story.title}
      </h1>
      
      <div className="mt-6">
        <PdfViewer url={story.module_pdf_url} title={story.title} />
      </div>
      
      <div className="mt-4 rounded-lg bg-clay-cream/50 p-4">
        <p className="text-sm text-clay-ink/70">
          <strong>Asal:</strong> {story.region_origin}
        </p>
        <p className="mt-1 text-sm text-clay-ink/70">
          <strong>Tema:</strong> {story.character_theme}
        </p>
        <p className="mt-2 text-sm text-clay-ink/60">
          {story.synopsis}
        </p>
      </div>
    </div>
  );
}