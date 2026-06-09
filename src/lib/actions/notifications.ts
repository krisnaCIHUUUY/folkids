"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export type ActionError = { error: string };

// Tandai notifikasi sebagai dibaca. RLS membatasi update ke milik user sendiri,
// jadi tak perlu menyaring user_id di sini. `ids` opsional: bila kosong → semua
// notifikasi belum dibaca milik user ditandai.
export async function markNotificationsRead(
  ids?: number[],
): Promise<ActionError | { ok: true }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);

  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  }

  const { error } = await query;

  if (error) {
    console.error("[markNotificationsRead]", error.code, error.message);
    return { error: "Gagal memperbarui notifikasi." };
  }

  // Lonceng ada di semua portal; revalidasi beranda & dashboard.
  revalidatePath("/beranda");
  revalidatePath("/dashboard");
  return { ok: true };
}
