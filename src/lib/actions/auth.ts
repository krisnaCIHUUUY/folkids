"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import {
  loginGuruAdminSchema,
  type LoginGuruAdminValues,
} from "@/lib/validations/auth";

export type AuthActionResult = { error: string };

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

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
