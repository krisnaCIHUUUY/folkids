"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  storySchema,
  storyPageSchema,
  type StoryFormValues,
  type StoryPageFormValues,
} from "@/lib/validations/story";

export type ActionError = { error: string };
export type CreateStoryResult = ActionError | { id: number };

// Ubah string kosong jadi null agar kolom opsional tersimpan rapi.
function emptyToNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

async function requireGuruAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "guru" && user.role !== "admin")) {
    return null;
  }
  return user;
}

export async function createStory(
  values: StoryFormValues,
): Promise<CreateStoryResult> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = storySchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .insert({
      title: parsed.data.title,
      synopsis: emptyToNull(parsed.data.synopsis),
      region_origin: emptyToNull(parsed.data.region_origin),
      character_theme: emptyToNull(parsed.data.character_theme),
      difficulty: parsed.data.difficulty,
      cover_image_url: emptyToNull(parsed.data.cover_image_url),
      module_pdf_url: emptyToNull(parsed.data.module_pdf_url),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createStory]", error?.code, error?.message);
    return { error: "Gagal membuat cerita. Coba lagi." };
  }

  revalidatePath("/cms");
  revalidatePath("/dashboard");
  return { id: data.id };
}

export async function updateStory(
  id: number,
  values: StoryFormValues,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = storySchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .update({
      title: parsed.data.title,
      synopsis: emptyToNull(parsed.data.synopsis),
      region_origin: emptyToNull(parsed.data.region_origin),
      character_theme: emptyToNull(parsed.data.character_theme),
      difficulty: parsed.data.difficulty,
      cover_image_url: emptyToNull(parsed.data.cover_image_url),
      module_pdf_url: emptyToNull(parsed.data.module_pdf_url),
    })
    .eq("id", id);

  if (error) {
    console.error("[updateStory]", error.code, error.message);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/cms");
  revalidatePath(`/cms/${id}/edit`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteStory(id: number): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.from("stories").delete().eq("id", id);

  if (error) {
    console.error("[deleteStory]", error.code, error.message);
    return { error: "Gagal menghapus cerita. Coba lagi." };
  }

  revalidatePath("/cms");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function togglePublish(
  id: number,
  next: boolean,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("stories")
    .update({ is_published: next })
    .eq("id", id);

  if (error) {
    console.error("[togglePublish]", error.code, error.message);
    return { error: "Gagal mengubah status publikasi." };
  }

  revalidatePath("/cms");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createPage(
  storyId: number,
  values: StoryPageFormValues,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = storyPageSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();

  // page_number berikutnya = max + 1 (default 1 bila belum ada halaman).
  const { data: last } = await supabase
    .from("story_pages")
    .select("page_number")
    .eq("story_id", storyId)
    .order("page_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = (last?.page_number ?? 0) + 1;

  const { error } = await supabase.from("story_pages").insert({
    story_id: storyId,
    page_number: nextNumber,
    content: parsed.data.content,
    illustration_url: emptyToNull(parsed.data.illustration_url),
    audio_url: emptyToNull(parsed.data.audio_url),
    video_url: emptyToNull(parsed.data.video_url),
    character_values: emptyToNull(parsed.data.character_values),
  });

  if (error) {
    console.error("[createPage]", error.code, error.message);
    return { error: "Gagal menambah halaman. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/halaman`);
  return { ok: true };
}

export async function updatePage(
  pageId: number,
  storyId: number,
  values: StoryPageFormValues,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = storyPageSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("story_pages")
    .update({
      content: parsed.data.content,
      illustration_url: emptyToNull(parsed.data.illustration_url),
      audio_url: emptyToNull(parsed.data.audio_url),
      video_url: emptyToNull(parsed.data.video_url),
      character_values: emptyToNull(parsed.data.character_values),
    })
    .eq("id", pageId);

  if (error) {
    console.error("[updatePage]", error.code, error.message);
    return { error: "Gagal menyimpan halaman. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/halaman`);
  return { ok: true };
}

export async function deletePage(
  pageId: number,
  storyId: number,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.from("story_pages").delete().eq("id", pageId);

  if (error) {
    console.error("[deletePage]", error.code, error.message);
    return { error: "Gagal menghapus halaman. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/halaman`);
  return { ok: true };
}

export async function movePage(
  pageId: number,
  storyId: number,
  direction: "up" | "down",
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_story_page", {
    p_page_id: pageId,
    p_direction: direction,
  });

  if (error) {
    console.error("[movePage]", error.code, error.message);
    return { error: "Gagal mengubah urutan halaman." };
  }

  revalidatePath(`/cms/${storyId}/halaman`);
  return { ok: true };
}
