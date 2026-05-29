import { z } from "zod";

// Login — Guru & Admin (email + password)
export const loginGuruAdminSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
export type LoginGuruAdminValues = z.infer<typeof loginGuruAdminSchema>;

// Login — Siswa (kode kelas + username, tanpa password)
export const loginSiswaSchema = z.object({
  classCode: z.string().min(1, "Kode kelas wajib diisi"),
  username: z.string().min(1, "Username wajib diisi"),
});
export type LoginSiswaValues = z.infer<typeof loginSiswaSchema>;

// Register — Guru
export const registerGuruSchema = z
  .object({
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    terms: z.boolean().refine((v) => v === true, {
      message: "Kamu harus menyetujui Syarat & Ketentuan",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });
export type RegisterGuruValues = z.infer<typeof registerGuruSchema>;

export type PasswordStrengthLabel = "Lemah" | "Sedang" | "Kuat";

export type PasswordStrength = {
  score: number; // 0-4
  label: PasswordStrengthLabel;
  // tingkat 0..3 untuk segmen bar
  level: 0 | 1 | 2 | 3;
};

// Hitung kekuatan password real-time. Dipakai PasswordStrengthMeter.
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Lemah", level: 1 };
  if (score <= 3) return { score, label: "Sedang", level: 2 };
  return { score, label: "Kuat", level: 3 };
}
