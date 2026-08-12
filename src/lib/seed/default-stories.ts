import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DefaultStory = {
  title: string;
  synopsis: string;
  region_origin: string;
  character_theme: string;
  difficulty: "mudah" | "sedang" | "sulit";
  module_pdf_url: string;
};

export const DEFAULT_STORIES: DefaultStory[] = [
  {
    title: "EDULASKAR",
    synopsis: "Kumpulan sastra anak dari kelompok 2 yang mengangkat cerita rakyat Nusantara.",
    region_origin: "Indonesia",
    character_theme: "Sastra Anak",
    difficulty: "sedang",
    module_pdf_url: "/cerita/Salinan%20dari%20EDULASKAR%20KELOMPOK%202%20SASTRA%20ANAK(1).pdf",
  },
  {
    title: "Jaranan Reog",
    synopsis: "Pertunjukan kesenian tradisional Jawa yang menggabungkan tari, musik, dan kebatinan.",
    region_origin: "Jawa Timur",
    character_theme: "Kesenian Tradisional",
    difficulty: "sedang",
    module_pdf_url: "/cerita/Salinan%20dari%20Krem%20Cokelat%20Ilustratif%20Pertunjukan%20Kesenian%20Tradisional%20Jawa%20Jaranan%20Reog%20Flyer(1).pdf",
  },
  {
    title: "Tradisi Bulusan Kudus",
    synopsis: "Tradisi khas daerah Kudus yang melestarikan budaya leluhur.",
    region_origin: "Kudus, Jawa Tengah",
    character_theme: "Tradisi Lokal",
    difficulty: "sedang",
    module_pdf_url: "/cerita/Salinan%20dari%20Tradisi%20BULUSAN%20Kudus(1).pdf",
  },
];

export async function seedDefaultStories(
  supabase: SupabaseClient<Database>,
  userId: string,
  classId: number
): Promise<void> {
  for (const story of DEFAULT_STORIES) {
    const { data: existing } = await supabase
      .from("stories")
      .select("id")
      .eq("created_by", userId)
      .eq("module_pdf_url", story.module_pdf_url)
      .maybeSingle();

    let storyId: number | null = existing?.id ?? null;

    if (!storyId) {
      const { data: inserted, error } = await supabase
        .from("stories")
        .insert({
          title: story.title,
          synopsis: story.synopsis,
          region_origin: story.region_origin,
          character_theme: story.character_theme,
          difficulty: story.difficulty,
          module_pdf_url: story.module_pdf_url,
          created_by: userId,
          is_published: true,
        })
        .select("id")
        .single();

      if (error || !inserted) {
        console.error("[seedDefaultStories] Gagal insert story:", story.title, error?.message);
        continue;
      }
      storyId = inserted.id;
    }

    const { error: asgErr } = await supabase.rpc("create_assignment", {
      p_class_id: classId,
      p_kind: "baca",
      p_story_id: storyId!,
      p_quiz_id: null as unknown as number,
      p_title: story.title,
      p_instructions: "Bacalah modul cerita ini dengan saksama.",
      p_due_at: null as unknown as string,
    });

    if (asgErr) {
      console.error("[seedDefaultStories] Gagal create_assignment:", story.title, asgErr.message);
    }
  }
}
