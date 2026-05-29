"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/auth";
import { roleHome } from "@/lib/roles";
import {
  loginGuruAdminSchema,
  loginSiswaSchema,
  registerGuruSchema,
  registerSiswaSchema,
  siswaEmail,
  type LoginGuruAdminValues,
  type LoginSiswaValues,
  type RegisterGuruValues,
  type RegisterSiswaValues,
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

// Login Siswa via kode kelas + username + password.
// Identitas = username (dijembatani ke email sintetis) + password.
// Kode kelas dipakai untuk auto-join kelas (idempoten) sekaligus syarat masuk.
export async function loginSiswa(
  values: LoginSiswaValues,
): Promise<AuthActionResult | void> {
  const parsed = loginSiswaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Input tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: siswaEmail(parsed.data.username),
    password: parsed.data.password,
  });

  if (error) {
    console.error("[loginSiswa]", error.status, error.code, error.message);
    switch (error.code) {
      case "invalid_credentials":
        return { error: "Username atau password salah" };
      case "over_request_rate_limit":
        return { error: "Terlalu banyak percobaan. Coba lagi sebentar." };
      default:
        return (error.status ?? 0) >= 500
          ? { error: "Server sedang bermasalah. Coba lagi nanti." }
          : { error: "Gagal masuk. Coba lagi." };
    }
  }

  // Verifikasi + auto-join kelas lewat kode. Bila kode salah, batalkan sesi
  // agar login bersifat atomik (tidak ada sesi tertinggal tanpa kelas valid).
  const { data: joinData, error: joinError } = await supabase.rpc(
    "join_class_by_code",
    { p_code: parsed.data.classCode },
  );

  const join = joinData as { ok: boolean; error?: string } | null;
  if (joinError || !join?.ok) {
    if (joinError) {
      console.error("[loginSiswa.join]", joinError.code, joinError.message);
    }
    await supabase.auth.signOut();
    return { error: join?.error ?? "Kode kelas tidak ditemukan" };
  }

  redirect(roleHome("siswa"));
}

// Register Siswa: daftar mandiri dengan nama + username + password.
// Email sintetis tak bisa konfirmasi inbox → pakai admin.createUser (service role)
// dengan email_confirm true agar akun langsung aktif, lalu langsung sign-in.
export async function registerSiswa(
  values: RegisterSiswaValues,
): Promise<AuthActionResult | void> {
  const parsed = registerSiswaSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Input tidak valid" };
  }

  const email = siswaEmail(parsed.data.username);
  const admin = createAdminClient();

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    // role di-hardcode 'siswa' — jangan pernah dari input klien.
    user_metadata: {
      name: parsed.data.name,
      role: "siswa",
      username: parsed.data.username.trim().toLowerCase(),
    },
  });

  if (createError) {
    console.error("[registerSiswa]", createError.status, createError.message);
    const msg = createError.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return { error: "Username sudah dipakai. Pilih yang lain." };
    }
    if (msg.includes("password")) {
      return { error: "Password terlalu lemah. Gunakan kombinasi yang lebih kuat." };
    }
    return { error: "Gagal membuat akun. Coba lagi." };
  }

  // Akun sudah aktif → langsung buat sesi lewat client biasa.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (signInError) {
    console.error("[registerSiswa.signIn]", signInError.code, signInError.message);
    return { error: "Akun dibuat, tapi gagal masuk. Coba login manual." };
  }

  redirect(roleHome("siswa"));
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
  redirect("/");
}
