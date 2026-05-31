"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export type ActionError = { error: string };

// Simpan progres baca siswa (upsert per cerita). RLS membatasi ke milik sendiri.
export async function upsertReadingProgress(
  storyId: number,
  lastPageRead: number,
  isCompleted: boolean,
): Promise<ActionError | { ok: true }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "siswa") return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reading_progress")
    .upsert(
      {
        student_id: user.id,
        story_id: storyId,
        last_page_read: lastPageRead,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      },
      { onConflict: "student_id,story_id" },
    );

  if (error) {
    console.error("[upsertReadingProgress]", error.code, error.message);
    return { error: "Gagal menyimpan progres baca." };
  }

  revalidatePath("/perpustakaan");
  return { ok: true };
}
