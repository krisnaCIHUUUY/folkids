"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import {
  loginGuruAdminSchema,
  registerGuruSchema,
  type LoginGuruAdminValues,
  type RegisterGuruValues,
} from "@/lib/validations/auth";

export type AuthActionResult = { error: string };
export type RegisterActionResult =
  | { error: string }
  | { needsConfirmation: true };

// Login Guru/Admin via email + password. Sukses → redirect ke home sesuai role.
export async function loginGuruAdmin(
  values: LoginGuruAdminValues,
): Promise<AuthActionResult | void> {
  const parsed = loginGuruAdminSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Input tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Log error asli di server untuk debugging; pesan ke user tetap ramah.
    console.error("[loginGuruAdmin]", error.status, error.code, error.message);

    switch (error.code) {
      case "invalid_credentials":
        return { error: "Email atau password salah" };
      case "email_not_confirmed":
        return { error: "Email belum dikonfirmasi. Periksa inbox kamu." };
      case "over_request_rate_limit":
        return { error: "Terlalu banyak percobaan. Coba lagi sebentar." };
      default:
        return (error.status ?? 0) >= 500
          ? { error: "Server sedang bermasalah. Coba lagi nanti." }
          : { error: "Gagal masuk. Coba lagi." };
    }
  }

  const role = await getUserRole();
  redirect(roleHome(role));
}

// Register Guru via email + password. Metadata { name, role } dibaca trigger
// handle_new_user() untuk membuat baris profil di tabel users.
export async function registerGuru(
  values: RegisterGuruValues,
): Promise<RegisterActionResult | void> {
  const parsed = registerGuruSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Input tidak valid" };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: { name: parsed.data.fullName, role: "guru" },
    },
  });

  if (error) {
    console.error("[registerGuru]", error.status, error.code, error.message);

    switch (error.code) {
      case "user_already_exists":
      case "email_exists":
        return { error: "Email sudah terdaftar. Silakan masuk." };
      case "weak_password":
        return { error: "Password terlalu lemah. Gunakan kombinasi yang lebih kuat." };
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return { error: "Terlalu banyak percobaan. Coba lagi sebentar." };
      default:
        return (error.status ?? 0) >= 500
          ? { error: "Server sedang bermasalah. Coba lagi nanti." }
          : { error: "Gagal membuat akun. Coba lagi." };
    }
  }

  // Konfirmasi email aktif → belum ada session, user harus cek inbox.
  if (!data.session) {
    return { needsConfirmation: true };
  }

  redirect(roleHome("guru"));
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
