import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { LibraryStory } from "@/components/siswa/library-card";
import { LibraryBrowser } from "@/components/siswa/library-browser";

export default async function PerpustakaanPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // RLS otomatis membatasi siswa hanya ke cerita is_published = true.
  const [storiesRes, pagesRes, progressRes] = await Promise.all([
    supabase
      .from("stories")
      .select("id, title, region_origin, difficulty, cover_image_url")
      .order("created_at", { ascending: false }),
    supabase.from("story_pages").select("story_id"),
    supabase
      .from("reading_progress")
      .select("story_id, last_page_read, is_completed")
      .eq("student_id", user!.id),
  ]);

  // Jumlah halaman per cerita (untuk menghitung persentase progres).
  const pageCount = new Map<number, number>();
  for (const p of pagesRes.data ?? []) {
    pageCount.set(p.story_id, (pageCount.get(p.story_id) ?? 0) + 1);
  }

  const progressByStory = new Map(
    (progressRes.data ?? []).map((r) => [r.story_id, r]),
  );

  const list: LibraryStory[] = (storiesRes.data ?? []).map((s) => {
    const prog = progressByStory.get(s.id);
    const total = pageCount.get(s.id) ?? 0;
    const percent =
      prog?.is_completed
        ? 100
        : prog && total > 0
          ? Math.min(100, Math.round((prog.last_page_read / total) * 100))
          : 0;
    return {
      id: s.id,
      title: s.title,
      region: s.region_origin,
      difficulty: s.difficulty,
      coverUrl: s.cover_image_url,
      progress: percent,
      completed: prog?.is_completed ?? false,
    };
  });

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-sun text-clay-ink">
          <BookOpen className="size-5" />
        </span>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
          Perpustakaan Cerita
        </h1>
      </div>
      <p className="mt-2 font-semibold text-clay-ink/60">
        Pilih cerita rakyat untuk dibaca, lalu kerjakan kuisnya.
      </p>

      {list.length === 0 ? (
        <div className="clay mt-8 flex flex-col items-center gap-3 bg-white p-10 text-center">
          <span className="clay-sm grid size-14 place-items-center bg-clay-sun text-clay-ink">
            <BookOpen className="size-7" />
          </span>
          <p className="font-serif text-lg font-bold text-clay-ink">
            Belum ada cerita
          </p>
          <p className="max-w-sm font-semibold text-clay-ink/60">
            Cerita akan muncul di sini setelah gurumu mempublikasikannya.
          </p>
        </div>
      ) : (
        <LibraryBrowser stories={list} />
      )}
    </div>
  );
}
