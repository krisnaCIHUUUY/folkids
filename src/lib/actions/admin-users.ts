"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import { siswaEmail } from "@/lib/validations/auth";
import {
  createGuruSchema,
  createSiswaSchema,
  editUserSchema,
  resetPasswordSchema,
  type CreateGuruValues,
  type CreateSiswaValues,
  type EditUserValues,
  type ResetPasswordValues,
} from "@/lib/validations/admin-user";

export type ActionError = { error: string };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

function revalidateUsers() {
  revalidatePath("/pengguna");
  revalidatePath("/admin");
}

// Buat akun guru atau siswa via service-role (tanpa logout admin / email konfirmasi).
export async function createUser(
  role: "guru" | "siswa",
  values: CreateGuruValues | CreateSiswaValues,
): Promise<ActionError | { id: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Tidak diizinkan" };

  let email: string;
  let metadata: Record<string, string>;
  let password: string;

  if (role === "guru") {
    const parsed = createGuruSchema.safeParse(values);
    if (!parsed.success) return { error: "Input tidak valid" };
    email = parsed.data.email.trim().toLowerCase();
    password = parsed.data.password;
    metadata = { name: parsed.data.name, role: "guru" };
  } else {
    const parsed = createSiswaSchema.safeParse(values);
    if (!parsed.success) return { error: "Input tidak valid" };
    const username = parsed.data.username.trim().toLowerCase();
    email = siswaEmail(username);
    password = parsed.data.password;
    metadata = { name: parsed.data.name, role: "siswa", username };
  }

  const svc = createAdminClient();
  const { data, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error || !data.user) {
    console.error("[createUser]", error?.status, error?.message);
    const msg = (error?.message ?? "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return {
        error:
          role === "guru"
            ? "Email sudah terdaftar."
            : "Username sudah dipakai. Pilih yang lain.",
      };
    }
    if (msg.includes("password")) {
      return { error: "Password terlalu lemah. Gunakan kombinasi yang lebih kuat." };
    }
    return { error: "Gagal membuat akun. Coba lagi." };
  }

  revalidateUsers();
  return { id: data.user.id };
}

// Edit nama profil (anon client + RLS users_update_admin).
export async function updateUserProfile(
  id: string,
  values: EditUserValues,
): Promise<ActionError | { ok: true }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Tidak diizinkan" };

  const parsed = editUserSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ name: parsed.data.name })
    .eq("id", id);

  if (error) {
    console.error("[updateUserProfile]", error.code, error.message);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidateUsers();
  return { ok: true };
}

// Aktif/nonaktifkan akun. Admin tidak boleh menonaktifkan dirinya sendiri.
export async function setUserActive(
  id: string,
  isActive: boolean,
): Promise<ActionError | { ok: true }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Tidak diizinkan" };

  if (id === admin.id && !isActive) {
    return { error: "Kamu tidak bisa menonaktifkan akunmu sendiri." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("[setUserActive]", error.code, error.message);
    return { error: "Gagal mengubah status. Coba lagi." };
  }

  revalidateUsers();
  return { ok: true };
}

// Reset password user lain via service-role.
export async function resetUserPassword(
  id: string,
  values: ResetPasswordValues,
): Promise<ActionError | { ok: true }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Tidak diizinkan" };

  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const svc = createAdminClient();
  const { error } = await svc.auth.admin.updateUserById(id, {
    password: parsed.data.password,
  });

  if (error) {
    console.error("[resetUserPassword]", error.status, error.message);
    return { error: "Gagal mereset password. Coba lagi." };
  }

  return { ok: true };
}
