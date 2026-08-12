"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { seedDefaultStories } from "@/lib/seed/default-stories";
import { getCurrentUser } from "@/lib/auth";
import { classSchema, type ClassFormValues } from "@/lib/validations/class";

export type ActionError = { error: string };
export type CreateClassResult = ActionError | { id: number };

async function requireGuruAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "guru" && user.role !== "admin")) {
    return null;
  }
  return user;
}

export async function createClass(
  values: ClassFormValues,
): Promise<CreateClassResult> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = classSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: parsed.data.name,
      grade_level: parsed.data.grade_level,
      teacher_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createClass]", error?.code, error?.message);
    return { error: "Gagal membuat kelas. Coba lagi." };
  }

  await seedDefaultStories(supabase, user.id, data.id);

  revalidatePath("/kelas");
  revalidatePath("/dashboard");
  revalidatePath(`/kelas/${data.id}`);
  return { id: data.id };
}

export async function updateClass(
  id: number,
  values: ClassFormValues,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = classSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("classes")
    .update({
      name: parsed.data.name,
      grade_level: parsed.data.grade_level,
    })
    .eq("id", id);

  if (error) {
    console.error("[updateClass]", error.code, error.message);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/kelas");
  revalidatePath(`/kelas/${id}`);
  return { ok: true };
}

export async function deleteClass(
  id: number,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.from("classes").delete().eq("id", id);

  if (error) {
    console.error("[deleteClass]", error.code, error.message);
    return { error: "Gagal menghapus kelas. Coba lagi." };
  }

  revalidatePath("/kelas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function regenerateClassCode(
  id: number,
): Promise<ActionError | { code: string }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("regenerate_class_code", {
    p_class_id: id,
  });

  if (error || !data) {
    console.error("[regenerateClassCode]", error?.code, error?.message);
    return { error: "Gagal membuat ulang kode kelas." };
  }

  revalidatePath(`/kelas/${id}`);
  return { code: data };
}

export async function removeStudent(
  classId: number,
  studentId: string,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);

  if (error) {
    console.error("[removeStudent]", error.code, error.message);
    return { error: "Gagal mengeluarkan siswa. Coba lagi." };
  }

  revalidatePath(`/kelas/${classId}`);
  return { ok: true };
}

// Siswa bergabung ke kelas lewat kode (RPC join_class_by_code).
export async function joinClassByCode(
  code: string,
): Promise<ActionError | { ok: true; className: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "siswa") return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_class_by_code", {
    p_code: code,
  });

  if (error) {
    console.error("[joinClassByCode]", error.code, error.message);
    return { error: "Gagal bergabung ke kelas. Coba lagi." };
  }

  const result = data as { ok: boolean; error?: string; class_name?: string };
  if (!result?.ok) {
    return { error: result?.error ?? "Gagal bergabung ke kelas." };
  }

  revalidatePath("/beranda");
  return { ok: true, className: result.class_name ?? "" };
}
