"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  assignmentSchema,
  announcementSchema,
  type AssignmentFormValues,
  type AnnouncementFormValues,
} from "@/lib/validations/assignment";
import type { Database } from "@/types/database";

export type ActionError = { error: string };

type CreateAssignmentArgs =
  Database["public"]["Functions"]["create_assignment"]["Args"];

async function requireGuruAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "guru" && user.role !== "admin")) return null;
  return user;
}

// Buat tugas untuk satu kelas. RPC create_assignment (SECURITY DEFINER) memvalidasi
// kepemilikan kelas lalu fan-out notifikasi 'tugas_baru' ke semua anggota kelas.
export async function createAssignment(
  values: AssignmentFormValues,
): Promise<ActionError | { ok: true; id: number }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = assignmentSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const dueAtIso = parsed.data.dueAt
    ? new Date(parsed.data.dueAt).toISOString()
    : null;

  // SQL menerima null untuk kolom yang tak relevan; tipe RPC generated tak
  // mengekspresikan nullability arg, jadi dicast sekali di sini.
  const args = {
    p_class_id: parsed.data.classId,
    p_kind: parsed.data.kind,
    p_story_id: parsed.data.kind === "baca" ? (parsed.data.storyId ?? null) : null,
    p_quiz_id: parsed.data.kind === "kuis" ? (parsed.data.quizId ?? null) : null,
    p_title: parsed.data.title,
    p_instructions: parsed.data.instructions ?? null,
    p_due_at: dueAtIso,
  } as unknown as CreateAssignmentArgs;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_assignment", args);

  if (error || data == null) {
    console.error("[createAssignment]", error?.code, error?.message);
    return { error: "Gagal membuat tugas. Coba lagi." };
  }

  revalidatePath("/tugas");
  revalidatePath(`/kelas/${parsed.data.classId}`);
  return { ok: true, id: data };
}

export async function updateAssignment(
  id: number,
  values: AssignmentFormValues,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = assignmentSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  // RLS membatasi update ke pembuat/admin.
  const { error } = await supabase
    .from("assignments")
    .update({
      kind: parsed.data.kind,
      story_id: parsed.data.kind === "baca" ? (parsed.data.storyId ?? null) : null,
      quiz_id: parsed.data.kind === "kuis" ? (parsed.data.quizId ?? null) : null,
      title: parsed.data.title,
      instructions: parsed.data.instructions || null,
      due_at: parsed.data.dueAt ? new Date(parsed.data.dueAt).toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateAssignment]", error.code, error.message);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/tugas");
  revalidatePath(`/kelas/${parsed.data.classId}`);
  return { ok: true };
}

export async function deleteAssignment(
  id: number,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.from("assignments").delete().eq("id", id);

  if (error) {
    console.error("[deleteAssignment]", error.code, error.message);
    return { error: "Gagal menghapus tugas. Coba lagi." };
  }

  revalidatePath("/tugas");
  return { ok: true };
}

// Kirim pengumuman ke satu kelas (notifikasi 'pengumuman' ke semua anggota).
export async function sendAnnouncement(
  values: AnnouncementFormValues,
): Promise<ActionError | { ok: true; recipients: number }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = announcementSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("send_announcement", {
    p_class_id: parsed.data.classId,
    p_title: parsed.data.title,
    p_body: parsed.data.body ?? "",
  });

  if (error) {
    console.error("[sendAnnouncement]", error.code, error.message);
    return { error: "Gagal mengirim pengumuman. Coba lagi." };
  }

  revalidatePath(`/kelas/${parsed.data.classId}`);
  return { ok: true, recipients: data ?? 0 };
}
